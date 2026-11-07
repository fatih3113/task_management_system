import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: { projects: true },
    });

    if (!team) {
      throw new NotFoundException(`Team dengan id ${id} tidak ditemukan`);
    }

    return team;
  }

  async create(dto: CreateTeamDto): Promise<Team> {
    const existing = await this.teamRepository.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Tim dengan nama "${dto.name}" sudah ada`);
    }

    const team = this.teamRepository.create({
      name: dto.name,
      description: dto.description ?? null,
    });

    const saved = await this.teamRepository.save(team);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateTeamDto): Promise<Team> {
    const team = await this.teamRepository.findOne({ where: { id } });

    if (!team) {
      throw new NotFoundException(`Team dengan id ${id} tidak ditemukan`);
    }

    if (dto.name && dto.name !== team.name) {
      const existing = await this.teamRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException(`Tim dengan nama "${dto.name}" sudah ada`);
      }
    }

    if (dto.name !== undefined) team.name = dto.name;
    if (dto.description !== undefined) team.description = dto.description;

    await this.teamRepository.save(team);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const team = await this.teamRepository.findOne({ where: { id } });

    if (!team) {
      throw new NotFoundException(`Team dengan id ${id} tidak ditemukan`);
    }

    const totalProjects = await this.teamRepository.manager
      .getRepository('Project')
      .count({ where: { teamId: id } });

    if (totalProjects > 0) {
      throw new ConflictException(
        `Tim "${team.name}" tidak dapat dihapus karena masih memiliki ${totalProjects} proyek`,
      );
    }

    await this.teamRepository.remove(team);
    return { message: `Tim "${team.name}" berhasil dihapus` };
  }
}
