import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { api, linkKeys, linksQueryOptions, type LinkItem } from "../lib/api";
import {
  formatDate,
  formatDay,
  hoursLeft,
  isWithinADay,
  prettyUrl,
} from "../lib/format";

// 1. Features: which table abilities we switch on (only sorting here).
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
});

// 2. Columns: what each column shows. Defined once, outside the component.
const helper = createColumnHelper<typeof features, LinkItem>();

const columns = helper.columns([
  helper.accessor("code", {
    header: "Short link",
    cell: (info) => (
      <Link
        to="/stats/$code"
        params={{ code: info.getValue() }}
        title="View stats"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  helper.accessor("longUrl", {
    header: "Destination",
    cell: (info) => (
      <span className="truncate" title={info.getValue()}>
        {prettyUrl(info.getValue())}
      </span>
    ),
  }),
  helper.accessor("clicks", { header: "Clicks" }),
  helper.accessor("createdAt", {
    header: "Created",
    cell: (info) => formatDay(info.getValue()),
  }),
  helper.accessor("expiresAt", {
    header: "Expires",
    cell: (info) => <ExpiryCell iso={info.getValue()} />,
  }),
  helper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <DeleteButton code={row.original.code} />,
  }),
]);

const emptyRows: LinkItem[] = []; // stable fallback: a new [] every render would reset the table

export function LinksTable() {
  const { data, isPending, isError, error } = useQuery(linksQueryOptions);
  // Hooks must run on every render, so useTable comes before the early returns.
  const table = useTable({ features, columns, data: data ?? emptyRows });

  return (
    <section className="panel links-panel" aria-labelledby="links-title">
      <div className="panel-head">
        <h2 id="links-title">Your links</h2>
        {data && data.length > 0 && (
          <span className="count">{data.length}</span>
        )}
      </div>

      {isPending ? (
        <div aria-label="Loading links">
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      ) : isError ? (
        <div className="panel-body">
          <p className="alert" role="alert">
            Could not load links: {error.message}
          </p>
        </div>
      ) : data.length === 0 ? (
        <div className="empty">
          <h3>No links yet</h3>
          <p className="muted">
            Shorten your first link above and it will show up here.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="links">
            <thead>
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        className={`col-${header.column.id}`}
                        aria-sort={
                          sorted === "asc"
                            ? "ascending"
                            : sorted === "desc"
                              ? "descending"
                              : undefined
                        }
                      >
                        {header.column.getCanSort() ? (
                          <button
                            type="button"
                            className="sort"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <table.FlexRender header={header} />
                            <span className="sort-arrow" aria-hidden="true">
                              {sortArrow(sorted)}
                            </span>
                          </button>
                        ) : (
                          <table.FlexRender header={header} />
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`col-${cell.column.id}`}
                      data-label={labelOf(cell.column.columnDef.header)}
                    >
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// The column's header text ("Created"), used as a label when rows turn into cards on narrow screens.
function labelOf(header: unknown): string | undefined {
  return typeof header === "string" ? header : undefined;
}

function sortArrow(direction: false | "asc" | "desc"): string {
  if (direction === "asc") return "↑";
  if (direction === "desc") return "↓";
  return "";
}

function ExpiryCell({ iso }: { iso: string | null }) {
  if (!iso) return <span>Never</span>;
  // Less than a day left: show how many hours, highlighted. The exact time is in the tooltip.
  if (isWithinADay(iso))
    return (
      <span className="badge" title={formatDate(iso)}>
        {hoursLeft(iso)}
      </span>
    );
  return <span title={formatDate(iso)}>{formatDay(iso)}</span>;
}

function DeleteButton({ code }: { code: string }) {
  const queryClient = useQueryClient();
  const deleteLink = useMutation({
    mutationFn: api.deleteLink,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: linkKeys.all }),
  });

  return (
    <button
      type="button"
      className="icon-btn icon-btn-danger"
      disabled={deleteLink.isPending}
      aria-label={`Delete ${code}`} // what screen readers say, since there is no visible text
      title="Delete link" // tooltip on hover
      onClick={() => {
        if (
          window.confirm(`Delete ${code}? The short link will stop working.`)
        ) {
          deleteLink.mutate(code);
        }
      }}
    >
      <TrashIcon />
    </button>
  );
}

/** A trash can drawn with SVG lines. `currentColor` = it takes the button's text colour. */
function TrashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}
