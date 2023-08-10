import React, { FunctionComponent, useRef } from "react";
import { observer } from "mobx-react-lite";
import { TodoTasks } from "../TodoTasks/TodoTasks";
import store from "../../store/store";
import { AddTask } from "../AddTask/AddTask";

export const TodoList: FunctionComponent = observer(() => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={"todolist"}>
      <div className="m-6 flex justify-between  w-100 gap-x-2">
        {store.statusColumns.map(
          (todo: {
            id: string;
            title: string;
            color: string;
            textColor: string;
          }) => (
            <div
              data-status-column={todo.title}
              className="flex  w-full p-4 rounded-md h-fit gap-y-2 flex-col"
              style={{
                backgroundColor: todo.color,
                color: todo.textColor,
                outline:
                  store.hoveredStatus == todo.title && store.movingTask
                    ? "dashed"
                    : "none",
              }}
              key={todo.id}
            >
              {/*The section where new tasks are added and the name of the status is shown*/}
              <AddTask todo={todo} />

              {/*The list of tasks that are related to this status*/}
              <TodoTasks listTitle={todo.title} />
            </div>
          ),
        )}
      </div>
    </div>
  );
});
