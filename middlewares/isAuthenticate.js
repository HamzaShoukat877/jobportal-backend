import jwt from "jsonwebtoken";
import cookieParser from 'cookie-parser';

app.use(cookieParser()); // Ensure cookie parser is initialized

const isAuthenticated = (req, res, next) => {
    try {
        const token = req.cookies?.token;
        console.log("Token:", token); // Debugging line
        if (!token) {
            return res.status(401).json({ message: "Unauthorized", success: false });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token", success: false });
        }

        req.id = decoded.userId;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ message: "Unauthorized" });
    }
};

export default isAuthenticated;
