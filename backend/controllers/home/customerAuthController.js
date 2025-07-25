const sellerCustomerModel = require("../../models/chat/sellerCustomerModel");
const customerModel = require("../../models/customerModel");
const { responseReturn } = require("../../utiles/response");
const bcrypt = require("bcryptjs");
const { createToken } = require("../../utiles/tokenCreate");

class customerAuthController {
  customer_register = async (req, res) => {
    const { email, name, password } = req.body;
    try {
      const customer = await customerModel.findOne({ email });
      if (customer) {
        responseReturn(res, 404, { error: "Email Already Exit" });
      } else {
        const createCustomer = await customerModel.create({
          name: name.trim(),
          email: email.trim(),
          password: await bcrypt.hash(password, 10),
          method: "menualy",
        });
        await sellerCustomerModel.create({
          myId: createCustomer.id,
        });
        const token = await createToken({
          id: createCustomer.id,
          name: createCustomer.name,
          email: createCustomer.email,
          method: createCustomer.method,
        });
        res.cookie("customerToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // active en prod
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        responseReturn(res, 201, { message: "User Register Success", token });
      }
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };
  // End Method

  customer_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const customer = await customerModel
        .findOne({ email })
        .select("+password");
      if (customer) {
        const match = await bcrypt.compare(password, customer.password);
        if (match) {
          const token = await createToken({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            method: customer.method,
          });
          res.cookie("customerToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });

          responseReturn(res, 201, { message: "User Login Success", token });
        } else {
          responseReturn(res, 404, { error: "Password Wrong" });
        }
      } else {
        responseReturn(res, 404, { error: "Email Not Found" });
      }
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };
  // End Method

  customer_logout = async (req, res) => {
    res.cookie("customerToken", "", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: new Date(0), // expire immédiatement
    });

    responseReturn(res, 200, { message: "Logout Success" });
  };
  // End Method
}

module.exports = new customerAuthController();
