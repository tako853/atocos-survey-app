import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class Questions {
  @Field((type) => Int)
  id: number;

  @Field((type) => String)
  question: string;
}