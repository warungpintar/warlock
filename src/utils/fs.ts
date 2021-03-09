import fs from 'fs';
import { pipe } from 'fp-ts/function';
import * as IOE from 'fp-ts/IOEither';
import * as E from 'fp-ts/Either';

import { concat } from '../utils/generic';

const onDirectoryNotExist = (dirPath: string): IOE.IOEither<Error, string> =>
  createDir(dirPath);

const onDirectoryExist = (dirPath: string): IOE.IOEither<Error, string> =>
  IOE.of(dirPath);

export const buildDirPath = (baseDirPath: string) => (
  dirName: string,
): string => pipe(baseDirPath, concat('/'), concat(dirName));

export const checkDirectoryExist = (dirPath): IOE.IOEither<string, string> =>
  IOE.chain((x: string) => (fs.existsSync(x) ? IOE.right(x) : IOE.left(x)))(
    dirPath,
  );

export const removeDirIfExist = (dirPath) =>
  pipe(
    IOE.tryCatch(() => {
      fs.rmdirSync(dirPath);
      return dirPath;
    }, E.toError),
  );

export const createDir = (dirPath: string): IOE.IOEither<Error, string> =>
  IOE.tryCatch(() => {
    fs.mkdirSync(dirPath);
    return dirPath;
  }, E.toError);

export const createDirIfNotExist = (dirPath: string) =>
  pipe(
    IOE.of(dirPath),
    checkDirectoryExist,
    IOE.fold(onDirectoryNotExist, onDirectoryExist),
  );
