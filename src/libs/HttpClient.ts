// @ts-nocheck
// @TODO {httpClient}
import axios from 'axios';
import R from 'ramda';
import defaultResolver from '../defaultResolvers';

const createHttpClient = (config, opts, ctx) => {
  const httpClient = axios.create();
  const { rest } = config;

  const hasMockSetup = R.propEq('source', opts.baseURL);
  const mocker = R.find(hasMockSetup)(rest);

  const handleOkResponse = (response) => {
    const transformResolvers = R.path([
      'transforms',
      opts.url,
      ctx.request.method.toLowerCase(),
    ])(mocker);

    if (!transformResolvers) {
      return Promise.resolve(response);
    }

    // @TODO: RESOLVER MAPPING LOGIC HERE!
    // if the path has custom resolver path on the yaml config, then execute the resolver fn
    // if it's predefined resolver (such as faker and json) then execute Warlock's default resolver
    // replace line 41 - 52
    //
    // transformResolvers.forEach(resolver => {
    //   const paths = R.compose(
    //     R.drop(1),
    //     log,
    //     R.split('.'),
    //     log,
    //     R.prop('field')
    //   )(resolver)
    // })

    return Promise.resolve({
      ...response,
      data: {
        ...response.data,
        results: response.data.results.map((result) => ({
          ...result,
          name: defaultResolver.faker(result, { props: 'name.firstName' }, ctx),
        })),
      },
    });
  };

  const handleErrorResponse = (error) => {
    return Promise.reject(error);
  };

  httpClient.interceptors.response.use(handleOkResponse, handleErrorResponse);

  return httpClient;
};

export default {
  createHttpClient,
};
