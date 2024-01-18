# Get It Done - Documentation

## Environment Variables

| Name           | Description                                                | Default |
| -------------- | ---------------------------------------------------------- | ------- |
| COOKIE_SECRET  | **IMPORTANT** - Used for signing auth cookie with a secret | -       |
| TOKEN_SECRET   | **IMPORTANT** - Used for signing the Auth Tokens           | -       |
| PORT           | Used for changing the Port on which the App listens        | 3500    |
| ADMIN_USERNAME | The default admins username                                | admin   |
| ADMIN_PASSWORD | The default admins password                                | admin   |
| LOG_LEVEL      | The level of logs to be displayed                          | info    |

## Error Codes

### 1

Unexpected Application Stop - This could be a number of things, but something just didn't go right.

## API Routes/Endpoints

The API is found under /api and then add the routes from here on top of that.
So /users wold be /api/users.

For authentication either have the the `token` cookie set (got from the /auth route)

### POST /auth

**THIS ROUTE IS UNDER THE ROOT AS AN EXCEPTION**

This route/endpoint is used to get authentication.

POST Request with either JSON Body:

```json
{
  "username": "USERNAME",
  "password": "PASSWORD"
}
```

or also with a Form POST from for example a html form.

Response with setting a cookie on the client called `token` which is signed but basically a JsonWebToken auth token.
It also returns JSON data with the token directly for using in the `Authorization` header instead.

```json
{
  "token": "TOKEN_FOR_AUTHORIZATION_HEADER"
}
```

### GET /users

**ADMIN ONLY**

For getting a full list of all users.

Returns:

```json
[
  {
    // USER OBJECT
  },
  {
    // ANOTHER USER OBJECT
  }
]
```

#### User Object

| KEY              | DESCRIPTION                                      | VALUE TYPE                                |
| ---------------- | ------------------------------------------------ | ----------------------------------------- |
| user_id          | The users id                                     | number                                    |
| user_name        | The users name - unique                          | string                                    |
| user_displayname | The users display name                           | string                                    |
| user_role        | The users role                                   | `admin` or `user`                         |
| last_action      | A timestamp of the users last action on the app  | string                                    |
| user_active      | If user is activated and can do stuff (soft ban) | `0` or `1`                                |
| invitee          | An object of who invited this user               | [Invitee Object](#invitee-object) or null |

#### Invitee Object

| KEY              | DESCRIPTION                                  | VALUE TYPE |
| ---------------- | -------------------------------------------- | ---------- |
| user_id          | The users id that invited the user           | number     |
| user_name        | The users name that invited the user         | string     |
| user_displayname | The users display name that invited the user | string     |

### GET /users/:user_id

For getting a specific user.

| Parameter | Description         |
| --------- | ------------------- |
| user_id   | The users id to get |

Returns one [User Object](#user-object):

```json
{
  // USER OBJECT
}
```

### POST /users

**ADMIN ONLY**

For creating a new user.

Request with a JSON Object in the body:

| KEY              | Description                     | Value Type         | OPTIONAL                 | LIMITATIONS                            |
| ---------------- | ------------------------------- | ------------------ | ------------------------ | -------------------------------------- |
| user_name        | The new users username - unique | string             | NO                       | Min: 1, Max: 40, Alphanumeric + ".\_-" |
| password         | The new users password          | string             | NO                       | Max: 128, Ascii Chars only             |
| user_displayname | The new users display name      | string             | YES                      | Max: 40                                |
| user_role        | The new users role              | `admin` or `users` | YES (Defaults to `user`) | `admin` or `user`                      |
| invitee_id       | The new users invitee by id     | number             | YES (Defaults to `null`) | ID of a existing user                  |

### PUT /users/:user_id

For updating a user.

| Parameter | Description            |
| --------- | ---------------------- |
| user_id   | The users id to update |

Request with a JSON Object in the body:

| KEY              | Description                                 | Value Type         | OPTIONAL | LIMITATIONS                            | Available To                |
| ---------------- | ------------------------------------------- | ------------------ | -------- | -------------------------------------- | --------------------------- |
| user_name        | The users new username - unique             | string             | YES      | Min: 1, Max: 40, Alphanumeric + ".\_-" | Admin and the user themself |
| password         | The users new password                      | string             | YES      | Max: 128, Ascii Chars only             | Admin and the user themself |
| user_displayname | The users new display name                  | string             | YES      | Max: 40                                | Admin and the user themself |
| user_role        | The users new role                          | `admin` or `users` | YES      | `admin` or `user`                      | Admin only                  |
| invitee_id       | The users new invitee by id                 | number             | YES      | ID of a existing user                  | Admin only                  |
| is_active        | The users new deactivated (soft ban) status | `0` or `1`         | YES      | `0` or `1`                             | Admin only                  |

### DELETE /users/:user_id

For deleting a user.

| Parameter | Description            |
| --------- | ---------------------- |
| user_id   | The users id to delete |
