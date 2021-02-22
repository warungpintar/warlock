import { WarlockConfig as RestConfig } from '.';
import { YamlConfig as GraphqlConfig } from '@graphql-mesh/types';

export interface Config {
  rest?: RestConfig.Config;
  graphql?: GraphqlConfig.Config;
}
