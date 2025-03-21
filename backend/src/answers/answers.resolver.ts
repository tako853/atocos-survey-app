import { Mutation, Query, Resolver, Args, Int } from '@nestjs/graphql';
import { Answer } from './answers.model';

@Resolver(() => Answer)
export class QuestionsResolver {
  private answers: Answer[] = []; // 仮のデータストア（DBを使う場合は後で変更）

  @Query(() => [Answer], { name: 'answers' })
  async getAnswers() {
    return this.answers;
  }

  @Mutation(() => Answer, { name: 'submitAnswer' })
  async submitAnswer(
    @Args('questionId', { type: () => Int }) questionId: number,
    @Args('choiceId', { type: () => Int }) choiceId: number
  ) {
    const newAnswer = {
      id: this.answers.length + 1,
      questionId,
      choiceId,
    };
    this.answers.push(newAnswer);
    return newAnswer;
  }
}
