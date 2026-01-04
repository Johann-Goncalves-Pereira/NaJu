import { createFileRoute } from '@tanstack/react-router'

import { setPageTitle } from '@/utils/pageTitle'

import SizePage from '@pages/grid/Size'

export const Route = createFileRoute('/grid/size')({
	beforeLoad: () => {
		setPageTitle('Tamanho')
	},
	component: SizePage,
})
