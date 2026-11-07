import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Project } from './entities/project.entity.js';
import { CreateProjectDto, FindProjectsQueryDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

const FINAL_TASK_STATUSES = ['done', 'cancelled'];

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(query: FindProjectsQueryDto): Promise<Project[]> {
    const where: FindOptionsWhere<Project> = {};
    if (query.teamId) where.teamId = query.teamId;
    if (query.status) where.status = query.status;

    return this.projectRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });

    if (!project) {
      throw new NotFoundException(`Project dengan id ${id} tidak ditemukan`);
    }

    return project;
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    this.assertDateRange(dto.startDate, dto.endDate);

    const project = this.projectRepository.create({
      teamId: dto.teamId,
      name: dto.name,
      description: dto.description ?? null,
      startDate: dto.startDate ? dto.startDate.slice(0, 10) : null,
      endDate: dto.endDate ? dto.endDate.slice(0, 10) : null,
      status: 'active',
    });

    const saved = await this.projectRepository.save(project);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project dengan id ${id} tidak ditemukan`);
    }

    const effectiveStart =
      dto.startDate !== undefined
        ? dto.startDate.slice(0, 10)
        : (project.startDate ?? undefined);
    const effectiveEnd =
      dto.endDate !== undefined
        ? dto.endDate.slice(0, 10)
        : (project.endDate ?? undefined);

    this.assertDateRange(effectiveStart, effectiveEnd);

    if (dto.name !== undefined) project.name = dto.name;
    if (dto.description !== undefined) project.description = dto.description;
    if (dto.status !== undefined) project.status = dto.status;
    if (dto.startDate !== undefined) project.startDate = dto.startDate.slice(0, 10);
    if (dto.endDate !== undefined) project.endDate = dto.endDate.slice(0, 10);

    await this.projectRepository.save(project);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project dengan id ${id} tidak ditemukan`);
    }

    await this.projectRepository.remove(project);
    return { message: `Project "${project.name}" berhasil dihapus` };
  }

  private assertDateRange(start?: string, end?: string): void {
    if (start && end && end.slice(0, 10) < start.slice(0, 10)) {
      throw new BadRequestException('endDate tidak boleh lebih awal dari startDate');
    }
  }
}
