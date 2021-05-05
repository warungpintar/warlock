import { useQuery } from 'react-query';
import { getConfig } from '../service/config';

export const useConfigQuery = () => useQuery('config', getConfig);
