import { makeAutoObservable, runInAction, reaction, toJS } from "mobx";
import { nanoid } from "nanoid";
import axios from "axios";
import * as R from "ramda";
import { Task } from "../interfaces";

class ObservableTodoStore {
  constructor() {
    makeAutoObservable(this);
  }
  ignoreNextChanges: boolean = false;
  tasksLoading: boolean = false;
  pointerCoordinates: { x: number; y: number } = { x: 0, y: 0 };
  offserX: number = 0;
  offserY: number = 0;
  editingElementId: string | null = null;
  moving: boolean = false;
  movingTask: string | null = null;
  hoveredStatus: string | null = null;
  statusColumns: {
    id: string;
    title: string;
    color: string;
    textColor: string;
  }[] = [
    {
      id: nanoid(),
      title: "backlog",
      color: "#EDECEA",
      textColor: "#918E8D",
    },
    {
      id: nanoid(),
      title: "todo",
      color: "#F8E0BD",
      textColor: "#C89C3D",
    },
    {
      id: nanoid(),
      title: "in progress",
      color: "#C7D9EB",
      textColor: "#6896AC",
    },
    {
      id: nanoid(),
      title: "test",
      color: "#E9DADB",
      textColor: "#E65A60",
    },
    {
      id: nanoid(),
      title: "done",
      color: "#D6F1E0",
      textColor: "#6A9074",
    },
  ];
  tasks: Task[] = [];
  focusedTaskTitle: string = "";

  addTask(title: string | undefined, listTitle: string) {
    const id = nanoid();
    runInAction(() => {
      this.tasks.push({
        id,
        title: title || "",
        status: listTitle,
      });
    });
    if (title) {
      runInAction(() => {
        this.focusedTaskTitle = "";
      });
    }
  }

  // Opening appropriate creating field of the task
  showAddInput(listId: string) {
    this.focusedTaskTitle = listId;
  }

  deleteTask(itemId: string) {
    this.tasks = this.tasks.filter((task) => task.id !== itemId);
  }
}

const store: ObservableTodoStore = new ObservableTodoStore();
export default store;
