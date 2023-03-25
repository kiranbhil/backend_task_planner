//1. Import
const express = require("express");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const userModel = require("../models/user.model");

//2. Create
const userRoutes = express.Router();

//3. Methods

//3.1 Signup
userRoutes.post("/signup", async (req, res) => {
  //1. Getting data from body
  const { email, password, name } = req.body;

  //2. making hashed password
  const hash = await argon2.hash(password);
  try {
    //3. if both email and password exist then we will proceeds
    if (email && password) {
      //4. find user Already exist or not
      let userExistOrNot = await userModel.find({ email });
      // console.log("userExistOrNot:", userExistOrNot);

      //5. user exist with this email id
      if (userExistOrNot.length !== 0) {
        return res.status(200).send({
          message: "User With this Email Already Exists",
          data: userExistOrNot[0],
        });
      }

      //6. create user if he/she not exist with hashed password
      let createUser = new userModel({
        email,
        name,
        password: hash,
      });
      await createUser.save();

      return res.status(201).send({
        message: "User Created Successfully!",
        data: createUser,
      });
    } else {
      return res.status(400).send({
        message: "Please Fill All Details",
        data: [],
      });
    }
  } catch (e) {
    console.log(e.message);
    return res.status(401).send({
      message: "Error Occurs",
      data: [],
      desc: e.message,
    });
  }
});

//3.2 Login
userRoutes.post("/login", async (req, res) => {
  //1. Getting data from body
  const { email, password } = req.body;
  console.log("email, password:", email, password);
  try {
    const userExistOrNot = await userModel.findOne({ email });

    //2. if user not signup in our app he have to signup first
    if (userExistOrNot.length === 0) {
      return res.status(400).send({
        message: "User With this Email Id Not Exist!",
      });
    }

    //3. password verify by argon2 package
    if (await argon2.verify(userExistOrNot.password, password)) {
      //3. Creating Token
      const access_token = jwt.sign(
        { _id: userExistOrNot._id, email: userExistOrNot.email, name: userExistOrNot.name },
        "PAYPAL_27",
        { expiresIn: "4days" }
      );

      //4. Create Refresh Token
      const refresh_token = jwt.sign(
        { _id: userExistOrNot._id },
        "PAYPAL_27_REFRESH",
        { expiresIn: "7days" }
      );

      return res
        .status(201)
        .send({ message: "Login Successfully!", access_token, refresh_token });
    } else {
      return res.status(203).send({
        message: "Wrong Credentials",
      });
    }
  } catch (e) {
    console.log(e.message);
    return res.status(401).send({
      message: "Error Occurs",
      desc: e.message,
    });
  }
});


//3.3 Getting data from token
userRoutes.post("/verify", async (req, res) => {
  const { token } = req.body;
  if (token === undefined) {
    return res.send("Unauthorized");
  }
  try {
    const verification = jwt.verify(token, "PAYPAL_27");
    if (verification) {
      return res.status(200).send(verification);
    }
  } catch (e) {
    console.log("e:", e.message);
    return res.status(403).send({ message: "Access Token Expired!" });
  }
});

//3.4 get all users
userRoutes.get("/", async (req, res) => {

  try {
    let data = await userModel.find({}, { password: 0 })
    return res.status(200).send({
      message: "All Users",
      data
    })
  } catch (e) {
    console.log("e:", e.message);
    return res.status(403).send({ message: "Access Token Expired!" });
  }
})

//4. Exports
module.exports = userRoutes;