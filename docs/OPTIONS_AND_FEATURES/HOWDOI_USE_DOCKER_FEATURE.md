# How do I use the Docker feature?

## What is the Docker feature?

A ready-to-use `Dockerfile` designed for Nutin applications, paired with an Nginx configuration file.

The actual `Dockerfile` and `nginx.conf` files are generated at build time from their `.templates` counterparts.

It assumes the use of a reverse proxy - See [Nginx config](#nginx-config).

## Add docker to your app

```bash
nutin-add docker
```

## Usage

```bash
<pm> run docker:build
<pm> run docker:run
```

## Configure ports

Container port(s) are configured via `nutin.config.js`'s `dockerPorts` (`number[]`):

```js
export default {
  tailwind: false,
  i18n: false,
  inlineTemplates: false,

  generateSEOFiles: false,
  dockerPorts: [9090],
}
```

Emptying the array (`dockerPorts: []`) or deleting it makes `docker:build` fail with a clear error.

On build, `dockerPorts` is used to generate the actual `Dockerfile` and `nginx.conf` from their `.template` counterpart. 

### Port range

Each port must be a registered/user port: **1024–49151**. 
Ports below 1024 are privileged (may require elevated host privileges to bind); ports 49152 and above are the OS's ephemeral range. 

`docker:build` rejects anything outside that range with a clear error.

If you want to run your image on a port **outside that range**, run the docker command directly `docker run -p 80:9090`. 

Every configured port is:
- exposed by the built image (`EXPOSE`)
- listened on by nginx (one `listen <port>;` per port)

The container healthcheck always targets the *first* configured port.

Changing ports only requires editing `nutin.config.js` and rebuilding.

## Dockerfile

A preconfigured, multi-stage Dockerfile that:

- Builds your application in a Node environment 
- Builds a brotli-enabled Nginx image:
```
FROM alpine
RUN apk add --no-cache nginx nginx-mod-http-brotli
```
- Serves the final assets
- Includes an optional container healthcheck
- Exposes ports for reverse proxies

## Nginx config

**This Nginx config assumes the use of a reverse proxy**, so it:
- uses non-standard port(s), configurable via `nutin.config.js`'s top-level `dockerPorts` (see [Configure ports](#configure-ports) above).
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

- *Reminder: when you use `add_header` in a child location block, it replaces ALL headers from the parent context rather than merging them.*

You need to repeat the security headers in each location block that uses add_header. 

## Compression

Gzip (`.gz`) and Brotli (`.br`) compression is handled on production build - independent from Docker feature.

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
