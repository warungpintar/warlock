import fs from 'fs';

const cache = {};
export const fileWatcher = (cb: () => void) => (pathFile: fs.PathLike) => {
  if (cache[pathFile as string]) {
    fs.unwatchFile(pathFile);
  }

  fs.watchFile(pathFile, cb);

  cache[pathFile as string] = true;
};
