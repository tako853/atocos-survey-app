import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsResolver } from './question.resolvers';
import { Question } from './entities/question.entity';
import { Choice } from './entities/choice.entity';
import { Sheet } from './entities/sheet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Choice, Sheet])],
  providers: [QuestionsResolver],
})
export class QuestionsModule {}