import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsService } from './projects.service';
import { ProjectsResolver } from './projects.resolver';
import { Project, ProjectSchema } from './project.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
  ],
  providers: [ProjectsService, ProjectsResolver],
  exports: [ProjectsService],
})
export class ProjectsModule {}
