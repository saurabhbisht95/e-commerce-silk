import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { logger } from '../config/logger.js';
import { USER_ROLES } from '../constants/enums.js';
import { User } from '../models/User.js';
import { hashPassword } from '../utils/password.js';

const getRequiredEnv = key => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`${key} is required. Add it to apps/api/.env before running npm run create:admin.`);
  }
  return value;
};

const run = async () => {
  const name = process.env.ADMIN_NAME?.trim() || 'Doon Silk Admin';
  const email = getRequiredEnv('ADMIN_EMAIL').toLowerCase();
  const password = getRequiredEnv('ADMIN_PASSWORD');
  const phone = process.env.ADMIN_PHONE?.trim();

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters for a super admin account.');
  }

  await connectDatabase();

  const existing = await User.findOne({ email, deletedAt: null }).select('+password');

  if (existing) {
    existing.name = existing.name || name;
    existing.phone = existing.phone || phone;
    existing.roles = [...new Set([...(existing.roles || []), USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN])];
    existing.isActive = true;
    existing.isEmailVerified = true;
    await existing.save();

    logger.info({ email }, 'Existing user promoted to super admin');
  } else {
    await User.create({
      name,
      email,
      phone,
      password: await hashPassword(password),
      roles: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
      isActive: true,
      isEmailVerified: true
    });

    logger.info({ email }, 'Super admin created');
  }

  await disconnectDatabase();
};

run().catch(async error => {
  logger.error({ err: error }, 'Super admin bootstrap failed');
  await disconnectDatabase();
  process.exit(1);
});
