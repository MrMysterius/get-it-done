import { MigrationObject } from "@/functions/migrateDatabase";

export const Migration: MigrationObject = {
  version: "0.2.5",
  execute: (db, logger) => {
    try {
      db.prepare(
        `ALTER TABLE "tasks"
        ADD COLUMN "task_creation_timestamp" TEXT`
      ).run();
      logger.info(`+ Added Column "task_creation_timestamp" to "tasks" table.`);

      db.prepare(
        `ALTER TABLE "tasks"
        ADD COLUMN "task_last_edit_timestamp" TEXT`
      ).run();
      logger.info(`+ Added Column "task_last_edit_timestamp" to "tasks" table.`);

      return true;
    } catch (err) {
      logger.error(err.message, { stack: err.stack });
      return false;
    }
  },
};
