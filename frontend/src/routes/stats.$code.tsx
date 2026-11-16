import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Link,
  createFileRoute,
  type ErrorComponentProps,
} from "@tanstack/react-router";
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
      <p>
        <Link to="/">← All links</Link>
      </p>
      <h1>Stats for {link.code}</h1>
      <p className="big-number">{link.clicks}</p>
      <p className="muted">total clicks · refreshes every 5 seconds</p>
      <dl className="details">
        <dt>Short URL</dt>
        <dd>
          <a href={link.shortUrl} target="_blank" rel="noreferrer">
            {link.shortUrl}
          </a>
        </dd>
        <dt>Destination</dt>
        <dd className="truncate">{link.longUrl}</dd>
        <dt>Created</dt>
        <dd>{formatDate(link.createdAt)}</dd>
        <dt>Last clicked</dt>
        <dd>{formatDate(link.lastAccessedAt, "Never")}</dd>
      </dl>
    </>
  );
}

function StatsError({ error }: ErrorComponentProps) {
  const notFound = error instanceof ApiError && error.status === 404;
  const message = error instanceof Error ? error.message : "Unknown error";
  return (
    <>
      <p>
        <Link to="/">← All links</Link>
      </p>
      <p className="error">
        {notFound
          ? "This link does not exist or has expired."
          : `Something went wrong: ${message}`}
      </p>
    </>
  );
}
