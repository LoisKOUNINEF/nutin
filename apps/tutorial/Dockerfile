FROM node:22.3.0 AS builder
WORKDIR /usr/src/app
COPY . .
RUN	npm ci && \
	npm run -w tutorial build

FROM nginx:1.21-alpine
RUN sed -i 's/listen  .*/listen 9092;/' /etc/nginx/conf.d/default.conf  && \
    sed -i 's|index  index.html index.htm;|index  index.html index.htm;\n    try_files \$uri /index.html;|' /etc/nginx/conf.d/default.conf && \
		mkdir -p /usr/share/nginx/html
COPY --from=builder /usr/src/app/apps/tutorial/dist/src /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
