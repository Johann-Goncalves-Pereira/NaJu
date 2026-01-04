import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactCompiler from 'eslint-plugin-react-compiler'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import path from 'path'
import tseslint from 'typescript-eslint'

// eslint-disable-next-line no-undef
const __dirname = new URL('.', import.meta.url).pathname

/** @type {import('eslint').Config} */
export default [
	{ ignores: ['dist'] }, // 📦 Ignore the 'dist' folder, we don't care about bundled stuff here!
	js.configs.recommended, // ✅ Use ESLint's recommended rules - good starting point!
	...tseslint.configs.recommended, // 📝 Add TypeScript's recommended rules - because we love types!
	{
		files: ['**/*.{ts,tsx}'], // 🔍 Apply these rules to all TypeScript and TSX files
		languageOptions: {
			ecmaVersion: 2020, // ECMA Version
			globals: {
				...globals.browser, // 🌐 We're in a browser environment!
			},
			parser: tseslint.parser,
			parserOptions: {
				project: [
					path.resolve(__dirname, './tsconfig.app.json'),
					path.resolve(__dirname, './tsconfig.node.json'),
				],
				tsconfigRootDir: __dirname,
			},
		},
		plugins: {
			react: react, // ⚛️ Register the React plugin
			'react-hooks': reactHooks, // 🎣 Register the React Hooks plugin
			'react-refresh': reactRefresh, // 🔄 Register the React Refresh plugin
			'react-compiler': reactCompiler, // ⚛️⚡️ Register the React Compiler plugin
		},
		rules: {
			...reactHooks.configs.recommended.rules, // 🎣 Apply React Hooks recommended rules
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true }, // 🔄⚡️ Warn if we're not exporting components correctly for React Refresh
			],

			// TypeScript Rules
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					vars: 'all',
					args: 'after-used',
					ignoreRestSiblings: true,
					argsIgnorePattern: '^_', // ⚠️ No unused variables allowed! (but _ is okay for unused args)
					varsIgnorePattern: '^Type|^Interface|^I[A-Z]',
				},
			],
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ prefer: 'type-imports', fixStyle: 'separate-type-imports' },
			],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/prefer-nullish-coalescing': 'error',
			'@typescript-eslint/prefer-optional-chain': 'error',
			'@typescript-eslint/no-non-null-assertion': 'error',
			'@typescript-eslint/prefer-as-const': 'error',

			// React Compiler & Performance Rules
			'react-compiler/react-compiler': 'error', // ⚛️⚡️ Enable React Compiler rules
			'react/react-in-jsx-scope': 'off', // ⚛️ No need to import React in JSX anymore!

			// React Performance & Memoization Best Practices
			'react-hooks/exhaustive-deps': 'error', // 🔄 Ensure all dependencies are listed
			'react/jsx-key': 'error', // 🔑 Require keys in list items
			'react/jsx-no-bind': [
				'warn',
				{
					allowArrowFunctions: true,
					allowBind: false,
					ignoreRefs: true,
				},
			], // ⚡ Warn about inline function binding
			'react/jsx-no-constructed-context-values': 'error', // 📦 Prevent object creation in Context values
			'react/jsx-no-useless-fragment': 'error', // 🧹 Remove unnecessary fragments
			'react/no-array-index-key': 'warn', // 🔢 Warn about using array indices as keys
			'react/no-object-type-as-default-prop': 'error', // 🏗️ Prevent object literals as default props
			'react/self-closing-comp': 'error', // 🔄 Enforce self-closing components
			'react/hook-use-state': 'error', // 🪝 Enforce useState hook patterns

			// General Code Quality
			'prefer-const': 'error',
			'no-var': 'error',
			'object-shorthand': 'error',
			'prefer-template': 'error',
			eqeqeq: ['error', 'always', { null: 'ignore' }],
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'no-debugger': 'error',
		},
		settings: {
			react: {
				version: 'detect', // ⚛️ Automatically detect React version
			},
			'import/resolver': {
				node: {
					paths: ['src'], // 🚚 Look for imports in the 'src' directory
					extensions: ['.js', '.jsx', '.ts', '.tsx'], // 🚚 ...and these file extensions
				},
			},
		},
	},
]
