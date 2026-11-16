import { createFileRoute } from "@tanstack/react-router";
import { CreateLinkForm } from "../components/CreateLinkForm";
import { LinksTable } from "../components/LinksTable";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>Make a long link short.</h1>
        <p>
          Paste any web address. You get a short link to share, and a count of
          every click on it.
        </p>
      </section>
      <CreateLinkForm />
      <LinksTable />
    </>
  );
}
