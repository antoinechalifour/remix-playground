import React from "react";
import classNames from "classnames";
import { PlusIcon } from "@radix-ui/react-icons";
import { ShareTodoListDialogContent } from "front/todolist/Sharing/ShareTodoListDialogContent";
import { Dialog } from "front/ui/Dialog";

export const ShareButton = () => (
  <Dialog.Root>
    <Dialog.Trigger asChild>
      <button
        className={classNames(
          "h-[25px] w-[25px] select-none rounded-full",
          "flex items-center justify-center",
          "bg-white font-mono text-xs font-bold uppercase"
        )}
        type="button"
        aria-label="Share this todo list"
      >
        <PlusIcon fill="currentColor" className="text-inverse" />
      </button>
    </Dialog.Trigger>

    <Dialog.Content title="Share this todo list">
      <ShareTodoListDialogContent />
    </Dialog.Content>
  </Dialog.Root>
);