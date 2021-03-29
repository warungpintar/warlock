import React from 'react';
import { Box, Stack, Text, Heading, Badge, Switch } from '@chakra-ui/react';
import * as F from 'fp-ts/function';

import { WarlockConfig } from '../../types';
import { useConfigQuery } from '../hooks/config';

export const flattenPathHandler = (pathHandler: WarlockConfig.Transform) => {
  return F.flow((data: WarlockConfig.Transform) => {
    return Object.keys(data).map((key) => ({
      key,
      ...data[key],
    }));
  })(pathHandler);
};

const verbColorsMap = {
  get: 'orange',
  post: 'yellow',
  patch: 'teal',
  delete: 'blue',
  put: 'cyan',
};

const Home = () => {
  const { data } = useConfigQuery();

  const sources = data?.data?.rest?.sources ?? [];

  return (
    <Stack spacing="2rem">
      <Heading>Rest Transforms</Heading>
      <Stack spacing="2rem">
        {sources.map((source) => (
          <Stack key={source.origin}>
            <Stack spacing="1px">
              <Heading size="sm">{source.name}</Heading>
              <Text fontSize="sm">{source.origin}</Text>
            </Stack>
            <Stack px="1rem" bg="gray.100" rounded="md" pb="1rem" spacing="1px">
              {flattenPathHandler(source.transforms as any)?.map((handler) => (
                <Stack key={handler.key} spacing="2px" p="1rem">
                  <Stack direction="row" align="center" justify="space-between">
                    <Text fontSize="sm" fontWeight="bold" py="1rem">
                      {handler.key}
                    </Text>
                    <Switch isChecked />
                  </Stack>
                  {Object.keys(handler).map((verb) => (
                    <Stack key={verb}>
                      {handler[verb as 'get']?.map?.((fieldHandler) => (
                        <Box
                          key={fieldHandler.field}
                          bg="green.300"
                          py="0.5rem"
                          px="1rem"
                          rounded="md"
                        >
                          <Badge colorScheme={verbColorsMap[verb]}>
                            {verb}
                          </Badge>
                          <Stack
                            direction="row"
                            align="center"
                            justify="space-between"
                          >
                            <Text fontSize="sm">{fieldHandler.field}</Text>
                            <Switch
                              isChecked
                              colorScheme={verbColorsMap[verb]}
                            />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ))}
                </Stack>
              ))}
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default Home;
