import { AppError } from '../lib/errors.js';
import { verifyPassword } from '../lib/password.js';
import { signToken } from '../middleware/auth.js';
import { findUserForLogin, getUserProfile } from '../services/users.js';

export async function login(req, res) {
  const { email, password } = req.valid.body;
  const user = await findUserForLogin(email);
  // Same error for unknown user and wrong password (no account enumeration).
  if (!user || !(await verifyPassword(password, user.password_hash))) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  res.json({ data: { token: signToken(user), user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role, tenantName: user.tenant_name } } });
}

export async function me(req, res) {
  const profile = await getUserProfile(req.user.id);
  if (!profile) throw new AppError(401, 'INVALID_TOKEN', 'User no longer exists');
  res.json({ data: profile });
}
