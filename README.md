<p align="center">
    <img alt="React Native Template Obytes" src="https://user-images.githubusercontent.com/11137944/93101697-808bc580-f6a2-11ea-8ce3-482be6ca456a.png" width="200" />

</p>
<h1 align="center">
  React Native Template Obytes
</h1>

📱 A template for your next React Native project 🚀, Made with developer experience and performance first: Expo,TypeScript,tailwindcss, Husky, Lint-Staged, react-navigation, react-query, react-hook-form, I18n.

🚀 Use the template to start your next project or navigate to [code source](https://github.com/obytes/react-native-template-obytes/tree/master/template) to get some inspiration 😉

### ⭐ Features

- ✅ Last Expo SDK + Costume Dev client
- 🎉 Type checking [TypeScript](https://www.typescriptlang.org/)
- 💅 Minimal UI kit using [tailwindcss](https://www.nativewind.dev/) with theming.
- ⚙️ Support multiple environnement builds [Production, Staging, Development] using Expo configuration.
- 🦊 Husky for Git Hooks
- 💡 Clean project structure with Absolute Imports
- 🚫 Lint-staged for running linters + typescript checking on Git staged files
- 🗂 VSCode recommended extensions configuration, settings and snippets for a better developer experience
- ☂️ [React Navigation](https://reactnavigation.org/) pre-installed with examples
- 💫 Auth flow with [zustand](https://github.com/pmndrs/zustand) and [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) as a storage to save sensitive data.
- 🛠 A simple workflow to build, release and distribute your application using [Github action](https://github.com/features/actions)
- 🔥 [React Query](https://react-query.tanstack.com/) & [axios](https://github.com/axios/axios) to fetch Data
- 🧵 A good approach with example to handle forms based on [react-hook-form](https://react-hook-form.com/) and [yup](https://github.com/jquense/yup) for validation
- 🎯 Localization with [i18next](https://www.i18next.com/) + validation using Eslint.

### 🎤 Philosophy

- 🚀 Production-ready
- 🥷 Developer experience + Productivity
- 🧩 Minimal code and dependencies
- ⚠️ well maintained third-party libraries

## 🔗 Requirements

- [Node.js LTS release](https://nodejs.org/en/)
- [Git](https://git-scm.com/)
- [Watchman](https://facebook.github.io/watchman/docs/install#buildinstall), required only for macOS or Linux users
- [Yarn](https://classic.yarnpkg.com/en/docs/install)
- [Expo Cli](https://docs.expo.dev/workflow/expo-cli/)
- [VS Code Editor](https://code.visualstudio.com/download)

### 🤖 Getting started

Start your project by running the following command:

```bash
npx create-obytes-app MyApp

```

Enable husky Git pre-hooks by adding the following script to your `packages.json` and reinstall dependencies to enable husky pre-commit using `yarn install`

```json
   "scripts": {
      "postinstall": "husky install",
    },
```

Run the app

```bash
yarn ios

yarn android
```

### Project structure

```bash
src
├── api
│   ├── common
│   │   ├── api-provider.tsx
│   │   ├── client.tsx
│   │   ├── index.tsx
│   │   └── utils.tsx
│   ├── index.tsx
│   ├── posts
│   │   ├── index.tsx
│   │   └── use-posts.ts
│   └── types.ts
├── core
│   ├── auth
│   │   ├── index.tsx
│   │   └── utils.tsx
│   ├── i18n
│   │   ├── index.tsx
│   │   ├── react-i18next.d.ts
│   │   ├── resources.ts
│   │   ├── types.ts
│   │   └── utils.tsx
│   ├── index.tsx
│   └── utils.ts
├── index.tsx
├── navigation
│   ├── auth-navigator.tsx
│   ├── index.tsx
│   ├── navigation-container.tsx
│   ├── root-navigator.tsx
│   ├── tab-navigator.tsx
│   ├── types.tsx
│   └── utils.tsx
├── screens
│   ├── feed
│   │   ├── card.tsx
│   │   └── index.tsx
│   ├── index.tsx
│   ├── login
│   │   └── index.tsx
│   ├── settings
│   └── style
├── translations
│   ├── ar.json
│   └── en.json
├── types
│   └── index.ts
└── ui
    ├── core
    │   ├── activity-indicator.tsx
    │   ├── bottom-sheet
    │   ├── button.tsx
    │   ├── image.tsx
    │   ├── index.tsx
    │   ├── input
    │   ├── list
    │   ├── pressable.tsx
    │   ├── scroll-view.tsx
    │   ├── select-input
    │   ├── text.tsx
    │   ├── touchable-opacity.tsx
    │   └── view.tsx
    ├── error-handler
    │   ├── error-fallback.tsx
    │   └── index.tsx
    ├── icons
    ├── index.tsx
    ├── screen.tsx
    ├── theme
    │   ├── colors.js
    │   ├── constants.tsx
    │   └── index.ts
    └── utils.tsx
```

### 🧩 Customization

#### 📲 Update App Icon & Splash screen

Replace App icons template with your icons under `assets` folder

Run the following command to generate App icons assets :

```
yarn prebuild

yarn ios

```

### 🔖 License

This project is MIT licensed.
