import { Resolver, Query, Mutation, Args, ID, ObjectType, InputType, Field, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TimeEntriesService, CreateTimeEntryInput, UpdateTimeEntryInput } from './time-entries.service';
import { TimeEntry } from './time-entry.model';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@InputType()
export class CreateTimeEntryInputType {
  @Field()
  userId: string;

  @Field()
  projectId: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  startTime: Date;

  @Field({ nullable: true })
  endTime?: Date;

  @Field({ nullable: true })
  duration?: number;

  @Field({ nullable: true })
  billable?: boolean;
}

@InputType()
export class UpdateTimeEntryInputType {
  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  projectId?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  startTime?: Date;

  @Field({ nullable: true })
  endTime?: Date;

  @Field({ nullable: true })
  duration?: number;

  @Field({ nullable: true })
  billable?: boolean;
}

@InputType()
export class StartTimerInputType {
  @Field()
  userId: string;

  @Field()
  projectId: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  billable?: boolean;
}

@ObjectType()
export class TotalDurationResponse {
  @Field(() => Int)
  totalMinutes: number;
}

@Resolver(() => TimeEntry)
export class TimeEntriesResolver {
  constructor(private timeEntriesService: TimeEntriesService) {}

  @Query(() => [TimeEntry])
  @UseGuards(GqlAuthGuard)
  async timeEntries(): Promise<TimeEntry[]> {
    return this.timeEntriesService.findAll();
  }

  @Query(() => TimeEntry, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async timeEntry(@Args('id', { type: () => ID }) id: string): Promise<TimeEntry | null> {
    return this.timeEntriesService.findById(id);
  }

  @Query(() => [TimeEntry])
  @UseGuards(GqlAuthGuard)
  async timeEntriesByProject(
    @Args('projectId', { type: () => String }) projectId: string,
  ): Promise<TimeEntry[]> {
    return this.timeEntriesService.findByProject(projectId);
  }

  @Query(() => [TimeEntry])
  @UseGuards(GqlAuthGuard)
  async timeEntriesByUser(
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<TimeEntry[]> {
    return this.timeEntriesService.findByUser(userId);
  }

  @Query(() => Int)
  @UseGuards(GqlAuthGuard)
  async totalDuration(
    @Args('projectId', { type: () => String, nullable: true }) projectId?: string,
    @Args('userId', { type: () => String, nullable: true }) userId?: string,
  ): Promise<number> {
    return this.timeEntriesService.calculateTotalDuration(projectId, userId);
  }

  @Mutation(() => TimeEntry)
  @UseGuards(GqlAuthGuard)
  async createTimeEntry(
    @Args('input') input: CreateTimeEntryInputType,
  ): Promise<TimeEntry> {
    return this.timeEntriesService.create(input as CreateTimeEntryInput);
  }

  @Mutation(() => TimeEntry)
  @UseGuards(GqlAuthGuard)
  async updateTimeEntry(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTimeEntryInputType,
  ): Promise<TimeEntry> {
    return this.timeEntriesService.update(id, input as UpdateTimeEntryInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteTimeEntry(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.timeEntriesService.delete(id);
  }

  @Mutation(() => TimeEntry)
  @UseGuards(GqlAuthGuard)
  async startTimer(
    @Args('input') input: StartTimerInputType,
  ): Promise<TimeEntry> {
    return this.timeEntriesService.startTimer(
      input.userId,
      input.projectId,
      input.description,
      input.billable || false,
    );
  }

  @Mutation(() => TimeEntry)
  @UseGuards(GqlAuthGuard)
  async stopTimer(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<TimeEntry> {
    return this.timeEntriesService.stopTimer(id);
  }
}
