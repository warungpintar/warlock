import { flow, pipe } from 'fp-ts/function';
import { right, left, fold, map, getOrElse, bimap } from 'fp-ts/Either';
import { reduce, mapWithIndex } from 'fp-ts/Array';

export const isNumber = (a: any) =>
  isNaN(Number(a)) ? left(a) : right(Number(a));

export const isArray = (a: any) => (Array.isArray(a) ? right(a) : left(a));

export const isString = (a: any) =>
  typeof a === 'string' ? right(a) : left(a);

export const isNotNil = (a: any) =>
  a !== null || a !== undefined ? right(a) : left(a);

const isObject = (input: any) =>
  input === Object(input) && !Array.isArray(input);

const isPath = (path: string) => {
  // root.[1].bio.history.[0].childHistory.[0]
  // will match ["root.[1]", "history.[0]", "childHistory.[0]"]
  const match = path.match(/(\w|[0-9])+\.\[+?([0-9]+)+\]/g);
  return match ? right(match) : left(path);
};

// root.[1].bio.history.[0].childHistory.[0]
// will match ["[1]", "[0]", "[0]"]
const arrIdxPathReExp = /\[+?([0-9]+)+\]/g;
const transformIdxPath = flow(
  reduce([] as string[], (prev, next: string) => {
    return [...prev, next.replace(arrIdxPathReExp, '[]')];
  }),
);

/**
 * return all possibility path
 * @param path
 * @returns - array of all path variants
 *
 * @example
 * if included array path like "root.items.[0].isMentee.[1].age"
 * also try to match the path without array index
 * "root.items.[].isMentee.[1].age"
 * "root.items.[0].isMentee.[].age";
 * "root.items.[].isMentee.[].age";
 */
const getUnindexedArrayPath = (path: string) =>
  pipe(
    path,
    isPath,
    fold(() => [], transformIdxPath),
    (arr) => [...arr, path.replace(arrIdxPathReExp, '[]')],
  );

/**
 * take the element that match one of selectors / key
 * @param data
 * @param selectors
 */
const takeSomeObjectKey = (selectors: string[]) => (
  data: Record<string, (a: any) => any>,
) => {
  for (const selector of selectors) {
    if (typeof data[selector] === 'function') {
      return right(data[selector]);
    }
  }

  return left(undefined);
};

type KeysToCamelConfigType = {
  defaultValue?: Record<string, unknown>;
  modifier?: Record<any, (val: unknown) => unknown>;
};

const createModifier = (modifier) => (path) =>
  pipe(modifier, takeSomeObjectKey([path, ...getUnindexedArrayPath(path)]));

/**
 *
 * @param input - array | object
 * @param config - specify defaultValue or modifier
 * @param path - internal
 *
 * @example
 * const data = {student: {age: 20}}
 * keysToCamel(data, {
 *  modifier: {
 *    'root.student.age': val => val > 20 ? 'kamu tua!' : 'masih muda!'
 *  }
 * });
 *
 * //> result {student: {age: 'masih muda!'}}
 */
export function pathTransform(
  input: any,
  config: KeysToCamelConfigType | null = null,
  path = 'root',
): any {
  const modifier = config?.modifier ?? {};

  // if included array path like "root.items.[0].isMentee.[1].age"
  // also try to match the path without array index
  // "root.items.[].isMentee.[1].age"
  // "root.items.[0].isMentee.[].age";
  // "root.items.[].isMentee.[].age";
  const currentModifier = flow(createModifier(modifier));
  const flowModifier = (p: string) => (val: any) =>
    pipe(
      p,
      currentModifier,
      bimap(
        () => val,
        (f) => f(val),
      ),
      getOrElse((a) => a),
    );
  const rootModifier = flowModifier(path);

  if (isObject(input)) {
    // TODO: refactor using reduce
    const n = {};
    Object.keys(input).forEach((k) => {
      // new path
      const newPath = path + '.' + k;
      const newPathModifier = flowModifier(newPath);

      const keyVal = pathTransform(input[k], config, newPath);
      const matchedValue = keyVal;
      n[k] = newPathModifier(matchedValue);
    });

    return rootModifier(n);
  }

  const arrayMapper = mapWithIndex((idx, item) =>
    pathTransform(item, config, path + `.[${idx}]`),
  );

  return pipe(
    input,
    isArray,
    map(arrayMapper),
    map(rootModifier),
    getOrElse(rootModifier),
  );
}
