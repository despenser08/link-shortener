FROM node:lts AS builder

WORKDIR /usr/src/shortlink
COPY . .

RUN yarn install --frozen-lockfile
RUN yarn cache clean
RUN yarn build


FROM node:lts

WORKDIR /usr/src/shortlink
COPY --from=builder /usr/src/shortlink/dist ./dist
COPY --from=builder /usr/src/shortlink/public ./public

COPY package.json .
COPY yarn.lock .
RUN yarn install --production --frozen-lockfile

EXPOSE 8080

CMD yarn start
