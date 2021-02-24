import { flow } from 'fp-ts/function';
import faker from 'faker';

export const fakerResolver = (path: string) =>
  flow((data: any) => {
    if (!path) return data;

    const fakerFn = path
      ?.split(/\./g)
      .reduce((prev, next) => (prev[next] ? prev[next] : null), faker);

    return typeof fakerFn === 'function' ? fakerFn() : data;
  });
