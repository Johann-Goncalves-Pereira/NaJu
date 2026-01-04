import { createFileRoute } from '@tanstack/react-router'

import EditPage from '@pages/grid/Edit'

export const Route = createFileRoute('/grid/edit')({
	component: EditPage,
})
