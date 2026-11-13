import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";

// One cache for all server data in the app.
const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient }, // every route's loader can now use the query cache
  defaultPreload: "intent", // start loading a page when the user hovers its link
  defaultPreloadStaleTime: 0, // let TanStack Query decide what is fresh, not the router
  scrollRestoration: true,
});

// Teaches TypeScript about our routes, so <Link to="..."> is type-checked.
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
