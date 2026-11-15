import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stats/$code')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/stats/$code"!</div>
}
