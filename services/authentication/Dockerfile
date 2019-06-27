FROM node:12-alpine

ARG NODE_ENV=development
ARG PORT=9080
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}

RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers autoconf automake make nasm python git && \
    npm install --quiet node-gyp -g

WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN yarn

# Copy rest of the application source code
COPY . .

# Build Typescript
RUN ["chmod", "a+x", "./node_modules/.bin/tsc"]
RUN yarn tsc -v
RUN yarn tsc

# Run api
ENTRYPOINT ["yarn", "start:production"]



