import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimeEntry } from './time-entry.model';

export interface CreateTimeEntryInput {
  userId: string;
  projectId: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  billable?: boolean;
}

export interface UpdateTimeEntryInput {
  userId?: string;
  projectId?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  billable?: boolean;
}

@Injectable()
export class TimeEntriesService {
  constructor(
    @InjectModel(TimeEntry.name) private timeEntryModel: Model<TimeEntry>,
  ) {}

  async findAll(): Promise<TimeEntry[]> {
    return this.timeEntryModel.find().sort({ startTime: -1 }).exec();
  }

  async findById(id: string): Promise<TimeEntry | null> {
    return this.timeEntryModel.findById(id).exec();
  }

  async findByProject(projectId: string): Promise<TimeEntry[]> {
    return this.timeEntryModel.find({ projectId }).sort({ startTime: -1 }).exec();
  }

  async findByUser(userId: string): Promise<TimeEntry[]> {
    return this.timeEntryModel.find({ userId }).sort({ startTime: -1 }).exec();
  }

  async findActiveByUser(userId: string): Promise<TimeEntry | null> {
    return this.timeEntryModel.findOne({ userId, endTime: null }).exec();
  }

  async create(data: CreateTimeEntryInput): Promise<TimeEntry> {
    const timeEntry = new this.timeEntryModel(data);
    return timeEntry.save();
  }

  async update(id: string, data: UpdateTimeEntryInput): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (!timeEntry) {
      throw new NotFoundException(`TimeEntry with ID ${id} not found`);
    }

    return timeEntry;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.timeEntryModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async startTimer(userId: string, projectId: string, description?: string, billable = false): Promise<TimeEntry> {
    // Check if there's already an active timer for this user
    const activeEntry = await this.findActiveByUser(userId);
    if (activeEntry) {
      throw new Error('There is already an active timer. Stop it first before starting a new one.');
    }

    const timeEntry = new this.timeEntryModel({
      userId,
      projectId,
      description,
      startTime: new Date(),
      billable,
    });
    return timeEntry.save();
  }

  async stopTimer(id: string): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryModel.findById(id).exec();
    
    if (!timeEntry) {
      throw new NotFoundException(`TimeEntry with ID ${id} not found`);
    }

    if (timeEntry.endTime) {
      throw new Error('This timer has already been stopped.');
    }

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - timeEntry.startTime.getTime()) / 60000);

    timeEntry.endTime = endTime;
    timeEntry.duration = duration;
    
    return timeEntry.save();
  }

  async calculateTotalDuration(projectId?: string, userId?: string): Promise<number> {
    const filter: Record<string, string> = {};
    
    if (projectId) filter.projectId = projectId;
    if (userId) filter.userId = userId;

    const entries = await this.timeEntryModel.find({ ...filter, duration: { $exists: true } }).exec();
    return entries.reduce((total, entry) => total + (entry.duration || 0), 0);
  }
}
