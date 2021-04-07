FROM node:14.16.0-alpine as BUILD_IMAGE

RUN mkdir -p /usr/src/app
RUN mkdir -p /opt/yarn
WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

COPY . ./

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python && \
  yarn global add --silent node-gyp && \
  yarn install --silent --frozen-lockfile && \
  yarn build && \
  apk del native-deps

# @TODO: remove installed dev dependency on node_modules to make image more concise for instance using `npm prune --production`

FROM node:14.16.0-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

# copy from build image
COPY --from=BUILD_IMAGE /usr/src/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/src/app/bin ./bin
COPY --from=BUILD_IMAGE /usr/src/app/.config/.warlock.yaml ./config/.warlock.yaml
COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules

EXPOSE 3000 4000

CMD ["./bin/warlock", "serve", "--non-interactive", "-c", "./config/.warlock.yaml"]
