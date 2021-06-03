# Obytes Mobile App

The project was created using [react-native-obytes-template](https://github.com/obytes/react-native-template-obytes)

## ⭐ Features

- ✅ Typescript by default based on official Typescript template
- ✅ Auto Generate App Icon and Splash screen
- ✅ React Navigation Pre-installed
- ✅ React Query to fetch Data
- ✅ Auth flow with react-native-mmkv to secure tokens
- ✅ A clean project structure based on our experience with React Native
- ✅ Minimal UI kit setup using restyle and configurable theme & icons using react-native-svg
- ✅ A good approach to handle forms based on react-hook-form
- ✅ A complete setup to Handle Errors
- ✅ Handel environment variables with react-native-env
- ✅ Localization
- More ...

## ▶️ Usage

```
npx react-native init MyApp --template react-native-template-obytes
```

## ⚙️ Enable husky Git pre-hooks

Add the following script to your `packages.json` and reinstall dependencies to enable husky pre-commit using `yarn install`

```json
"scripts": {
    //...
     "postinstall": "husky install",
  },

```

## 📲 Update App Icon & Splash screen

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

## ✏️ Custom fonts

Replace Inter.ttf font file with your fonts under `assets/fonts` folder

Run the following command to generate App icons assets :

```
yarn react-native link
```

More details [how to customize App Icon and Splash screen](https://handbook.obytes.com/docs/mobile/generate-app-icon)

## 📚 Read More About Modules

👉 https://handbook.obytes.com/docs/mobile/get-started
