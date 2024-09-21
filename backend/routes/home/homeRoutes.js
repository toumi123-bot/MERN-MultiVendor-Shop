const homeControllers = require('../../controllers/home/homeControllers')

const router = require('express').Router()

router.get('/get-gategorys',homeControllers.get_categorys)
router.get('/get-products',homeControllers.get_products)
module.exports = router