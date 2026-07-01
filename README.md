# Zero

the foundation of every project. Zero runs on your machine, knows your hardware, builds your code, and ships it.

the beginning. and the last step.

## structure

- **Engine/Dynamic/Startup** — boots first. maps the filesystem, profiles hardware, reads the network, writes `information.json`.
- **Engine/Dynamic/Build** — Zero Build. compiles and bundles any language. reads from `information.json`.
- **Engine/Dynamic/Manage** — keeps the runtime alive. watches resources, loads modules live, runs the PlugBoard.
- **Engine/Dynamic/Manage/CLI** — the `zero` command. `new`, `dev`, `build`, `deploy`, `help`.
- **Apps** — your projects live here.
- **Docs** — plain-English docs. readable in any text editor. also available via `zero help`.

## getting started

```
node dist/Engine/Dynamic/Startup/core.js
```

or, once the CLI is installed:

```
zero dev
```

see `Docs/getting-started.txt` for the full walkthrough.
