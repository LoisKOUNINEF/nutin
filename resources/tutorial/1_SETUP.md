# 1. Create your Nutin to-do application

We are going to build a basic CRUD application in the form of a to-do list.

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
npm run dev # Port 9090
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

## How the pieces fit together

* Views **orchestrate**
* Components **handle UI**
* Services **hold data**
* Events **connect** them

**[Next step]()**
