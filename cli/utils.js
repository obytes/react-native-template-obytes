#!/usr/bin/env node
const chalk = require("chalk");
const fs = require("fs-extra");
const { createSpinner } = require("nanospinner");
const { exec } = require("child_process");
const path = require("path");

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
  { loading = "loading ....", success = "success", error = "error" }
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

// remove ios and android folders
const cleanUpFolder = async (projectName) => {
  const spinner = createSpinner(`Clean up project folder`).start();
  try {
    fs.removeSync(path.join(process.cwd(), `${projectName}/ios`));
    fs.removeSync(path.join(process.cwd(), `${projectName}/android`));
    spinner.success({ text: "Clean up project folder" });
  } catch (error) {
    spinner.error({ text: error });
    console.log(chalk.red(`Failed to clean up project folder`), error);
    process.exit(1);
  }
};

module.exports = {
  runCommand,
  cleanUpFolder,
};
