import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

const MainPanel: React.FC<BoxProps> = (props) => {
  return (
    <Box p="3rem" width="100%" height="100vh" overflowY="auto" {...props} />
  );
};

export default MainPanel;
