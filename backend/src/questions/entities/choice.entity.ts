import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Question } from './question.entity';

@ObjectType()
@Entity('choices')
export class Choice {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 200 })
  choice: string;

  @Field(() => Int)
  @Column()
  questionId: number;

  @ManyToOne(() => Question, question => question.choices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: Question;
}