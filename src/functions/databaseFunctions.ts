import { db, logger } from "../main";

import Database from "better-sqlite3";

type IsSQLParameter<Part> = Part extends `@${infer PartA}` ? PartA : never;
type RemoveNewLine<Statement> = Statement extends `${infer PartA}\n${infer PartB}` ? `${PartA} ${RemoveNewLine<PartB>}` : Statement;
type StatementParts<Part> = RemoveNewLine<Part> extends `${infer PartA} ${infer PartB}` ? IsSQLParameter<PartA> | StatementParts<PartB> : IsSQLParameter<Part>;

type SQLPOriginalParameter<Original, Parameter> = Parameter extends keyof Original ? Original[Parameter] : never;

type SQLParameters<Original, Statement extends string> = {
  [Key in StatementParts<Statement>]: SQLPOriginalParameter<Original, Key>;
};

type SelectedColumns<T> = SplitToParts<SplitToParts<SplitToParts<SplitToParts<T, " ,">, " , ">, ", ">, " ">;

type Objectify<Original, Statement extends string> = {
  [Key in Statement]: SQLPOriginalParameter<Original, Key>;
};

type SelectReturn<Original, Statement> = Statement extends `SELECT ${infer PartA} FROM ${infer Anything}`
  ? PartA extends `*`
    ? Original
    : ObjectifyWithOriginal<Original, SelectedColumns<PartA>>
  : never;

// type TESTC = SelectedColumns<"test, test2 ,test3 , test4">;
// type TEST = SelectReturn<GIDData.user, "SELECT test, user_id ,test3 , test4 FROM users">;
// type TESTO = SelectReturn<GIDData.user, "SELECT * FROM users">;

export function executeRawStatement(sql_statement: string, ...params: any[]): Responses.Database<Database.RunResult | null> {
  try {
    const res = db.prepare(sql_statement).run(...params);
    return { isSuccessful: true, data: res };
  } catch (err: any) {
    logger.error(err.message, { stack: err.stack });
    return { isSuccessful: false, data: null };
  }
}

export function getData<ResponseDataType>(sql_statement: string, ...params: any[]): Responses.Database<ResponseDataType | null> {
  try {
    const data: ResponseDataType = db.prepare(sql_statement).get(...params) as ResponseDataType;
    return { isSuccessful: true, data };
  } catch (err: any) {
    logger.error(err.message, { stack: err.stack });
    return { isSuccessful: false, data: null };
  }
}

export function getAllData<ResponseDataType>(sql_statement: string, ...params: any[]): Responses.Database<Array<ResponseDataType> | null> {
  try {
    const data: Array<ResponseDataType> = db.prepare(sql_statement).all(...params) as Array<ResponseDataType>;
    return { isSuccessful: true, data };
  } catch (err: any) {
    logger.error(err.message, { stack: err.stack });
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
        logger.error(err.message, { stack: err.stack });
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
        logger.error(err.message, { stack: err.stack });
        return { isSuccessful: false, data: null };
      }
    },
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
