import { Link } from '@tanstack/react-router'
import { Grid3X3 } from 'lucide-react'

/**
 * Home page - Landing page with links to different sections
 */
export default function Home() {
	return (
		<main className='flex h-dvh w-full flex-col items-center justify-center gap-8 p-6'>
			<section className='flex flex-col items-center gap-6 text-center'>
				<Grid3X3 size={80} className='text-zinc-400 dark:text-zinc-600' />
				<h1 className='text-3xl font-bold text-zinc-800 dark:text-zinc-100'>Pixel Grid Editor</h1>
				<p className='max-w-md text-zinc-500 dark:text-zinc-400'>
					Create pixel art projects with customizable grids, colors, and export to SVG
				</p>

				<Link
					to='/grid'
					className='flex touch-manipulation items-center gap-2 rounded-xl bg-zinc-900 px-8 py-4 text-lg font-medium text-white transition-transform active:scale-95 dark:bg-zinc-100 dark:text-zinc-900'
				>
					<span>Open Grid Editor</span>
				</Link>
			</section>
		</main>
	)
}
