import jwt from "jsonwebtoken";
const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "User not authenticated.", success: false });
    }
    //token exists then decode token
    const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log(decode);
    
    //token not decoded
    if (!decode) {
      return res.status(401).json({ message: "Invalid token", success: false });
    }
    //after token decoded get userId from decoded token
    req.id = decode.userId;
    next();
  } catch (error) {
    console.log(error);
  }
};
export default isAuthenticated;
