import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProjectsService, CreateProjectInput, UpdateProjectInput } from './projects.service';
import { Project, ProjectStatus } from './project.model';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@ObjectType()
export class ProjectResponse {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  clientId: string;

  @Field(() => ProjectStatus)
  status: ProjectStatus;

  @Field({ nullable: true })
  budget?: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateProjectInputType {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  clientId: string;

  @Field(() => ProjectStatus, { nullable: true })
  status?: ProjectStatus;

  @Field({ nullable: true })
  budget?: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;
}

@InputType()
export class UpdateProjectInputType {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  clientId?: string;

  @Field(() => ProjectStatus, { nullable: true })
  status?: ProjectStatus;

  @Field({ nullable: true })
  budget?: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;
}

// Need to import InputType and Field
import { InputType, Field as GqlField } from '@nestjs/graphql';

@Resolver(() => Project)
export class ProjectsResolver {
  constructor(private projectsService: ProjectsService) {}

  @Query(() => [Project])
  @UseGuards(GqlAuthGuard)
  async projects(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Query(() => Project, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async project(@Args('id', { type: () => ID }) id: string): Promise<Project | null> {
    return this.projectsService.findById(id);
  }

  @Query(() => [Project])
  @UseGuards(GqlAuthGuard)
  async projectsByClient(
    @Args('clientId', { type: () => String }) clientId: string,
  ): Promise<Project[]> {
    return this.projectsService.findByClient(clientId);
  }

  @Mutation(() => Project)
  @UseGuards(GqlAuthGuard)
  async createProject(
    @Args('input') input: CreateProjectInputType,
  ): Promise<Project> {
    return this.projectsService.create(input as CreateProjectInput);
  }

  @Mutation(() => Project)
  @UseGuards(GqlAuthGuard)
  async updateProject(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateProjectInputType,
  ): Promise<Project> {
    return this.projectsService.update(id, input as UpdateProjectInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteProject(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.projectsService.delete(id);
  }
}
