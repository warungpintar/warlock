import { pipe } from 'fp-ts/function';
import { sort } from 'fp-ts/Array';
import { ordString } from 'fp-ts/Ord';

const splitStringToArray = (separator) => (str) => str.split(separator);

const join = (separator) => (arr) => arr.join(separator);

const concat = (any) => (arr) => arr.concat(any);

const constructURL = (origin) => (searchParams) => {
  return new URL(pipe(origin, concat('?'), concat(searchParams)));
};

const sortSearchParams = (searchParams: URLSearchParams) => {
  return new URLSearchParams(
    pipe(
      searchParams.toString(),
      splitStringToArray('&'),
      sort(ordString),
      join('&'),
    ),
  );
};

export const sortURLSearchParams = (url: URL) => {
  const searchParams = new URLSearchParams(url.searchParams.toString());

  return pipe(
    sortSearchParams(searchParams),
    constructURL(pipe(url.origin, concat(url.pathname))),
  );
};
