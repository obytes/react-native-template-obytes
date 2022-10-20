---
sidebar_position: 1
---

# Create a new app

Let's create a new React native project with obytes starter.

## Requirements

- [Node.js LTS release](https://nodejs.org/en/)
- [Git](https://git-scm.com/)
- [Watchman](https://facebook.github.io/watchman/docs/install#buildinstall), required only for macOS or Linux users
- [Yarn](https://classic.yarnpkg.com/en/docs/install)
- [Expo Cli](https://docs.expo.dev/workflow/expo-cli/)
- [VS Code Editor](https://code.visualstudio.com/download)

## Initializing a new project

Start your project using `create-obytes-app` command:

```bash
npx create-obytes-app MyApp
```

The command will create an expo app named `MyApp` and install all the dependencies added by the starter.

## Open Project on VS Code

VS code is the recommended editor for this starter, The starter comes with a list of recommended extensions,settings and project snippets that we think will improve your developer experience.

Open the project on VS Code using the following command:

```bash
code .
```

When you open the project on VS Code you will see a popup asking you to install the recommended extensions, the easy way is to install all recommend extensions by clicking on `Install All` button.

If you are not convinced to install all the recommended extensions, we recommend you to install at least the following extensions as we use them to validate and format the code on save:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Tailwindcss IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

Here is the complete list of recommended extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [tailwindcss IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Auto Rename Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag)
- [Auto close tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag)
- [Code spell checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)
- [Import Cost](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost)
- [Cobalt 2 theme](https://marketplace.visualstudio.com/items?itemName=ahmadawais.theme-cobalt2)
- [Turbo console log](https://marketplace.visualstudio.com/items?itemName=ChakrounAnas.turbo-console-log)
- [i18n Ally](https://marketplace.visualstudio.com/items?itemName=lokallise.i18n-ally)
- [Github copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)

## Running the app

If the installation is done successfully, the generated app should be ready to run using the following commands in the project directory:

```bash
# Run the app on iOS simulator
yarn ios

# Run the app on Android simulator
yarn android
```
