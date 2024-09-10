const {
  execShellCommand,
  runCommand,
  UPSTREAM_REPOSITORY,
  TEMPLATE_REPOSITORY,
} = require('./utils.js');
const { consola } = require('consola');
const fs = require('fs-extra');
const ProjectFilesManager = require('./project-files-manager.js');

/**
 * @type {ProjectFilesManager}
 */
let projectFilesManager;

const initializeProjectRepository = async (projectName) => {
  await execShellCommand(`cd ${projectName} && git init && cd ..`);
};

const installDependencies = async (projectName) => {
  await runCommand(`cd ${projectName} && pnpm install`, {
    loading: 'Installing project dependencies',
    success: 'Dependencies installed',
    error: 'Failed to install dependencies, Make sure you have pnpm installed',
  });
};

const removeUnrelatedFiles = () => {
  projectFilesManager.removeFiles([
    '.git',
    'README.md',
    'docs',
    '.github/workflows/deploy-docs.yml',
    'cli',
    '.github/workflows/deploy-cli.yml',
    'LICENSE',
  ]);
};

// Update package.json infos, name and  set version to 0.0.1 + add initial version to osMetadata
const updatePackageJson = async (projectName) => {
  const packageJsonPath =
    projectFilesManager.getAbsoluteFilePath('package.json');

  const packageJson = fs.readJsonSync(packageJsonPath);
  packageJson.osMetadata = { initVersion: packageJson.version };
  packageJson.version = '0.0.1';
  packageJson.name = projectName?.toLowerCase();
  packageJson.repository = {
    type: 'git',
    url: 'git+https://github.com/user/repo-name.git',
  };

  const appReleaseScript = packageJson.scripts['app-release'];
  packageJson.scripts['app-release'] = appReleaseScript.replace(
    'template',
    projectName
  );
  fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
};

const updateProjectConfig = async (projectName) => {
  projectFilesManager.replaceFilesContent([
    {
      fileName: 'env.js',
      replacements: [
        {
          searchValue: /RootstrapApp/gi,
          replaceValue: projectName,
        },
        {
          searchValue: /com.rootstrap/gi,
          replaceValue: `com.${projectName.toLowerCase()}`,
        },
        {
          searchValue: /rsdevs/gi,
          replaceValue: 'expo-owner',
        },
      ],
    },
  ]);
};

const updateGitHubWorkflows = (projectName) => {
  // Update useful workflows
  projectFilesManager.replaceFilesContent([
    {
      fileName: '.github/workflows/upstream-to-pr.yml',
      replacements: [
        {
          searchValue: UPSTREAM_REPOSITORY,
          replaceValue: TEMPLATE_REPOSITORY,
        },
      ],
    },
    {
      fileName: '.github/workflows/new-template-version.yml',
      replacements: [
        {
          searchValue: 'new version of the template',
          replaceValue: 'new version of the app',
        },
        {
          searchValue: 'New Template Version',
          replaceValue: `New ${projectName} Version`,
        },
        {
          searchValue: 'Run Template release',
          replaceValue: 'Run App release',
        },
        {
          searchValue:
            /^\s*environment:\s*\n\s*name:\s*template\s*\n\s*url:\s*.+\s*\n/m,
          replaceValue: '',
        },
      ],
    },
  ]);

  projectFilesManager.renameFiles([
    {
      oldFileName: '.github/workflows/new-template-version.yml',
      newFileName: '.github/workflows/new-app-version.yml',
    },
  ]);

  // Update Pull Request Template
  projectFilesManager.replaceFilesContent([
    {
      fileName: '.github/PULL_REQUEST_TEMPLATE.md',
      replacements: [
        {
          searchValue: /^[\s\S]*?(?=## What does this do\?)/,
          replaceValue: '',
        },
      ],
    },
  ]);
};

const updateProjectReadme = () => {
  projectFilesManager.renameFiles([
    {
      oldFileName: 'README-project.md',
      newFileName: 'README.md',
    },
  ]);
};

const setupProject = async (projectName) => {
  consola.start(`Clean up and setup your project 🧹`);

  projectFilesManager = ProjectFilesManager.withProjectName(projectName);

  try {
    removeUnrelatedFiles();
    await initializeProjectRepository(projectName);
    updatePackageJson(projectName);
    updateProjectConfig(projectName);
    updateGitHubWorkflows(projectName);
    updateProjectReadme();
    consola.success(`Clean up and setup your project 🧹`);
  } catch (error) {
    consola.error(`Failed to clean up project folder`, error);
    process.exit(1);
  }
};

module.exports = {
  setupProject,
  installDependencies,
};
