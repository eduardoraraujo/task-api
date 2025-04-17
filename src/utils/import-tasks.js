import { Transform } from "node:stream";
import { randomUUID } from "node:crypto";
import { add } from "date-fns";
import { parse } from "csv-parse";
import { Database } from "../middlewares/database.js";

const database = new Database();

class TaskTransformStream extends Transform {
  constructor() {
    super({ objectMode: true });
    this.database = database;
  }

  _transform(chunk, encoding, callback) {
    const row = chunk;

    const { completed_at, created_at, updated_at } = row;

    const task = {
      id: randomUUID(),
      title: row.title,
      description: row.description,
      completed_at: completed_at ? new Date(completed_at) : null,
      created_at: created_at
        ? add(new Date(created_at), { hours: -3 })
        : add(new Date(), { hours: -3 }),
      updated_at: updated_at
        ? add(new Date(updated_at), { hours: -3 })
        : add(new Date(), { hours: -3 }),
    };

    this.database.insert("tasks", task);

    callback(null, JSON.stringify(task) + "\n");
  }
}

export async function importTasks(req, res, database) {
  const parser = parse({ columns: true, trim: true });
  const taskTransform = new TaskTransformStream(database);

  req.pipe(parser).pipe(taskTransform);

  req.on("end", () => {
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Tasks imported successfully" }));
  });

  req.on("error", (error) => {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to import tasks",
        details: error.message,
      })
    );
  });
}
