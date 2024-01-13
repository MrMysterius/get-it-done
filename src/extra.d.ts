declare namespace GIDData {
  interface gid_info {
    key: string;
    value: any;
  }

  type user_role = "admin" | "user";
}

declare namespace Responses {
  interface Database<ResponseDataType> {
    isSuccessful: boolean;
    data: ResponseDataType;
  }
}

declare interface Error {
  status?: number;
}

interface TokenUser {
  user_id: number;
  username: string;
  role: GIDData.user_role;
}
