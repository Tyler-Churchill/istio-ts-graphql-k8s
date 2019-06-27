FROM node:10-alpine

ARG NODE_ENV=development
ARG PORT=9080
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}


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

ENV NODE_ENV="production"
# Run api
ENTRYPOINT ["yarn", "start:production"]





