/*
  Warnings:

  - You are about to alter the column `data` on the `filters` table. The data in that column could be lost. The data in that column will be cast from `Unsupported("json")` to `Unsupported("Json")`.
  - You are about to alter the column `data` on the `group_event` table. The data in that column could be lost. The data in that column will be cast from `Unsupported("json")` to `Unsupported("Json")`.
  - You are about to alter the column `extra_data` on the `inbox_code` table. The data in that column could be lost. The data in that column will be cast from `Unsupported("json")` to `Unsupported("Json")`.
  - You are about to alter the column `data` on the `user_event` table. The data in that column could be lost. The data in that column will be cast from `Unsupported("json")` to `Unsupported("Json")`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_filters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" Json NOT NULL,
    CONSTRAINT "filters_creator_fkey" FOREIGN KEY ("creator") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_filters" ("creator", "data", "id", "name") SELECT "creator", "data", "id", "name" FROM "filters";
DROP TABLE "filters";
ALTER TABLE "new_filters" RENAME TO "filters";
CREATE TABLE "new_group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    CONSTRAINT "group_owner_fkey" FOREIGN KEY ("owner") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_group" ("id", "name", "owner") SELECT "id", "name", "owner" FROM "group";
DROP TABLE "group";
ALTER TABLE "new_group" RENAME TO "group";
CREATE TABLE "new_group_event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_name" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origin" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "data" Json NOT NULL,
    CONSTRAINT "group_event_origin_fkey" FOREIGN KEY ("origin") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "group_event_creator_fkey" FOREIGN KEY ("creator") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_group_event" ("creator", "data", "event_name", "id", "origin", "timestamp") SELECT "creator", "data", "event_name", "id", "origin", "timestamp" FROM "group_event";
DROP TABLE "group_event";
ALTER TABLE "new_group_event" RENAME TO "group_event";
CREATE TABLE "new_group_members" (
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    PRIMARY KEY ("group_id", "user_id"),
    CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_group_members" ("group_id", "user_id") SELECT "group_id", "user_id" FROM "group_members";
DROP TABLE "group_members";
ALTER TABLE "new_group_members" RENAME TO "group_members";
CREATE TABLE "new_inbox_code" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "extra_data" Json NOT NULL,
    CONSTRAINT "inbox_code_owner_fkey" FOREIGN KEY ("owner") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_inbox_code" ("code", "extra_data", "id", "owner") SELECT "code", "extra_data", "id", "owner" FROM "inbox_code";
DROP TABLE "inbox_code";
ALTER TABLE "new_inbox_code" RENAME TO "inbox_code";
CREATE TABLE "new_invite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "limit" INTEGER NOT NULL DEFAULT 1,
    "uses" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "invite_creator_fkey" FOREIGN KEY ("creator") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_invite" ("code", "creator", "id", "limit", "uses") SELECT "code", "creator", "id", "limit", "uses" FROM "invite";
DROP TABLE "invite";
ALTER TABLE "new_invite" RENAME TO "invite";
CREATE TABLE "new_state" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "color_text" TEXT NOT NULL DEFAULT '#000000',
    "color_background" TEXT NOT NULL DEFAULT '#262626',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "state_creator_fkey" FOREIGN KEY ("creator") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_state" ("color_background", "color_text", "creator", "description", "id", "is_default", "name") SELECT "color_background", "color_text", "creator", "description", "id", "is_default", "name" FROM "state";
DROP TABLE "state";
ALTER TABLE "new_state" RENAME TO "state";
CREATE TABLE "new_tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL,
    "color_text" TEXT NOT NULL DEFAULT '#000000',
    "color_background" TEXT NOT NULL DEFAULT '#66a3ff',
    CONSTRAINT "tag_creator_fkey" FOREIGN KEY ("creator") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tag" ("color_background", "color_text", "creator", "description", "id", "name", "type") SELECT "color_background", "color_text", "creator", "description", "id", "name", "type" FROM "tag";
DROP TABLE "tag";
ALTER TABLE "new_tag" RENAME TO "tag";
CREATE TABLE "new_task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "date_start" DATETIME,
    "date_due" DATETIME,
    "time_estimate" INTEGER,
    "time_needed" INTEGER,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_updated" DATETIME,
    "current_state" TEXT NOT NULL,
    CONSTRAINT "task_creator_fkey" FOREIGN KEY ("creator") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_current_state_fkey" FOREIGN KEY ("current_state") REFERENCES "state" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_task" ("archived", "creator", "current_state", "date_creation", "date_due", "date_start", "date_updated", "description", "id", "time_estimate", "time_needed", "title") SELECT "archived", "creator", "current_state", "date_creation", "date_due", "date_start", "date_updated", "description", "id", "time_estimate", "time_needed", "title" FROM "task";
DROP TABLE "task";
ALTER TABLE "new_task" RENAME TO "task";
CREATE TABLE "new_task_asignee" (
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    PRIMARY KEY ("task_id", "user_id"),
    CONSTRAINT "task_asignee_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_asignee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_task_asignee" ("task_id", "user_id") SELECT "task_id", "user_id" FROM "task_asignee";
DROP TABLE "task_asignee";
ALTER TABLE "new_task_asignee" RENAME TO "task_asignee";
CREATE TABLE "new_task_comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task_id" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "date_creation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_updated" DATETIME NOT NULL,
    CONSTRAINT "task_comment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_comment_creator_fkey" FOREIGN KEY ("creator") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_task_comment" ("comment", "creator", "date_creation", "date_updated", "id", "task_id") SELECT "comment", "creator", "date_creation", "date_updated", "id", "task_id" FROM "task_comment";
DROP TABLE "task_comment";
ALTER TABLE "new_task_comment" RENAME TO "task_comment";
CREATE TABLE "new_task_tag" (
    "task_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    PRIMARY KEY ("task_id", "tag_id"),
    CONSTRAINT "task_tag_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_task_tag" ("tag_id", "task_id") SELECT "tag_id", "task_id" FROM "task_tag";
DROP TABLE "task_tag";
ALTER TABLE "new_task_tag" RENAME TO "task_tag";
CREATE TABLE "new_user_event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_name" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creator" TEXT NOT NULL,
    "data" Json NOT NULL,
    CONSTRAINT "user_event_creator_fkey" FOREIGN KEY ("creator") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_event" ("creator", "data", "event_name", "id", "timestamp") SELECT "creator", "data", "event_name", "id", "timestamp" FROM "user_event";
DROP TABLE "user_event";
ALTER TABLE "new_user_event" RENAME TO "user_event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
