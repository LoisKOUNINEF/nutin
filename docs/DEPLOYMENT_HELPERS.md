# Deployment Helpers ( Dockerfile / Nginx config )

- You may use the config files and Dockerfile exactly as-is for production deployments. Modify if you need custom caching rules or add external APIs to CSP.
- Adapt ports as needed.

## Dockerfile

A preconfigured, multi-stage Dockerfile that
- Builds your application in a Node environment
- Serves the final assets using Nginx
- Includes an optional container healthcheck
- Exposes the proper ports for reverse proxies like Traefik
- Is optimized for speed, small image size, and security.

## Nginx Config

- **This Nginx config is for production.**
- *Note: using non-standard ports because I personally use Traefik as a reverse proxy. Adapt to your setup.*
- ***This Nginx config does not include `add_header Strict-Transport-Security  "max-age=63072000" always;` for the same reason (Traefik reverse proxy). HSTS should be applied at the reverse proxy layer. Do not add it here unless Nginx is exposed directly over HTTPS.***

### Headers

#### Content-Security-Policy

One of the most effective defenses against Cross-Site Scripting (XSS), data injection, and content hijacking.                               
It defines where your app is allowed to load resources from (scripts, images, fonts, APIs, etc.).                                  
Browsers will block or warn if any resource violates the policy.

- `base-uri 'self'`

**Important anti-exfiltration protection.**                      
Prevents an attacker from changing your document base and redirecting relative URLs elsewhere.

- `default-src 'self'`

All unspecified resource types (e.g., media, frames) are only allowed from the same origin.

- `script-src 'self`

Only load JS from your own domain. Prevents loading third-party or injected scripts.                      
**Whitelist third-party scripts:** `script-src 'self' https://cdn.jsdelivr.net;`

- `style-src 'self' 'unsafe-inline'`

Allows inline `style=""` attributes and `<style\>` tags.                              
**The 'unsafe-inline' weakens security slightly but is needed for inline styles. Remove it if you only use external CSS files.**                                 
**Whitelist third-party:** `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;`

- `img-src 'self' data: https:`

Allow images from same origin, data: URIs (for base64 images), and any HTTPS domain.

- `font-src 'self'`

Only allow webfonts from your own domain.                       
**Whitelist third-party fonts:** `font-src 'self' https://fonts.gstatic.com;`

- `connect-src 'self'`

Only allow your app to make network requests to itself.                     
**If your app needs to make API calls:** `connect-src 'self' https://api.example.com;`

- `object-src 'none'`

Disables old plugin-based embeds (Flash, etc.) entirely.

- `form-action 'self'`

Forms can only submit to your own origin. Prevents data exfiltration through fake forms.

- `frame-ancestors 'none'`

Block the site from being embedded in iframes (anti-clickjacking). Supersedes `X-Frame-Options` header for newer browsers.

#### Permissions-Policy

Restricts or allows access to browser APIs (like camera, microphone, geolocation, fullscreen, USB, etc.) for your site and any embedded frames (iframes)

- `geolocation=()`

No origin can use the Geolocation API. Calls to navigator.geolocation.getCurrentPosition() will be denied.

- `microphone=()`

Prevents access to the device microphone (e.g., through WebRTC or getUserMedia).

- `camera=()`

Prevents access to the device camera.

- Allow origins

*Empty parentheses mean 'allow for no one'* including main origin.                         
Allow only your origin: `geolocation=(self)`                            
Allow specific trusted origins: `geolocation=(self "https://trusted-origin.com")`

#### X-Content-Type-Options

Stops browsers from MIME-type sniffing — guessing the content type of a file.                                     
This prevents attacks where an attacker uploads a file disguised as one type (e.g., .jpg) but containing executable code (.js, .html). With `nosniff`, the browser treats it strictly as an image and fails to execute if it’s not valid.

#### Referrer-Policy

Controls what gets sent in the Referer HTTP header when a user navigates away from your site or loads resources from another domain.
This helps protect user privacy and sensitive URL data (like tokens or IDs).

- `no-referrer`

Send no referer at all.

- `no-referrer-when-downgrade`

Default in some browsers. Sends Referer only for HTTPS->HTTPS requests.

- `strict-origin`

Send only the origin (no path/query) for HTTPS->HTTPS requests.

- `strict-origin-when-cross-origin`

Send the full URL only when same-origin; otherwise, send just the origin (no path or query).

- `origin-when-cross-origin`

Sends origin for cross-origin requests but full path for same-origin.

- `unsafe-url`

**(not recommended)** Always send the full Referer.

#### Testing Tools

You can validate your CSP and Permissions-Policy with:

- https://securityheaders.com — scans and scores your live site.
- https://csp-evaluator.withgoogle.com — Google tool that checks for unsafe directives.
- Browser DevTools → Network tab → Response Headers — inspect if headers are being sent correctly.

### Main route handler

Defines how Nginx serves files for your web app’s main route (/).

```
location / {
    try_files $uri $uri/ /index.html;
}
```

Try to serve the file matching the request path ($uri) — e.g. /app.js. If it’s a directory ($uri/), try to serve its index file. If neither exists, fall back to /index.html.

### Static assets with long cache

This tells browsers (and CDNs) to cache static assets aggressively for performance.                          
*Don’t use long caching on non-versioned assets (like /app.js without a hash).*
*If you change files often, use shorter caching (`expires 1d;`).*

```
location ~* \.(js|css|png|jpg|jpeg|gif|avif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

- `location ~* \.(...)$`

`~*` means case-insensitive regex match — applies to all file extensions listed (JavaScript, CSS, images, fonts, etc.).

- `expires 1y;`

Adds an Expires HTTP header set one year in the future.

- `add_header Cache-Control "public, immutable";`

Adds a modern Cache-Control header:                            
`public`: The resource can be cached by browsers and intermediate caches (CDNs, reverse proxies).                                
`immutable`: The file will never change, so browsers don’t even revalidate it.

### HTML files (no cache)

Ensures your HTML files (especially index.html) are never cached. Browsers always fetch the latest version.

```
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
}
```

- `expires -1;`

Tells the browser that the file is already expired.

- `Cache-Control: no-cache, no-store, must-revalidate`

Forces browsers to always re-download and not even use a local copy.

- `Pragma: no-cache`

Legacy header for older HTTP/1.0 caches.

### Headers for older browsers (legacy compatibility)

#### X-XSS-Protection

Enables a legacy built-in XSS filter in older browsers.
If the browser detects reflected XSS patterns, it either sanitizes or blocks the page.            
Replaced by CSP header (stronger protection) in modern browsers.

- `0` 

Disables XSS filter.

- `1`

Enables XSS filter.

- `1; mode=block`

Enables XSS filter and block the page entirely when an attack is detected.

#### X-Frame-Options

Block the site from being embedded in iframes (anti-clickjacking).                    
- `DENY` 

No domain can frame your content — not even your own site.

- `SAMEORIGIN`

Only pages from your own origin can embed your site in an iframe.

- `ALLOW-FROM https://example.com`

(Deprecated) Used to allow a specific external domain.

### Health check endpoint

Provides a lightweight HTTP health endpoint for monitoring or container orchestration.

``` 
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

- `access_log off`

Disables logging for this route (less noise in logs).

- `return 200 "healthy\n"`

Instantly returns a simple 200 OK response.

- `add_header Content-Type text/plain`

Ensures plain text content type.

### Hide Nginx version

`server_tokens off;` 

Prevents Nginx from revealing its version number in response headers / error pages (like “502 Bad Gateway”).                           
Reduces information leakage: attackers can’t fingerprint your exact Nginx version to target known vulnerabilities.

## Gzip compression

*Note: If your hosting allows, consider enabling Brotli for even smaller assets.*

- `gzip on`

Enables gzip compression for responses.

- `gzip_vary on`

Prevents caching issues when some clients accept gzip and others do not.

- `gzip_proxied any`

Makes gzip work even when the request is forwarded through a proxy.

- `gzip_comp_level 6`

Compression levels: 1: large file size, low CPU usage. 2: (recommended balance) small file size, reasonable CPU usage. 3: smaller file size, wastes CPU.

- `gzip_types ...`

Specifies MIME types eligible for compression. (HTML, CSS, JS, XML, JSON, SVG, Web fonts (TTF, OTF, WOFF, etc.)).
*Images like PNG, JPEG, AVIF, WebP should not be compressed*.

- `gzip_min_length 1000`

Avoids compressing tiny responses (error messages, redirects, small JSON payloads). (in bytes)
