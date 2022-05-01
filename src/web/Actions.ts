import { Injectable } from "@nestjs/common";
import { redirect } from "@remix-run/node";
import { Body, Params, DataFunction, SessionManager } from "remix-nest-adapter";
import { LoginApplicationService } from "authentication";
import {
  TodoApplicationService,
  TodoListApplicationService,
} from "todo-list-manager";
import { AddTodoBody, AddTodoParams } from "./dtos/AddTodo";
import { ArchiveTodoParams } from "./dtos/ArchiveTodo";
import {
  ChangeTodoCompletionBody,
  ChangeTodoCompletionParams,
} from "./dtos/ChangeTodoCompletion";
import { AddTodoListBody } from "./dtos/AddTodoList";
import { ArchiveTodoListParams } from "./dtos/ArchiveTodoList";
import { LoginBody } from "./dtos/Login";
import { Authenticated } from "./decorators/Authenticated";

@Injectable()
export class Actions {
  constructor(
    private readonly sessionManager: SessionManager,
    private readonly loginApplicationService: LoginApplicationService,
    private readonly todoApplicationService: TodoApplicationService,
    private readonly todoListApplicationService: TodoListApplicationService
  ) {}

  @DataFunction()
  async login(@Body() body: LoginBody) {
    const session = await this.sessionManager.get();
    const url = await this.loginApplicationService.login(
      session,
      body.username,
      body.password
    );

    return redirect(url, {
      headers: { "Set-Cookie": await this.sessionManager.commit(session) },
    });
  }

  @Authenticated()
  @DataFunction()
  async addTodo(@Params() params: AddTodoParams, @Body() body: AddTodoBody) {
    await this.todoApplicationService.add(params.todoListId, body.todoTitle);
    return null;
  }

  @Authenticated()
  @DataFunction()
  async archiveTodo(@Params() params: ArchiveTodoParams) {
    await this.todoApplicationService.archive(params.todoId);
    return redirect(`/l/${params.todoListId}`);
  }

  @Authenticated()
  @DataFunction()
  async changeTodoCompletion(
    @Params() params: ChangeTodoCompletionParams,
    @Body() body: ChangeTodoCompletionBody
  ) {
    await this.todoApplicationService.changeTodoCompletion(
      params.todoId,
      body.isChecked
    );
    return redirect(`/l/${params.todoListId}`);
  }

  @Authenticated()
  @DataFunction()
  async addTodoList(@Body() body: AddTodoListBody) {
    const url = await this.todoListApplicationService.add(body.title);
    return redirect(url);
  }

  @Authenticated()
  @DataFunction()
  async archiveTodoList(@Params() params: ArchiveTodoListParams) {
    await this.todoListApplicationService.archive(params.todoListId);
    return redirect("/");
  }
}