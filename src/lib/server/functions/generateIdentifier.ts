import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 20);

export function generateIdentifier(prefix: string = '') {
	if (prefix != '') {
		return `${prefix}_${nanoid()}`;
	} else {
		return nanoid();
	}
}
