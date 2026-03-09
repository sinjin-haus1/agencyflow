import { Resolver, Query, Mutation, ID, Args } from '@nestjs/graphql';
import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { ClientsService, CreateClientInput, UpdateClientInput } from './clients.service';

@ObjectType()
export class ClientResponse {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  company?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateClientInputGql {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  company?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class UpdateClientInputGql {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  company?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  notes?: string;
}

@Resolver(() => ClientResponse)
export class ClientsResolver {
  constructor(private clientsService: ClientsService) {}

  @Query(() => [ClientResponse])
  async clients(): Promise<ClientResponse[]> {
    const clients = await this.clientsService.findAll();
    return clients.map(this.mapToResponse);
  }

  @Query(() => ClientResponse, { nullable: true })
  async client(@Args('id', { type: () => ID }) id: string): Promise<ClientResponse | null> {
    const client = await this.clientsService.findById(id);
    return client ? this.mapToResponse(client) : null;
  }

  @Mutation(() => ClientResponse)
  async createClient(@Args('input') input: CreateClientInputGql): Promise<ClientResponse> {
    const client = await this.clientsService.create(input as CreateClientInput);
    return this.mapToResponse(client);
  }

  @Mutation(() => ClientResponse)
  async updateClient(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateClientInputGql,
  ): Promise<ClientResponse> {
    const client = await this.clientsService.update(id, input as UpdateClientInput);
    return this.mapToResponse(client);
  }

  @Mutation(() => Boolean)
  async deleteClient(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.clientsService.delete(id);
  }

  private mapToResponse(client: any): ClientResponse {
    return {
      id: client._id.toString(),
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      address: client.address,
      notes: client.notes,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}
