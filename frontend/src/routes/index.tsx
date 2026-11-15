import { createFileRoute } from "@tanstack/react-router";
import { BackendStatus } from "../components/BackendStatus";
import { CreateLinkForm } from "../components/CreateLinkForm";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <h1>Shorten a link</h1>
      <BackendStatus />
      <CreateLinkForm />
    </>
  );
}
