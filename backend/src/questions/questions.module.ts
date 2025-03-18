import { Module } from '@nestjs/common';
import { QuestionsResolver } from './question.resolvers';

@Module({
    providers: [QuestionsResolver],
})
export class QuestionsModule {}