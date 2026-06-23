import {
  {{layout1}},
  {{layout2}},
} from "@nucleoidai/platform/layouts";

import Container from "./src/Container";
import FullScreen from "./src/pages/FullScreen";
import Index from "./src/pages/Index";

const routes = [
  {
    container: <Container />,
    childs: [
      {
        layout: <{{layout1}}  />,
        pages: [
          { 
            path: "/",
            element:<Index />,
          },
        ],
      },
      {
        layout: <{{layout2}} />,
        pages: [{ path: "/full-screen/page", element: <FullScreen/>}],
      },
    ],
  },
];

export default routes;
