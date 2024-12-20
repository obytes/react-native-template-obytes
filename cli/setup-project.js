const { execShellCommand, runCommand } = require('./utils.js');
const { consola } = require('consola');
const fs = require('fs-extra');
const path = require('path');

// Execute shell command within a project directory
const execInProjectDir = async (projectName, command) => {
  const projectPath = path.join(process.cwd(), projectName);
  await execShellCommand(`cd ${projectPath} && ${command}`);
};

// Initialize Git repository
const initGit = async (projectName) => {
  await execInProjectDir(projectName, 'git init');
};

// Install dependencies using pnpm
const installDeps = async (projectName) => {
  const projectPath = path.join(process.cwd(), projectName);
  await runCommand(`cd ${projectPath} && pnpm install`, {
    loading: 'Installing project dependencies',
    success: 'Dependencies installed',
    error: 'Failed to install dependencies. Make sure you have pnpm installed.',
  });
};

// Remove unnecessary files from the project directory
const removeFiles = async (projectName) => {
  const FILES_TO_REMOVE = [
    '.git',
    'README.md',
    'ios',
    'android',
    'docs',
    'cli',
    'LICENSE',
  ];

  const projectPath = path.join(process.cwd(), projectName);
  for (const file of FILES_TO_REMOVE) {
    const filePath = path.join(projectPath, file);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  }
};

// Update package.json details
const updatePackageInfos = async (projectName) => {
  const packageJsonPath = path.join(process.cwd(), `${projectName}/package.json`);
  const packageJson = await fs.readJson(packageJsonPath);

  packageJson.osMetadata = { initVersion: packageJson.version };
  packageJson.version = '0.0.1';
  packageJson.name = projectName.toLowerCase();
  packageJson.repository = {
    type: 'git',
    url: 'git+https://github.com/user/repo-name.git',
  };

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
};

// Update configuration files with project-specific values
const updateProjectConfig = async (projectName) => {
  const configPath = path.join(process.cwd(), `${projectName}/env.js`);
  const contents = await fs.readFile(configPath, 'utf-8');

  const replaced = contents
    .replace(/ObytesApp/gi, projectName)
    .replace(/com.obytes/gi, `com.${projectName.toLowerCase()}`)
    .replace(/obytes/gi, 'expo-owner');

  await fs.writeFile(configPath, replaced);

  const readmeFilePath = path.join(process.cwd(), `${projectName}/README-project.md`);
  const newReadmePath = path.join(process.cwd(), `${projectName}/README.md`);

  if (await fs.pathExists(readmeFilePath)) {
    await fs.rename(readmeFilePath, newReadmePath);
  }
};

// Main function to set up the project
const setupProject = async (projectName) => {
  consola.start(`Cleaning up and setting up your project 🧹`);

  try {
    await removeFiles(projectName);
    await initGit(projectName);
    await updatePackageInfos(projectName);
    await updateProjectConfig(projectName);
    consola.success(`Project setup completed successfully 🧹`);
  } catch (error) {
    consola.error(`Failed to set up the project:`, error);
    process.exit(1);
  }
};

module.exports = {
  setupProject,
  installDeps,
};
