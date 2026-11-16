import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

/** The small pill in the header that says whether Spring Boot is reachable. */
export function BackendStatus() {
  const { isPending, isError } = useQuery({
    queryKey: ["ping"],
    queryFn: api.ping,
    retry: false, // fail fast so we see problems immediately
    refetchInterval: 15_000, // re-check every 15 s, so the pill recovers by itself
  });

  if (isPending) return <span className="status">Checking backend…</span>;
  if (isError) {
    return (
      <span className="status down" role="status">
        Backend offline
      </span>
    );
  }
  return <span className="status ok">Backend online</span>;
}
