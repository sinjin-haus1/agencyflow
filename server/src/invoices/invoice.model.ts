import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type InvoiceDocument = Invoice;

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class LineItem {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  rate: number;

  @Prop({ required: true })
  amount: number;
}

export const LineItemSchema = SchemaFactory.createForClass(LineItem);

@Schema({ timestamps: true })
export class Invoice extends Document {
  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Client', required: true })
  clientId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project' })
  projectId?: string;

  @Prop({ required: true, enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @Prop({ type: [LineItemSchema], default: [] })
  lineItems: LineItem[];

  @Prop({ required: true, default: 0 })
  subtotal: number;

  @Prop({ required: true, default: 0 })
  tax: number;

  @Prop({ required: true, default: 0 })
  total: number;

  @Prop({ required: true })
  dueDate: Date;

  @Prop()
  paidDate?: Date;

  @Prop()
  notes?: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
