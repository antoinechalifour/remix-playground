import { RenameTodoList } from "todo-list-manager";
import { TodoListsInMemory } from "./fakes/TodoListsInMemory";
import { aTodoList } from "./builders/TodoList";

describe("Renaming a todo list", () => {
  let todoLists: TodoListsInMemory;
  let renameTodoList: RenameTodoList;

  beforeEach(() => {
    todoLists = new TodoListsInMemory();
    renameTodoList = new RenameTodoList(todoLists);
  });

  it("renames the todo list", async () => {
    // Arrange
    const theTodoList = aTodoList()
      .withId("todoList/1")
      .ownedBy("owner/1")
      .withTitle("Current title")
      .build();
    await todoLists.save(theTodoList);

    // Act
    await renameTodoList.execute("todoList/1", "Updated title", "owner/1");

    // Assert
    expect((await todoLists.ofId("todoList/1")).title).toEqual("Updated title");
  });
});