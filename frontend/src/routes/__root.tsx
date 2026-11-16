import type { QueryClient } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { BackendStatus } from "../components/BackendStatus";
import "../styles.css";

// What every route receives in `context` (set in main.tsx).
type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});

function RootLayout() {
  return (
    <>
      <header className="site-header">
        <div className="shell">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true" />
            Link Shortener
          </Link>
          <BackendStatus />
        </div>
      </header>
      <main className="shell page">
        <Outlet /> {/* the current page renders here */}
      </main>
    </>
  );
}

function NotFoundPage() {
  return (
    <section className="error-page">
      <h1>Page not found</h1>
      <p>
        There is nothing at this address. Check the URL, or go back to your
        links.
      </p>
      <Link to="/" className="btn btn-primary">
        Go to your links
      </Link>
    </section>
  );
}
