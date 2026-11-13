import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function BackendStatus() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["ping"],
    queryFn: api.ping,
    retry: false, // fail fast so we see problems immediately
  });

  if (isPending) return <p className="status">Checking backend…</p>;
  if (isError)
    return (
      <p className="status error">
        Backend unreachable. Is Spring Boot running?
      </p>
    );
  return <p className="status ok">Backend: {data.status}</p>;
}
