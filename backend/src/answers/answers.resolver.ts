import { Mutation, Query, Resolver, Args, ObjectType, Field } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { AnswerInput } from './dto/answer.input';

@ObjectType()
export class SubmitAnswersResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}

@Resolver(() => Answer)
export class AnswersResolver {
  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
  ) {}

  @Query(() => [Answer], { name: 'answers' })
  async getAnswers(): Promise<Answer[]> {
    return this.answerRepository.find();
  }


  @Mutation(() => SubmitAnswersResponse, { name: 'submitAnswers' })
  async submitAnswers(
    @Args('answers', { type: () => [AnswerInput] }) answers: AnswerInput[]
  ): Promise<SubmitAnswersResponse> {
    try {
      const answerEntities = answers.map(answer => 
        this.answerRepository.create({
          questionId: answer.questionId,
          choiceId: answer.choiceId,
        })
      );
      
      await this.answerRepository.save(answerEntities);
      
      return {
        success: true,
        message: 'アンケートの回答が正常に保存されました'
      };
    } catch (error) {
      console.error('Error saving answers:', error);
      return {
        success: false,
        message: 'アンケートの回答保存に失敗しました'
      };
    }
  }
}
