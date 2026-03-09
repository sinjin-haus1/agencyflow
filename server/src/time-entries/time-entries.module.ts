import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimeEntriesService } from './time-entries.service';
import { TimeEntriesResolver } from './time-entries.resolver';
import { TimeEntry, TimeEntrySchema } from './time-entry.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TimeEntry.name, schema: TimeEntrySchema }]),
  ],
  providers: [TimeEntriesService, TimeEntriesResolver],
  exports: [TimeEntriesService],
})
export class TimeEntriesModule {}
