# Nutin - Docker Documentation

**IMPORTANT NOTE: Adapt port(s) as needed** 

- Default port: 

`9090`

- Dockerfile 

`ARG PORT=####`

- nginx.conf 

```nginx
server {
    # ---------------------------
    # LISTEN PORTS
    # ---------------------------
    listen ####;
``` 

## Table of Contents

- [Dockerfile](#dockerfile)
- [Nginx Config](#nginx-config)
- [Gzip compression](#gzip-compression)
- [Brotli compression](#brotli-compression)

You may use the Dockerfile exactly as-is for production deployments. Modify if you need custom caching rules or add external APIs to CSP.

## Dockerfile

A preconfigured, multi-stage Dockerfile that
- Builds your application in a Node environment 
- Builds a brotli-enabled Nginx image:
```
FROM alpine
RUN apk add --no-cache nginx nginx-mod-http-brotli
```
- Serves the final assets
- Includes an optional container healthcheck
- Exposes ports for reverse proxies like Traefik
- Works out of the box with npm, yarn, pnpm, and bun — `nutin-add docker` detects your package manager and renders the matching install/lockfile lines.

## Compression

Gzip (`.gz`) and Brotli (`.br`) compression are handled by Nutin's builder (`tools/builder/core/prod-bundle/compress-files.js`).

Params:
```js
gzip: {
  level: 9,
  memLevel: 9,
  windowBits: 15
}

brotli: {
  [constants.BROTLI_PARAM_QUALITY]: 11,
  [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_GENERIC,
  [constants.BROTLI_PARAM_SIZE_HINT]: content.length
}
```

## Nginx Config

**This Nginx config assumes the use of a reverse proxy** (i.e. Traefik), so it:
- uses non-standard port(s) (default: 9090).
- does not include `add_header Strict-Transport-Security  "max-age=63072000" always;`. Add it here only if Nginx is exposed directly over HTTPS.

### Gzip

Gzip is globally enabled.

```
gzip on # enables gzip compression for responses
gzip_static on # serves .gz files if present
gzip_proxied any # makes gzip work through a proxy
```

*Note: you can enable / disable gzip_static only for specific locations in nginx.conf if you don't want it to be enabled globally.*

### Brotli compression

Brotli is globally enabled.

```
brotli on; # compresses anything not precompressed
brotli_static on; # serves .br files if present
```

### Headers

*Reminder: when you use `add_header` in a child location block, it replaces ALL headers from the parent context rather than merging them.*
- You need to repeat the security headers in each location block that uses add_header. 
- This config uses nginx `map` directives to define headers once, then reuse them.
