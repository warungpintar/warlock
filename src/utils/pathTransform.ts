const isArray = (input: any) => Array.isArray(input);

const isObject = (input: any) =>
  input === Object(input) && !isArray(input) && input instanceof Date === false;

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
const getUnindexedArrayPath = (path: string): string[] => {
  // root.[1].bio.history.[0].childHistory.[0]
  // will match ["root.[1]", "history.[0]", "childHistory.[0]"]
  const match = path.match(/(\w|[0-9])+\.\[+?([0-9]+)+\]/g);

  // root.[1].bio.history.[0].childHistory.[0]
  // will match ["[1]", "[0]", "[0]"]
  const arrIdxPathReExp = /\[+?([0-9]+)+\]/g;

  if (match) {
    const result = match.map((selector) =>
      path.replace(selector, selector.replace(arrIdxPathReExp, '[]')),
    );
    result.push(path.replace(arrIdxPathReExp, '[]'));
    return result;
  }

  return [];
};

/**
 * take the element that match one of selectors / key
 * @param data
 * @param selectors
 */
const takeSomeObjectKey = (data: any, selectors: string[]) => {
  for (const selector of selectors) {
    if (data[selector] !== undefined) {
      return data[selector];
    }
  }

  return undefined;
};

type KeysToCamelConfigType = {
  defaultValue?: Record<string, unknown>;
  modifier?: Record<any, (val: unknown) => unknown>;
};

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
  config: KeysToCamelConfigType = {},
  path = 'root',
): any {
  const currentModifier = takeSomeObjectKey(config.modifier ?? {}, [
    path,
    ...getUnindexedArrayPath(path),
  ]);

  // root should be processed first
  if (currentModifier && path === 'root' && config?.modifier?.root) {
    delete config.modifier.root;
    return pathTransform(currentModifier(input), config, path);
  }

  if (Array.isArray(input)) {
    const mappedArray = input.map((item, idx) => {
      return pathTransform(item, config, path + `.[${idx}]`);
    });

    return currentModifier ? currentModifier(mappedArray) : mappedArray;
  }

  if (isObject(input)) {
    const mappedObj = Object.keys(input).reduce((prev, next) => {
      return {
        ...prev,
        [next]: pathTransform(input[next], config, path + `.${next}`),
      };
    }, {});

    return currentModifier ? currentModifier(mappedObj) : mappedObj;
  }

  return currentModifier ? currentModifier(input) : input;
}
