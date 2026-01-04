import { createFileRoute } from '@tanstack/react-router'

import ExportPage from '@pages/grid/Export'

export const Route = createFileRoute('/grid/export')({
	component: ExportPage,
})
