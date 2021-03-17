import { buildDirPath, createDir, removeDirIfExist } from '../src/utils/fs';
import * as E from 'fp-ts/lib/Either';

describe('fs utils buildDirPath with basePath', () => {
  it('should match expectation', () => {
    const basePath = '/tmp';
    const expectation = '/tmp/test';

    const concatBasePathWith = buildDirPath(basePath);
    expect(concatBasePathWith('test')).toEqual(expectation);
  });

  it('should match expectation without with root as the base path', () => {
    const basePath = '';
    const expectation = '/test';

    const concatBasePathWith = buildDirPath(basePath);
    expect(concatBasePathWith('test')).toEqual(expectation);
  });
});

describe('fs utils createDir', () => {
  // prerequisite step
  const basePath = process.cwd();
  const concatBasePathWith = buildDirPath(basePath);
  const dir = concatBasePathWith('test');
  const removeTestDir = removeDirIfExist(dir);

  afterEach(() => {
    removeTestDir();
  });

  it('should match expectation directory is created', () => {
    const mkdirTest = createDir(dir);
    expect(mkdirTest()).toStrictEqual(E.right(dir));
  });

  it('should match error expectation directory exist', () => {
    const mkdirTest = createDir(dir);
    mkdirTest();

    expect(
      E.fold(
        (a: Error) => a.message,
        (a) => a,
      )(mkdirTest()),
    ).toContain('file already exists');
  });
});
