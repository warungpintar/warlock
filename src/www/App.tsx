import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Stack } from '@chakra-ui/react';
import { Image, Box } from '@chakra-ui/react';

import SidePanel from './components/SidePanel';
import MainPanel from './components/MainPanel';

// pages
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Stack direction="row">
        <SidePanel w="300px">
          <Box w="200px" position="sticky" top="0" left="0" py="1rem" px="2rem">
            <Image src="/warlock.svg" />
          </Box>
          <Stack spacing="0">
            <Link to="/">
              <Box px="2rem" py="1rem" bg="gray.100">
                Home
              </Box>
            </Link>
          </Stack>
        </SidePanel>
        <MainPanel flex="1">
          <Switch>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </MainPanel>
      </Stack>
    </Router>
  );
}

export default App;
