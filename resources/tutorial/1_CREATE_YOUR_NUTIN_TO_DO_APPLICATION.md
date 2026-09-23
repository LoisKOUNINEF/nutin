# 1. Create your Nutin to-do application

We are going to build a basic CRUD application in the form of a to-do list.

*Estimated time:* 15-20 minutes.

- [See what you'll build](https://nutin-todo.nutin.org)

- [Refer to the full app code if you ever get lost](https://github.com/LoisKOUNINEF/nutin/tree/main/apps/tutorial)

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
cd nutin-todo
npm run serve # Port 9090 - use npm run dev for watch mode
```

## Project structure

```text
src/
 |---- app/
        |---- components/
        |---- services/
        |---- views/
        |---- globals.d.ts
        |---- main.ts
        |---- routes.ts
 |---- core     // Nutin source code
 |---- styles
```

### How the pieces fit together

* Views **orchestrate**
* Components **handle UI**
* Services **hold data**
* Events **connect** them

**[Next step →](2_BUILD_THE_UI_FOR_A_TASK.md)**
