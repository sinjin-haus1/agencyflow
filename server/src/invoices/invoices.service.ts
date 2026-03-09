import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument, InvoiceStatus, LineItem } from './invoice.model';

export interface LineItemInput {
  description: string;
  quantity: number;
  rate: number;
}

export interface CreateInvoiceInput {
  clientId: string;
  projectId?: string;
  lineItems: LineItemInput[];
  tax?: number;
  dueDate: Date;
  notes?: string;
}

export interface UpdateInvoiceInput {
  clientId?: string;
  projectId?: string;
  status?: InvoiceStatus;
  lineItems?: LineItemInput[];
  tax?: number;
  dueDate?: Date;
  paidDate?: Date;
  notes?: string;
}

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.invoiceModel.countDocuments({
      invoiceNumber: new RegExp(`^INV-${year}-`),
    });
    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private calculateLineItemAmount(quantity: number, rate: number): number {
    return Math.round(quantity * rate * 100) / 100;
  }

  private calculateTotals(lineItems: LineItemInput[], tax: number): {
    subtotal: number;
    total: number;
  } {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + this.calculateLineItemAmount(item.quantity, item.rate);
    }, 0);
    
    const taxAmount = Math.round(subtotal * (tax / 100) * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      total,
    };
  }

  async findAll(): Promise<Invoice[]> {
    return this.invoiceModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Invoice | null> {
    return this.invoiceModel.findById(id).exec();
  }

  async findByClient(clientId: string): Promise<Invoice[]> {
    return this.invoiceModel.find({ clientId }).sort({ createdAt: -1 }).exec();
  }

  async create(data: CreateInvoiceInput): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber();
    const tax = data.tax || 0;
    const totals = this.calculateTotals(data.lineItems, tax);

    const lineItemsWithAmount: LineItem[] = data.lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: this.calculateLineItemAmount(item.quantity, item.rate),
    }));

    const invoice = new this.invoiceModel({
      invoiceNumber,
      clientId: data.clientId,
      projectId: data.projectId,
      status: InvoiceStatus.DRAFT,
      lineItems: lineItemsWithAmount,
      subtotal: totals.subtotal,
      tax,
      total: totals.total,
      dueDate: data.dueDate,
      notes: data.notes,
    });

    return invoice.save();
  }

  async update(id: string, data: UpdateInvoiceInput): Promise<Invoice> {
    let updateData: any = { ...data };

    // Recalculate totals if lineItems or tax changed
    if (data.lineItems || data.tax !== undefined) {
      const invoice = await this.invoiceModel.findById(id).exec();
      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }

      const lineItems = data.lineItems || invoice.lineItems;
      const tax = data.tax !== undefined ? data.tax : invoice.tax;
      const totals = this.calculateTotals(lineItems, tax);

      updateData.subtotal = totals.subtotal;
      updateData.total = totals.total;

      if (data.lineItems) {
        updateData.lineItems = data.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: this.calculateLineItemAmount(item.quantity, item.rate),
        }));
      }
    }

    const invoice = await this.invoiceModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.invoiceModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async markAsPaid(id: string): Promise<Invoice> {
    const invoice = await this.invoiceModel
      .findByIdAndUpdate(
        id,
        {
          status: InvoiceStatus.PAID,
          paidDate: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async sendInvoice(id: string): Promise<Invoice> {
    const invoice = await this.invoiceModel
      .findByIdAndUpdate(
        id,
        { status: InvoiceStatus.SENT },
        { new: true },
      )
      .exec();

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }
}
