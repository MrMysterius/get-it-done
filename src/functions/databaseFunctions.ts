import Database from "better-sqlite3";
import { db } from "../main";

export function executeRawStatement(sql_statement: string, ...params: any[]): Responses.Database<Database.RunResult | null> {
  try {
    const res = db.prepare(sql_statement).run(...params);
    return { isSuccessful: true, data: res };
  } catch (err) {
    console.log(err);
    return { isSuccessful: false, data: null };
  }
}
