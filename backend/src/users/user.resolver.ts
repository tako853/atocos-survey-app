import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { User } from './user.model';

@Resolver(() => User)
export class UserResolver {
  private users: User[] = [];

  @Query(() => [User])
  getUsers(): User[] {
    return this.users;
  }

  @Mutation(() => User)
  createUser(
    @Args('name') name: string,
    @Args('email') email: string,
  ): User {
    const newUser = { id: this.users.length + 1, name, email };
    this.users.push(newUser);
    return newUser;
  }
}
