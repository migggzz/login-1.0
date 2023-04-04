import { Router } from "express";
import UserModel from "../dao/models/user.model.js";
import { createHash } from "../utils.js";
import { isValidPassword } from "../utils.js";

const router = Router()

//View to Register Users
router.get('/register', (req, res) => {
    res.render('sessions/register')
})

// API to create aa user in the DB
router.post('/register', async(req, res) => {
    const userNew = {
        first_name : req.body.first_name,
        last_name : req.body.last_name,
        age: req.body.age,
        email : req.body.email,
        password : createHash(req.body.password)
     }
    console.log(userNew);

    const user = new UserModel(userNew)
    await user.save()

    res.redirect('/session/login')
})

// Login View
router.get('/login', (req, res) => {
    res.render('sessions/login')
})

// API for login
router.post('/login', async (req, res) => {
    const { email, password } = req.body

    const user = await UserModel.findOne({email}).lean().exec()
    if(!user) {
        return res.status(401).render('errors/base', {
            error: 'user not found'
        })
    }
    if(!isValidPassword(user, password)) {
        return res.status(403).render('errors/base', {
            error: 'invalid password'
        })
    }

    delete user.password
    req.session.user = user
    res.redirect('/products')
})

// close Session
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            console.log(err);
            res.status(500).render('errors/base', {error: err})
        } else res.redirect('/sessions/login')
    })
})



export default router