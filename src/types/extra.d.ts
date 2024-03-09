declare namespace GIDData {
  interface gid_info {
    key: string;
    value: any;
  }

  interface user {
    user_id: string;
    user_name: string;
    user_password_hash: string;
    user_displayname: string;
    user_role: user_role;
    user_last_action_timestamp: string;
    user_active: boolean;
    user_invited_from: string | null;
  }

  type user_role = "admin" | "user";

  interface group {
    group_id: string;
    group_name: string;
    group_owner: string;
  }

  interface invite {
    invite_id: string;
    invite_creator: string;
    invite_code: string;
    invite_limit: number;
    invite_used_amount: number;
  }

  interface group_member {
    group_id: string;
    user_id: string;
  }

  interface state {
    state_id: string;
    state_creator: string;
    state_name: string;
    state_description: string;
    state_colour_text: string;
    state_colour_background: string;
    is_default: boolean;
  }

  interface tag {
    tag_id: string;
    tag_creator: string;
    tag_name: string;
    tag_description: string;
    tag_type: tag_type;
    tag_colour_text: string;
    tag_colour_background: string;
  }

  type tag_type = "context" | "project" | "other";

  interface task {
    task_id: string;
    task_creator: string;
    task_title: string;
    task_description: string;
    task_date_start: string;
    task_date_due: string;
    task_time_estimate: number;
    task_time_needed: number;
    task_archived: boolean;
    task_creation_timestamp: string;
    task_last_edit_timestamp: string;
  }

  interface task_tag {
    task_id: string;
    tag_id: string;
  }

  interface task_state {
    task_id: string;
    state_id: string;
  }

  interface task_asignee {
    task_id: string;
    user_id: string;
  }

  interface comment {
    comment_id: string;
    task_id: string;
    user_id: string;
    comment: string;
    comment_last_changed: string;
  }

  interface inbox_code {
    inbox_id: string;
    inbox_owner: string;
    inbox_code: string;
    inbox_extras: string;
  }

  interface filter {
    filter_id: string;
    filter_creator: string;
    filter_name: string;
    filter_data: string;
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
  user_id: string;
  username: string;
  role: GIDData.user_role;
}

interface AuthedUser {
  user_id: string;
  user_name: string;
  user_displayname: string;
  user_role: GIDData.user_role;
  user_active: boolean;
  user_invited_from: string | null;
}

type StartsWith<T extends string, Start extends string = ""> = T extends `${Start}${infer Part}` ? Part : never;
type EndsWith<T extends string, End extends string = ""> = T extends `${infer Part}${End}` ? Part : never;
type StartsAndEndsWith<T extends string, Start extends string = "", End extends string = ""> = StartsWith<EndsWith<T, End>, Start>;
type SplitToParts<Part, Spliter extends string = " ", Blacklisted extends string = ""> = Part extends `${infer PartA}${Spliter}${infer PartB}`
  ? (PartA extends `${Blacklisted}` ? never : PartA) | SplitToParts<PartB, Spliter>
  : Part;
type ReplaceWith<T extends string, Search extends string = "", Replace extends string = Search> = T extends `${infer PartA}${Search}${infer PartB}`
  ? `${PartA}${Replace}${ReplaceWith<PartB, Search, Replace>}`
  : T;

type KeyTypeExtract<T, K> = K extends keyof T ? T[K] : never;
type KeyExists<T, K> = K extends keyof T ? K : never;

type ObjectifyWithOriginal<Original, K extends string> = {
  [Key in KeyExists<Original, K>]: KeyTypeExtract<Original, Key>;
};
