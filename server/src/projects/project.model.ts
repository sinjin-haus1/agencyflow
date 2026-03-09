import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

registerEnumType(ProjectStatus, {
  name: 'ProjectStatus',
  description: 'The status of a project',
});

@Schema({ timestamps: true })
@ObjectType()
export class Project extends Document {
  @Field(() => ID)
  id: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field({ nullable: true })
  @Prop()
  description?: string;

  @Field()
  @Prop({ required: true })
  clientId: string;

  @Field(() => ProjectStatus)
  @Prop({ required: true, enum: ProjectStatus, default: ProjectStatus.ACTIVE })
  status: ProjectStatus;

  @Field({ nullable: true })
  @Prop()
  budget?: number;

  @Field({ nullable: true })
  @Prop()
  startDate?: Date;

  @Field({ nullable: true })
  @Prop()
  endDate?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
