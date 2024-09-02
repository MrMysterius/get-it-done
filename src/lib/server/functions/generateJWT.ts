import JWT from 'jsonwebtoken';
import type { Prisma } from '@prisma/client';
import { env } from '$env/dynamic/private';

export function generateAccessToken({ id }: Prisma.userGetPayload<null>, expiresIn = '30m') {
	return JWT.sign({ id }, env.TOKEN_SECRET, {
		expiresIn: expiresIn,
		issuer: 'GetItDone'
	});
}

export function generateRefreshToken({ id }: Prisma.userGetPayload<null>, expiresIn = '30d') {
	return JWT.sign({ id }, env.TOKEN_SECRET, {
		expiresIn: expiresIn,
		issuer: 'GetItDone'
	});
}
