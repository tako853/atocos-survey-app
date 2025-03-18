import { Args, Query, Resolver } from '@nestjs/graphql';
import { Questions } from './questions.model';

@Resolver((of) => Questions)
export class QuestionsResolver {
    constructor(){}

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
}