const Jimp = require('jimp');

/**
 * @param {string} appIconPath  // path to the app icon
 * @param {string} badgeOverlayPath // path to the badge icon overlay
 * @param {string} appEnvironment // the app environment staging | development | production
 * @param {string} appVersion // the app version v1.0.0
 * @returns {Promise<void>}
 * @async
 * @function
 * @name addAppBanners
 * @description
 * Create a new app icon with a banner and version ribbon overlay based on the app environment and version.
 * The app icon is a 1024x1024 PNG image.
 * The badge overlay is a 1024x1024 PNG image.
 * The environment banner is a 1024x180 PNG image.
 * The version ribbon is a 1024x180 PNG image.
 * The result image is a 1024x1024 PNG image.
 * The result image is a composite of the app icon, badge overlay, environment banner, and version ribbon.
 * The result image is saved to a file with the app environment name as suffix.
 * @example
 * addAppBanners({
 *  appIconPath: './assets/icon.png',
 * badgeOverlayPath: './assets/icon-badge.png',
 * appEnvironment: 'development',
 * appVersion: '3.0.0',
 * });
 */

async function addAppBanners({
  appIconPath,
  badgeOverlayPath,
  appEnvironment,
  appVersion,
}) {
  const appIcon = await Jimp.read(appIconPath);
  const badgeOverlay = await Jimp.read(badgeOverlayPath);
  const bannerHeight = 180;
  const bgColor = 'transparent';
  const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);

  // Create the environment banner image
  const environmentBadge = new Jimp(
    appIcon.bitmap.width,
    bannerHeight,
    bgColor
  );
  await environmentBadge.print(
    font,
    0,
    0,
    {
      text: appEnvironment.toUpperCase(),
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    },
    appIcon.bitmap.width,
    bannerHeight
  );

  // Create the version badge image and rotate it
  const versionBadge = new Jimp(appIcon.bitmap.width, bannerHeight, bgColor);
  await versionBadge.print(
    font,
    0,
    0,
    {
      text: appVersion,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    },
    appIcon.bitmap.width,
    bannerHeight
  );
  versionBadge.rotate(-45);
  const translateX = 270; // this one to make sure is in the right position, its a magic number :D get it by testing and tweaking it with real results

  // Combine the app icon, badgeOverlay environment banner, and version ribbon images
  const resultImage = await appIcon
    .composite(badgeOverlay, 0, 0)
    .composite(environmentBadge, 0, appIcon.bitmap.height - bannerHeight + 2)
    .composite(
      versionBadge,
      appIcon.bitmap.width - versionBadge.bitmap.width + translateX,
      -translateX
    );

  // Save the result image to a file with app environment name as suffix
  // probably we need to add it a pram to the function to allow the user to choose the output path
  // or use the same app icon path and add the suffix to the file name
  const resultFilename = `assets/icon.${appEnvironment}.png`;
  await resultImage.writeAsync(resultFilename);
}

addAppBanners({
  appIconPath: './assets/icon.png',
  badgeOverlayPath: './assets/icon-badge.png',
  appEnvironment: 'development',
  appVersion: '3.0.0',
});
