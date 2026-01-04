import { Link } from '@tanstack/react-router'

export default function NotFound() {
	return (
		<main className='font-family-serif flex h-dvh flex-col items-center justify-center gap-4 text-center text-3xl'>
			<h1 className='m-0 text-5xl'>Page not found</h1>
			<p className='mt-2 opacity-80'>The page you requested does not exist.</p>
			<Link className='text-accent-500' to='/'>
				Go to Home
			</Link>
		</main>
	)
}
