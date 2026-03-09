import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';

@Schema({ timestamps: true })
@ObjectType()
export class TimeEntry extends Document {
  @Field(() => ID)
  id: string;

  @Field()
  @Prop({ required: true })
  userId: string;

  @Field()
  @Prop({ required: true })
  projectId: string;

  @Field({ nullable: true })
  @Prop()
  description?: string;

  @Field()
  @Prop({ required: true })
  startTime: Date;

  @Field({ nullable: true })
  @Prop()
  endTime?: Date;

  @Field({ nullable: true })
  @Prop()
  duration?: number; // in minutes

  @Field()
  @Prop({ default: false })
  billable: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export const TimeEntrySchema = SchemaFactory.createForClass(TimeEntry);
