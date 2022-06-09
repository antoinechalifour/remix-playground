import { Event } from "shared/events";

export class TagAddedToTodo extends Event {
  static TYPE = "todo.tagAdded";

  constructor(
    public readonly todoListId: string,
    public readonly contributorId: string,
    public readonly todoId: string,
    public readonly tag: string,
    publishedAt: Date
  ) {
    super(TagAddedToTodo.TYPE, publishedAt);
  }
}