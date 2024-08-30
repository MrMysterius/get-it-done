ARG GID_VERSION "0.3.0"

FROM node:22-alpine

RUN npm install -g pnpm

RUN mkdir -p /app
RUN mkdir -p /data
WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm install --frozen-lockfile

ENV NODE_ENV production
ENV DATABASE_URL "file:/data/GetItDone.db"
ENV HOST "0.0.0.0"
ENV PORT "4137"

COPY . .

RUN pnpm build

RUN rm -rf ./src ./static ./tests

EXPOSE ${PORT}

ENTRYPOINT [ "pnpm" , "start", "--host", "${HOST}", "--port", "${PORT}" ]
