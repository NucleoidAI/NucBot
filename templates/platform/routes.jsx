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
            element:<>Hi</>,
          },
        ],
      },
      {
        layout: <FullScreenLayout />,
        pages: [{ path: "/chat", element: <>Hi</>}],
      },
    ],
  },
];

export default routes;
