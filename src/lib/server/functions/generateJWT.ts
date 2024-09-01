import JWT from 'jsonwebtoken';
import type { Prisma } from '@prisma/client';

export function generateAccessToken({ id }: Prisma.userGetPayload<null>) {
	return JWT.sign({ id }, process.env.TOKEN_SECRET as string, {
		expiresIn: '30m',
		issuer: 'GetItDone'
	});
}

export function generateRefreshToken({ id }: Prisma.userGetPayload<null>) {
	return JWT.sign({ id }, process.env.TOKEN_SECRET as string, {
		expiresIn: '7d',
		issuer: 'GetItDone'
	});
}
