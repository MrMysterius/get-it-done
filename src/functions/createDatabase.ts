import { createTransactionStatement, executeRawStatement } from "./databaseFunctions";

export function createDatabase() {
  console.log("# Creating Database...");

  console.log("+ Table gid_info");
  executeRawStatement(
    `CREATE TABLE "gid_info" (
      "key"	TEXT NOT NULL,
      "value"	TEXT NOT NULL,
      PRIMARY KEY("key")
    );`
  ).isSuccessful
    ? null
    : process.exit(100);

  console.log("+ Inserting Keys into gid_info");
  {
    const statement = createTransactionStatement(`INSERT INTO gid_info (key, value) VALUES (?, ?)`);
    statement.run("version", "0.1.0");
    statement.run("installation_timestamp", Date.now().toString());
    statement.run("last_startup_timestamp", Date.now().toString());
  }

  console.log("+ Table users");
  executeRawStatement(
    `CREATE TABLE "users" (
      "user_id"	INTEGER,
      "user_name"	TEXT NOT NULL UNIQUE,
      "user_password_hash" TEXT NOT NULL,
      "user_displayname"	TEXT NOT NULL,
      "user_last_action_timestamp"	TEXT,
      "user_active"	INTEGER NOT NULL,
      PRIMARY KEY("user_id" AUTOINCREMENT)
    );`
  );

  console.log("+ Table groups");
  executeRawStatement(
    `CREATE TABLE "groups" (
      "group_id"	INTEGER,
      "group_name"	TEXT NOT NULL,
      "group_owner"	INTEGER,
      FOREIGN KEY("group_owner") REFERENCES "users"("user_id") ON UPDATE CASCADE ON DELETE CASCADE,
      PRIMARY KEY("group_id" AUTOINCREMENT)
    );`
  );

  console.log("+ Table group_members");
  executeRawStatement(
    `CREATE TABLE "group_members" (
      "group_id"	INTEGER,
      "user_id"	INTEGER,
      FOREIGN KEY("user_id") REFERENCES "users"("user_id") ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY("group_id") REFERENCES "groups"("group_id") ON UPDATE CASCADE ON DELETE CASCADE,
      PRIMARY KEY("group_id","user_id")
    );`
  );

  console.log("+ Table filters");
  executeRawStatement(
    `CREATE TABLE "filters" (
      "filter_id"	INTEGER,
      "user_id"	INTEGER,
      "filter_data"	TEXT NOT NULL,
      FOREIGN KEY("user_id") REFERENCES "users"("user_id") ON UPDATE CASCADE ON DELETE CASCADE,
      PRIMARY KEY("filter_id" AUTOINCREMENT)
    );`
  );

  console.log("+ Table states");
  executeRawStatement(
    `CREATE TABLE "states" (
      "state_id"	INTEGER,
      "group_id"	INTEGER,
      "state_name"	TEXT NOT NULL,
      "state_description"	TEXT DEFAULT '',
      "state_colour_text"	TEXT NOT NULL DEFAULT '#000000',
      "state_colour_background"	TEXT NOT NULL DEFAULT '#262626',
      FOREIGN KEY("group_id") REFERENCES "groups"("group_id") ON UPDATE CASCADE ON DELETE CASCADE,
      PRIMARY KEY("state_id" AUTOINCREMENT)
    );`
  );

  console.log("+ Table tags");
  executeRawStatement(
    `CREATE TABLE "tags" (
      "tag_id"	INTEGER,
      "group_id"	INTEGER,
      "tag_name"	TEXT NOT NULL,
      "tag_description"	TEXT DEFAULT '',
      "tag_type"	TEXT NOT NULL,
      "tag_colour_text"	TEXT NOT NULL DEFAULT '#000000',
      "tag_colour_background"	TEXT NOT NULL DEFAULT '#66a3ff',
      FOREIGN KEY("group_id") REFERENCES "groups"("group_id") ON UPDATE CASCADE ON DELETE CASCADE,
      PRIMARY KEY("tag_id" AUTOINCREMENT)
    );`
  );

  console.log("+ Table tasks");
  executeRawStatement(
    `CREATE TABLE "tasks" (
      "task_id"	INTEGER,
      "group_id"	INTEGER,
      "task_title"	TEXT,
      "task_description"	TEXT,
      "task_date_start"	TEXT,
      "task_date_due"	TEXT,
      "task_time_estimate"	INTEGER,
      "task_time_needed"	INTEGER,
      "task_archived"	INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY("group_id") REFERENCES "groups"("group_id") ON UPDATE CASCADE ON DELETE CASCADE,
      PRIMARY KEY("task_id" AUTOINCREMENT)
    );`
  );

  console.log("+ Table task_tags");
  executeRawStatement(
    `CREATE TABLE "task_tags" (
      "task_id"	INTEGER,
      "tag_id"	INTEGER,
      FOREIGN KEY("tag_id") REFERENCES "tags"("tag_id") ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY("task_id") REFERENCES "tasks"("task_id") ON UPDATE CASCADE ON DELETE CASCADE,
      PRIMARY KEY("task_id","tag_id")
    );`
  );

  console.log("+ Table task_state");
  executeRawStatement(
    `CREATE TABLE "task_state" (
      "task_id"	INTEGER UNIQUE,
      "state_id"	INTEGER,
      FOREIGN KEY("state_id") REFERENCES "states"("state_id") ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY("task_id") REFERENCES "tasks"("task_id") ON UPDATE CASCADE ON DELETE CASCADE,
      PRIMARY KEY("task_id","state_id")
    );`
  );

  console.log("+ Table comments");
  executeRawStatement(
    `CREATE TABLE "comments" (
      "comment_id"	INTEGER,
      "task_id"	INTEGER,
      "user_id"	INTEGER,
      "comment"	TEXT NOT NULL,
      FOREIGN KEY("task_id") REFERENCES "tasks"("task_id") ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY("user_id") REFERENCES "users"("user_id") ON UPDATE CASCADE ON DELETE CASCADE,
      PRIMARY KEY("comment_id" AUTOINCREMENT)
    );`
  );

  console.log("# Finished Creating Database");
  console.log("----------------------------");
  return true;
}
