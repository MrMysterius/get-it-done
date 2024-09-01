import { json } from '@sveltejs/kit';

export function GET() {
	return json({ version: 1 }, { status: 200, statusText: 'OK' });
}
