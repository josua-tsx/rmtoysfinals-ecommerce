export const setCookies = (res, accessToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    // maxAge: 15 * 60 * 1000, // 15 minutes
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
