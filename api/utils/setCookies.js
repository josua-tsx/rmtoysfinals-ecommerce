export const setCookies = (res, accessToken) => {
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: true, // Essential for HTTPS
    sameSite: 'none', // Required for cross-site requests
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};