ARG NODE_VERSION=24.21.0
ARG ALPINE_VERSION=3.24
ARG PORT="9092"

FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /usr/src/app
RUN corepack enable
COPY package.json package-lock.json .
COPY apps/tutorial/package.json apps/tutorial/package.json
RUN npm ci
COPY apps/tutorial ./apps/tutorial
RUN npm run build:prod -w tutorial

FROM alpine:${ALPINE_VERSION}
ARG PORT
ENV PORT=${PORT}

RUN apk add --no-cache nginx nginx-mod-http-brotli

RUN rm -f /etc/nginx/http.d/default.conf
COPY --from=builder /usr/src/app/apps/tutorial/tools/docker/nginx.conf /etc/nginx/http.d/default.conf
COPY --from=builder /usr/src/app/apps/tutorial/dist/src /usr/share/nginx/html

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:9092/health || exit 1

CMD ["nginx", "-g", "daemon off;"]