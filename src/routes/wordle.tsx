import { createFileRoute } from '@tanstack/react-router'

import Wordle from '@pages/Main/Wordle'

export const Route = createFileRoute('/wordle')({
	component: Wordle,
})

export default Route
