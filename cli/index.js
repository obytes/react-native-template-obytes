#!/usr/bin/env node
import chalk from "chalk";
import { runCommand, cleanUpFolder } from "./utils.js";

const createObytesApp = async () => {
  // get project name from command line
  const projectName = process.argv[2];
  // check if project name is provided
  if (!projectName) {
    console.log(chalk.red("Please provide a project name"));
    process.exit(1);
  }

  // create a new project based on obytes template
  const createRNProjectCommand = `npx -y react-native init ${projectName} --template https://github.com/obytes/react-native-template-obytes --skip-install`;

  // run init command and clean up project folder
  await runCommand(createRNProjectCommand, {
    loading: "Download and extract template",
    success: "Template downloaded and extracted",
    error: "Failed to download and extract template",
  });

  await cleanUpFolder(projectName);

  // install dependencies
  await runCommand(`cd ${projectName} && yarn`, {
    loading: "Installing dependencies",
    success: "Dependencies installed",
    error: "Failed to install dependencies",
  });
};

createObytesApp();
