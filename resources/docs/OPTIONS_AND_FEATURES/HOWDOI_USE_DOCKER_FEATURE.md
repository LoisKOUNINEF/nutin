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

`docker:build` builds `<project>:latest`. `docker:run` runs it in the foreground on every port of `dockerPorts`: Ctrl+C stops it, and the container is removed. Both accept flags, listed by `--help`.

**With npm, put `--` before the flags** (`npm run docker:run -- -d`): without it, npm takes `-d` as its own `--loglevel` shorthand. pnpm, yarn and bun pass them through (`pnpm run docker:run -d`), with or without `--`. `--dry-run` also works with npm without `--`.

`docker:build` flags:

| Flag | Effect |
|---|---|
| `--no-cache` | Build without the layer cache |
| `--pull` | Pull newer versions of the base images (`node`, `alpine`) |
| `--platform <os/arch>` | Target platform, e.g. `linux/amd64` for a server when building on Apple silicon |
| `-t, --tag <tag>` | Also tag the image `<project>:<tag>`. `<project>:latest` is always set. Repeatable |
| `--build-arg <KEY=VALUE>` | Set a Dockerfile `ARG`: `NODE_VERSION`, `ALPINE_VERSION`. Repeatable |
| `--progress <mode>` | Build output: `auto`, `plain`, `tty`, `quiet`, `rawjson` |
| `--dry-run` | Print the `docker build` command without running it. The Docker configuration is still checked, but `Dockerfile` and `nginx.conf` aren't rewritten |

`docker:run` flags:

| Flag | Effect |
|---|---|
| `-d, --detach` | Run in the background, then print how to follow its logs and stop it |
| `--name <name>` | Container name. Defaults to the project's (`@acme/site` → `acme-site`) |
| `--rm` | Remove the container when it stops: already the default in the foreground |
| `--restart <policy>` | `no`, `always`, `unless-stopped`, `on-failure[:N]`. Can't be combined with `--rm` |
| `-t, --tag <tag>` | Image tag to run. Defaults to `latest` |
| `--platform <os/arch>` | Platform of the image to run, when it was built for several |
| `--dry-run` | Print the `docker run` command without running it. A container name that's already taken is a warning instead of an error |

Ports aren't flags: they come from `dockerPorts` (see below), and `-p`/`--publish` are refused.

```bash
npm run docker:build -- --tag 1.2.0 --platform linux/amd64
npm run docker:run -- -d --tag 1.2.0   # background, named after the project
docker logs -f <project>
docker stop <project> && docker rm <project>
```

A detached container is kept after it stops (unless `--rm` is passed): `docker:run` refuses to start another with the same name until it's removed, or given another `--name`.

## Configure ports

Container port(s) are configured via `nutin.config.js`'s `dockerPorts` (`number[]`):

```js
export default {
  tailwind: false,
  i18n: [],
  generateSEOFiles: false,

  // Nutin features
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

If the [Markdown feature](./HOWDOI_USE_MARKDOWN_FEATURE.md) is added, every folder listed in `markdownSources.sourceFolders` is copied into the build stage. These folders must be inside the project: `docker:build` fails with a clear error otherwise.

## Nginx config

**This Nginx config assumes the use of a reverse proxy**, so it:
- uses non-standard port(s), configurable via `nutin.config.js`'s top-level `dockerPorts` (see [Configure ports](#configure-ports) above).
- does not include `add_header Strict-Transport-Security  "max-age=63072000" always;`. Add it here only if Nginx is exposed directly over HTTPS.

With i18n on (`i18n: ['en', ...]`), it also 301-redirects `/` and any unprefixed path without an extension (`/docs` → `/en/docs`) to the default language, so an old or external link never gets a duplicate SPA shell. Files (`/robots.txt`, assets) and `/health` aren't redirected.

### Adding origins in CSP map

If you want to add scripts, styles or other external resources, you'll have to add the origins to `nginx.conf.template` CSP map.

```text
# multi-line for readability only - use single-line map in actual file

map $uri $csp_policy {
    default "default-src 'self'; 
    script-src 'self' https://cdn.jsdelivr.net/npm/a11y-elements@0.4.0/; 
    style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net/npm/a11y-elements@0.4.0/; 
    img-src 'self' data: https:; 
    font-src 'self'; 
    # ...
}
```

### Gzip

Gzip is globally enabled.

```text
gzip on # enables gzip compression for responses
gzip_static on # serves .gz files if present
gzip_proxied any # makes gzip work through a proxy
```

*Note: you can enable / disable gzip_static only for specific locations in nginx.conf if you don't want it to be enabled globally.*

### Brotli compression

Brotli is globally enabled.

```text
brotli on; # compresses anything not precompressed
brotli_static on; # serves .br files if present
```

### Headers

- *Reminder: when you use `add_header` in a child location block, it replaces ALL headers from the parent context rather than merging them.*

You need to repeat the security headers in each location block that uses add_header. 

### Caching

Every response says how long it may be cached, so a deploy shows at once, even in a browser that visited before:

| Files | `Cache-Control` | Why |
|---|---|---|
| `/chunks/*`, `bundle.<hash>.js`, `main.<hash>.css`, `/locales/<lang>.<hash>.json`, `/generated/<id>.<hash>.json` | `public, max-age=31536000, immutable` | Their name holds a hash of their content: a changed file gets a new name |
| HTML (the SPA shell, prerendered pages, `404.html`) | `no-cache` | Revalidated on every load: a `304` while unchanged |
| Every other file (`public/`, `src/assets/`, `sitemap.xml`, `robots.txt`, plain `/locales/<lang>.json`...) | `no-cache` | Its name never changes, so it's revalidated on each use |
| i18n redirects (`/` → `/en/`) | `public, max-age=3600` | A change of default language reaches everyone within an hour |

The app fetches its translations and Markdown manifests from their hashed copies: the production build writes `<name>.<hash>.json` next to each one, and the bundle maps the plain URL to it. An unchanged file keeps its hash across deploys, so it stays cached.

A file with no `Cache-Control` at all lets browsers and CDNs guess a lifetime from its `Last-Modified` date, often hours. A `location` you add should set one.

**Behind a CDN or caching proxy**:
- Let it respect the origin's headers: nothing else is needed, and hashed files never need purging.
- If it overrides them (an edge TTL, a "cache everything" rule), purge the HTML and the unhashed files on every deploy.
- Traefik doesn't cache by default: nothing to do.

A tab left open across a deploy may request a hashed file the new image no longer has: see [Tabs left open across a deploy](../TOOLS/BUILDER.md#tabs-left-open-across-a-deploy).

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
