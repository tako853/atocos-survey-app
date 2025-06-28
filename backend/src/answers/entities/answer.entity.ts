import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
@Entity('answers')
export class Answer {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  questionId: number;

  @Field(() => Int)
  @Column()
  choiceId: number;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;
}