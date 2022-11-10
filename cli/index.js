#!/usr/bin/env node

const chalk = require('chalk');
const { runCommand, cleanUpFolder, showMoreDetails } = require('./utils.js');

const createObytesApp = async () => {
  // get project name from command line
  const projectName = process.argv[2];
  // check if project name is provided
  if (!projectName) {
    console.log(chalk.red('Please provide a project name'));
    process.exit(1);
  }

  // create a new project based on obytes template
  const cloneStarter = `git clone --depth=1 -b new_structure https://github.com/obytes/react-native-template-obytes.git ${projectName}`;

  // run init command and clean up project folder
  await runCommand(cloneStarter, {
    loading: 'Download and extract template',
    success: 'Template downloaded and extracted',
    error: 'Failed to download and extract template',
  });

  await cleanUpFolder(projectName);

  // install dependencies
  await runCommand(`cd ${projectName} && yarn`, {
    loading: 'Installing dependencies',
    success: 'Dependencies installed',
    error: 'Failed to install dependencies',
  });

  showMoreDetails();
};

createObytesApp();
