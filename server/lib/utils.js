// import jwt from 'jsonwebtoken';


// // function to generate a token for a user 
// export const generateToken  = (userId) =>{
//     const token = jwt.sign({userId},process.env.JWT_SECRET);
//     return token;
// }

import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing in .env");
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
