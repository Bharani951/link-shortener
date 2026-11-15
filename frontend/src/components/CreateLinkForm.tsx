import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, api, linkKeys } from "../lib/api";

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
    // Any cached list of links is now out of date: mark it stale so it refetches (used from slice 3).
    onSuccess: () => queryClient.invalidateQueries({ queryKey: linkKeys.all }),
  });

  const form = useForm({
    defaultValues: { url: "" },
    onSubmit: async ({ value, formApi }) => {
      try {
        await createLink.mutateAsync({ url: value.url.trim() });
        formApi.reset();
      } catch {
        // the error is shown below from createLink.error
      }
    },
  });

  const created = createLink.data;

  return (
    <section className="card">
      <form
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
          {(field) => (
            <label>
              Long URL
              <input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="https://example.com/a/very/long/path"
                inputMode="url"
                autoComplete="off"
              />
              {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 && (
                  <small className="error">
                    {field.state.meta.errors.join(", ")}
                  </small>
                )}
            </label>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
        >
          {([canSubmit, isSubmitting]) => (
            <button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Shortening…" : "Shorten"}
            </button>
          )}
        </form.Subscribe>
      </form>

      {createLink.isError && (
        <p className="error">{errorText(createLink.error)}</p>
      )}

      {created && (
        <p className="result">
          Your short link:{" "}
          <a href={created.shortUrl} target="_blank" rel="noreferrer">
            {created.shortUrl}
          </a>{" "}
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(created.shortUrl)}
          >
            Copy
          </button>
        </p>
      )}
    </section>
  );
}
