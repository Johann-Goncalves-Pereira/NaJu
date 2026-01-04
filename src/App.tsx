import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import NotFound from '@pages/NotFound'

import { routeTree } from './routeTree.gen'

// Create a new router instance and provide a defaultNotFoundComponent to avoid the
// generic TanStack Router warning and render a nicer not-found UI.
const router = createRouter({ routeTree, defaultNotFoundComponent: () => <NotFound /> })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

function App() {
	return <RouterProvider router={router} />
}

export default App
