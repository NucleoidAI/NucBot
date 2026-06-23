import { Outlet } from "react-router-dom";
import { storage } from "@nucleoidjs/webstorage";

function Container() {
  storage.set("{{projectName}}", "accessToken", "test");
  storage.set("{{projectName}}", "refreshToken", "test");

  return <Outlet />;
}

export default Container;
