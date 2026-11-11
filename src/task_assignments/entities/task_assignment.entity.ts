import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

@Entity('task_assignments')
@Index(['taskId', 'memberId'], { unique: true }) // Constraint 4.1: UNIQUE (task_id, member_id)
export class TaskAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  taskId: number;

  @Column()
  memberId: number;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;

  @ManyToOne('Task', {
    nullable: false,
    onDelete: 'CASCADE', // Constraint 4.1: ON DELETE CASCADE saat task dihapus
  })
  @JoinColumn({ name: 'taskId' })
  task: object;

  @ManyToOne('Member', {
    nullable: false,
    onDelete: 'RESTRICT', // Constraint 4.1: ON DELETE RESTRICT
  })
  @JoinColumn({ name: 'memberId' })
  member: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}