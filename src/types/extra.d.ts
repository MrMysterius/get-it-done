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

  interface group {
    group_id: number;
    group_name: string;
    group_owner: number;
  }

  interface invite {
    invite_id: number;
    invite_creator: number;
    invite_code: string;
    invite_limit: number;
    invite_used_amount: number;
  }

  interface group_member {
    group_id: number;
    user_id: number;
  }

  interface state {
    state_id: number;
    state_creator: number;
    state_name: string;
    state_description: string;
    state_colour_text: string;
    state_colour_background: string;
  }

  interface tag {
    tag_id: number;
    tag_creator: number;
    tag_name: string;
    tag_description: string;
    tag_type: tag_type;
    tag_colour_text: string;
    tag_colour_background: string;
  }

  type tag_type = "context" | "project" | "other";

  interface task {
    task_id: number;
    task_creator: number;
    task_title: string;
    task_description: string;
    task_date_start: string;
    task_date_due: string;
    task_time_estimate: number;
    task_time_needed: number;
    task_archived: boolean;
  }

  interface task_tag {
    task_id: number;
    tag_id: number;
  }
}

declare namespace Responses {
  interface Database<ResponseDataType> {
    isSuccessful: boolean;
    data: ResponseDataType;
  }
}

declare interface Error {
  status?: number;
  details?: any;
}

declare interface ErrorResponse {
  status: number;
  message: any;
  details?: any;
}

declare namespace Express {
  interface Request {
    isAuthed?: boolean;
    authedUser?: AuthedUser | null;
    extra: {
      params: {
        [key: string]: any;
      };
      [key: string]: any;
    };
  }
}

interface TokenUser {
  user_id: number;
  username: string;
  role: GIDData.user_role;
}

interface AuthedUser {
  user_id: number;
  user_name: string;
  user_displayname: string;
  user_role: GIDData.user_role;
  user_active: boolean;
  user_invited_from: number | null;
}
