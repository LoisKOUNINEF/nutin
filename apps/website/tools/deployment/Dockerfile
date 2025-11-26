ARG NODE_VERSION=22.3.0
ARG NGINX_VERSION=1.27-alpine

FROM node:${NODE_VERSION} AS builder
WORKDIR /usr/src/app
COPY ./apps/website/ ./apps/website/
COPY ./package*.json ./
RUN npm ci && \
    npm run -w website build:prod

FROM nginx:${NGINX_VERSION}

RUN rm /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/src/app/apps/website/tools/deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/src/app/apps/website/dist/src /usr/share/nginx/html

EXPOSE 9090 9091

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9090/health || exit 1

CMD ["nginx", "-g", "daemon off;"]