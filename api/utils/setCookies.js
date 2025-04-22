export const setCookies = (res, accessToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true, // Always true in production
    sameSite: "none", // Changed from "strict"
    maxAge: 7 * 24 * 60 * 60 * 1000,
    domain: process.env.NODE_ENV === "production" 
      ? "https://rmtoysfinals-8jgr.vercel.app/" // Your Render domain
      : undefined // Localhost
  });
};