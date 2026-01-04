import { createFileRoute } from '@tanstack/react-router'

import Love from '@pages/Main/Love'

export const Route = createFileRoute('/love')({
	component: Love,
})
