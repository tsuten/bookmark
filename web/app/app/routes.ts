import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  layout("routes/_authenticated.tsx", [
    layout("routes/_bookmarks.tsx", [
      index("routes/home.tsx"),
      route("archived", "routes/archived.tsx"),
      route("uncategorized", "routes/uncategorized.tsx"),
      route(":tag", "routes/tagged.tsx"),
    ]),
    route("settings", "routes/settings.tsx"),
  ]),
] satisfies RouteConfig;
