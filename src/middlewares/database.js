import { readFileSync, writeFileSync } from "node:fs";

const databasePath = new URL("../db.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    this.#readDatabase();
  }

  #readDatabase() {
    const data = readFileSync(databasePath, "utf-8");
    this.#database = JSON.parse(data);
  }

  #persist() {
    writeFileSync(databasePath, JSON.stringify(this.#database));
  }

  select(table) {
    this.#readDatabase();

    let data = this.#database[table] ?? [];

    return data;
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();

    return data;
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
    }
  }

  deleteAll(table) {
    if (this.#database[table]) {
      this.#database[table] = [];
      this.#persist();
    }
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      this.#database[table][rowIndex] = { id, ...data };
      this.#persist();
    }
  }
}
