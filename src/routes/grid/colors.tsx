import { createFileRoute } from '@tanstack/react-router'

import ColorsPage from '@pages/grid/Colors'

export const Route = createFileRoute('/grid/colors')({
	component: ColorsPage,
})
