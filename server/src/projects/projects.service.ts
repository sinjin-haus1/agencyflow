import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectStatus } from './project.model';

export interface CreateProjectInput {
  name: string;
  description?: string;
  clientId: string;
  status?: ProjectStatus;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  clientId?: string;
  status?: ProjectStatus;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private projectModel: Model<Project>) {}

  async findAll(): Promise<Project[]> {
    return this.projectModel.find().exec();
  }

  async findById(id: string): Promise<Project | null> {
    return this.projectModel.findById(id).exec();
  }

  async findByClient(clientId: string): Promise<Project[]> {
    return this.projectModel.find({ clientId }).exec();
  }

  async create(data: CreateProjectInput): Promise<Project> {
    const project = new this.projectModel(data);
    return project.save();
  }

  async update(id: string, data: UpdateProjectInput): Promise<Project> {
    const project = await this.projectModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    
    return project;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.projectModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
