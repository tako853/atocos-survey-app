import { Mutation, Query, Resolver, Args, Int } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnModuleInit } from '@nestjs/common';
import { Question } from './entities/question.entity';
import { Choice } from './entities/choice.entity';
import { Sheet } from './entities/sheet.entity';

@Resolver(() => Question)
export class QuestionsResolver implements OnModuleInit {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Choice)
    private choiceRepository: Repository<Choice>,
    @InjectRepository(Sheet)
    private sheetRepository: Repository<Sheet>,
  ) {}

  async onModuleInit() {
    // 初期データの作成（テーブルが空の場合のみ）
    await this.initializeDemoData();
  }

  private async initializeDemoData() {
    const existingQuestions = await this.questionRepository.count();
    if (existingQuestions > 0) return; // 既にデータがある場合はスキップ

    // デモシートを作成
    const demoSheet = this.sheetRepository.create({
      title: 'デモシート',
    });
    const savedSheet = await this.sheetRepository.save(demoSheet);

    const demoQuestions = [
      {
        question: 'きのことたけのこ、どっち派？',
        choices: ['きのこ', 'たけのこ']
      },
      {
        question: 'えびとかに、どっちが好き？',
        choices: ['えび🦐', 'かに🦀']
      },
      {
        question: '犬と猫、どっち派？',
        choices: ['犬🐶', '猫🐱']
      }
    ];

    for (const demo of demoQuestions) {
      const question = this.questionRepository.create({
        question: demo.question,
        sheet_id: savedSheet.id,
      });
      const savedQuestion = await this.questionRepository.save(question);

      for (const choiceText of demo.choices) {
        const choice = this.choiceRepository.create({
          choice: choiceText,
          questionId: savedQuestion.id,
        });
        await this.choiceRepository.save(choice);
      }
    }
  }

  @Query(() => [Question], { name: 'questions' })
  async getQuestions(): Promise<Question[]> {
    return this.questionRepository.find({ relations: ['choices'] });
  }

  @Query(() => [Question], { name: 'questionsBySheet' })
  async getQuestionsBySheet(
    @Args('sheetId', { type: () => Int }) sheetId: number
  ): Promise<Question[]> {
    return this.questionRepository.find({
      where: { sheet_id: sheetId },
      relations: ['choices'],
      order: { id: 'ASC' }
    });
  }

  @Query(() => [Sheet], { name: 'sheets' })
  async getSheets(): Promise<Sheet[]> {
    return this.sheetRepository.find({ relations: ['questions'] });
  }

  @Query(() => Question, { name: 'question', nullable: true })
  async getQuestion(
    @Args('id', { type: () => Int }) id: number
  ): Promise<Question | null> {
    return this.questionRepository.findOne({
      where: { id },
      relations: ['choices']
    });
  }

  @Mutation(() => Sheet, { name: 'createSheet' })
  async createSheet(
    @Args('title', { type: () => String }) title: string
  ): Promise<Sheet> {
    const newSheet = this.sheetRepository.create({ title });
    return this.sheetRepository.save(newSheet);
  }

  @Mutation(() => Question, { name: 'createQuestion' })
  async createQuestion(
    @Args('question', { type: () => String }) question: string,
    @Args('choices', { type: () => [String] }) choices: string[],
    @Args('sheetId', { type: () => Int, nullable: true }) sheetId?: number
  ): Promise<Question> {
    let targetSheet: Sheet;
    
    if (sheetId) {
      const foundSheet = await this.sheetRepository.findOne({
        where: { id: sheetId }
      });
      if (!foundSheet) {
        throw new Error('指定されたシートが見つかりません');
      }
      targetSheet = foundSheet;
    } else {
      // デフォルトシートを取得または作成
      const foundSheet = await this.sheetRepository.findOne({
        where: { title: 'デモシート' }
      });
      
      if (!foundSheet) {
        targetSheet = this.sheetRepository.create({ title: 'デモシート' });
        targetSheet = await this.sheetRepository.save(targetSheet);
      } else {
        targetSheet = foundSheet;
      }
    }

    // 質問を作成
    const newQuestion = this.questionRepository.create({
      question,
      sheet_id: targetSheet.id,
    });
    const savedQuestion = await this.questionRepository.save(newQuestion);

    // 選択肢を作成
    const choiceEntities = choices.map(choiceText =>
      this.choiceRepository.create({
        choice: choiceText,
        questionId: savedQuestion.id,
      })
    );
    await this.choiceRepository.save(choiceEntities);

    // 選択肢を含めて質問を再取得
    const questionWithChoices = await this.questionRepository.findOne({
      where: { id: savedQuestion.id },
      relations: ['choices']
    });
    return questionWithChoices!;
  }

  @Mutation(() => Boolean, { name: 'deleteQuestion' })
  async deleteQuestion(
    @Args('id', { type: () => Int }) id: number
  ): Promise<boolean> {
    const result = await this.questionRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  @Mutation(() => Boolean, { name: 'deleteSheet' })
  async deleteSheet(
    @Args('id', { type: () => Int }) id: number
  ): Promise<boolean> {
    try {
      // シートに属する質問を削除（CASCADE設定により選択肢も自動削除される）
      await this.questionRepository.delete({ sheet_id: id });
      
      // シートを削除
      const result = await this.sheetRepository.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting sheet:', error);
      return false;
    }
  }

}