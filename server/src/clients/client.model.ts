import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Client extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  company?: string;

  @Prop()
  address?: string;

  @Prop()
  notes?: string;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
