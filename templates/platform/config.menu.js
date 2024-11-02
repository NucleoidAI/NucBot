import OrganizationButton from "./src/widgets/OrganizationButton/index.js";

const menuConfig = {
  topMenu: [],
  sideMenu: [
    {
      subheader: "Colleague",
      items: [
        {
          title: "Colleagues",
          icon: "solar:chart-line-duotone",
          path: "/colleagues",
        },
        {
          title: "Chat",
          icon: "ic:baseline-chat",
          path: "/chat",
        },
      ],
    },
  ],
  options: [
    {
      label: "Home",
      linkTo: "/",
    },
    {
      label: "Profile",
      linkTo: "/",
    },
    {
      label: "Settings",
      linkTo: "/",
    },
  ],
};

export default menuConfig;
