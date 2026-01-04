import { createRootRoute } from '@tanstack/react-router'

import { setPageTitle } from '@/utils/pageTitle'

import RootLayout from '@layout/Root'

export const Route = createRootRoute({
	beforeLoad: () => {
		setPageTitle()
	},
	component: () => <RootLayout />,
})
