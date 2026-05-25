import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';

export const hashPassword = password => bcrypt.hash(password, config.BCRYPT_SALT_ROUNDS);

export const comparePassword = (candidate, hash) => bcrypt.compare(candidate, hash);
