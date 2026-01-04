import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import App from './App'
import './main.css'
import accent from './utils/accent'

const rootElement = document.getElementById('root')
if (!rootElement) {
	throw new Error('Root element not found')
}

// Initialize accent service early so CSS variables are set before React paints
accent.init()
accent.start()

createRoot(rootElement).render(
	<StrictMode>
		<App />
	</StrictMode>,
)
