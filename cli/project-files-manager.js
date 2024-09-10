const fs = require('fs-extra');
const path = require('path');

class ProjectFilesManager {
  #projectName;

  constructor(
    /**
     * @type {string}
     */
    projectName
  ) {
    this.#projectName = projectName;
  }

  static withProjectName(
    /**
     * @type {string}
     */
    projectName
  ) {
    return new this(projectName);
  }

  getAbsoluteFilePath(
    /**
     * A file path relative to project's root path
     * @type {string}
     */
    relativeFilePath
  ) {
    return path.join(process.cwd(), `${this.#projectName}/${relativeFilePath}`);
  }

  removeFiles(
    /**
     * An array of file paths relative to project's root path
     * @type {Array<string>}
     */
    files
  ) {
    files.forEach((fileName) => {
      const absoluteFilePath = this.getAbsoluteFilePath(fileName);

      fs.removeSync(absoluteFilePath);
    });
  }

  renameFiles(
    /**
     * An array of objects containing the old and the new file names
     * relative to project's root path
     *
     * @type {Array<{
     *   oldFileName: string;
     *   newFileName: string;
     *  }>}
     */
    files
  ) {
    files.forEach(({ oldFileName, newFileName }) => {
      const oldAbsoluteFilePath = this.getAbsoluteFilePath(oldFileName);
      const newAbsoluteFilePath = this.getAbsoluteFilePath(newFileName);

      fs.renameSync(oldAbsoluteFilePath, newAbsoluteFilePath);
    });
  }

  replaceFilesContent(
    /**
     * An array of objects containing the file name relative to project's
     * root path and the replacement patterns to be applied
     *
     * @type {Array<{
     *  fileName: string;
     *  replacements: Array<{
     *    searchValue: string;
     *    replaceValue: string;
     *  }>
     * }>}
     */
    files
  ) {
    files.forEach(({ fileName, replacements }) => {
      const absoluteFilePath = this.getAbsoluteFilePath(fileName);

      const contents = fs.readFileSync(absoluteFilePath, {
        encoding: 'utf-8',
      });

      let replaced = contents;

      replacements.forEach(({ searchValue, replaceValue }) => {
        replaced = replaced.replace(searchValue, replaceValue);
      });

      fs.writeFileSync(absoluteFilePath, replaced, { spaces: 2 });
    });
  }
}

module.exports = ProjectFilesManager;
