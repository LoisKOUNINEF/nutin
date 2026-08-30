ARG NODE_VERSION=22.23.2
ARG ALPINE_VERSION=3.20
ARG PORT="9090 9091"

FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /usr/src/app
RUN corepack enable
COPY package.json package-lock.json .
COPY apps/website/package.json apps/website/package.json
RUN npm ci
COPY apps/website ./apps/website
RUN npm run build:prod -w website

FROM alpine:${ALPINE_VERSION}
ARG PORT
ENV PORT=${PORT}

RUN apk add --no-cache nginx nginx-mod-http-brotli

RUN rm -f /etc/nginx/http.d/default.conf
COPY --from=builder /usr/src/app/apps/website/tools/docker/nginx.conf /etc/nginx/http.d/default.conf
COPY --from=builder /usr/src/app/apps/website/dist/src /usr/share/nginx/html

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:9090/health || exit 1

CMD ["nginx", "-g", "daemon off;"]