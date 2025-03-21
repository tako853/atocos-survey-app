import { Mutation, Query, Resolver, Args, Int } from '@nestjs/graphql';
import { Questions } from './questions.model';
import { Answer } from '../answers/answers.model';

@Resolver(() => Questions)
export class QuestionsResolver {
  private answers: Answer[] = []; // 仮のデータストア（DBを使う場合は後で変更）

    @Query(() => [Questions], { name: 'questions' })
    async getQuestions(){
        return [
            {
              id: '1',
              question: 'きのことたけのこ、どっち派？',
              choices: [
                { id: '101', choice: 'きのこ' },
                { id: '102', choice: 'たけのこ' },
              ],
            },
            {
              id: '2',
              question: 'えびとかに、どっちが好き？',
              choices: [
                { id: '103', choice: 'えび🦐' },
                { id: '104', choice: 'かに🦀' },
              ],
            },
            {
                id: '3',
                question: '犬と猫、どっち派？',
                choices: [
                  { id: '105', choice: '犬🐶' },
                  { id: '106', choice: '猫🐱' },
                ],
              },
        ];
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

    @Query(() => [Answer], { name: 'answers' })
    async getAnswers() {
        return this.answers;
    }
}