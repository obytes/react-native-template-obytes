const { runCommand, TEMPLATE_REPOSITORY } = require('./utils.js');
const { consola } = require('consola');

const getLatestRelease = async () => {
  try {
    const repoData = await fetch(
      `https://api.github.com/repos/${TEMPLATE_REPOSITORY}/releases/latest`
    );
    const releaseData = await repoData.json();
    return releaseData.tag_name || 'master';
  } catch (error) {
    console.warn(
      'Failed to retrieve the latest release; will use the master branch instead'
    );
    return 'master';
  }
};

const cloneLastTemplateRelease = async (projectName) => {
  consola.start('Extracting last release number 👀');
  const latest_release = await getLatestRelease();
  consola.info(`Using Rootstrap's Template ${latest_release}`);

  // create a new project based on Rootstrap template
  const cloneStarter = `git clone -b ${latest_release} --depth=1 https://github.com/${TEMPLATE_REPOSITORY}.git ${projectName}`;
  await runCommand(cloneStarter, {
    loading: 'Extracting the template...',
    success: 'Template extracted successfully',
    error: 'Failed to download and extract template',
  });
};

module.exports = {
  cloneLastTemplateRelease,
};
