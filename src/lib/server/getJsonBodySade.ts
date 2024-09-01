import type { RequestEvent } from '@sveltejs/kit';

export async function getJsonBody(e: RequestEvent) {
	try {
		const json = await e.request.json();
		return json;
	} catch {
		return {};
	}
}
