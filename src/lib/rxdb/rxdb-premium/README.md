# RxDB Premium

This module contains the [premium plugins](https://rxdb.info/premium) of RxDB.

## Installation

The [RxDB premium](https://rxdb.info/premium) module is distributed via npm and downloads+decrypts the actual code in the `postinstall` hook.

1. Add `rxdb-premium` to your dependencies in the `package.json`. You can find out the newest [RxDB version here](https://github.com/pubkey/rxdb/releases).

```json
{
  "dependencies": {
    "rxdb": "XX.X.X",
    "rxdb-premium": "XX.X.X"
  }
}
```

2. Add your access token to the `package.json` of your project.

```json
{
  "accessTokens": {
    "rxdb-premium": "0x7ff6230..."
  }
}
```

**NOTICE:** On install, `rxdb-premium` will look in all package.json files in all parent paths to find the token. So when you have a multi-module project, it is enough to put the token into the root `package.json`.

3. Run `npm install` to install all dependencies.

**NOTICE:**

- You should always pin the version and do not use version ranges.
- The major version of your `rxdb-premium` package must be the same as of `rxdb`.

## Source Code Access

If you have purchased the source code access option, you can find the source code in the installed rxdb premium folder in your node_modules. `node_modules/rxdb-premium/src`

## Getting help

If you have found a technical problem, you might ask about it at the "rxdb-premium" [discord channel](https://rxdb.info/chat.html).
If you have any problem with installation or your access token, write me an email.
