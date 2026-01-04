import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/grid/colors')({
	component: RouteComponent,
})

function RouteComponent() {
	return <div>Hello "/grid/colors"!</div>
}
