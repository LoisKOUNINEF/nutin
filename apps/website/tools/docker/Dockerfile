ARG NODE_VERSION=22.23.2
ARG ALPINE_VERSION=3.20
ARG PORT="9090"

FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /usr/src/app
RUN corepack enable
COPY package.json package-lock.json* .
RUN npm ci
COPY tsconfig.json .
COPY ./src ./src
COPY ./public ./public
COPY ./nutin.config.js .
COPY ./config ./config
COPY ./tools/builder ./tools/builder
COPY ./tools/docker ./tools/docker
COPY ./tools/utils ./tools/utils
RUN npm run build:prod

FROM alpine:${ALPINE_VERSION}
ARG PORT
ENV PORT=${PORT}

RUN apk add --no-cache nginx nginx-mod-http-brotli

RUN rm -f /etc/nginx/http.d/default.conf
COPY --from=builder /usr/src/app/tools/docker/nginx.conf /etc/nginx/http.d/default.conf
COPY --from=builder /usr/src/app/dist/src /usr/share/nginx/html

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:9090/health || exit 1

CMD ["nginx", "-g", "daemon off;"]