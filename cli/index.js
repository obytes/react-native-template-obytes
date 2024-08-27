#!/usr/bin/env node

const { consola } = require('consola');
const { showMoreDetails } = require('./utils.js');
const { cloneLastTemplateRelease } = require('./clone-repo.js');
const { setupProject, installDeps } = require('./setup-project.js');
const pkg = require('./package.json');

const { name: packageName } = pkg;
const createRootstrapApp = async () => {
  consola.box("Rootstrap's React Native Template\nPerfect React Native App Kickstart 🚀!");
  // get project name from command line
  const projectName = process.argv[2];
  // check if project name is provided
  if (!projectName) {
    consola.error(
      `Please provide a name for your project: \`npx ${packageName}@latest <project-name>\``
    );
    process.exit(1);
  }
  // clone the last release of the template from github
  await cloneLastTemplateRelease(projectName);

  // setup the project: remove unnecessary files, update package.json infos, name and  set version to 0.0.1 + add initial version to osMetadata
  await setupProject(projectName);

  // install project dependencies using pnpm
  await installDeps(projectName);

  // show instructions to run the project + link to the documentation
  showMoreDetails(projectName);
};

createRootstrapApp();
