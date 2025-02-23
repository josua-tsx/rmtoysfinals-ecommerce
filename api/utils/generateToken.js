import jwt from 'jsonwebtoken'

export const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d",
    });
    // const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    //     expiresIn: "7d",
    // });
    return { accessToken };
};
