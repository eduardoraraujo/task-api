import { randomUUID } from "node:crypto";
import { Database } from "./middlewares/database.js";
import { buildRoutePath } from "./utils/build-route-path.js";
import { add } from "date-fns";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const tasks = database.select("tasks");

      return res.end(
        JSON.stringify({
          message: "Tasks retrieved successfully",
          data: tasks,
        })
      );
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description, completed_at, created_at, updated_at } =
        req.body;

      if (!title || !description) {
        return res
          .writeHead(400, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: "Title and description are required" }));
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: completed_at ? new Date(completed_at) : null,
        created_at: created_at
          ? add(new Date(created_at), { hours: -3 })
          : add(new Date(), { hours: -3 }),
        updated_at: updated_at
          ? add(new Date(updated_at), { hours: -3 })
          : add(new Date(), { hours: -3 }),
      };

      database.insert("tasks", task);

      return res.writeHead(201).end(
        JSON.stringify({
          message: "Task created successfully",
          data: task,
        })
      );
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const existingTask = database
        .select("tasks")
        .find((task) => task.id === id);

      if (!existingTask) {
        return res
          .writeHead(404, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: "Task not found" }));
      }

      database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description, completed_at } = req.body;

      const existingTask = database
        .select("tasks")
        .find((task) => task.id === id);

      if (!existingTask) {
        return res
          .writeHead(404, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: "Task not found" }));
      }

      if (!title && !description) {
        return res
          .writeHead(400, { "Content-Type": "application/json" })
          .end(
            JSON.stringify({ error: "Title and description must be provided" })
          );
      }

      const updatedTask = {
        id: id,
        title,
        description,
        completed_at: completed_at ? new Date(completed_at) : null,
        created_at: existingTask.created_at,
        updated_at: add(new Date(), { hours: -3 }),
      };

      database.update("tasks", id, updatedTask);

      return res.writeHead(200, { "Content-Type": "application/json" }).end(
        JSON.stringify({
          message: "Task updated successfully",
          data: updatedTask,
        })
      );
    },
  },
];
