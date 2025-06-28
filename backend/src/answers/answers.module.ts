import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswersResolver } from './answers.resolver';
import { Answer } from './entities/answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Answer])],
  providers: [AnswersResolver],
  exports: [AnswersResolver],
})
export class AnswersModule {}