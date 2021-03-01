import * as O from 'fp-ts/Option';

export const safeGet = (propName) => (obj) => O.fromNullable(obj[propName]);
