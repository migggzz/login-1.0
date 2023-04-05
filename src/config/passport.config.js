import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2'
import UserModel from '../dao/models/user.model.js';
import { createHash, isValidPassword } from '../utils.js';
import {config} from 'dotenv';

config();

const LocalStrategy = local.Strategy;

const initializePassport = () => {
    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email',
    }, async (req, username,password, done)=>{
        const {first_name, last_name, age,email} = req.body
        try{
            const user = await UserModel.findOne({email: username}).lean().exec()
            if(user){
                console.log("user already exists")
                return done(null, false, {message: 'user already exists'})
            }

            const newUser = {
                first_name,
                last_name,
                age,
                email,
                password: createHash(password)
            }
            const result = await UserModel.create(newUser)

            return done(null, result)
        }
        catch(err){
            return done("Eror obtaining User "+err)
        }
    }))

    passport.use('login', new LocalStrategy({
        usernameField: 'email',
    }, async (username,password, done)=>{
        try{
            const user = await UserModel.findOne({email: username}).lean().exec()
            if(!user){
                console.log('user doesnt exist')
                return done(null, false, {message: 'user not found'})
            } 
            if(!isValidPassword(user, password)){
                console.log('invalid password')
                return done(null, false, {message: 'invalid password'})
            }
            return done(null, user, {message: 'Logged in successfully'})
        }
        catch(err){}
    }))

    passport.use('github', new GitHubStrategy({
        clientID: process.env.CLIENTID,
        clientSecret: process.env.CLIENTSECRET,
        callbackURL: process.env.CALLBACKURL,
    }, async(accessToken, refreshToken, profile, done) => {
        console.log(profile)
        
        try {
            const user = await UserModel.findOne({ email: profile._json.email})
            if (user) {
                return done(null, user)
            }
            const newUser = await UserModel.create({
                first_name: profile._json.name,
                last_name: "",
                email: profile._json.email
            })
            return done(null, newUser)
        } catch(error) {
            return done('Error to login with github')
        }

    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        try{
            const user = await UserModel.findById(id).lean().exec()
            return done(null, user)
        }
        catch(err){
            return done("Eror obtaining User "+err)
        }
    })

    
}

export default initializePassport;