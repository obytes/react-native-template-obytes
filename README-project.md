<h1 align="center">
  <img alt="logo" src="./assets/RootstrapIcon.jpg" width="124px" style="border-radius:10px"/><br/>
Mobile App </h1>

> This Project is based on [Rootstrap React Native Template](https://github.com/rootstrap/react-native-template)

## Requirements

- [React Native dev environment](https://reactnative.dev/docs/environment-setup)
- [Node.js LTS release](https://nodejs.org/en/)
- [Git](https://git-scm.com/)
- [Watchman](https://facebook.github.io/watchman/docs/install#buildinstall), required only for macOS or Linux users
- [Pnpm](https://pnpm.io/installation)
- [VS Code Editor](https://code.visualstudio.com/download) ⚠️ Make sure to install all recommended extension from `.vscode/extensions.json`

## 👋 Quick start

Clone the repo to your machine and install deps :

```sh
git clone https://github.com/user/repo-name

cd ./repo-name

pnpm install
```

To run the app on ios

```sh
pnpm ios
```

To run the app on Android

```sh
pnpm android
```

To build your app locally you can run any of the build scripts with --local.

`pnpm build:development:ios --local`

### SonarQube setup

SonarQube is an open-source platform for continuous inspection of code quality. It performs automatic reviews to detect bugs, code smells, and security vulnerabilities. Rootstrap has a SonarQube instance to improve the quality of the software we develop. On each PR, a GitHub Action is triggered to perform the analysis. To set up SonarQube correctly, you need to add the `SONAR_TOKEN`, `SONAR_URL`, and `SONAR_PROJECT` secrets to the repository. Additionally, you must select the quality gate named `ReactNativeTemplate` for your project on SonarQube. In case you're using this project outside Rootstrap and you're not planning to use SonarQube the sonar scanner [workflow](.github/workflows/sonar.yml) should be deleted.

## ✍️ Documentation

- [Rules and Conventions](https://starter.obytes.com/getting-started/rules-and-conventions/)
- [Project structure](https://starter.obytes.com/getting-started/project-structure)
- [Environment vars and config](https://starter.obytes.com/getting-started/environment-vars-config)
- [UI and Theming](https://starter.obytes.com/ui-and-theme/ui-theming)
- [Components](https://starter.obytes.com/ui-and-theme/components)
- [Forms](https://starter.obytes.com/ui-and-theme/Forms)
- [Data fetching](https://starter.obytes.com/guides/data-fetching)
- [Contribute to starter](https://starter.obytes.com/how-to-contribute/)
- [Distribute using EAS](/EAS.md)
