// import User from "../models/User.js";
// import jwt  from "jsonwebtoken";

// // middleware to protect routes
// export const  protectRoute = async (req , res , next)=>{
//     try {
//         const token = req.headers.token; 

//         const decoded = jwt.verify(token, process.env.JWT_SECRET)

//         const user = await  User.findById(decoded.userId).select("-password");

//         if(!user) return res.json({success : false, message : "User not found "});
        
//         req.user = user; 
//         next();
        
//     } catch (error) {
//         console.log(error.message);
//          res.json({success : false, message : error.message});
        
//     }
// }



import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "JWT must be provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        req.user = user;
        next();
    } catch (error) {
        console.error("JWT verification error:", error);
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};
