export interface NavLink {
	href: string;
	label: string;
}

export const navLinks: (NavLink & { home?: boolean })[] = [
	{ home: true, href: '/', label: 'Agnieszka Paradecka – Świtalska' },
	{ href: '/portfolio', label: 'Portfolio' },
	{ href: '/o-mnie', label: 'O mnie' },
	{ href: '/kontakt', label: 'Kontakt' },
];
