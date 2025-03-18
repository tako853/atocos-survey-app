import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class Choice {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  choice: string;
}

@ObjectType()
export class Questions {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  question: string;

  @Field(() => [Choice])
  choices: Choice[];
}
