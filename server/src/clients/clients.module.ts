import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsService } from './clients.service';
import { ClientsResolver } from './clients.resolver';
import { Client, ClientSchema } from './client.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),
  ],
  providers: [ClientsService, ClientsResolver],
  exports: [ClientsService],
})
export class ClientsModule {}
