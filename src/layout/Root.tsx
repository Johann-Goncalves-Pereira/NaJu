import { Outlet } from '@tanstack/react-router'

function RootLayout() {
	return (
		<div className='shadow-absolute fixed inset-[clamp(0.8333rem,0.9801rem+-0.1894vw,0.9375rem)] rounded-2xl'>
			<div className='absolute inset-0.5 z-10 grid grid-rows-[1fr_auto] place-items-center overflow-x-auto rounded-2xl border-zinc-50/5 bg-zinc-50/75 dark:border-zinc-300/10 dark:bg-zinc-950/75'>
				<Outlet />

				<footer className='dark:hover:text-accent-100 hover:text-accent-800 py-2 font-serif text-xs text-zinc-950/50 transition-colors dark:text-white/50'>
					Made with{' '}
					<span className='text-shadow-[0px_0px_1px_var(--color-accent-600)] dark:text-shadow-none'>
						🤍
					</span>{' '}
					from Johann to Xoice
				</footer>
			</div>
		</div>
	)
}

export default RootLayout
