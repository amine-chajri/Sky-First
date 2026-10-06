import crypto from "node:crypto";

export interface BaseDoc {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NewDoc<T extends BaseDoc> = Omit<T, "_id" | "createdAt" | "updatedAt">;

export interface InMemoryCollection<T extends BaseDoc> {
  all(): T[];
  insert(data: NewDoc<T>): T;
  insertMany(items: NewDoc<T>[]): T[];
  deleteAll(): void;
  count(): number;
}

export function generateId(): string {
  return crypto.randomBytes(12).toString("hex");
}

export function createCollection<T extends BaseDoc>(): InMemoryCollection<T> {
  const rows: T[] = [];

  const insert = (data: NewDoc<T>): T => {
    const now = new Date();
    const doc = { ...data, _id: generateId(), createdAt: now, updatedAt: now } as T;
    rows.push(doc);
    return doc;
  };

  return {
    all: () => rows,
    insert,
    insertMany: (items) => items.map(insert),
    deleteAll: () => {
      rows.length = 0;
    },
    count: () => rows.length,
  };
}