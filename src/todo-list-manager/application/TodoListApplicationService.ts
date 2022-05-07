import { Injectable } from "@nestjs/common";
import { AddTodoList } from "../usecase/AddTodoList";
import { ArchiveTodoList } from "../usecase/ArchiveTodoList";
import { TodoListPrismaRepository } from "../persistence/TodoListPrismaRepository";
import { RealClock } from "../infrastructure/RealClock";
import { GenerateUUID } from "shared";

@Injectable()
export class TodoListApplicationService {
  constructor(
    private readonly todoLists: TodoListPrismaRepository,
    private readonly generateId: GenerateUUID,
    private readonly clock: RealClock
  ) {}

  add(title: string, ownerId: string) {
    return new AddTodoList(this.todoLists, this.generateId, this.clock).execute(
      title,
      ownerId
    );
  }

  archive(todoListId: string, ownerId: string) {
    return new ArchiveTodoList(this.todoLists).execute(todoListId, ownerId);
  }
}
