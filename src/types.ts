export const user_roles = ["admin", "user"] as const;
export type user_role = (typeof user_roles)[number];
