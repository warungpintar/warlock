import R from 'ramda';
import { groupListBy } from './list';
// @TODO define config type
export const normalizedConfigByHandler = (config: any) =>
  R.compose(groupListBy('handler'), R.prop('sources'))(config);
