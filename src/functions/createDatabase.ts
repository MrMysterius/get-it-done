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

  console.log("# Finished Creating Database");
  console.log("----------------------------");
  return true;
}
