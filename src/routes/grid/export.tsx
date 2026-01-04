import { createFileRoute } from '@tanstack/react-router'

import { setPageTitle } from '@/utils/pageTitle'

import ExportPage from '@pages/grid/Export'

export const Route = createFileRoute('/grid/export')({
	beforeLoad: () => {
		setPageTitle('Exportar')
	},
	component: ExportPage,
})
