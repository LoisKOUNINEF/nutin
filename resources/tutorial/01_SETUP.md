# Setup

## Install the CLI

```bash
npm install -g @nutin/cli
```

## Create the application

```bash
nutin-new nutin-todo
```

## Run the application

```bash
# Port 9090
npm run dev
```

## Project structure

```text
src/
 |---- app/
        |---- components/
        |---- services/
        |---- views/
        |---- routes.ts
        |---- main.ts
```

## Basic relationship and responsibilities

* Views orchestrate
* Components handle UI
* Services hold data
* Events connect them
