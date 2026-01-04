import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/grid/size')({
	component: RouteComponent,
})

function RouteComponent() {
	return <div>Hello "/grid/size"!</div>
}
