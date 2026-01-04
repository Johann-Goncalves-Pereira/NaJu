import { createFileRoute } from '@tanstack/react-router'

import { setPageTitle } from '@/utils/pageTitle'

import ColorsPage from '@pages/grid/Colors'

export const Route = createFileRoute('/grid/colors')({
	beforeLoad: () => {
		setPageTitle('Cores')
	},
	component: ColorsPage,
})
