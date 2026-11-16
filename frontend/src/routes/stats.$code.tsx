import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Link,
  createFileRoute,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { CopyButton } from "../components/CopyButton";
import { ApiError, linkQueryOptions } from "../lib/api";
import { formatDate } from "../lib/format";

export const Route = createFileRoute("/stats/$code")({
  // Runs BEFORE the page renders: fetch the data (or reuse the cache).
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(linkQueryOptions(params.code)),
  component: StatsPage,
  errorComponent: StatsError,
});

function StatsPage() {
  const { code } = Route.useParams();
  // The loader already filled the cache, so this never shows a loading state.
  const { data: link } = useSuspenseQuery(linkQueryOptions(code));

  return (
    <>
      <nav>
        {/* Icon only: aria-label is what screen readers say, title is the hover tooltip */}
        <Link
          to="/"
          className="back"
          aria-label="Back to all links"
          title="Back to all links"
        >
          <ArrowLeftIcon />
        </Link>
      </nav>

      <section className="stats-head">
        <h1 className="stats-code">{link.code}</h1>
        <p className="stats-dest">{link.longUrl}</p>
        <div className="stats-actions">
          <CopyButton
            text={link.shortUrl}
            label="Copy short link"
            className="btn btn-primary"
          />
          <a
            className="btn"
            href={link.shortUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open short link
          </a>
        </div>
      </section>

      <section className="stats-grid">
        <div className="clicks-card">
          <div>
            <p className="clicks-number" aria-live="polite">
              {link.clicks.toLocaleString()}
            </p>
            <p className="clicks-label">
              {link.clicks === 1 ? "click" : "clicks"} in total
            </p>
          </div>
          <p className="live">Updates every 5 seconds</p>
        </div>

        <div className="panel details-panel">
          <dl className="details">
            <dt>Short link</dt>
            <dd>
              <a
                href={link.shortUrl}
                target="_blank"
                rel="noreferrer"
                className="mono"
              >
                {link.shortUrl}
              </a>
            </dd>
            <dt>Destination</dt>
            <dd>{link.longUrl}</dd>
            <dt>Created</dt>
            <dd>{formatDate(link.createdAt)}</dd>
            <dt>Last clicked</dt>
            <dd>{formatDate(link.lastAccessedAt, "Not clicked yet")}</dd>
            <dt>Expires</dt>
            <dd>{formatDate(link.expiresAt, "Never")}</dd>
          </dl>
        </div>
      </section>
    </>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

function StatsError({ error }: ErrorComponentProps) {
  const notFound = error instanceof ApiError && error.status === 404;
  const message = error instanceof Error ? error.message : "Unknown error";
  return (
    <section className="error-page">
      <h1>{notFound ? "Link not found" : "Could not load stats"}</h1>
      <p>
        {notFound
          ? "This short link does not exist. It may have expired or been deleted."
          : `The backend returned an error: ${message}`}
      </p>
      <Link to="/" className="btn btn-primary">
        Go to your links
      </Link>
    </section>
  );
}
