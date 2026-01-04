import { createFileRoute } from '@tanstack/react-router'

import { setPageTitle } from '@/utils/pageTitle'

import Home from '@pages/Home'

export const Route = createFileRoute('/')({
	beforeLoad: () => {
		setPageTitle('Início')
	},
	component: Home,
})
