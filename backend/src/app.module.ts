import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import * as path from 'path';
import { QuestionsModule } from './questions/questions.module';
import { Application } from 'express';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { QuestionsResolver } from './questions/question.resolvers';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
  ],
  providers: [QuestionsResolver],
})
export class AppModule {}
