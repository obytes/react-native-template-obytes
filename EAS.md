## Distribute using Expo Application Services

To be able to use Expo Application Services to upload your app to App Store and Google Play Store there are some configurations that need to be done on your side.

### Build from github actions

To be able to trigger the eas-build github action you will have to add the `EXPO_TOKEN` secret to the repo settings. This secret is a required access token for your Expo account. https://expo.dev/settings/access-tokens

### Submit to Google Play Store

The first submission of the app needs to be performed manually. Learn more: https://expo.fyi/first-android-submission. Only after having a valid version submitted you can submit automatically using EAS.

To submit an app to google play store you will have to follow the steps in [Uploading a Google Service Account Key for Play Store Submissions with EAS](https://github.com/expo/fyi/blob/main/creating-google-service-account.md) guide, its super detailed and should not take you much time.

Once you've completed the guide you'll be able to submit to the store your EAS builds using the following command:

`eas submit --platform android`

### Submit to AppStore

1. Ensure your credentials are configured correctly in EAS. You can do this by running the following command in your terminal:

`eas credentials`

Follow the prompts to authenticate and select your Apple Developer account.

2. Build your app using Expo and EAS:

`eas build --platform ios`

This command initiates the build process for iOS using Expo Application Services.

3. Submit Your Build to the App Store
   Once your build is complete, you can submit it to the App Store using the following command:

`eas submit --platform ios`

This command will handle the submission of your build to the App Store using the credentials and configuration you provided.

### Additional Resources

For more detailed instructions on setting up your Apple Developer account, certificates, and provisioning profiles, refer to the [EAS Submits](https://docs.expo.dev/submit/introduction/) docs.
