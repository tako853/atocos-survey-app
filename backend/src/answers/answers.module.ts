import { Module } from '@nestjs/common';
import { AnswersResolver } from './answers.resolver';

@Module({
  providers: [AnswersResolver],
  exports: [AnswersResolver],
})
export class AnswersModule {}