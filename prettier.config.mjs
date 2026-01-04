/** @type {import('prettier').Config} */
const config = {
	// Formatting
	semi: false,
	singleQuote: true,
	trailingComma: 'all',
	useTabs: true,
	tabWidth: 2,
	printWidth: 100,
	endOfLine: 'lf',
	proseWrap: 'always',

	// JSX/HTML
	jsxSingleQuote: true,
	bracketSpacing: true,
	htmlWhitespaceSensitivity: 'css',

	// Quotes
	quoteProps: 'as-needed',
	arrowParens: 'avoid',

	// Pragma
	insertPragma: false,
	requirePragma: false,

	// Plugins
	plugins: [
		'@trivago/prettier-plugin-sort-imports',
		[
			'prettier-plugin-css-order',
			{
				syntax: 'postcss-scss',
				order: 'concentric-css',
			},
		],
		'prettier-plugin-tailwindcss',
	],

	// Import sort configuration
	importOrder: [
		'^react$', // React import first
		'<THIRD_PARTY_MODULES>', // Third-party modules
		'^@/(.*)$', // Root imports (@/*)
		'^@(?:/)?components/(.*)$', // Component imports
		'^@(?:/)?hooks/(.*)$', // Custom hooks imports
		'^@(?:/)?icons/(.*)$', // Icon imports
		'^@(?:/)?layout/(.*)$', // Layout component imports
		'^@(?:/)?utils/(.*)$', // Utility function imports
		'^@(?:/)?shared/(.*)$', // Shared module imports
		'^@(?:/)?pages/(.*)$', // Page component imports
		'^@/types/(.*)$', // Type definition imports
		'^[./]', // Relative imports (current or parent directory)
	],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
	importOrderParserPlugins: ['typescript', 'jsx'],
}

export default config
