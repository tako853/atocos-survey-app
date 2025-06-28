import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Choice } from './choice.entity';
import { Sheet } from './sheet.entity';

@ObjectType()
@Entity('questions')
export class Question {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 500 })
  question: string;

  @Field(() => [Choice])
  @OneToMany(() => Choice, choice => choice.question, { cascade: true, eager: true })
  choices: Choice[];

  @Field(() => Int)
  @Column()
  sheet_id: number;

  @ManyToOne(() => Sheet, sheet => sheet.questions)
  @JoinColumn({ name: 'sheet_id' })
  sheet: Sheet;
}