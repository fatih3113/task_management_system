import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ length: 50 })
  role: string;

  @Column()
  teamId: number;

  // members (N) -> (1) teams, ON DELETE RESTRICT
  @ManyToOne('Team', 'members', {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'teamId' })
  team: object;

  // Aktifkan setelah entity TaskAssignment dibuat:
  // @OneToMany('TaskAssignment', 'member')
  // taskAssignments: object[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
