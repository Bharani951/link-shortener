import { Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { formatDate } from "../lib/format";

// 1. Features: which table abilities we switch on (only sorting here).
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
});

// 2. Columns: what each column shows. Defined once, outside the component.
const helper = createColumnHelper<typeof features, LinkItem>();

const columns = helper.columns([
    helper.accessor('code', {
    header: 'Short code',
    cell: (info) => (
      <Link to="/stats/$code" params={{ code: info.getValue() }}>
        {info.getValue()}
      </Link>
    ),
  }),
 
]);

const emptyRows: LinkItem[] = []; // stable fallback: a new [] every render would reset the table

export function LinksTable() {
  const { data, isPending, isError, error } = useQuery(linksQueryOptions);
  // Hooks must run on every render, so useTable comes before the early returns.
  const table = useTable({ features, columns, data: data ?? emptyRows });

  if (isPending) return <p>Loading links…</p>;
  if (isError)
    return <p className="error">Could not load links: {error.message}</p>;
  if (data.length === 0)
    return <p>No links yet. Create your first one above.</p>;

  return (
    <table className="links">
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th key={header.id}>
                {header.column.getCanSort() ? (
                  <button
                    type="button"
                    className="sort"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <table.FlexRender header={header} />
                    {sortArrow(header.column.getIsSorted())}
                  </button>
                ) : (
                  <table.FlexRender header={header} />
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getAllCells().map((cell) => (
              <td key={cell.id}>
                <table.FlexRender cell={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function sortArrow(direction: false | "asc" | "desc"): string {
  if (direction === "asc") return " ↑";
  if (direction === "desc") return " ↓";
  return "";
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
      className="danger"
      disabled={deleteLink.isPending}
      onClick={() => {
        if (
          window.confirm(`Delete ${code}? The short link will stop working.`)
        ) {
          deleteLink.mutate(code);
        }
      }}
    >
      {deleteLink.isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
