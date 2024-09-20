const category = require('../../models/categoryModel')
const { responseReturn } = require("../../utiles/response")

class homeControllers{


    get_categorys = async (req, res) => {
        try {
            const categorys = await category.find({})
            responseReturn(res,200, {
                categorys
            })
            
        } catch (error) {
            console.log(error)
        }
    }

}

module.exports = new homeControllers()