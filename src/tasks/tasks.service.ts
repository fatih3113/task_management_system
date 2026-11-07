import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Task } from './entities/task.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import {
  CreateTaskDto,
  FindTasksQueryDto,
  TaskStatus,
} from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

// Perpindahan status yang diizinkan (aturan bisnis 4.2)
const STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in_progress', 'cancelled'],
  in_progress: ['todo', 'done', 'cancelled'],
  done: [],
  cancelled: [],
};

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(query: FindTasksQueryDto): Promise<Task[]> {
    const where: FindOptionsWhere<Task> = {};
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;

    return this.taskRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task dengan id ${id} tidak ditemukan`);
    }

    return task;
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    const project = await this.projectRepository.findOne({
      where: { id: dto.projectId },
    });
    if (!project) {
      throw new NotFoundException(
        `Project dengan id ${dto.projectId} tidak ditemukan`,
      );
    }

    if (project.status === 'completed') {
      throw new BadRequestException(
        `Tugas tidak dapat dibuat pada proyek "${project.name}" yang berstatus completed`,
      );
    }

    if (dto.dueDate) this.assertDueDateNotPast(dto.dueDate);

    const task = this.taskRepository.create({
      projectId: dto.projectId,
      title: dto.title,
      description: dto.description ?? null,
      priority: dto.priority ?? 'medium',
      dueDate: dto.dueDate ? dto.dueDate.slice(0, 10) : null,
      status: 'todo',
    });

    const saved = await this.taskRepository.save(task);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    if (dto.dueDate !== undefined) this.assertDueDateNotPast(dto.dueDate);

    if (dto.status !== undefined && dto.status !== task.status) {
      await this.assertStatusTransition(task, dto.status as TaskStatus);
      task.status = dto.status;
    }

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.dueDate !== undefined) task.dueDate = dto.dueDate.slice(0, 10);

    await this.taskRepository.save(task);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const task = await this.findOne(id);

    // task_assignments.task_id memakai ON DELETE CASCADE,
    // jadi penugasan ikut terhapus otomatis.
    await this.taskRepository.remove(task);
    return { message: `Task "${task.title}" berhasil dihapus` };
  }

  private async assertStatusTransition(
    task: Task,
    next: TaskStatus,
  ): Promise<void> {
    const current = task.status as TaskStatus;
    const allowed = STATUS_TRANSITIONS[current] ?? [];

    if (!allowed.includes(next)) {
      const hint = allowed.length
        ? `hanya boleh ke: ${allowed.join(', ')}`
        : 'status ini sudah final';
      throw new BadRequestException(
        `Status tidak dapat diubah dari "${current}" ke "${next}" (${hint})`,
      );
    }

    if (next === 'in_progress') {
      const totalAssignments = await this.countAssignments(task.id);
      if (totalAssignments === 0) {
        throw new BadRequestException(
          'Tugas harus ditugaskan ke minimal satu anggota sebelum berstatus in_progress',
        );
      }
    }
  }

  // Memakai nama entity string (sama seperti pola di TeamsService)
  // agar tidak ada circular import dengan modul TaskAssignments.
  private countAssignments(taskId: number): Promise<number> {
    return this.taskRepository.manager
      .getRepository('TaskAssignment')
      .count({ where: { taskId } });
  }

  private assertDueDateNotPast(dueDate: string): void {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    if (dueDate.slice(0, 10) < today) {
      throw new BadRequestException('dueDate tidak boleh di masa lalu');
    }
  }
}
