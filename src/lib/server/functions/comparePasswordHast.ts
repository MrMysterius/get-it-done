import bcrypt from 'bcrypt';

export function comparePasswordHash(password: string, hash: string) {
	return bcrypt.compareSync(password, hash);
}
