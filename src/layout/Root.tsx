import { Outlet } from '@tanstack/react-router'

function RootLayout() {
	return (
		<div className='shadow-absolute fixed inset-0.5 rounded-2xl'>
			<div className='absolute inset-0.5 z-10 grid grid-rows-[1fr_auto] place-items-center overflow-x-auto rounded-2xl border-zinc-50/5 bg-zinc-50/75 dark:border-zinc-300/10 dark:bg-zinc-950/75'>
				<Outlet />
			</div>
		</div>
	)
}

export default RootLayout
