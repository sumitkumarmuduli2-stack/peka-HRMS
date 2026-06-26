import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'supersecret_peka_hrms_token_key',
    { expiresIn: process.env.JWT_EXPIRE || '1d' }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'supersecret_peka_hrms_refresh_token_key',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

export const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Set cookies configuration
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token: accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });
};
