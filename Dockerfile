FROM node:lts AS BUILDER

WORKDIR /usr/src/link-shortener
COPY . .

RUN yarn install --frozen-lockfile
RUN yarn cache clean
RUN yarn build


FROM node:lts as RUNNER

WORKDIR /usr/src/link-shortener
COPY --from=builder /usr/src/link-shortener/dist ./dist
COPY ./public ./public

COPY package.json .
COPY yarn.lock .
RUN yarn install --production --frozen-lockfile

EXPOSE 8080

CMD yarn start
