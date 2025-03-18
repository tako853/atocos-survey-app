import { Args, Query, Resolver } from '@nestjs/graphql';
import { Questions } from './questions.model';

@Resolver((of) => Questions)
export class QuestionsResolver {
    constructor(){}

    @Query(() => [Questions], { name: 'questions' })
    async getQuestions(){
        return [
            {
                id: 1,
                question: 'きのことたけのこ、どっちがすき？',
            },
            {
                id: 2,
                question: 'えびとかに、どっちが好き？',
            },
        ];
    }
}