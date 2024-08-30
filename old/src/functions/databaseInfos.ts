import { createTransactionStatementTyped, getAllData, getData } from "./databaseFunctions";

export function getDatabaseInfo(info: string): GIDData.gid_info | null {
  const res = getData<GIDData.gid_info>(`SELECT * FROM gid_info WHERE key = ?`, info);
  return res.data;
}

export function getAllDatabaseInfo(): GIDData.gid_info[] | null {
  const res = getAllData<GIDData.gid_info>(`SELECT * FROM gid_info`);
  return res.data;
}

export function setDatabaseInfo(info: GIDData.gid_info) {
  const res = createTransactionStatementTyped<GIDData.gid_info>(`UPDATE gid_info SET value = @value WHERE key = @key`).run(info);
  if (!res.isSuccessful) {
    throw new Error(`Couldn't update gid_info - KEY: ${info.key}`);
  }
  return res.data;
}
