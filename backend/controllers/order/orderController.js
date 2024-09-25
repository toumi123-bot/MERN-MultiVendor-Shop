const authorOrderModel  = require("../../models/authOrder")
const customerModel  = require("../../models/customerModel")
const cardModel = require("../../models/cardModel")
const { responseReturn } = require("../../utiles/response")
const { mongo:{ObjectId}} = require('mongoose')
const moment = require("moment")

class orderController{
    place_order = async(req, res) => {
        const {price,products,shipping_fee,shippingInfo,userId} = req.body
        let authorOrderData = []
        let cardId = []
        let customerOrderProduct = []
        const tempDate = moment(Date.now()).format('LLL')
        for (let i = 0; i < products.length; i++) {
            const pro = products[i].products;
            for (let j = 0; j < pro.length; j++) {
                const tempCusPro = pro[j].productInfo;
                tempCusPro.quantity = pro[j].quantity
                customerOrderProduct.push(tempCusPro)
                if (pro[j]._id){
                    cardId.push(pro[j]._id)
                }
            }
        }
        try {
            
        } catch (error) {
            
        }
}

//END METHOD
}
module.exports = new orderController()