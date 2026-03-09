import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterInput, LoginResponse, UserResponse } from './auth.types';
import { GqlAuthGuard } from './gql-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async register(@Args('input') input: RegisterInput): Promise<LoginResponse> {
    return this.authService.register(input);
  }

  @Mutation(() => LoginResponse)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<LoginResponse> {
    return this.authService.login(email, password);
  }

  @Query(() => UserResponse)
  @UseGuards(GqlAuthGuard)
  async me(@Context() ctx: any): Promise<UserResponse> {
    return ctx.req.user;
  }
}
