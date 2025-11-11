ARG NODE_VERSION=22.3.0
ARG NGINX_VERSION=1.27-alpine

FROM node:${NODE_VERSION} AS builder
WORKDIR /usr/src/app
COPY . .
RUN npm ci && \
    npm run -w website build:prod

FROM nginx:${NGINX_VERSION}

RUN rm /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/src/app/apps/website/nginx.conf /etc/nginx/conf.d/default.conf

RUN sed -i '/http {/a \
    # Gzip compression\n\
    gzip on;\n\
    gzip_vary on;\n\
    gzip_proxied any;\n\
    gzip_comp_level 6;\n\
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;\n\
    gzip_min_length 1000;\n\
' /etc/nginx/nginx.conf && \
	touch /var/run/nginx.pid

COPY --from=builder /usr/src/app/apps/website/dist/src /usr/share/nginx/html

EXPOSE 9090 9091

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9090/health || exit 1

CMD ["nginx", "-g", "daemon off;"]