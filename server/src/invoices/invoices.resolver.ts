import { Resolver, Query, Mutation, ID, Args } from '@nestjs/graphql';
import { ObjectType, Field, ID as GqlID, InputType } from '@nestjs/graphql';
import { InvoicesService, CreateInvoiceInput, UpdateInvoiceInput, LineItemInput } from './invoices.service';
import { InvoiceStatus } from './invoice.model';

@ObjectType()
export class LineItemResponse {
  @Field()
  description: string;

  @Field()
  quantity: number;

  @Field()
  rate: number;

  @Field()
  amount: number;
}

@ObjectType()
export class InvoiceResponse {
  @Field(() => GqlID)
  id: string;

  @Field()
  invoiceNumber: string;

  @Field(() => GqlID)
  clientId: string;

  @Field(() => GqlID, { nullable: true })
  projectId?: string;

  @Field()
  status: InvoiceStatus;

  @Field(() => [LineItemResponse])
  lineItems: LineItemResponse[];

  @Field()
  subtotal: number;

  @Field()
  tax: number;

  @Field()
  total: number;

  @Field()
  dueDate: Date;

  @Field({ nullable: true })
  paidDate?: Date;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class LineItemInputGql {
  @Field()
  description: string;

  @Field()
  quantity: number;

  @Field()
  rate: number;
}

@InputType()
export class CreateInvoiceInputGql {
  @Field(() => GqlID)
  clientId: string;

  @Field(() => GqlID, { nullable: true })
  projectId?: string;

  @Field(() => [LineItemInputGql])
  lineItems: LineItemInputGql[];

  @Field({ nullable: true })
  tax?: number;

  @Field()
  dueDate: Date;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class UpdateInvoiceInputGql {
  @Field(() => GqlID, { nullable: true })
  clientId?: string;

  @Field(() => GqlID, { nullable: true })
  projectId?: string;

  @Field({ nullable: true })
  status?: InvoiceStatus;

  @Field(() => [LineItemInputGql], { nullable: true })
  lineItems?: LineItemInputGql[];

  @Field({ nullable: true })
  tax?: number;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field({ nullable: true })
  paidDate?: Date;

  @Field({ nullable: true })
  notes?: string;
}

@Resolver(() => InvoiceResponse)
export class InvoicesResolver {
  constructor(private invoicesService: InvoicesService) {}

  @Query(() => [InvoiceResponse])
  async invoices(): Promise<InvoiceResponse[]> {
    const invoices = await this.invoicesService.findAll();
    return invoices.map(this.mapToResponse);
  }

  @Query(() => InvoiceResponse, { nullable: true })
  async invoice(@Args('id', { type: () => GqlID }) id: string): Promise<InvoiceResponse | null> {
    const invoice = await this.invoicesService.findById(id);
    return invoice ? this.mapToResponse(invoice) : null;
  }

  @Query(() => [InvoiceResponse])
  async invoicesByClient(@Args('clientId', { type: () => GqlID }) clientId: string): Promise<InvoiceResponse[]> {
    const invoices = await this.invoicesService.findByClient(clientId);
    return invoices.map(this.mapToResponse);
  }

  @Mutation(() => InvoiceResponse)
  async createInvoice(@Args('input') input: CreateInvoiceInputGql): Promise<InvoiceResponse> {
    const invoiceInput: CreateInvoiceInput = {
      clientId: input.clientId,
      projectId: input.projectId,
      lineItems: input.lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
      })),
      tax: input.tax,
      dueDate: input.dueDate,
      notes: input.notes,
    };
    const invoice = await this.invoicesService.create(invoiceInput);
    return this.mapToResponse(invoice);
  }

  @Mutation(() => InvoiceResponse)
  async updateInvoice(
    @Args('id', { type: () => GqlID }) id: string,
    @Args('input') input: UpdateInvoiceInputGql,
  ): Promise<InvoiceResponse> {
    const invoiceInput: UpdateInvoiceInput = {
      clientId: input.clientId,
      projectId: input.projectId,
      status: input.status,
      lineItems: input.lineItems?.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
      })),
      tax: input.tax,
      dueDate: input.dueDate,
      paidDate: input.paidDate,
      notes: input.notes,
    };
    const invoice = await this.invoicesService.update(id, invoiceInput);
    return this.mapToResponse(invoice);
  }

  @Mutation(() => Boolean)
  async deleteInvoice(@Args('id', { type: () => GqlID }) id: string): Promise<boolean> {
    return this.invoicesService.delete(id);
  }

  @Mutation(() => InvoiceResponse)
  async markAsPaid(@Args('id', { type: () => GqlID }) id: string): Promise<InvoiceResponse> {
    const invoice = await this.invoicesService.markAsPaid(id);
    return this.mapToResponse(invoice);
  }

  @Mutation(() => InvoiceResponse)
  async sendInvoice(@Args('id', { type: () => GqlID }) id: string): Promise<InvoiceResponse> {
    const invoice = await this.invoicesService.sendInvoice(id);
    return this.mapToResponse(invoice);
  }

  private mapToResponse(invoice: any): InvoiceResponse {
    return {
      id: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId.toString(),
      projectId: invoice.projectId?.toString(),
      status: invoice.status,
      lineItems: invoice.lineItems.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      })),
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      dueDate: invoice.dueDate,
      paidDate: invoice.paidDate,
      notes: invoice.notes,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }
}
