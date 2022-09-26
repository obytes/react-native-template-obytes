#!/usr/bin/env node
import chalk from "chalk";
import fs from "fs-extra";
import { createSpinner } from "nanospinner";
import { exec } from "child_process";
import path from "path";

export const execShellCommand = (cmd) => {
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

export const runCommand = async (
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
export const cleanUpFolder = async (projectName) => {
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
