---
sidebar_position: 1
---

# Overview

This starter is based on obytes mobile tribe best practices for building react native apps and used on a daily based by our team. The starter is battle tested with multiple projects we worked on over the past four years.

Although the starter is very opinionated, we believe that we did our best to select the best solutions for the majority of the challenges we ran into while developing mobile apps for our clients.

## 🚀 Motivation

The idea behind the starter is that we wanted to create a starter that will help us create react native apps faster and with less effort.
we want to make sure all our internal and external projects will have the same code quality and the same architecture which help us maintain and scale our apps easily as well as sharing code between projects and teams.

Using this starter help our team to switch projects easily and focus on the business logic and not on the boilerplate code.

## ✍️ Philosophy

We built this starter with the following principles in mind:

- 🚀 Production-ready
- 🥷 Developer experience + Productivity
- 🧩 Minimal code and dependencies
- 💪 well maintained third-party libraries

## ⭐ key Features

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

## 😉 Why Expo?

Expo is a great tool to build react native apps, it helps you to build your app faster and with less effort.
One of the most famous questions we get from the community is why we use Expo and not React Native ClI?

In the first version of the starter we used React Native CLI as back then using Expo is not the best option as we are using some native libraries and we will need to eject the app anyway. Last year Expo team introduce using costume dev client which allow you to use Expo without ejecting the app and use native libraries.

The starter is using Expo with a costume dev client which means we will get access to the amazing Expo ecosystem and install native libraries without ejecting the app.

Last and not least, with older version of the starter we face a lot of issues while upgrading our apps to the last version but now with Expo we can upgrade our apps easily.

Probably the right question is **Why not Expo?**

## 🤔 Is this starter for you?

The short answer is yes, if you are building a react native app and you want to start with a solid foundation ,good architecture and a good developer experience then this starter is for you.

If you don't think using a starter is a good idea you can just take a look and get some inspiration for your project to find some good practices and solutions for common challenges react native developers are facing while building apps.

## 🧑‍💻 Stay up to date

The starter is constantly improving and we are adding new features and fixing bugs as soon as we can. You can stay up to date by watching the repository or by hitting the start button.

<!-- add a gif image here  -->

## 💎 Libraries used

- [Expo](https://docs.expo.io/)
- [React Navigation](https://reactnavigation.org/)
- [Nativewind](https://www.nativewind.dev/)
- [Flash list](https://github.com/Shopify/flash-list)
- [React Query](https://tanstack.com/query/v4)
- [Axios](https://axios-http.com/docs/intro)
- [React Hook Form](https://react-hook-form.com/)
- [i18next](https://www.i18next.com/)
- [zustand](https://github.com/pmndrs/zustand)
- [React Native MMKV](https://github.com/mrousavy/react-native-mmkv)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/)
- [React Naive Svg](https://github.com/software-mansion/react-native-svg)
- [ React Error Boundaries](https://github.com/bvaughn/react-error-boundary)
- [React Native fast image](https://github.com/DylanVann/react-native-fast-image)

## work with us

## Contributors

more:

- get started
- project structure
- validation & rules : git hooks and linting + typescript checking + file names
- Github actions for new PRs to validate hooks and typing
- customizing app icons + splash screen
- ui and theming and tawiwindcss

## Guides

- auth module
- storage module
- handling froms
- localization
- More
- api module and handling apis calls for the app

- vs code setting and extensions
- build and release with eas and github actions
