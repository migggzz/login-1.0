import { Router } from "express";
import UserModel from "../dao/models/user.model.js";

const router = Router()

//View to Register Users
router.get('/register', (req, res) => {
    res.render('sessions/register')
})

// API to create aa user in the DB
router.post('/register', async(req, res) => {
    const userNew = req.body
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

    const user = await UserModel.findOne({email, password}).lean().exec()
    if(!user) {
        return res.status(401).render('errors/base', {
            error: 'Error en email y/o password'
        })
    }

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