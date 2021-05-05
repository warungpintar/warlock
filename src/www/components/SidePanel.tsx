import React from 'react';
import { Stack, StackProps } from '@chakra-ui/react';

const SidePanel: React.FC<StackProps> = (props) => {
  return (
    <Stack
      spacing="1rem"
      bg="gray.200"
      width="100%"
      height="100vh"
      overflowY="auto"
      {...props}
    />
  );
};

export default SidePanel;
