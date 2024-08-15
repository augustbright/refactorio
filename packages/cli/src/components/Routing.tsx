import React from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router';

import { Application } from './Application.js';

const memoryRouter = createMemoryRouter([
  {
    path: '/',
    element: <Application />
  }
]);

export const Routing = () => {
  return <RouterProvider router={memoryRouter} />;
};
