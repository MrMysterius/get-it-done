-- CreateTable
CREATE TABLE "gid_info" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "displayname" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "last_action_timestamp" TEXT,
    "active" BOOLEAN NOT NULL,
    "invited_from" TEXT,
    CONSTRAINT "user_invited_from_fkey" FOREIGN KEY ("invited_from") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_name" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creator" TEXT NOT NULL,
    "data" Json NOT NULL,
    CONSTRAINT "user_event_creator_fkey" FOREIGN KEY ("creator") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    CONSTRAINT "group_owner_fkey" FOREIGN KEY ("owner") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "group_members" (
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    PRIMARY KEY ("group_id", "user_id"),
    CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "group_event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_name" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origin" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "data" Json NOT NULL,
    CONSTRAINT "group_event_origin_fkey" FOREIGN KEY ("origin") REFERENCES "group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "group_event_creator_fkey" FOREIGN KEY ("creator") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "filters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" Json NOT NULL,
    CONSTRAINT "filters_creator_fkey" FOREIGN KEY ("creator") REFERENCES "group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "state" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "color_text" TEXT NOT NULL DEFAULT '#000000',
    "color_background" TEXT NOT NULL DEFAULT '#262626',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "state_creator_fkey" FOREIGN KEY ("creator") REFERENCES "group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL,
    "color_text" TEXT NOT NULL DEFAULT '#000000',
    "color_background" TEXT NOT NULL DEFAULT '#66a3ff',
    CONSTRAINT "tag_creator_fkey" FOREIGN KEY ("creator") REFERENCES "group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "task" (
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
    CONSTRAINT "task_creator_fkey" FOREIGN KEY ("creator") REFERENCES "group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "task_current_state_fkey" FOREIGN KEY ("current_state") REFERENCES "state" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "task_tag" (
    "task_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    PRIMARY KEY ("task_id", "tag_id"),
    CONSTRAINT "task_tag_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "task_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "task_asignee" (
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    PRIMARY KEY ("task_id", "user_id"),
    CONSTRAINT "task_asignee_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "task_asignee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "task_comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task_id" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "date_creation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_updated" DATETIME NOT NULL,
    CONSTRAINT "task_comment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "task_comment_creator_fkey" FOREIGN KEY ("creator") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "limit" INTEGER NOT NULL DEFAULT 1,
    "uses" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "invite_creator_fkey" FOREIGN KEY ("creator") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inbox_code" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "extra_data" Json NOT NULL,
    CONSTRAINT "inbox_code_owner_fkey" FOREIGN KEY ("owner") REFERENCES "group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "gid_info_key_key" ON "gid_info"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_name_key" ON "user"("name");
