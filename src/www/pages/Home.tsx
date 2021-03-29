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
  post: 'pink',
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
                  <Stack
                    direction="row"
                    align="center"
                    justify="space-between"
                    mb="-1rem"
                  >
                    <Text fontSize="sm" fontWeight="bold" py="1rem">
                      {handler.key}
                    </Text>
                    <Switch isChecked />
                  </Stack>
                  <Stack spacing="1rem">
                    {Object.keys(handler).map((verb) => (
                      <Stack key={verb} spacing="1rem">
                        {handler[verb as 'get']?.map?.((fieldHandler) => (
                          <Box
                            key={fieldHandler.field}
                            bg={`${verbColorsMap[verb]}.100`}
                            shadow="md"
                            py="0.5rem"
                            px="1rem"
                            rounded="md"
                          >
                            <Stack
                              direction="row"
                              align="center"
                              justify="space-between"
                            >
                              <Stack flex="1" direction="row" align="center">
                                <Badge>{verb}</Badge>
                                <Text
                                  fontSize="sm"
                                  fontWeight="bold"
                                  color={`${verbColorsMap[verb]}.900`}
                                >
                                  {fieldHandler.field}
                                </Text>
                              </Stack>
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
