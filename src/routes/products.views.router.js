import {Router} from "express"
import productModel from "../dao/models/products.model.js"

const router = Router()

router.get("/", async (req, res) => {

    const limit = req.query?.limit || 10
    const page = req.query?.page || 1
    const filter = req.query?.filter || ''
    const sortQuery = req.query?.sort || ''
    const sortQueryOrder = req.query?.sortorder || 'desc'

    const search = {}
    if(filter) {
        search.title = filter
    }
    const sort = {}
    if (sortQuery) {
        sort[sortQuery] = sortQueryOrder
    }

    const options = {
        limit, 
        page, 
        sort,
        lean: true
    }
    
    let data = await productModel.paginate(search, options)
    data.prevLink = data.hasPrevPage ? `/products?page=${data.prevPage}&limit=${limit}` : '';
    data.nextLink = data.hasNextPage ? `/products?page=${data.nextPage}&limit=${limit}` : '';
    console.log(JSON.stringify(data, null, 2, '\t'));

    const user = req.session.user

    res.render('products', data,user)
})

export default router