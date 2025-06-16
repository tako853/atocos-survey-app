import { Field, ObjectType, Int, InputType } from '@nestjs/graphql';

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

  @Field(() => Int)
  sheet_id: number;
}

@ObjectType()
export class Sheets {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  title: string;
}

@InputType()
export class CreateChoiceInput {
  @Field(() => String)
  choice: string;
}

@InputType()
export class CreateQuestionInput {
  @Field(() => String)
  question: string;

  @Field(() => [CreateChoiceInput])
  choices: CreateChoiceInput[];

  @Field(() => Int)
  sheet_id: number;
}
