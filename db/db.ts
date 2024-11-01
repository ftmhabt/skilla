import Dexie, { type EntityTable } from "dexie";

interface Field {
  id: number;
  name: string;
  roadmap:
    | {
        id: number;
        topic: string;
        subtopics:
          | {
              name: string;
              isChecked: boolean;
              checklist:
                | {
                    name: string;
                    isChecked: boolean;
                  }[]
                | null;
            }[]
          | null;
      }[]
    | null;
}

const db = new Dexie("FieldsDatabase") as Dexie & {
  fields: EntityTable<Field, "id">;
};

db.version(6).stores({
  fields: "++id, name, roadmap",
});

export type { Field };
export { db };
