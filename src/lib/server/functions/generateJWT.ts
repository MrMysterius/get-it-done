import JWT from 'jsonwebtoken';
import type { Prisma } from '@prisma/client';
import { TOKEN_SECRET } from '$env/static/private';

export function generateAccessToken({ id }: Prisma.userGetPayload<null>, expiresIn = '30m') {
	return JWT.sign({ id }, TOKEN_SECRET, {
		expiresIn: expiresIn,
		issuer: 'GetItDone'
	});
}

export function generateRefreshToken({ id }: Prisma.userGetPayload<null>, expiresIn = '30d') {
	return JWT.sign({ id }, TOKEN_SECRET, {
		expiresIn: expiresIn,
		issuer: 'GetItDone'
	});
}
