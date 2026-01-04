export default function Home() {
	return (
		<main className='flex h-dvh w-full flex-col items-center justify-center gap-3 text-center'>
			<div className='flex items-center gap-4'>
				<span className='flex items-center gap-2'>
					<button className='size-8 rounded-full bg-rose-500/25 pb-0.5'>-</button>
					<p>12</p>
					<button className='size-8 rounded-full bg-emerald-500/25 pb-0.5'>+</button>
				</span>
				<em className='mx-4 text-2xl font-semibold'>x</em>
				<span className='flex items-center gap-2'>
					<button className='size-8 rounded-full bg-rose-500/25 pb-0.5'>-</button>
					<p>12</p>
					<button className='size-8 rounded-full bg-emerald-500/25 pb-0.5'>+</button>
				</span>
			</div>
		</main>
	)
}
