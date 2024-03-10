import { db, logger } from "../main";

import Database from "better-sqlite3";

type SQLParameters<Original, T extends string> = ObjectifyWithOriginal<Original, StartsWith<SplitToParts<ReplaceWith<T, "\n", " ">>, "@">>;

type SelectedColumns<T> = SplitToParts<SplitToParts<SplitToParts<SplitToParts<T, " ,">, " , ">, ", ">, " ">;

type SelectReturn<Original, Statement> = Statement extends `SELECT ${infer PartA} FROM ${infer Anything}`
  ? PartA extends `*`
    ? Original
    : ObjectifyWithOriginal<Original, SelectedColumns<PartA>>
  : Original | never;

/**
 * @deprecated Will soon be Removed
 */
export function executeRawStatement(sql_statement: string, ...params: any[]): Responses.Database<Database.RunResult | null> {
  try {
    const res = db.prepare(sql_statement).run(...params);
    return { isSuccessful: true, data: res };
  } catch (err: any) {
    logger.error(err.message, { stack: err.stack });
    return { isSuccessful: false, data: null };
  }
}

/**
 * @deprecated Will soon be Removed
 */
export function getData<ResponseDataType>(sql_statement: string, ...params: any[]): Responses.Database<ResponseDataType | null> {
  try {
    const data: ResponseDataType = db.prepare(sql_statement).get(...params) as ResponseDataType;
    return { isSuccessful: true, data };
  } catch (err: any) {
    logger.error(err.message, { stack: err.stack });
    return { isSuccessful: false, data: null };
  }
}

/**
 * @deprecated Will soon be Removed
 */
export function getAllData<ResponseDataType>(sql_statement: string, ...params: any[]): Responses.Database<Array<ResponseDataType> | null> {
  try {
    const data: Array<ResponseDataType> = db.prepare(sql_statement).all(...params) as Array<ResponseDataType>;
    return { isSuccessful: true, data };
  } catch (err: any) {
    logger.error(err.message, { stack: err.stack });
    return { isSuccessful: false, data: null };
  }
}

/**
 * @deprecated Will soon be Removed
 */
export function createTransactionStatement(sql_statement: string) {
  const statement = db.prepare(sql_statement);
  return {
    run: (...params: any[]) => {
      try {
        const res = statement.run(...params);
        return { isSuccessful: true, data: res };
      } catch (err: any) {
        logger.error(err.message, { stack: err.stack });
        return { isSuccessful: false, data: null };
      }
    },
  };
}

/**
 * @deprecated Will soon be Removed
 */
export function createTransactionStatementTyped<TransactionRequiredData>(sql_statement: string) {
  const statement = db.prepare(sql_statement);
  return {
    run: (data: TransactionRequiredData) => {
      try {
        const res = statement.run(data);
        return { isSuccessful: true, data: res };
      } catch (err: any) {
        logger.error(err.message, { stack: err.stack });
        return { isSuccessful: false, data: null };
      }
    },
  };
}

export function createTransaction<InputDataType>() {
  return function <T extends string>(sql_statement: T) {
    const statement = db.prepare(sql_statement);
    return {
      run: (data: SQLParameters<InputDataType, T>) => {
        try {
          const res = statement.run(data);
          return { isSuccessful: true, data: res };
        } catch (err: any) {
          logger.error(err.message, { stack: err.stack });
          return { isSuccessful: false, data: null };
        }
      },
    };
  };
}

export function createDataQuery<InputDataType = null, ResponseDataType = InputDataType>() {
  return function <T extends string>(sql_statement: T) {
    const statement = db.prepare(sql_statement);

    return {
      get: (data: SQLParameters<InputDataType, T>) => {
        try {
          const returnedData = statement.get(data) as SelectReturn<ResponseDataType, T>;
          const res: Responses.Database<SelectReturn<ResponseDataType, T> | null> = { isSuccessful: true, data: returnedData };
          return res;
        } catch (err: any) {
          logger.error(err.message, { stack: err.stack });
          const res: Responses.Database<SelectReturn<ResponseDataType, T> | null> = { isSuccessful: false, data: null };
          return res;
        }
      },
      getAll: (data: SQLParameters<InputDataType, T>) => {
        try {
          const returnedData = statement.all(data) as SelectReturn<ResponseDataType, T>[];
          const res: Responses.Database<SelectReturn<ResponseDataType, T>[] | null> = { isSuccessful: true, data: returnedData };
          return res;
        } catch (err: any) {
          logger.error(err.message, { stack: err.stack });
          const res: Responses.Database<SelectReturn<ResponseDataType, T>[] | null> = { isSuccessful: false, data: null };
          return res;
        }
      },
    };
  };
}
