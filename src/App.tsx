import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { runInAction, reaction, toJS } from "mobx";
import { TodoList } from "./components/TodoList/TodoList";
import { Layout, Space, Button } from "antd";
import store from "./store/store";
import PoweroffOutlined from "@ant-design/icons";
import { Task } from "./interfaces";
import { io } from "socket.io-client";
import * as R from "ramda";
import axios from "axios";

const { Header, Footer, Sider, Content } = Layout;

const socket = io("http://localhost:3003");

const storeReactions = reaction(
  () => {
    const newTaskList = R.indexBy(R.prop("id"), toJS(store.tasks));
    return toJS(newTaskList);
  },
  (newTasks: Record<string, Task>, oldTasks: Record<string, Task>) => {
    if (!store.ignoreNextChanges) {
      const probablyUpdatedTaskIds = R.union(
        R.keys(newTasks),
        R.keys(oldTasks),
      );
      const tasksToUpdate = R.filter(
        (id) => !R.equals(newTasks[id], oldTasks[id]),
        probablyUpdatedTaskIds,
      );
      const taskIdsToDelete = R.difference(
        Object.keys(oldTasks),
        Object.keys(newTasks),
      );

      for (const id of taskIdsToDelete) {
        void socket.emit("deletedTodo", id);
      }

      let tasksIdsToCreate = R.difference(
        Object.keys(newTasks),
        Object.keys(oldTasks),
      );
      for (const id of tasksIdsToCreate) {
        void socket.emit("newTodo", newTasks[id]);
      }
      for (const id of tasksToUpdate) {
        newTasks[id] && void socket.emit("editedTodo", newTasks[id]);
      }
    } else {
      store.ignoreNextChanges = false;
    }
  },
);

const App: React.FC = () => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to the server");
    });

    socket.emit("subscribe");

    socket.on("loadingData", (data) => {
      runInAction(() => {
        store.ignoreNextChanges = false;
        store.tasks = JSON.parse(data);
        store.ignoreNextChanges = true;
      });
    });

    socket.on("newTodo", (data) => {
      console.log("newTodo event", data);
      runInAction(() => {
        store.ignoreNextChanges = false;
        store.tasks.push(JSON.parse(data));
        store.ignoreNextChanges = true;
      });
    });

    socket.on("editedTodo", (data) => {
      console.log("editTodo event", data);
      runInAction(() => {
        const parsedData = JSON.parse(data);
        store.ignoreNextChanges = false;
        const index = store.tasks.findIndex(
          (task) => task.id === parsedData.id,
        );
        store.tasks[index] = parsedData;
        store.ignoreNextChanges = true;
      });
    });

    socket.on("deletedTodo", (data) => {
      console.log("deleteTodo event", data);
      runInAction(() => {
        store.ignoreNextChanges = false;
        store.tasks = store.tasks.filter((task) => task.id !== data);
        store.ignoreNextChanges = true;
      });
    });

    const getParentElements = (
      startElement: Element | null,
      targetSelector: string,
    ) => {
      const parents = [];
      let currentElement: Element | null = startElement;

      while (currentElement && currentElement !== document.body) {
        parents.push(currentElement);
        // @ts-ignore
        currentElement = currentElement.parentNode;
        if (
          currentElement &&
          currentElement.nodeType === Node.ELEMENT_NODE &&
          currentElement.matches(targetSelector)
        ) {
          break;
        }
      }
      let result: string | null = null;
      for (let i = 0; i < parents.length; i++) {
        if (parents[i].getAttribute("data-status-column")) {
          return (result = parents[i].getAttribute("data-status-column"));
        }
      }
      return result;
    };

    const handleMouseHover = (event: any) => {
      // Get the x and y coordinates of the cursor from the event

      const div = event.target;
      const rect = div.getBoundingClientRect();

      const x = event.clientX;
      const y = event.clientY;

      runInAction(() => {
        store.pointerCoordinates = {
          x: x - store.offserX,
          y: y - store.offserY,
        };
      });

      // Get the element under the cursor
      const elementUnderCursor: Element | null = document.elementFromPoint(
        event.clientX,
        event.clientY,
      );
      const body = document.body;

      // Check if the element has the attribute 'data-status-column'
      const dataStatusColumnValue: string | null | undefined =
        elementUnderCursor?.getAttribute("data-status-column");

      if (dataStatusColumnValue) {
        runInAction(() => {
          store.hoveredStatus = dataStatusColumnValue;
        });
      } else {
        if (getParentElements(elementUnderCursor, "BODY")) {
          runInAction(() => {
            return (store.hoveredStatus = getParentElements(
              elementUnderCursor,
              "BODY",
            ));
          });
        } else {
          runInAction(() => {
            store.hoveredStatus = null;
          });
        }
      }
    };
    const handleUpdateUser = async (task: Task) => {
      try {
        runInAction(() => {
          task.status = store.hoveredStatus;
          store.movingTask = null;
        });
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const handleMouseUp = (event: any) => {
      if (
        event.target.getAttribute("data-status-column") ||
        getParentElements(event.target, "BODY")
      ) {
        runInAction(() => {
          const task = store.tasks.find(
            (task: Task) => task.id == store.movingTask,
          );

          if (task) {
            handleUpdateUser(task);
          }
        });
      } else {
        runInAction(() => {
          store.movingTask = null;
        });
      }
    };

    // Add the onMouseMove event listener to the body element
    document.body.addEventListener("pointermove", handleMouseHover);

    document.body.addEventListener("pointerup", handleMouseUp);

    return () => {
      socket.disconnect();
      storeReactions();
    };
  }, []);

  return (
    <div className="App">
      {store.tasksLoading ? (
        <div
          style={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            style={{ border: "none" }}
            icon={<PoweroffOutlined />}
            loading
          />
        </div>
      ) : (
        <TodoList />
      )}
    </div>
  );
};

export default App;
