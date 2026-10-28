# Package Release Docs

Each package has its own `release*.yml` workflow, publishing it to npm when a `<tag-prefix><version>` tag is pushed.

## Releasing

1. Bump the version from the package directory: `npm version patch|minor|major` (or edit `package.json`), commit and merge to `main`.
2. Tag the `main` commit and push the tag: `git tag <tag-prefix><version> && git push origin <tag-prefix><version>`.

The workflow:

* Ensures the tagged commit is on `main` (`git merge-base --is-ancestor`), unless generated with `--skip-main-check`.
* Ensures the tag matches the package's `package.json` version (`<tag-prefix>1.2.3` ↔ `1.2.3`).
* Installs dependencies (`npm ci` at the repository root, so workspaces are installed too).
* Runs the pre-publish checks, from the package directory.
* Lists the tarball contents (`npm pack --dry-run`) and publishes (`npm publish --access public`), from the package directory. `prepublishOnly` scripts run there as well.

Releases of a package are queued, never run in parallel (`concurrency: release-<name>`).

## npm trusted publishing

No npm token is stored in GitHub: the workflow authenticates to npm with GitHub's OIDC token (`id-token: write`), and npm adds provenance to the published version.

- Configure it on npmjs.com: package → Settings → Trusted publishing → GitHub Actions, with the repository owner, repository name and the workflow **file name** (e.g. `release.yml`). The package must already exist on npm, so its first version is published manually (`npm publish --access public` from the package directory).
- Requires npm ≥ 11.5.1 on the runner (bundled with current Node 24 releases).
- If publishing fails with an authentication error, run the publish step with `npm publish --access public --loglevel verbose`: npm only logs why the OIDC token exchange failed at that level.
