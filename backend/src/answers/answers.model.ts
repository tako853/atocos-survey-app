import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class Answer {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  questionId: number;

  @Field(() => Int)
  choiceId: number;
}
