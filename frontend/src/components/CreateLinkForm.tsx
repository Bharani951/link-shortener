import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ApiError, api, linkKeys, type LinkItem } from "../lib/api";
import { prettyUrl } from "../lib/format";

// Client-side check: fast feedback for the user. The server checks again (never trust the client).
function validateUrl(value: string): string | undefined {
  if (!value.trim()) return "Paste a URL to shorten";
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "Only http and https links are allowed";
    }
  } catch {
    return "That is not a valid URL";
  }
  return undefined;
}

function errorText(error: Error): string {
  if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
    return Object.values(error.fieldErrors).join(". ");
  }
  return error.message;
}

export function CreateLinkForm() {
  const queryClient = useQueryClient();

  // A mutation = a request that CHANGES data on the server.
  const createLink = useMutation({
    mutationFn: api.createLink,
    // The list on screen is now out of date: mark it stale so it refetches.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: linkKeys.all }),
  });

  const form = useForm({
    defaultValues: { url: "", expiresInDays: "" },
    onSubmit: async ({ value, formApi }) => {
      try {
        await createLink.mutateAsync({
          url: value.url.trim(),
          expiresInDays: value.expiresInDays
            ? Number(value.expiresInDays)
            : null,
        });
        formApi.reset();
      } catch {
        // the error is shown below from createLink.error
      }
    },
  });

  return (
    <section className="create" aria-label="Shorten a link">
      <form
        className="create-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault(); // stop the browser's full-page form submit
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="url"
          validators={{ onChange: ({ value }) => validateUrl(value) }}
        >
          {(field) => {
            const showError =
              field.state.meta.isTouched && field.state.meta.errors.length > 0;
            return (
              <div className="field">
                <label className="field-label" htmlFor="url">
                  Long URL
                </label>
                <input
                  id="url"
                  className="input"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="https://example.com/a/very/long/path"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={showError}
                  aria-describedby={showError ? "url-error" : undefined}
                />
                {showError && (
                  <small id="url-error" className="field-error">
                    {field.state.meta.errors.join(", ")}
                  </small>
                )}
              </div>
            );
          }}
        </form.Field>

        <form.Field name="expiresInDays">
          {(field) => (
            <div className="field">
              <label className="field-label" htmlFor="expires">
                Expires
              </label>
              <select
                id="expires"
                className="select"
                name={field.name}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              >
                <option value="">Never</option>
                <option value="1">In 1 day</option>
                <option value="7">In 7 days</option>
                <option value="30">In 30 days</option>
              </select>
            </div>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Shortening…" : "Shorten"}
            </button>
          )}
        </form.Subscribe>
      </form>

      {createLink.isError && (
        <p className="alert" role="alert">
          {errorText(createLink.error)}
        </p>
      )}

      {/* key = code: a new link remounts the stub, so its entrance animation plays again */}
      {createLink.data && (
        <ResultStub key={createLink.data.code} link={createLink.data} />
      )}
    </section>
  );
}

/** The "ticket stub" that appears after a link is created. */
function ResultStub({ link }: { link: LinkItem }) {
  const [copied, setCopied] = useState(false);
  const base = link.shortUrl.slice(0, -link.code.length); // "http://localhost:8080/r/"

  async function copy() {
    await navigator.clipboard.writeText(link.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="stub" role="status">
      <div className="stub-main">
        <span className="stub-label">Your short link is ready</span>
        <a
          className="stub-link"
          href={link.shortUrl}
          target="_blank"
          rel="noreferrer"
        >
          <span className="base">{prettyUrl(base)}</span>
          <span className="code">{link.code}</span>
        </a>
        <span className="stub-dest" title={link.longUrl}>
          Opens {prettyUrl(link.longUrl)}
        </span>
      </div>
      <div className="stub-actions">
        <button type="button" className="btn btn-dark" onClick={copy}>
          {copied ? "Copied" : "Copy link"}
        </button>
        <Link to="/stats/$code" params={{ code: link.code }} className="btn">
          View stats
        </Link>
      </div>
    </div>
  );
}
