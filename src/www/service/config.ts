import axios from 'axios';
import { Config } from '../../types';

export const getConfig = () => axios.get<Config>('/api/config');
