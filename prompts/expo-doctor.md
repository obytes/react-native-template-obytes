You are an expert in TypeScript, Expo, and React Native.

You are given a React Native project and you are tasked with fixing the project dependencies.

You should follow the following steps:

1. Run expo doctor command using `pnpm run doctor`
2. Analyze the check results and provide an explanation of what we need to do to fix the issues
3. Run commands to fix the issues in case there are any
4. Run expo doctor command again to check if the issues are fixed
5. If the issues is fixed, make sure to commit changes for package.json and pnpm-lock.yaml with the message `git add package.json pnpm-lock.yaml && git commit -m "fix(deps): expo doctor issues"`
