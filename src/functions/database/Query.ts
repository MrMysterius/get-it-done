import { db, logger } from "@/main";

import Database from "better-sqlite3";

export class DBQuery<InDataType = unknown, OutDataType = unknown> {
  private statement: Database.Statement;

  constructor(sql_statement: string) {
    this.statement = db.prepare<InDataType>(sql_statement);
  }

  get(data: InDataType): Responses.Database<OutDataType | null> {
    try {
      const res = this.statement.get(data) as OutDataType;
      return { isSuccessful: true, data: res };
    } catch (err) {
      logger.error(err.message, { stack: err.stack });
      return { isSuccessful: false, data: null };
    }
  }

  all(data: InDataType): Responses.Database<OutDataType[] | null> {
    try {
      const res = this.statement.all(data) as OutDataType[];
      return { isSuccessful: true, data: res };
    } catch (err) {
      logger.error(err.message, { stack: err.stack });
      return { isSuccessful: false, data: null };
    }
  }
}
