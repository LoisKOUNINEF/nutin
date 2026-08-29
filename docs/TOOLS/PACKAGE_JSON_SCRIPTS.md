# Package.json scripts

## Development server

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

## Build 

```bash
<pm> run build:prod
# runs: NODE_ENV=production node tools/builder/builder.js
```

See [Builder](./BUILDER.md)

## Generate a component, view or service

```bash
<pm> run generate ELEMENT ELEMENT_NAME
```

See [Generator](./GENERATOR.md)

## Run tests (built-in testing toolkit)

```bash
<pm> run testin-nutin           # build, then run once
<pm> run testin-nutin:watch     # build once, then re-run on file changes
<pm> run testin-nutin:coverage  # run and outputs coverage. Fails if below threshold defined in nutin.config.js.testinNutin.coverage.threshold
<pm> run testin-nutin:verbose   # run and log each test suite and test as it runs
```

See [testin-nutin documentation](../TESTING.md)
