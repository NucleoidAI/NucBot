const menuConfig = {
  topMenu: [],
  sideMenu: [
    {
      subheader: "Colleague",
      items: [
        {
          title: "Index",
          icon: "solar:chart-line-duotone",
          path: "/platform",
        },
        {
          title: "Full Screen",
          icon: "solar:full-screen-circle-bold-duotone",
          path: "/full-screen/page",
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
