import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoicesService } from './invoices.service';
import { InvoicesResolver } from './invoices.resolver';
import { Invoice, InvoiceSchema } from './invoice.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
  ],
  providers: [InvoicesService, InvoicesResolver],
  exports: [InvoicesService],
})
export class InvoicesModule {}
