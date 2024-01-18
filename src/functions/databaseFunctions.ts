import { db, logger } from "../main";

import Database from "better-sqlite3";

export function executeRawStatement(sql_statement: string, ...params: any[]): Responses.Database<Database.RunResult | null> {
  try {
    const res = db.prepare(sql_statement).run(...params);
    return { isSuccessful: true, data: res };
  } catch (err: any) {
    logger.error(err.stack);
    return { isSuccessful: false, data: null };
  }
}

export function getData<ResponseDataType>(sql_statement: string, ...params: any[]): Responses.Database<ResponseDataType | null> {
  try {
    const data: ResponseDataType = db.prepare(sql_statement).get(...params) as ResponseDataType;
    return { isSuccessful: true, data };
  } catch (err: any) {
    logger.error(err.stack);
    return { isSuccessful: false, data: null };
  }
}

export function getAllData<ResponseDataType>(sql_statement: string, ...params: any[]): Responses.Database<Array<ResponseDataType> | null> {
  try {
    const data: Array<ResponseDataType> = db.prepare(sql_statement).all(...params) as Array<ResponseDataType>;
    return { isSuccessful: true, data };
  } catch (err: any) {
    logger.error(err.stack);
    return { isSuccessful: false, data: null };
  }
}

export function createTransactionStatement(sql_statement: string) {
  const statement = db.prepare(sql_statement);
  return {
    run: (...params: any[]) => {
      try {
        const res = statement.run(...params);
        return { isSuccessful: true, data: res };
      } catch (err: any) {
        logger.error(err.stack);
        return { isSuccessful: false, data: null };
      }
    },
  };
}

export function createTransactionStatementTyped<TransactionRequiredData>(sql_statement: string) {
  const statement = db.prepare(sql_statement);
  return {
    run: (data: TransactionRequiredData) => {
      try {
        const res = statement.run(data);
        return { isSuccessful: true, data: res };
      } catch (err: any) {
        logger.error(err.stack);
        return { isSuccessful: false, data: null };
      }
    },
  };
}
