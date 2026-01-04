import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
	const isProduction = mode === 'production'
	const compiler = [['babel-plugin-react-compiler', { target: '19' }]]

	return {
		define: {
			'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
			__DEV__: !isProduction,
		},
		server: {
			hmr: true, // Always enable HMR for development
		},
		plugins: [
			tailwindcss(),
			tanstackRouter({ target: 'react', autoCodeSplitting: true }),
			react({
				jsxRuntime: 'automatic',
				babel: { plugins: isProduction ? compiler : [] },
			}),
		],
		resolve: {
			alias: {
				// Path aliases for better imports throughout the application
				// Instead of relative imports like '../../../components', you can use '@components/...'
				'@components': path.resolve(__dirname, './src/components'), // Component directory alias
				'@hooks': path.resolve(__dirname, './src/hooks'), // Custom hooks directory alias
				'@layout': path.resolve(__dirname, './src/layout'), // Layout components directory alias
				'@utils': path.resolve(__dirname, './src/utils'), // Utility functions directory alias
				'@pages': path.resolve(__dirname, './src/pages'), // Page components directory alias
				'@shared': path.resolve(__dirname, './src/shared'), // Shared resources directory alias
				'@': path.resolve(__dirname, './src'), // Root source directory alias
			},
		},
		build: {
			rollupOptions: {
				output: {
					manualChunks(id: string) {
						if (id.includes('node_modules')) {
							if (id.includes('react') || id.includes('react-dom')) return 'vendor-react'
							if (id.includes('@tanstack')) return 'vendor-tanstack'
							if (id.includes('lucide-react')) return 'vendor-lucide'
							// group large libs together
							return 'vendor'
						}
						// Create page-specific chunks for routes under src/pages
						if (id.includes('/src/pages/')) {
							const parts = id.split('/src/pages/')
							if (parts[1]) {
								const name = parts[1].split(/\\|\//)[0]

								return `page-${name}`
							}
						}
					},
				},
			},
			// Keep chunk size warning reasonable for this repo
			chunkSizeWarningLimit: 600,
		},
	}
})
