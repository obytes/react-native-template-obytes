const { execShellCommand, runCommand } = require('./utils.js');
const { consola } = require('consola');
const fs = require('fs-extra');
const path = require('path');

const initGit = async (projectName) => {
  await execShellCommand(`cd ${projectName} && git init && cd ..`);
};

const installDeps = async (projectName) => {
  await runCommand(`cd ${projectName} && pnpm install`, {
    loading: 'Installing  project dependencies',
    success: 'Dependencies installed',
    error: 'Failed to install dependencies, Make sure you have pnpm installed',
  });
};

// remove unnecessary files, such us .git, ios, android, docs, cli, LICENSE
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
    
    // Update e2e test script APP_ID if it exists
    if (packageJson.scripts && packageJson.scripts['e2e-test']) {
      packageJson.scripts['e2e-test'] = packageJson.scripts['e2e-test']
        .replace(/com\.obytes\.development/g, `com.${projectName.toLowerCase()}.development`);
    }
    
    fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
  };

const updateProjectConfig = async (projectName) => {
  // Update env.ts
  const configPath = path.join(process.cwd(), `${projectName}/env.ts`);
  let contents = fs.readFileSync(configPath, {
    encoding: 'utf-8',
  });
  let replaced = contents
    .replace(/ObytesApp/gi, projectName)
    .replace(/com.obytes/gi, `com.${projectName.toLowerCase()}`)
    .replace(/obytes/gi, 'expo-owner');

  fs.writeFileSync(configPath, replaced, { spaces: 2 });

  // Update app.config.ts
  const appConfigPath = path.join(process.cwd(), `${projectName}/app.config.ts`);
  let appConfigContents = fs.readFileSync(appConfigPath, {
    encoding: 'utf-8',
  });
  let appConfigReplaced = appConfigContents
    .replace(/expo\/react-native-template-obytes/g, `user\/repo-name`)
    .replace(/const EXPO_ACCOUNT_OWNER = 'obytes';/g, `const EXPO_ACCOUNT_OWNER = '${projectName.toLowerCase()}'`)
    .replace(/const EAS_PROJECT_ID = 'c3e1075b-6fe7-4686-aa49-35b46a229044';/g, `const EAS_PROJECT_ID = 'your-project-id';`)
    .replace(/slug: 'obytesapp',/g, `slug: '${projectName.toLowerCase()}',`);

  fs.writeFileSync(appConfigPath, appConfigReplaced, { spaces: 2 });

  // Rename README-project.md to README.md
  const readmeFilePath = path.join(
    process.cwd(),
    `${projectName}/README-project.md`
  );
  fs.renameSync(
    readmeFilePath,
    path.join(process.cwd(), `${projectName}/README.md`)
  );
};

const setupProject = async (projectName) => {
  consola.start(`Clean up and setup your project 🧹`);
  try {
    removeFiles(projectName);
    await initGit(projectName);
    updatePackageInfos(projectName);
    updateProjectConfig(projectName);
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
