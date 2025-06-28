import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Question } from './question.entity';

@ObjectType()
@Entity('sheets')
export class Sheet {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Field(() => [Question])
  @OneToMany(() => Question, question => question.sheet)
  questions: Question[];
}