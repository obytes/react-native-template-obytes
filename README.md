<p align="center">
    <img alt="React Native Template Obytes" src="https://user-images.githubusercontent.com/11137944/93101697-808bc580-f6a2-11ea-8ce3-482be6ca456a.png" width="200" />

</p>
<h1 align="center">
  React Native Template Obytes
</h1>

📱 A template for your next React Native project 🚀, Made with developer experience and performance first: TypeScript, Husky, Lint-Staged, react-navigation, react-query, restyle, react-hook-form, AppIcon, Splash Screen.

🚀 Use the template to start your next project or just navigate to [code source](https://github.com/obytes/react-native-template-obytes/tree/master/template) to get some inspiration 😉

### ⭐ Features

- ✅ Last React Native version
- 🎉 Type checking [TypeScript](https://www.typescriptlang.org/)
- 💅 Minimal UI kit using [@shopify/restyle](https://github.com/Shopify/restyle) with theming
- 🤖 Auto generate App Icon using [react-native-make](https://github.com/bamlab/react-native-make) and Splash screen using [react-native-bootsplash](https://github.com/zoontek/react-native-bootsplash/)
- 🦊 Husky for Git Hooks
- 💡 Clean project structure with Absolute Imports
- 🚫 Lint-staged for running linters on Git staged files
- ☂️ [React Navigation](https://reactnavigation.org/) pre-installed with examples
- 💫 Auth flow with [zustand](https://github.com/pmndrs/zustand) and [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) as a storage to save sensitive data.
- 🛠 A simple workflow to build, release and distribute your application using [Github action](https://github.com/features/actions)
- 🔥 [React Query](https://react-query.tanstack.com/) & [axios](https://github.com/axios/axios) to fetch Data
- 🧵 A good approach with example to handle forms based on [react-hook-form](https://react-hook-form.com/) and [yup](https://github.com/jquense/yup) for validation
- ⚙️ Handel environment variables with [react-native-env](https://github.com/goatandsheep/react-native-dotenv)
- 🎯 Localization

### 🎤 Philosophy

- 🚀 Production-ready
- 🧩 Minimal code
- ⚠️ well maintained third-party libraries

### Requirements

- [Setting up the development environment](https://reactnative.dev/docs/environment-setup)

### Getting started

Start your project using obytes template by running:

```
npx react-native init MyApp --template https://github.com/obytes/react-native-template-obytes
```

Open the project on your favorite IDE (vscode 😉)

```sh
src
├── api                    #axios client and api hooks using react-query
│   ├── APIProvider.tsx
│   ├── client.tsx
│   ├── index.tsx
│   ├── useAddTask.tsx
│   └── useTasks.tsx
├── core                   # core functionalities:authentication, storage, localization
│   ├── Auth
│   ├── I18n
│   └── index.tsx
├── index.tsx
├── navigation             # Navigation, stacks and tabs
│   ├── AuthNavigator.tsx
│   ├── RootNavigator.tsx
│   ├── TabNavigator.tsx
│   ├── index.tsx
│   ├── types.tsx
│   └── utils.tsx
├── screens                # App screens
│   ├── Home
│   ├── Login
│   ├── Style
│   └── index.tsx
├── translations          # translation files
│   └── en.json
└── ui                    # ui component with theming
    ├── Button.tsx
    ├── ErrorHandler
    ├── Input.tsx
    ├── Pressable.tsx
    ├── SafeAreaView.tsx
    ├── Screen.tsx
    ├── Text.tsx
    ├── View.tsx
    ├── constants.tsx
    ├── icons
    ├── index.tsx
    ├── theme
    └── utils.tsx
```

Enable husky Git prehooks by adding the following script to your `packages.json` and reinstall dependencies to enable husky pre-commit using `yarn install`

```json
   "scripts": {
      "postinstall": "husky install",
    },
```

### Customization

#### 📲 Update App Icon & Splash screen

Replace App logo template `logo.png` with your logo under `assets` folder

Run the following command to generate App icons assets :

```
yarn react-native set-icon  --path ./assets/logo.png --background "#FFF"

```

> For android icon, make sure to provide a logo with more padding and generate a new app icon for android :

```
yarn react-native set-icon  --platform android  --path ./assets/android_logo.png --background "#FFF"

```

To generate a standard splash screen using bootsplash package.

```sh
yarn react-native generate-bootsplash assets/logo.png \
  --background-color=FFFFFF \
  --logo-width=150 \
  --assets-path=assets
```

#### ✏️ Custom fonts

Replace `Inter.ttf` font file with your fonts under `assets/fonts` folder

Run the following command to generate App icons assets :

```
yarn react-native link
```

More details [how to customize App Icon and Splash screen](https://handbook.obytes.com/docs/mobile/generate-app-icon)

### 📚 Read More About Modules

👉 https://handbook.obytes.com/docs/mobile/get-started

### Releasing and building the app with Github action

👉 https://handbook.obytes.com/docs/mobile/ci-cd/github-action-build

### 🔖 License

This project is MIT licensed.
