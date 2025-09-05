// import cloudinary from "../lib/cloudinary.js";
// import { generateToken } from "../lib/utils.js";
// import User from "../models/User.js";


// // Signup a new user
// export const signup = async (req, res) => {
//     const { fullName, email, password, bio } = req.body || {};

//     try {
//         if (!fullName || !email || !password || !bio) {
//             return res.json({ success: false, message: "Missing Details " })
//         }

//         const user = await User.findOne({ email });

//         if (user) {
//             return res.json({ success: false, message: "Account already exist  ! " })
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedpassword = await bcrypt.hash(password, salt);

//         const newUser = await User.create({
//             fullName, email, password: hashedpassword, bio
//         });
//         const token = generateToken(newUser._id)

//         res.json({ success: true, userData: newUser, token, message: "Account created successfully" })

//     } catch (error) {
//         console.log("user controller error : ", error.message);

//         res.json({ success: false, message: error.message })
//     }
// }



// //  function for the login 

// export const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const userData = await User.findOne({ email })

//         const isPasswordCorrect = await bcrypt.compare(process, userData.password);

//         if (!isPasswordCorrect) {
//             return res.json({ success: false, message: "Invalid credentials" });
//         }

//         const token = generateToken(userData._id)
//         res.json({ success: true, userData, token, message: "Login successfully" })

//     } catch (error) {
//         console.log("user controller error in the login  : ", error.message);
//         res.json({ success: false, message: error.message })
//     }
// }

// // controller to check if user is authenticated 

// export const checkAuth = (req , res )=>{
//     res.json({success:true, user: req.user});
// }


// // update user profile details 
// export const updateProfile = async (req , res)=>{
//     try {
//         const {profilePic , bio , fullName} = req.body; 
        
//         const userId = req.user._id; 
//         let updatedUser ;

//         if(!profilePic){
//            updatedUser =  await User.findByIdAndUpdate(userId,{bio , fullName},{new : true });
//         }else{
//             const upload = await cloudinary.uploader.upload(profilePic);

//             updatedUser = await User.findByIdAndUpdate(userId , { profilePic:upload , secure_url, bio , fullName},{new : true });
//         }
//         res.json({success:true , user : updatedUser})

//     } catch (error) {
//         console.log("error in upload the cloudinary  : ",error.message);
//           res.json({success:false  , message : error.message})
//     }
// }


























import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Signup
export const signup = async (req, res) => {
    try {
        const { fullName, email, password, bio } = req.body;
        if (!fullName || !email || !password || !bio) {
            return res.status(400).json({ success: false, message: "Missing fields" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "Account already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ fullName, email, password: hashedPassword, bio });

        const token = generateToken(newUser._id);

        res.json({ success: true, user: newUser, token, message: "Account created successfully" });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const token = generateToken(user._id);

        res.json({
            success: true,
            user: { id: user._id, email: user.email, fullName: user.fullName, bio: user.bio, profilePic: user.profilePic },
            token,
            message: "Login successful",
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { bio, fullName, profilePic } = req.body;
    const userId = req.user._id;

    let updatedData = { bio, fullName };

    // ✅ If frontend sends a Base64 image, upload to Cloudinary
    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic, {
  folder: "profile_pics",
  resource_type: "image", // ✅ Always specify image
  timeout: 60000, // ✅ Increase timeout to 60 seconds
});

      updatedData.profilePic = upload.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    }).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Check authentication
export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user });
};
