import {
  DashboardLayout,
  FullScreenLayout,
} from "@nucleoidai/platform/layouts";

import Container from "./src/Container";
import FullScreen from "./src/pages/FullScreen";
import Index from "./src/pages/Index";

const routes = [
  {
    container: <Container />,
    childs: [
      {
        layout: <DashboardLayout />,
        pages: [
          { 
            path: "/platform",
            element:<Index />,
          },
        ],
      },
      {
        layout: <FullScreenLayout />,
        pages: [{ path: "/full-screen/page", element: <FullScreen/>}],
      },
    ],
  },
];

export default routes;
