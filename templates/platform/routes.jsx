import AddTeam from "./src/pages/addTeam";
import Chat from "./src/pages/chat";
import Colleague from "./src/pages/colleague";
import Colleagues from "./src/pages/colleagues";
import Container from "./src/Container";
import Dashboard from "./src/pages/dashboard";
import Settings from "./src/pages/settings";

import {
  DashboardLayout,
  FullScreenLayout,
} from "@nucleoidai/platform/layouts";

const routes = [
  {
    container: <Container />,
    childs: [
      {
        layout: <DashboardLayout />,
        pages: [
          {
            path: "/",
            element: <Dashboard />,
          },
          {
            path: `/colleagues`,
            element: <Colleagues />,
          },
          { path: "/colleagues/:colleagueId", element: <Colleague /> },
          { path: "/settings", element: <Settings /> },
          { path: "/teams/add", element: <AddTeam /> },
        ],
      },
      {
        layout: <FullScreenLayout />,
        pages: [{ path: "/chat", element: <Chat /> }],
      },
    ],
  },
];

export default routes;
