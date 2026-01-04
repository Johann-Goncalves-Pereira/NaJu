import { createFileRoute } from '@tanstack/react-router'

import { setPageTitle } from '@/utils/pageTitle'

import ProjectsPage from '@pages/grid/Projects'

export const Route = createFileRoute('/grid/')({
	beforeLoad: () => {
		setPageTitle('Projetos')
	},
	component: ProjectsPage,
})
