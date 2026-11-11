import { Test, TestingModule } from '@nestjs/testing';
import { TaskAssignmentsController } from './task_assignments.controller.js';
import { TaskAssignmentsService } from './task_assignments.service.js';

describe('TaskAssignmentsController', () => {
  let controller: TaskAssignmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskAssignmentsController],
      providers: [TaskAssignmentsService],
    }).compile();

    controller = module.get<TaskAssignmentsController>(TaskAssignmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
