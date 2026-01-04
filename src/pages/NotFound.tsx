import { Link } from '@tanstack/react-router'

import { usePageTitle } from '@hooks/usePageTitle'

export default function NotFound() {
	usePageTitle('Não encontrado')

	return (
		<main className='font-family-serif flex h-dvh flex-col items-center justify-center gap-4 text-center text-3xl'>
			<h1 className='m-0 text-5xl'>Página não encontrada</h1>
			<p className='mt-2 opacity-80'>A página que você solicitou não existe.</p>
			<Link className='text-accent-500' to='/'>
				Ir para o início
			</Link>
		</main>
	)
}
