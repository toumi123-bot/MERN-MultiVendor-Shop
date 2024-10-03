const stripeModel = require('../../models/stripeModel')
const {v4: uuidv4} = require('uuid')
const stripe = require ('stripe')('sk_test_51Q5pOLF4md42MzNFfd346XC4Ei7UQAadIsfGlApQRmoY7LTNTKCrkzzrXV7LHegwEVhXjoGd4LnCkQI6dDvDiFAB00dT4MULfg')
class paymentController{
    create_stripe_connect_account = async (req,res) =>{
        console.log('test data')
        console.log(req.id)
    }
}

module.exports = new paymentController()