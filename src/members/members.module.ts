import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity.js';
import { Team } from '../teams/entities/team.entity.js';
import { MembersService } from './members.service.js';
import { MembersController } from './members.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Team])],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
