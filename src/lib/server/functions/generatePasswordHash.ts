import bcrypt from 'bcrypt';

export function generatePasswordHash(password: string) {
	const salt = bcrypt.genSaltSync(12);
	const hash = bcrypt.hashSync(password, salt);
	return hash;
}
