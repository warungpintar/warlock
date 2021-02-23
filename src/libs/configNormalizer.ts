import R from 'ramda';
import { groupListBy } from './list';

export const configNormlizer = (config: any) =>
  R.compose(groupListBy('handler'), R.prop('sources'))(config);
