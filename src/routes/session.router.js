import { Router } from "express";
import UserModel from "../dao/models/user.model.js";
import { createHash } from "../utils.js";
import { isValidPassword } from "../utils.js";
import passport from 'passport';

const router = Router()

//View to Register Users
router.get('/register', (req, res) => {
    res.render('sessions/register')
})

router.get('/failRegister', (req, res) => {
    res.render('errors/base', {error: 'Failed registration'})
})

router.get('/failLogin', (req, res) => {
    res.render('errors/base', {error: 'Failed login'})
})

// API to create aa user in the DB
router.post('/register', passport.authenticate('register',{failureRedirect: '/failRegister'}),async(req, res) => {
   // Todo lo de abajo esta hecho por el middleware de passport
    // const userNew = {
    //     first_name : req.body.first_name,
    //     last_name : req.body.last_name,
    //     age: req.body.age,
    //     email : req.body.email,
    //     password : createHash(req.body.password)
    //  }
    // console.log(userNew);

    // const user = new UserModel(userNew)
    // await user.save()
    console.log('user created')

    res.redirect('/')
})

// Login View
router.get('/', (req, res) => {
    res.render('sessions/login')
})

// API for login
router.post('/login', passport.authenticate('login',{failureRedirect: '/failLogin'}) ,async (req, res) => {

    if(!req.user){
        return res.status(400).send({status:"error",error:"user not found"})
    }

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
    }
  // todo lo de abaixo esta hecho por el middleware de passport
    // const { email, password } = req.body

    // const user = await UserModel.findOne({email}).lean().exec()
    // if(!user) {
    //     return res.status(401).render('errors/base', {
    //         error: 'user not found'
    //     })
    // }
    // if(!isValidPassword(user, password)) {
    //     return res.status(403).render('errors/base', {
    //         error: 'invalid password'
    //     })
    // }

    // delete user.password
    // req.session.user = user
    res.redirect('/products')
})

router.get('/github', passport.authenticate('github', { scope: ['user: email']}), (req, res) => {

})

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/'}), async (req, res) => {
    console.log("Callback: ", req.user)
    req.session.user = req.user
    console.log("User session: ", req.session.user)
    res.redirect('/products')
})


// close Session
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            console.log(err);
            res.status(500).render('errors/base', {error: err})
        } else res.redirect('/')
    })
})



export default router