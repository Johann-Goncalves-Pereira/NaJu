import { createFileRoute } from '@tanstack/react-router'

import SizePage from '@pages/grid/Size'

export const Route = createFileRoute('/grid/size')({
	component: SizePage,
})
