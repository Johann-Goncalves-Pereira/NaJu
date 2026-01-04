import { createFileRoute } from '@tanstack/react-router'

import ProjectsPage from '@pages/grid/Projects'

export const Route = createFileRoute('/grid/')({
	component: ProjectsPage,
})
