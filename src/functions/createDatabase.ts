import { executeRawStatement } from "./databaseFunctions";

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
    const info_insert = `INSERT INTO gid_info (key, value) VALUES (?, ?)`;
    executeRawStatement(info_insert, "version", "0.1.0");
    executeRawStatement(info_insert, "installation_timestamp", Date.now().toString());
    executeRawStatement(info_insert, "last_startup_timestamp", Date.now().toString());
  }

  console.log("# Finished Creating Database");
  console.log("----------------------------");
  return true;
}
