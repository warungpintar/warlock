import * as R from 'ramda';

export const groupListBy = R.curry((propName: string, arr: any[]) => {
  return R.groupBy(R.prop(propName), arr);
});
