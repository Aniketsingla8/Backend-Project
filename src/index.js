//require('dotenv').config({path: './env'}); (because it is exploiting the consistency of the code)
import dotenv from "dotenv" //to do this we have to do 2 more steps 1) config dotenv below and 2) add experimental feature in package.json file
import connectDB from "./db/index.js";
import { app } from "./app.js"

dotenv.config({path: './env'})
//The below code was for practice and the better approach was used after this as this code was polluting the index file as we used a lot of things in one file
/*
import express from "express";
const app = express();  

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR:", error)
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("ERROR: ", error)
        throw error 
    }
})()
*/

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`App is listening on ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("MongoDB connection error: ", error)
})