import faker from 'faker';
import R from 'ramda';

const resolver = (_: any, args: { props: string }) => {
  const fakerProps = args.props?.split('.') ?? [];
  const fakerFn = R.path<() => string>(fakerProps)(faker);
  return fakerFn?.();
};

export default resolver;
