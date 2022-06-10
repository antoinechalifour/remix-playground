import type { TodoLists } from "../../domain/TodoLists";
import type { TodoListPermissions } from "../../domain/TodoListPermissions";
import { ReorderTodo } from "../../usecase/ReorderTodo";
import { TodoListsInMemory } from "./fakes/TodoListsInMemory";
import { TodoListPermissionsInMemory } from "./fakes/TodoListPermissionsInMemory";
import { aTodoList, TodoListBuilder } from "./builders/TodoList";
import {
  aTodoListPermission,
  TodoListPermissionBuilder,
} from "./builders/TodoListPermission";
import { TodoListPermissionDeniedError } from "../../domain/TodoListPermissionDeniedError";

let reorderTodo: ReorderTodo;
let todoLists: TodoLists;
let todoListPermissions: TodoListPermissions;

beforeEach(() => {
  todoLists = new TodoListsInMemory();
  todoListPermissions = new TodoListPermissionsInMemory();
  reorderTodo = new ReorderTodo(todoLists, todoListPermissions);
});

it("reordering todos requires permission", async () => {
  await givenPermission(
    aTodoListPermission().forTodoList("todoList/1").forOwner("owner/1")
  );

  await expect(
    reorderTodo.execute("todoList/1", "contributor/1", "todo/2", 3)
  ).rejects.toEqual(
    new TodoListPermissionDeniedError("todoList/1", "contributor/1")
  );
});

const AUTHORIZED_CASES = [
  {
    role: "authorized contributor",
    todoListId: "todoList/1",
    contributorId: "contributor/authorized",
    permission: aTodoListPermission()
      .forTodoList("todoList/1")
      .withContributors("contributor/authorized"),
  },
  {
    role: "owner",
    todoListId: "todoList/2",
    contributorId: "contributor/owner",
    permission: aTodoListPermission()
      .forTodoList("todoList/2")
      .forOwner("contributor/owner"),
  },
];

AUTHORIZED_CASES.forEach(({ role, todoListId, contributorId, permission }) =>
  it(`places the todo at the given index (role=${role})`, async () => {
    await Promise.all([
      givenPermission(permission),
      givenTodoList(
        aTodoList()
          .withId(todoListId)
          .withTodosOrder("todo/1", "todo/2", "todo/3", "todo/4")
      ),
    ]);

    await reorderTodo.execute(todoListId, contributorId, "todo/2", 3);

    const reorderedTodoList = await todoLists.ofId(todoListId);
    expect(reorderedTodoList.todosOrder).toEqual([
      "todo/1",
      "todo/3",
      "todo/4",
      "todo/2",
    ]);
  })
);

it("throws when the index is out of bounds (negative)", async () => {
  await Promise.all([
    givenPermission(
      aTodoListPermission()
        .forTodoList("todoList/1")
        .forOwner("contributor/owner")
    ),
    givenTodoList(
      aTodoList().withId("todoList/1").withTodosOrder("todo/1", "todo/2")
    ),
  ]);

  return expect(() =>
    reorderTodo.execute("todoList/1", "contributor/owner", "todo/1", -1)
  ).rejects.toThrow("Index -1 is out of bounds");
});

it("throws when the index is out of bounds (after)", async () => {
  await Promise.all([
    givenPermission(
      aTodoListPermission()
        .forTodoList("todoList/1")
        .forOwner("contributor/owner")
    ),
    givenTodoList(
      aTodoList().withId("todoList/1").withTodosOrder("todo/1", "todo/2")
    ),
  ]);

  return expect(() =>
    reorderTodo.execute("todoList/1", "contributor/owner", "todo/1", 2)
  ).rejects.toThrow("Index 2 is out of bounds");
});

it("throws when the todo doesn't belong the todo list", async () => {
  await Promise.all([
    givenPermission(
      aTodoListPermission()
        .forTodoList("todoList/1")
        .forOwner("contributor/owner")
    ),
    givenTodoList(
      aTodoList().withId("todoList/1").withTodosOrder("todo/1", "todo/2")
    ),
  ]);

  return expect(() =>
    reorderTodo.execute("todoList/1", "contributor/owner", "todo/999", 1)
  ).rejects.toThrow("Todo todo/999 not found");
});

function givenPermission(todoListPermission: TodoListPermissionBuilder) {
  return todoListPermissions.save(todoListPermission.build());
}

function givenTodoList(todoList: TodoListBuilder) {
  return todoLists.save(todoList.build());
}