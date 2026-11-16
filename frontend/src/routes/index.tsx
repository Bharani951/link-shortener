import { createFileRoute } from "@tanstack/react-router";
import { BackendStatus } from "../components/BackendStatus";
import { CreateLinkForm } from "../components/CreateLinkForm";
import { LinksTable } from "../components/LinksTable";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <h1>Shorten a link</h1>
      <BackendStatus />
      <CreateLinkForm />
      <h2>Your links</h2>
      <LinksTable />
    </>
  );
}
