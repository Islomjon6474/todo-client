import React, { FunctionComponent, useRef } from "react";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import taskStore from "../../store/store";
import { Task } from "../../interfaces";

type CardProps = {
  listTitle: string;
};

export const TodoTasks: FunctionComponent<CardProps> = observer(
  ({ listTitle }) => {
    const editTaskInputRef = useRef<HTMLInputElement>(null);
    return (
      <div className="todolist flex gap-2 flex-col">
        {taskStore.tasks.map((task: Task) => {
          return (
            task.status == listTitle && (
              <div
                className="flex justify-between w-full p-2 rounded-md break-normal bg-white h-fit gap-y-2"
                style={
                  taskStore.movingTask == task.id
                    ? {
                        position: "fixed",
                        left: `${taskStore.pointerCoordinates.x}px`,
                        top: `${taskStore.pointerCoordinates.y}px`,
                        border:
                          "2px solid " +
                          taskStore.statusColumns.find(
                            (statusColumn: {
                              id: string;
                              title: string;
                              color: string;
                              textColor: string;
                            }) => statusColumn.title == listTitle,
                          )?.color,
                        backgroundColor: "white",
                        width: "200px",
                        pointerEvents:
                          taskStore.movingTask == task.id ? "none" : "auto",
                      }
                    : {}
                }
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  runInAction(() => {
                    taskStore.movingTask = task.id;
                    taskStore.offserX =
                      e.clientX - e.currentTarget.getBoundingClientRect().left;
                    taskStore.offserY =
                      e.clientY - e.currentTarget.getBoundingClientRect().top;
                  });
                }}
                key={task.id}
              >
                {taskStore.editingElementId == task.id && (
                  <div className="flex gap-2 ">
                    <input
                      style={{ width: "100%", height: "100%" }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        runInAction(() => {
                          taskStore.movingTask = null;
                        });
                      }}
                      ref={editTaskInputRef}
                      defaultValue={task.title}
                    />
                    <button
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        runInAction(() => {
                          runInAction(() => {
                            taskStore.editingElementId = null;
                            taskStore.movingTask = null;
                            task.title =
                              editTaskInputRef?.current?.value || task.title;
                          });
                        });
                      }}
                    >
                      Done
                    </button>
                  </div>
                )}
                {taskStore.editingElementId != task.id ? (
                  <div className="flex justify-between w-full gap-2">
                    <p className="break-normal h-fit">{task.title}</p>
                    <div className="flex gap-2">
                      <button
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          runInAction(() => {
                            taskStore.editingElementId = task.id;
                            editTaskInputRef?.current?.focus();
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          runInAction(() => {
                            taskStore.movingTask = null;
                          });
                          taskStore.deleteTask(task.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )
          );
        })}
      </div>
    );
  },
);
