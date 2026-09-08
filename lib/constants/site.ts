/**
 * Centralized site configuration, metadata, and routing constants.
 * Enhances codebase scalability and single-source-of-truth consistency.
 */

export const SITE_CONFIG = {
	name: 'Cukupin™',
	tagline: 'Catat santai, tahu arah uangmu.',
	description: 'Aplikasi pencatatan keuangan pribadi dengan pendekatan Quiet Ledger — ramah privasi, offline-ready (PWA), dan tanpa biaya langganan.',
	url: 'https://cukupin.app',
	locale: 'id_ID',
	author: 'Cukupin™ Team',
	twitterHandle: '@cukupin',
	themeColor: '#F7F6F0',
	links: {
		dashboard: '/dashboard',
		transactions: '/transactions',
		reports: '/reports',
		goals: '/goals',
		wishlist: '/wishlist',
		login: '/auth/login',
		privacy: '/legal/privacy',
		terms: '/legal/terms'
	}
} as const;
export const STORAGE_KEYS = {
	COOKIE_CONSENT: 'cukupin-cookie-consent',
	OFFLINE_QUEUE: 'cukupin_offline_queue',
	LOCAL_TRANSACTIONS: 'cukupin_local_transactions',
	LOCAL_GOALS: 'cukupin_local_goals',
	LOCAL_WISHLIST: 'cukupin_local_wishlist',
	LOCAL_BILLS: 'cukupin_local_bills',
	LOCAL_BUDGETS: 'cukupin_local_budgets'
} as const;
