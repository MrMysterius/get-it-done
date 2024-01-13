declare namespace GIDData {
  interface gid_info {
    key: string;
    value: any;
  }

  interface user {
    user_id: number;
    user_name: string;
    user_password_hash: string;
    user_displayname: string;
    user_role: user_role;
    user_last_action_timestamp: string;
    user_active: boolean;
    user_invited_from: number | null;
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

declare namespace Express {
  interface Request {
    isAuthed?: boolean;
  }
}

interface TokenUser {
  user_id: number;
  username: string;
  role: GIDData.user_role;
}
