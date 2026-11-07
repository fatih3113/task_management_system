import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { Member } from './entities/member.entity.js';
import { Team } from '../teams/entities/team.entity.js';
import {
  CreateMemberDto,
  FindMembersQueryDto,
} from './dto/create-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: FindMembersQueryDto): Promise<Member[]> {
    const where: FindOptionsWhere<Member> = {};
    if (query.teamId) where.teamId = query.teamId;

    return this.memberRepository.find({
      where,
      relations: { team: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: { team: true },
    });

    if (!member) {
      throw new NotFoundException(`Member dengan id ${id} tidak ditemukan`);
    }

    return member;
  }

  async create(dto: CreateMemberDto): Promise<Member> {
    await this.assertTeamExists(dto.teamId);
    await this.assertEmailAvailable(dto.email);

    const member = this.memberRepository.create({
      teamId: dto.teamId,
      name: dto.name,
      email: dto.email,
      role: dto.role,
    });

    const saved = await this.memberRepository.save(member);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateMemberDto): Promise<Member> {
    const member = await this.memberRepository.findOne({ where: { id } });

    if (!member) {
      throw new NotFoundException(`Member dengan id ${id} tidak ditemukan`);
    }

    if (dto.email !== undefined && dto.email !== member.email) {
      await this.assertEmailAvailable(dto.email);
    }

    // Aturan 4.4: anggota yang masih punya penugasan tidak boleh pindah tim
    if (dto.teamId !== undefined && dto.teamId !== member.teamId) {
      await this.assertTeamExists(dto.teamId);

      const totalAssignments = await this.countAssignments(id);
      if (totalAssignments > 0) {
        throw new ConflictException(
          `Member "${member.name}" tidak dapat dipindahkan ke tim lain karena masih memiliki ${totalAssignments} penugasan`,
        );
      }

      member.teamId = dto.teamId;
    }

    if (dto.name !== undefined) member.name = dto.name;
    if (dto.email !== undefined) member.email = dto.email;
    if (dto.role !== undefined) member.role = dto.role;

    await this.memberRepository.save(member);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const member = await this.memberRepository.findOne({ where: { id } });

    if (!member) {
      throw new NotFoundException(`Member dengan id ${id} tidak ditemukan`);
    }

    // Aturan 4.4: anggota yang masih punya penugasan tidak boleh dihapus
    const totalAssignments = await this.countAssignments(id);
    if (totalAssignments > 0) {
      throw new ConflictException(
        `Member "${member.name}" tidak dapat dihapus karena masih memiliki ${totalAssignments} penugasan`,
      );
    }

    await this.memberRepository.remove(member);
    return { message: `Member "${member.name}" berhasil dihapus` };
  }

  private async assertTeamExists(teamId: number): Promise<void> {
    const exists = await this.teamRepository.exists({ where: { id: teamId } });
    if (!exists) {
      throw new NotFoundException(`Team dengan id ${teamId} tidak ditemukan`);
    }
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    const existing = await this.memberRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException(`Email "${email}" sudah digunakan`);
    }
  }

  /**
   * Menghitung penugasan milik member. Aman dipanggil sebelum modul
   * TaskAssignments dibuat (mengembalikan 0 jika entity belum terdaftar).
   * Pastikan entity TaskAssignment nanti punya kolom `memberId`.
   */
  private async countAssignments(memberId: number): Promise<number> {
    if (!this.dataSource.hasMetadata('TaskAssignment')) return 0;

    return this.dataSource
      .getRepository('TaskAssignment')
      .count({ where: { memberId } });
  }
}
