import { getAllData, getData } from "./databaseFunctions";

export function getDatabaseInfo<ResponseType>(info: string): ResponseType | null {
  const res = getData<ResponseType>(`SELECT * FROM gid_info WHERE key = ?`, info);
  return res.data;
}

export function getAllDatabaseInfo(): GIDData.gid_info[] | null {
  const res = getAllData<GIDData.gid_info>(`SELECT * FROM gid_info`);
  return res.data;
}
