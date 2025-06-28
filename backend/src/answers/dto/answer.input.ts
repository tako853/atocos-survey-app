import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class AnswerInput {
  @Field(() => Int)
  questionId: number;

  @Field(() => Int)
  choiceId: number;
}

@InputType()
export class SubmitAnswersResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}