<h1 align="center">
  <img alt="Obytesapp logo" src="./assets/icon.jpeg" width="124px" style="border-radius:10px"/><br/>
ObytesApp Mobile App </h1>

Due to the fact that this project is based on [`expo-dev-client` ](https://docs.expo.dev/development/getting-started/), we are able to add our own native libraries as well as utilize the entire Expo ecosystem.

## 🔗 Requirements

- [Node.js LTS release](https://nodejs.org/en/)
- [Git](https://git-scm.com/)
- [Watchman](https://facebook.github.io/watchman/docs/install#buildinstall), required only for macOS or Linux users
- [Yarn](https://classic.yarnpkg.com/en/docs/install)
- [Expo Cli](https://docs.expo.dev/workflow/expo-cli/)
- [VS Code Editor](https://code.visualstudio.com/download) ⚠️ Make sure to install all recommended extension from `.vscode/extensions.json`

## 👋 Quick start

Clone the repo to your machine and install deps :

```sh
git clone https://github.com/user/obytesapp.git

cd ./obytesapp

yarn
```

To run the app on ios

```sh
yarn ios
```

To run the app on Android

```sh
yarn android
```

## Project setup

The project use `husky` and `lint-staged` to manage the project. We will run `yarn lint` before your commit for all the files that are added or modified to make sure that the project is linted and your code respects the best practices.

we are also enforcing a conventional git commit message format based on the [conventional-commits](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) guidelines.

If you set up VsCode correctly and install all the recommended extensions, you will be able to see all the linting errors in the editor.

You can always run `yarn lint` in your terminal if you have trouble setting up eslint.

If you had trouble setting up vs code, try updating to the last version and turning off other extensions for the project. If it still doesn't work, please make a problem report on github.

## Built with

The project is built with the following libraries :

- [expo](https://expo.dev)
- [react-query](https://tanstack.com/query/v4/)
- [zustand](https://zustand-demo.pmnd.rs/)
- [nativewind](https://nativewind.dev/)
- [react-navigation](https://reactnavigation.org/)
- [react-hook-form](https://react-hook-form.com/)
- [@shopify/flash-list](https://shopify.github.io/flash-list/)
- [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)

> Its always a good idea to check out those libraries and see how they work.😉
