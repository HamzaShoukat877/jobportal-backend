import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
    try {
        console.log("Cookies received:", req.cookies); // Log all cookies
        const token = req.cookies?.token;
        console.log("Token extracted:", token);

        if (!token) {
            return res.status(401).json({ message: "Unauthorized", success: false });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token", success: false });
        }

        req.id = decoded._id;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ message: "Unauthorized" });
    }
};

export default isAuthenticated;
