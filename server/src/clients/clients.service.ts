import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client } from './client.model';

export interface CreateClientInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientInput {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
}

@Injectable()
export class ClientsService {
  constructor(@InjectModel(Client.name) private clientModel: Model<Client>) {}

  async findAll(): Promise<Client[]> {
    return this.clientModel.find().exec();
  }

  async findById(id: string): Promise<Client | null> {
    return this.clientModel.findById(id).exec();
  }

  async create(data: CreateClientInput): Promise<Client> {
    const client = new this.clientModel(data);
    return client.save();
  }

  async update(id: string, data: UpdateClientInput): Promise<Client> {
    const client = await this.clientModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.clientModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
