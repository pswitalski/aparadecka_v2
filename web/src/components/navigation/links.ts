export interface NavLink {
	label: string;
	href: string;
}

export const navLinks: (NavLink & { home?: boolean })[] = [
	{ label: 'Agnieszka Paradecka – Świtalska', href: '/', home: true },
	{ label: 'Portfolio', href: '/portfolio' },
	{ label: 'O mnie', href: '/o-mnie' },
	{ label: 'Kontakt', href: '/kontakt' },
];
