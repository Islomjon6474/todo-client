import React, { FunctionComponent, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import store from "../../store/store";

type TaskProps = {
  todo: {
    id: string;
    title: string;
    color: string;
    textColor: string;
  };
};

export const AddTask: FunctionComponent<TaskProps> = observer(({ todo }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div
        className="capitalize flex items-start font-bold w-auto px-1q"
        key={todo.id}
      >
        {todo.title}
      </div>
      {store.focusedTaskTitle !== todo.id && (
        <div className="flex justify-start w-full m-y-2">
          <button
            onClick={() => {
              store.showAddInput(todo.id);
              inputRef?.current?.focus();
            }}
          >
            New
          </button>
        </div>
      )}
      {store.focusedTaskTitle === todo.id && (
        <div className="flex justify-between gap-2 w-full">
          <input
            className="rounded-md w-full p-1"
            ref={inputRef}
            defaultValue=""
          />
          <button
            onClick={() => store.addTask(inputRef?.current?.value, todo.title)}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
});
