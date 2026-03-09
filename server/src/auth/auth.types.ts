import { ObjectType, Field, InputType } from '@nestjs/graphql';

@ObjectType()
export class UserResponse {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  token: string;

  @Field(() => UserResponse)
  user: UserResponse;
}

@InputType()
export class RegisterInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  name?: string;
}
