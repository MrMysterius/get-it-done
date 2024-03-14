import { db, logger } from "@/main";

import Database from "better-sqlite3";

export class DBTransaction<InDataType = unknown> {
  private statement: Database.Statement;

  constructor(sql_statement: string) {
    this.statement = db.prepare<InDataType>(sql_statement);
  }

  run(data: InDataType): Responses.Database<Database.RunResult | null> {
    try {
      const res = this.statement.run(data);
      return { isSuccessful: true, data: res };
    } catch (err) {
      logger.error(err.message, { stack: err.stack });
      return { isSuccessful: false, data: null };
    }
  }

  exec = this.run;
}
