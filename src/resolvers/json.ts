import path from 'path';
import fs from 'fs';
import { flow } from 'fp-ts/function';

export const jsonResolver = flow((filePath: string) => {
  try {
    const jsonString = fs.readFileSync(
      path.join(process.cwd(), filePath),
      'utf-8',
    );
    return () => {
      return JSON.parse(jsonString);
    };
  } catch {
    return () => ({});
  }
});
