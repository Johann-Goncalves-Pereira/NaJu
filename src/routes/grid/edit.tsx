import { createFileRoute } from '@tanstack/react-router'

import { setPageTitle } from '@/utils/pageTitle'

import EditPage from '@pages/grid/Edit'

export const Route = createFileRoute('/grid/edit')({
	beforeLoad: () => {
		setPageTitle('Editor')
	},
	component: EditPage,
})
