#!/usr/bin/env node
const chalk = require('chalk');
const fs = require('fs-extra');
const { createSpinner } = require('nanospinner');
const { exec } = require('child_process');
const path = require('path');

const execShellCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
        reject(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
};

const runCommand = async (
  command,
  { loading = 'loading ....', success = 'success', error = 'error' }
) => {
  const spinner = createSpinner(loading).start({ text: loading });
  try {
    await execShellCommand(command);
    spinner.success({ text: success });
  } catch (err) {
    spinner.error({ text: error });
    console.log(chalk.red(`Failed to execute ${command}`), error);
    process.exit(1);
  }
};
const initGit = async (projectName) => {
  await execShellCommand(`cd ${projectName} && git init && cd ..`);
};

// Update package.json infos, name and  set version to 0.0.1
const updatePackageInfos = async (projectName) => {
  const packageJsonPath = path.join(
    process.cwd(),
    `${projectName}/package.json`
  );
  const packageJson = fs.readJsonSync(packageJsonPath);
  packageJson.osMetadata = { initVersion : packageJson.version };
  packageJson.version = '0.0.1';
  packageJson.name = projectName?.toLowerCase();
  packageJson.repository = { type: 'git', url:'git+https://github.com/user/repo-name.git'}
  fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
};

const updateConfig = async (projectName) => {
  const configPath = path.join(
    process.cwd(),
    `${projectName}/env.js`
  );
  const contents = fs.readFileSync(configPath, {
    encoding: 'utf-8',
  });
  const replaced = contents
    .replace(/ObytesApp/gi, projectName)
    .replace(/com.obytes/gi, `com.${projectName.toLowerCase()}`)
    .replace(/obytes/gi, 'expo-owner');

  fs.writeFileSync(configPath, replaced, { spaces: 2 });
  const readmeFilePath = path.join(
    process.cwd(),
    `${projectName}/README-project.md`
  );
  fs.renameSync(
    readmeFilePath,
    path.join(process.cwd(), `${projectName}/README.md`)
  );
};

// remove ios and android folders and update project config
const cleanUpFolder = async (projectName) => {
  const spinner = createSpinner(`Clean and Setup project folder`).start();
  const FILES_TO_REMOVE = [
    '.git',
    'README.md',
    'ios',
    'android',
    'docs',
    'cli',
    'LICENSE',
  ];
  try {
    FILES_TO_REMOVE.forEach((file) => {
      fs.removeSync(path.join(process.cwd(), `${projectName}/${file}`));
    });
    await initGit(projectName);
    updatePackageInfos(projectName);
    updateConfig(projectName);
    spinner.success({ text: 'Clean and Setup  project folder' });
  } catch (error) {
    spinner.error({ text: error });
    console.log(chalk.red(`Failed to clean up project folder`), error);
    process.exit(1);
  }
};

// show more details message using chalk
const showMoreDetails = () => {
  console.log(
    '\n\n\n',
    chalk('🔥 Your project is ready to go! \n\n'),
    chalk('📱 Run your project: \n\n'),
    chalk(`   cd ${projectName}`),
    chalk('   IOS     :  pnpm ios \n'),
    chalk('   Android :  pnpm android \n\n'),
    chalk.bold('📚 Starter Documentation: https://starter.obytes.com \n')
  );
};

module.exports = {
  runCommand,
  cleanUpFolder,
  showMoreDetails,
};
