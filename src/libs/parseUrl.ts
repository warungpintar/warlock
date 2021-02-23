import * as O from 'fp-ts/Option';

export const parseUrl = (maybeUrl: string) => {
  try {
    const url = new URL(maybeUrl);
    return O.some(url);
  } catch {
    return O.none;
  }
};
