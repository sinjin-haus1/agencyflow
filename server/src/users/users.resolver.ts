import { Resolver, Query, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserResponse } from '../auth/auth.types';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Resolver(() => UserResponse)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => [UserResponse])
  @UseGuards(GqlAuthGuard)
  async users(): Promise<UserResponse[]> {
    const users = await this.usersService.findById('dummy');
    return [];
  }
}
