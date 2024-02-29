import { db, logger } from "../main";

import { Database } from "better-sqlite3";
import { Logger } from "winston";
import fs from "fs";
import path from "path";
import { setDatabaseInfo } from "./databaseInfos";

export async function migrateDatabase(current_version: string): Promise<boolean> {
  logger.info("> Starting Migration Check");

  const dir = fs.readdirSync(path.join(__dirname, "../migrations"), { withFileTypes: true });

  const migrationObjects: MigrationObject[] = [];

  for (const obj of dir) {
    if (!obj.isFile()) continue;

    try {
      const imported = await import(path.join("../migrations", obj.name));
      migrationObjects.push(imported.Migration);
    } catch (err) {
      logger.debug(path.join("../migrations", obj.name));
      logger.error(err.message, { stack: err.stack });
      process.exit(1);
    }
  }

  migrationObjects.sort((a, b) => a.version.localeCompare(b.version));

  const versions = migrationObjects.map((obj) => obj.version);
  versions.push(current_version);
  versions.sort((a, b) => a.localeCompare(b));

  const currentMigration = versions.findIndex((v) => v == current_version);

  for (const migrationObject of migrationObjects.slice(currentMigration)) {
    logger.info(`>> Migrating for Version ${migrationObject.version}`);

    if (!migrationObject.execute(db, logger)) {
      logger.error(`# Failed Migration to version ${migrationObject.version} - ABORTING`);
      throw new Error(`Failed to Migrate to version ${migrationObject.version}`);
    }

    setDatabaseInfo({ key: "version", value: migrationObject.version });

    logger.info(`>> Migrated to Version ${migrationObject.version}`);
  }

  logger.info("> Migration Check Completed");

  return true;
}

export interface MigrationObject {
  version: string;
  execute: (db: Database, logger: Logger) => boolean;
}
