# Development environment

All serve on port 9090 by default. Pass `-- --port 3000` (or set `PORT=3000`) to change it.

```bash
# build (dev environment) and serve
<pm> run serve

# build (prod environment) and serve
<pm> run serve:prod

# without build (use existing 'dist' output)
<pm> run serve:only

# build (dev environment) and serve with live reload
<pm> run dev
```
