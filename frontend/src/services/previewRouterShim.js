export const previewRouterShimSource = `export * from "react-router-dom";
import { MemoryRouter as RuntimeMemoryRouter, createMemoryRouter as runtimeCreateMemoryRouter, Link as RuntimeLink, NavLink as RuntimeNavLink, useLocation, useNavigate } from "react-router-dom";
import * as React from "react";
function DevPilotRouteBridge({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent("devpilot:generated-navigation", { detail: { pathname: location.pathname, search: location.search, hash: location.hash } }));
  }, [location.pathname, location.search, location.hash]);
  React.useEffect(() => {
    const handleNavigation = (event) => {
      const route = event.detail;
      if (!route || typeof route.pathname !== "string" || !route.pathname.startsWith("/") || route.pathname.startsWith("//")) return;
      navigate(route.pathname + (route.search || "") + (route.hash || ""));
    };
    window.addEventListener("devpilot:route-navigate", handleNavigation);
    return () => window.removeEventListener("devpilot:route-navigate", handleNavigation);
  }, [navigate]);
  return React.createElement(React.Fragment, null, children);
}
function RuntimeRouter({ children, ...props }) {
  const route = window.__DEVPILOT_INITIAL_ROUTE__ || "/";
  return React.createElement(RuntimeMemoryRouter, { ...props, initialEntries: [route], initialIndex: 0 }, React.createElement(DevPilotRouteBridge, null, children));
}
export const BrowserRouter = RuntimeRouter;
export const HashRouter = RuntimeRouter;
export const MemoryRouter = RuntimeRouter;
export const Link = (props) => React.createElement(RuntimeLink, { ...props, "data-devpilot-router-link": "" });
export const NavLink = (props) => React.createElement(RuntimeNavLink, { ...props, "data-devpilot-router-link": "" });
export function createBrowserRouter(routes, options = {}) {
  const route = window.__DEVPILOT_INITIAL_ROUTE__ || "/";
  const router = runtimeCreateMemoryRouter(routes, { ...options, initialEntries: [route], initialIndex: 0 });
  router.subscribe((state) => window.dispatchEvent(new CustomEvent("devpilot:generated-navigation", { detail: { pathname: state.location.pathname, search: state.location.search, hash: state.location.hash } })));
  window.dispatchEvent(new CustomEvent("devpilot:generated-navigation", { detail: { pathname: router.state.location.pathname, search: router.state.location.search, hash: router.state.location.hash } }));
  window.addEventListener("devpilot:route-navigate", (event) => {
    const next = event.detail;
    if (next && typeof next.pathname === "string" && next.pathname.startsWith("/") && !next.pathname.startsWith("//")) router.navigate(next.pathname + (next.search || "") + (next.hash || ""));
  });
  return router;
}
export const createHashRouter = createBrowserRouter;`
