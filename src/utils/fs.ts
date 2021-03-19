import fs from 'fs';
import { pipe } from 'fp-ts/function';
import * as IOE from 'fp-ts/IOEither';
import * as E from 'fp-ts/Either';

import { concat } from '../utils/generic';

const onDirectoryNotExist = (error: Error): IOE.IOEither<Error, string> => {
  const { message: dirPath } = error;
  return createDir(dirPath);
};

const onDirectoryExist = (dirPath: string): IOE.IOEither<Error, string> =>
  IOE.of(dirPath);

export const buildDirPath = (baseDirPath: string) => (
  dirName: string,
): string => pipe(baseDirPath, concat('/'), concat(dirName));

export const checkDirectoryExist = (
  dirPath: string,
): IOE.IOEither<unknown, string> =>
  pipe(
    IOE.of(dirPath),
    IOE.chain((x) =>
      fs.existsSync(x) ? IOE.right(x) : IOE.left(new Error(x)),
    ),
  );

export const removeDir = (dirPath: string): IOE.IOEither<Error, boolean> =>
  IOE.tryCatch(() => {
    fs.rmdirSync(dirPath, { recursive: true });
    return true;
  }, E.toError);

export const removeDirIfExist = (dirPath) =>
  pipe(checkDirectoryExist(dirPath), IOE.chain(removeDir));

export const createDir = (dirPath: string): IOE.IOEither<Error, string> =>
  IOE.tryCatch(() => {
    fs.mkdirSync(dirPath);
    return dirPath;
  }, E.toError);

export const createDirIfNotExist = (dirPath: string) =>
  pipe(
    IOE.of(dirPath),
    IOE.chain(checkDirectoryExist),
    IOE.fold(onDirectoryNotExist, onDirectoryExist),
  );
