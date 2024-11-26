# Distribute using Expo Application Services

To use Expo Application Services (EAS) to build and upload your app to the App Store and Google Play Store, there are some configurations that need to be set up on your side.

## Application build process

### Building with EAS

You will need to upload each environment file as a **file-type** EAS secret:

- For the Development environment:
  - `eas secret:create --scope project --name ENVIRONMENT_FILE_DEVELOPMENT --value .env.development --type file`
- For the QA environment:
  - `eas secret:create --scope project --name ENVIRONMENT_FILE_QA --value .env.qa --type file`
- For the Staging environment:
  - `eas secret:create --scope project --name ENVIRONMENT_FILE_STAGING --value .env.staging --type file`
- For the Production environment:
  - `eas secret:create --scope project --name ENVIRONMENT_FILE_PRODUCTION --value .env.production --type file`

Then, there are two ways to start a build process using EAS:

a. Running the `eas build` command in your terminal for the required environment:

- For the Development environment:
  - `pnpm build:development:android` and `pnpm build:development:ios`
- For the QA environment:
  - `pnpm build:qa:android` and `pnpm build:qa:ios`
- For the Staging environment:
  - `pnpm build:staging:android` and `pnpm build:staging:ios`
- For the Production environment:
  - `pnpm build:production:android` and `pnpm build:production:ios`

b. Manually triggering the [EAS Build workflow](.github/workflows/eas-build.yml) from the repository's Actions tab.

For the workflow to work properly, you will need to add the `EXPO_TOKEN` secret in the repository settings. This secret is a required access token for your Expo account. To generate a new token, follow the steps in the official [Expo documentation](https://expo.dev/settings/access-tokens).

After you've added the secrets, you can trigger the build by manually running the [EAS Build workflow](.github/workflows/eas-build.yml) from the repository's Actions tab.

### Building locally

You can also run a local build by executing the following commands:

- For the Development environment:
  - `pnpm build:development:android --local` and `pnpm build:development:ios --local`
- For the QA environment:
  - `pnpm build:qa:android --local` and `pnpm build:qa:ios --local`
- For the Staging environment:
  - `pnpm build:staging:android --local` and `pnpm build:staging:ios --local`
- For the Production environment:
  - `pnpm build:production:android --local` and `pnpm build:production:ios --local`

The only prerequisite is to have the corresponding environment file in the root folder of the project (`.env.development`, `.env.qa`, `.env.staging` or `.env.production`).

## Application Distribution Process

### Submit to the Google Play Store

The first submission of the app needs to be done manually. To learn more about why this is required, refer to the [official Expo documentation](https://expo.fyi/first-android-submission).

To submit an app to the Google Play Store, follow the steps in the [Uploading a Google Service Account Key for Play Store Submissions with EAS](https://github.com/expo/fyi/blob/main/creating-google-service-account.md) guide. It is detailed and should not take much time.

Once you've completed the guide, you'll be able to submit your EAS builds to the Google Play Store using the following commands:

- For the Development environment:
  - `pnpm submit:development:mobile --platform android`
- For the QA environment:
  - `pnpm submit:qa:mobile --platform android`
- For the Staging environment:
  - `pnpm submit:staging:mobile --platform android`
- For the Production environment:
  - `pnpm submit:production:mobile --platform android`

### Submit to the App Store

First, ensure your credentials are configured correctly in EAS. Do this by running the following commands in your terminal:

- For the Development environment:
  - `pnpm credentials:development:ios`
- For the QA environment:
  - `pnpm credentials:qa:ios`
- For the Staging environment:
  - `pnpm credentials:staging:ios`
- For the Production environment:
  - `pnpm credentials:production:ios`

Follow the prompts to authenticate and select your Apple Developer account.

When asked, "What do you want to do?", select: `App Store Connect: Manage your API Key`.

<img width="793" alt="Screenshot 2024-07-31 at 6 09 59 PM" src="https://github.com/user-attachments/assets/c0403c6d-b151-4d74-9458-2b6fadd6cbf3">

To generate a new App Store Connect API Key, ensure your user has the necessary permissions on the App Store Connect account. Verify that you have access to the Cloud Managed Distribution Certificate. Without this permission, you'll receive a `403 - Access forbidden response` error message.

![Screenshot 2024-07-31 at 5 34 56 PM](https://github.com/user-attachments/assets/890e1199-b4c6-4aed-9582-3122d40ee66a)

Once you've configured the credentials in EAS, you'll be able to submit your builds to the App Store using the following commands:

- For the Development environment:
  - `pnpm submit:development:mobile --platform ios`
- For the QA environment:
  - `pnpm submit:qa:mobile --platform ios`
- For the Staging environment:
  - `pnpm submit:staging:mobile --platform ios`
- For the Production environment:
  - `pnpm submit:production:mobile --platform ios`

### Additional Resources

For more detailed instructions on setting up your Apple Developer account, certificates, and provisioning profiles, refer to the [EAS Submit](https://docs.expo.dev/submit/introduction/) documentation.
