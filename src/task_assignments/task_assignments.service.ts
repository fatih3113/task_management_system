import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { TaskAssignment } from './entities/task_assignment.entity.js';
import {
  CreateTaskAssignmentDto,
  FindTaskAssignmentsQueryDto,
} from './dto/create-task_assignment.dto.js';

@Injectable()
export class TaskAssignmentsService {
  constructor(
    @InjectRepository(TaskAssignment)
    private readonly taskAssignmentRepository: Repository<TaskAssignment>,
  ) {}

  async findAll(query: FindTaskAssignmentsQueryDto): Promise<TaskAssignment[]> {
    const where: FindOptionsWhere<TaskAssignment> = {};
    if (query.taskId) where.taskId = query.taskId;
    if (query.memberId) where.memberId = query.memberId;

    return this.taskAssignmentRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<TaskAssignment> {
    const assignment = await this.taskAssignmentRepository.findOne({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Penugasan dengan id ${id} tidak ditemukan`,
      );
    }

    return assignment;
  }

  async create(dto: CreateTaskAssignmentDto): Promise<TaskAssignment> {
    const manager = this.taskAssignmentRepository.manager;

    // 1. Cek keberadaan Task
    const task: any = await manager.getRepository('Task').findOne({
      where: { id: dto.taskId },
    });
    if (!task) {
      throw new NotFoundException(
        `Task dengan id ${dto.taskId} tidak ditemukan`,
      );
    }

    // 2. Cek Aturan Bisnis 4.4: Tugas berstatus done atau cancelled tidak dapat ditugaskan ke anggota lagi
    if (['done', 'cancelled'].includes(task.status)) {
      throw new BadRequestException(
        `Tugas yang berstatus "${task.status}" tidak dapat ditugaskan ke anggota lagi`,
      );
    }

    // 3. Cek keberadaan Member
    const member: any = await manager.getRepository('Member').findOne({
      where: { id: dto.memberId },
    });
    if (!member) {
      throw new NotFoundException(
        `Member dengan id ${dto.memberId} tidak ditemukan`,
      );
    }

    // 4. Ambil Project untuk cek teamId
    const project: any = await manager.getRepository('Project').findOne({
      where: { id: task.projectId },
    });

    // 5. Cek Aturan Bisnis 4.4: Anggota hanya boleh ditugaskan pada tugas milik proyek dari tim yang sama
    if (project && member.teamId !== project.teamId) {
      throw new BadRequestException(
        'Anggota hanya boleh ditugaskan pada tugas dari tim yang sama dengan tim anggota tersebut',
      );
    }

    // 6. Cek Aturan Bisnis 4.4 / Constraint 4.1: Anggota yang sama tidak dapat ditugaskan dua kali (HTTP 409)
    const existing = await this.taskAssignmentRepository.findOne({
      where: { taskId: dto.taskId, memberId: dto.memberId },
    });
    if (existing) {
      throw new ConflictException(
        'Anggota ini sudah ditugaskan pada tugas tersebut',
      );
    }

    const assignment = this.taskAssignmentRepository.create({
      taskId: dto.taskId,
      memberId: dto.memberId,
    });

    const saved = await this.taskAssignmentRepository.save(assignment);
    return this.findOne(saved.id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const assignment = await this.findOne(id);
    const manager = this.taskAssignmentRepository.manager;

    // Ambil data task terkait
    const task: any = await manager.getRepository('Task').findOne({
      where: { id: assignment.taskId },
    });

    // Cek Aturan Bisnis 4.4: Penanggung jawab terakhir tidak dapat dihapus dari tugas yang sedang in_progress (HTTP 409)
    if (task && task.status === 'in_progress') {
      const totalAssignments = await this.taskAssignmentRepository.count({
        where: { taskId: assignment.taskId },
      });

      if (totalAssignments <= 1) {
        throw new ConflictException(
          'Penanggung jawab terakhir tidak dapat dihapus dari tugas yang sedang in_progress',
        );
      }
    }

    await this.taskAssignmentRepository.remove(assignment);
    return { message: `Penugasan dengan id ${id} berhasil dihapus` };
  }
}