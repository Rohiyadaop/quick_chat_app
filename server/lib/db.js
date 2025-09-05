import mongoose from "mongoose";

// function to connect the db 
export const connectDB = async ()=>{
    try{
        mongoose.connection.on('connected', ()=>console.log('Database connected '));
        await mongoose.connect(`${process.env.MONGO_URI}`)
    }catch(error){
        console.log("error in mongoosje connection : ",error);
    }
} 