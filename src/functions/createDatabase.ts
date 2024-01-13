import { createTransactionStatement, executeRawStatement } from "./databaseFunctions";

import { generatePasswordHash } from "./generatePasswordHash";

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
    ? "OK"
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
      "user_password_hash"	TEXT NOT NULL,
      "user_displayname"	TEXT NOT NULL,
      "user_role"	TEXT NOT NULL DEFAULT 'user',
      "user_last_action_timestamp"	TEXT,
      "user_active"	INTEGER NOT NULL,
      "user_invited_from"	INTEGER DEFAULT NULL,
      PRIMARY KEY("user_id" AUTOINCREMENT),
      FOREIGN KEY("user_invited_from") REFERENCES "users"("user_id")
    );`
  );

  console.log("+ Inserting Default Admin User - admin:admin");
  {
    const statement = createTransactionStatement(
      `INSERT INTO users (user_name, user_password_hash, user_displayname, user_last_action_timestamp, user_active) VALUES (?, ?, ? ,? ,?)`
    );
    statement.run(process.env.ADMIN_USERNAME || "admin", generatePasswordHash(process.env.ADMIN_PASSWORD || "admin"), "Admin", Date.now().toString(), 1)
      .isSuccessful
      ? "OK"
      : process.exit(101);
  }

  console.log("+ Table groups");
  executeRawStatement(
    `CREATE TABLE "groups" (
      "group_id"	INTEGER,
      "group_name"	TEXT NOT NULL,
      "group_owner"	INTEGER NOT NULL,
      PRIMARY KEY("group_id" AUTOINCREMENT),
      FOREIGN KEY("group_owner") REFERENCES "users"("user_id") ON UPDATE CASCADE ON DELETE CASCADE
    );`
  );

  console.log("+ Table group_members");
  executeRawStatement(
    `CREATE TABLE "group_members" (
      "group_id"	INTEGER NOT NULL,
      "user_id"	INTEGER NOT NULL,
      PRIMARY KEY("group_id","user_id"),
      FOREIGN KEY("user_id") REFERENCES "users"("user_id") ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY("group_id") REFERENCES "groups"("group_id") ON UPDATE CASCADE ON DELETE CASCADE
    );`
  );

  console.log("+ Table filters");
  executeRawStatement(
    `CREATE TABLE "filters" (
      "filter_id"	INTEGER,
      "filter_creator"	INTEGER,
      "filter_data"	TEXT NOT NULL DEFAULT '{}',
      PRIMARY KEY("filter_id" AUTOINCREMENT),
      FOREIGN KEY("filter_creator") REFERENCES "groups"("group_id") ON UPDATE CASCADE ON DELETE CASCADE
    );`
  );

  console.log("+ Table states");
  executeRawStatement(
    `CREATE TABLE "states" (
      "state_id"	INTEGER,
      "state_creator"	INTEGER NOT NULL,
      "state_name"	TEXT NOT NULL,
      "state_description"	TEXT DEFAULT '',
      "state_colour_text"	TEXT NOT NULL DEFAULT '#000000',
      "state_colour_background"	TEXT NOT NULL DEFAULT '#262626',
      PRIMARY KEY("state_id" AUTOINCREMENT),
      FOREIGN KEY("state_creator") REFERENCES "groups"("group_id") ON UPDATE CASCADE ON DELETE CASCADE
    );`
  );

  console.log("+ Table tags");
  executeRawStatement(
    `CREATE TABLE "tags" (
      "tag_id"	INTEGER,
      "tag_creator"	INTEGER NOT NULL,
      "tag_name"	TEXT NOT NULL,
      "tag_description"	TEXT DEFAULT '',
      "tag_type"	TEXT NOT NULL,
      "tag_colour_text"	TEXT NOT NULL DEFAULT '#000000',
      "tag_colour_background"	TEXT NOT NULL DEFAULT '#66a3ff',
      FOREIGN KEY("tag_creator") REFERENCES "groups"("group_id") ON UPDATE CASCADE ON DELETE CASCADE,
      PRIMARY KEY("tag_id" AUTOINCREMENT)
    );`
  );

  console.log("+ Table tasks");
  executeRawStatement(
    `CREATE TABLE "tasks" (
      "task_id"	INTEGER,
      "task_creator"	INTEGER NOT NULL,
      "task_title"	TEXT,
      "task_description"	TEXT,
      "task_date_start"	TEXT,
      "task_date_due"	TEXT,
      "task_time_estimate"	INTEGER,
      "task_time_needed"	INTEGER,
      "task_archived"	INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY("task_id" AUTOINCREMENT),
      FOREIGN KEY("task_creator") REFERENCES "groups"("group_id") ON UPDATE CASCADE ON DELETE CASCADE
    );`
  );

  console.log("+ Table task_tags");
  executeRawStatement(
    `CREATE TABLE "task_tags" (
      "task_id"	INTEGER NOT NULL,
      "tag_id"	INTEGER NOT NULL,
      PRIMARY KEY("task_id","tag_id"),
      FOREIGN KEY("tag_id") REFERENCES "tags"("tag_id") ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY("task_id") REFERENCES "tasks"("task_id") ON UPDATE CASCADE ON DELETE CASCADE
    );`
  );

  console.log("+ Table task_state");
  executeRawStatement(
    `CREATE TABLE "task_state" (
      "task_id"	INTEGER NOT NULL UNIQUE,
      "state_id"	INTEGER NOT NULL,
      PRIMARY KEY("task_id","state_id"),
      FOREIGN KEY("state_id") REFERENCES "states"("state_id") ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY("task_id") REFERENCES "tasks"("task_id") ON UPDATE CASCADE ON DELETE CASCADE
    );`
  );

  console.log("+ Table comments");
  executeRawStatement(
    `CREATE TABLE "comments" (
      "comment_id"	INTEGER,
      "task_id"	INTEGER NOT NULL,
      "user_id"	INTEGER NOT NULL,
      "comment"	TEXT NOT NULL,
      PRIMARY KEY("comment_id" AUTOINCREMENT),
      FOREIGN KEY("task_id") REFERENCES "tasks"("task_id") ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY("user_id") REFERENCES "users"("user_id") ON UPDATE CASCADE ON DELETE CASCADE
    );`
  );

  console.log("+ Table invites");
  executeRawStatement(
    `CREATE TABLE "invites" (
      "invite_id"	INTEGER,
      "invite_creator"	INTEGER NOT NULL,
      "invite_code"	TEXT NOT NULL UNIQUE,
      "invite_limit"	INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY("invite_creator") REFERENCES "users"("user_id") ON UPDATE CASCADE ON DELETE CASCADE,
      PRIMARY KEY("invite_id" AUTOINCREMENT)
    );`
  );

  console.log("+ Table inbox_codes");
  executeRawStatement(
    `CREATE TABLE "inbox_codes" (
      "inbox_id"	INTEGER,
      "inbox_owner"	INTEGER NOT NULL,
      "inbox_code"	TEXT NOT NULL,
      "inbox_extras"	TEXT DEFAULT '{}',
      PRIMARY KEY("inbox_id" AUTOINCREMENT),
      FOREIGN KEY("inbox_owner") REFERENCES "groups"("group_id") ON UPDATE CASCADE ON DELETE CASCADE
    );`
  );

  console.log("# Finished Creating Database");
  console.log("----------------------------");
  return true;
}
