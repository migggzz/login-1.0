import express from "express";
import handlebars from "express-handlebars"
import { Server } from "socket.io";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import __dirname from "./utils.js"
import run from "./run.js";

const PORT = 8080;
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(__dirname + "/public"))
app.engine("handlebars", handlebars.engine())
app.set("views", __dirname + "/views")
app.set("view engine", "handlebars")

const MONGO_URI = "mongodb+srv://miggz:miguel1989@cluster00.8kbvpfy.mongodb.net/?retryWrites=true&w=majority"
const MONGO_DB_NAME = "coder_project"

app.use(session({
    store: MongoStore.create({
        mongoUrl: MONGO_URI,
        dbName: MONGO_DB_NAME
    }),
    secret: 'mysecret',
    resave: true,
    saveUninitialized: true
}))

mongoose.connect(MONGO_URI, {
    dbName: MONGO_DB_NAME
}, (error) => {
    if(error){
        console.log("DB No conected...")
        return
    }
    const httpServer = app.listen(PORT, () => console.log("Listening on port 8080"))
    const socketServer = new Server(httpServer)
    httpServer.on("error", (e) => console.log("ERROR: " + e))

    run(socketServer, app)
})