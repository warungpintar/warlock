import fs from 'fs';
import { pipe } from 'fp-ts/function';
import * as IOE from 'fp-ts/IOEither';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';

import { concat } from '../utils/generic';
import { safeGet } from '../utils/object';

type FileError = {
  name: string;
  message: string;
  path?: string;
  stack?: string;
};

export function FileError(this: FileError, message: string, path?: string) {
  this.name = 'FileError';
  this.message = message;
  this.path = path;
  this.stack = new Error().stack;
}

FileError.prototype = Object.create(Error.prototype);
FileError.prototype.constructor = FileError;

export const buildDirPath = (baseDirPath: string) => (
  dirName: string,
): string => pipe(baseDirPath, concat('/'), concat(dirName));

export const checkDirectoryExist = (
  dirPath: string,
): IOE.IOEither<unknown, string> =>
  pipe(
    IOE.of(dirPath),
    IOE.chain((path) =>
      fs.existsSync(path)
        ? IOE.right(path)
        : IOE.left(new FileError('directory is not exist', path)),
    ),
  );

const removeDir = (dirPath: string): IOE.IOEither<Error, string> => {
  return IOE.tryCatch(() => {
    fs.rmdirSync(dirPath, { recursive: true });
    return dirPath;
  }, E.toError);
};

export const removeDirIfExist = (
  dirPath: string,
): IOE.IOEither<Error, string> =>
  pipe(checkDirectoryExist(dirPath), IOE.chain(removeDir));

export const createDir = (dirPath: string): IOE.IOEither<Error, string> =>
  IOE.tryCatch(() => {
    fs.mkdirSync(dirPath);
    return dirPath;
  }, E.toError);

export const createDirIfNotExist = (dirPath: string) => {
  const onDirectoryNotExist = (error: FileError): IOE.IOEither<Error, string> =>
    pipe(
      error,
      safeGet('path'),
      O.map(createDir),
      O.getOrElse(() => IOE.left(new Error('Failed to create directory'))),
    );

  const onDirectoryExist = (dirPath: string): IOE.IOEither<Error, string> =>
    IOE.of(dirPath);

  return pipe(
    IOE.of(dirPath),
    IOE.chain(checkDirectoryExist),
    IOE.fold(onDirectoryNotExist, onDirectoryExist),
  );
};
