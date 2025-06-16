import { Mutation, Query, Resolver, Args, Int } from '@nestjs/graphql';
import { Questions, Sheets } from './questions.model';

@Resolver(() => Questions)
export class QuestionsResolver {

  // 仮のデータストア（DBを使う場合は後で変更）
  private sheets: Sheets[] = [];
  private questions: Questions[] = [];

  // 32bit整数の範囲内でIDを生成するヘルパーメソッド
  private generateId(): number {
    return Math.floor(Math.random() * 2147483647); // 2^31 - 1
  }

  constructor() {
    // デモ用の初期データを作成
    this.initializeDemoData();
  }

  private initializeDemoData() {
    const demoSheet = {
      id: this.generateId(),
      title: 'デモシート',
    };
    this.sheets.push(demoSheet);

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

    demoQuestions.forEach(demo => {
      const question = {
        id: this.generateId(),
        question: demo.question,
        choices: demo.choices.map(choice => ({
          id: this.generateId(),
          choice: choice,
        })),
        sheet_id: demoSheet.id,
      };
      this.questions.push(question);
    });
  }

    @Query(() => [Questions], { name: 'questions' })
    async getQuestions(){
        return this.questions;
    }


    @Mutation(() => Sheets, { name: 'createSheet' })
    async createSheet(
        @Args('title', { type: () => String }) title: string
    ) {
        const newSheet = {
            id: this.generateId(),
            title,
        };
        this.sheets.push(newSheet);
        return newSheet;
    }

    @Mutation(() => Questions, { name: 'createQuestion' })
    async createQuestion(
        @Args('question', { type: () => String }) question: string,
        @Args('choices', { type: () => [String] }) choices: string[],
        @Args('sheet_id', { type: () => Int }) sheet_id: number
    ) {
        const newQuestion = {
            id: this.generateId(),
            question: question,
            choices: choices.map((choice) => ({
                id: this.generateId(),
                choice: choice,
            })),
            sheet_id: sheet_id,
        };
        this.questions.push(newQuestion);
        return newQuestion;
    }

    @Mutation(() => Boolean, { name: 'deleteQuestion' })
    async deleteQuestion(
        @Args('id', { type: () => Int }) id: number
    ) {
        const initialLength = this.questions.length;
        this.questions = this.questions.filter(q => q.id !== id);
        return this.questions.length < initialLength;
    }

    @Query(() => Questions, { name: 'question', nullable: true })
    async getQuestion(
        @Args('id', { type: () => Int }) id: number
    ) {
        return this.questions.find(q => q.id === id) || null;
    }

}