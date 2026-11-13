import type { QueryClient } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import "../styles.css";

// What every route receives in `context` (set in main.tsx).
type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => <p>Page not found.</p>,
});

function RootLayout() {
  return (
    <main>
      <header className="site-header">
        <Link to="/" className="brand">
          Link Shortener
        </Link>
      </header>
      <Outlet /> {/* the current page renders here */}
    </main>
  );
}
