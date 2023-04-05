import express from "express";
import handlebars from "express-handlebars"
import { Server } from "socket.io";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import __dirname from "./utils.js"
import run from "./run.js";
import  {config} from "dotenv";
import passport from "passport";
import initializePassport from "./config/passport.config.js";

config()

const PORT = 8080;
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(__dirname + "/public"))
app.engine("handlebars", handlebars.engine())
app.set("views", __dirname + "/views")
app.set("view engine", "handlebars")

const MONGO_URI = process.env.mongo_uri
const MONGO_DB_NAME = process.env.mongo_db_name

app.use(session({
    store: MongoStore.create({
        mongoUrl: MONGO_URI,
        dbName: MONGO_DB_NAME
    }),
    secret: 'mysecret',
    resave: true,
    saveUninitialized: true
}))

initializePassport();

app.use(passport.initialize())
app.use(passport.session())

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