// hashPassword.js (crea este archivo temporal)
import bcrypt from 'bcryptjs';

const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log('Hash:', hash);