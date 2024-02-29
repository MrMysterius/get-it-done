import { MigrationObject } from "@/functions/migrateDatabase";

export const Migration: MigrationObject = {
  version: "0.2.4",
  execute: (db, logger) => {
    try {
      let res = db
        .prepare(
          `ALTER TABLE "states"
          ADD COLUMN "is_default" NUMERIC DEFAULT 0`
        )
        .run();
      logger.info(`+ Added Column "is_default" to "states" table.`);
      return true;
    } catch (err) {
      logger.error(err.message, { stack: err.stack });
      return false;
    }
  },
};
