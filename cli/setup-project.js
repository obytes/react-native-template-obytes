const {
  execShellCommand,
  runCommand,
  UPSTREAM_REPOSITORY,
  TEMPLATE_REPOSITORY,
} = require('./utils.js');
const { consola } = require('consola');
const fs = require('fs-extra');
const path = require('path');

const initGit = async (projectName) => {
  await execShellCommand(`cd ${projectName} && git init && cd ..`);
};

const installDeps = async (projectName) => {
  await runCommand(`cd ${projectName} && pnpm install`, {
    loading: 'Installing project dependencies',
    success: 'Dependencies installed',
    error: 'Failed to install dependencies, Make sure you have pnpm installed',
  });
};

// remove unnecessary files and directories
const removeFiles = (projectName) => {
  const FILES_TO_REMOVE = ['.git', 'README.md', 'docs', 'cli', 'LICENSE'];

  FILES_TO_REMOVE.forEach((file) => {
    fs.removeSync(path.join(process.cwd(), `${projectName}/${file}`));
  });
};

// Update package.json infos, name and  set version to 0.0.1 + add initial version to osMetadata
const updatePackageInfos = async (projectName) => {
  const packageJsonPath = path.join(
    process.cwd(),
    `${projectName}/package.json`
  );
  const packageJson = fs.readJsonSync(packageJsonPath);
  packageJson.osMetadata = { initVersion: packageJson.version };
  packageJson.version = '0.0.1';
  packageJson.name = projectName?.toLowerCase();
  packageJson.repository = {
    type: 'git',
    url: 'git+https://github.com/user/repo-name.git',
  };
  fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
};

const updateProjectConfig = async (projectName) => {
  const configPath = path.join(process.cwd(), `${projectName}/env.js`);
  const contents = fs.readFileSync(configPath, {
    encoding: 'utf-8',
  });
  const replaced = contents
    .replace(/RootstrapApp/gi, projectName)
    .replace(/com.rootstrap/gi, `com.${projectName.toLowerCase()}`)
    .replace(/rootstrap/gi, 'expo-owner');

  fs.writeFileSync(configPath, replaced, { spaces: 2 });
};

const updateGitHubWorkflows = (projectName) => {
  const upstreamToPRWorkflowPath = path.join(
    process.cwd(),
    `${projectName}/.github/workflows/upstream-to-pr.yml`
  );
  const contents = fs.readFileSync(upstreamToPRWorkflowPath, {
    encoding: 'utf-8',
  });

  const replaced = contents.replace(UPSTREAM_REPOSITORY, TEMPLATE_REPOSITORY);

  fs.writeFileSync(upstreamToPRWorkflowPath, replaced, { spaces: 2 });
};

const renameFiles = (projectName) => {
  const FILES_TO_RENAME = [
    {
      oldFileName: 'README-project.md',
      newFileName: 'README.md',
    },
  ];

  FILES_TO_RENAME.forEach(({ oldFileName, newFileName }) => {
    fs.renameSync(
      path.join(process.cwd(), `${projectName}/${oldFileName}`),
      path.join(process.cwd(), `${projectName}/${newFileName}`)
    );
  });
};

const setupProject = async (projectName) => {
  consola.start(`Clean up and setup your project 🧹`);
  try {
    removeFiles(projectName);
    await initGit(projectName);
    updatePackageInfos(projectName);
    updateProjectConfig(projectName);
    updateGitHubWorkflows(projectName);
    renameFiles(projectName);
    consola.success(`Clean up and setup your project 🧹`);
  } catch (error) {
    consola.error(`Failed to clean up project folder`, error);
    process.exit(1);
  }
};

module.exports = {
  setupProject,
  installDeps,
};
