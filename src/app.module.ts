import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './projects/projects.module.js';
import { TeamsModule } from './teams/teams.module.js';
import { MembersModule } from './members/members.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { TaskAssignmentsModule } from './task_assignments/task_assignments.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),

    TeamsModule,
    ProjectsModule,
    MembersModule,
    TasksModule,
    TaskAssignmentsModule,     
    // TaskAssignmentsModule, // tambahkan setelah modul TaskAssignments selesai

    // yang kurang 1 ini

  ],
})
export class AppModule { }
