export const user_roles = ["admin", "user"] as const;
export type user_role = (typeof user_roles)[number];

export const tag_types = ["context", "project", "other"] as const;
export type tag_type = (typeof user_roles)[number];
