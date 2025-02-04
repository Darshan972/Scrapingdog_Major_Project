const User = require("../models/auth.model");
const expressJwt = require("express-jwt");
const _ = require("lodash");
const AWS = require("aws-sdk");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { errorHandler } = require("../helpers/dbErrorHandling");
const nodemailer = require("nodemailer");
require("dotenv").config({
  path: "../config/config.env",
});
const RECAPTCHA_SERVER_KEY = process.env.RECAPTCHA_SERVER_KEY;

const AWS_SES = new AWS.SES(SES_CONFIG);


exports.registerController = async(req, res) => {
  const { name, email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      errors: firstError,
    });
  } else {

    try {
      const user = await User.findOne({ email });
    
      if (user) {
        let decoded, isExpired;
    
        try {
          decoded = jwt.verify(user.registrationToken, process.env.JWT_SECRET);
          isExpired = Date.now() >= decoded.exp * 1000;
        } catch (err) {
          isExpired = true;
        }
    
        if (user.isActive === false && isExpired) {
          const token = jwt.sign(
            {
              name,
              email,
              password,
            },
            process.env.JWT_ACCOUNT_ACTIVATION,
            {
              expiresIn: "4h",
            }
          );
    
          sendEmail(email, name, token);
    
          user.registrationToken = token;
    
          await user.save();
    
          return res.status(200).json({
            message: "A verification link has been sent to your mail account.",
          });
        } else {
          return res.status(400).json({
            errors: "Username or Email already exist",
          });
        }
      } else {
        const token = jwt.sign(
          {
            name,
            email,
            password,
          },
          "duckduckgo",
          {
            expiresIn: "4h",
          }
        );
    
        sendEmail(email, name, token);
    
        const user = new User({
          name,
          email,
          password,
          registrationToken: token,
        });
    
        await user.save();
    
        return res.status(200).json({
          message: "A verification link has been sent to your mail account.",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        errors: "Internal server error",
      });
    }
    
  }
};

exports.activationController = async(req, res) => {
  let date_ob = new Date();
  let { token } = req.body;
  console.log(token)
  // console.log(token);
  // token = token.substring(1)
  console.log(token)

  if (token) {
    jwt.verify(token, "duckduckgo", async(err, decoded) => {
      if (err) {
        console.log(err);
        return res.status(401).json({
          errors: "Expired link. Signup again",
        });
      } else {
        const { name, email, password } = jwt.decode(token);
        const { planDate } = date_ob;

        try {
          const user = await User.findOne({ email });
        
          if (!user) {
            return res.status(400).json({
              errors: "User is not registered",
            });
          }
        
          if (user.activation_freq >= 1) {
            return res.status(400).json({
              errors: "User is already activated",
            });
          } else {
            user.planDate = planDate;
            user.isActive = true;
            user.activation_freq = user.activation_freq + 1;
        
            await user.save();
        
            sendEmailToCustomer(email);
            sendEmailToSerpdog(email);
        
            return res.json({
              success: true,
              message: "Signup success",
            });
          }
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            errors: "Internal server error",
          });
        }
      }
    });
  } else {
    console.log("me")
    return res.json({
      message: "error happening please try again",
    });
  }
};

exports.signinController = async(req, res) => {
  let email = req.body.email
  let password = req.body.password
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      errors: firstError,
    });
  } else {

    const user = await User.findOne({email});

    try {
    
      if (!user) {
        return res.status(400).json({
          errors: "User with that email does not exist. Please signup",
        });
      }
    
      if (!user.isActive) {
        return res.status(400).json({
          errors: "Please activate your account",
        });
      }
    
      // authenticate
      if (!user.authenticate(password)) {
        return res.status(400).json({
          errors: "Email and password do not match",
        });
      }
    
      // generate a token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    
      const { _id, name, email, role, plan } = user;
    
      return res.json({
        token,
        user: { _id, name, email, role, plan },
      });
    } catch (error) {
      console.log(error)
      // Handle any potential errors
      return res.status(500).json({
        errors: "Internal server error",
      });
    }
    
  }
};

// exports.requireSignin = expressJwt({
//   secret: process.env.JWT_SECRET,
//   algorithms: ["RS256"], // req.user._id
// });
//7654321789fguk



exports.resetPasswordController = async(req, res) => {
  let { resetPasswordLink, newPassword } = req.body;
  console.log(resetPasswordLink)
  const errors = validationResult(req);
  // resetPasswordLink = resetPasswordLink.substring(1)
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      errors: firstError,
    });
  } else {
    if (resetPasswordLink) {
      jwt.verify(
        resetPasswordLink,
        "7654321789fguk",
        async(err, decoded) => {
          if (err) {
            return res.status(400).json({
              error: "Expired link. Try again",
            });
          }
          try {

            const user = await User.findOne({ resetPasswordLink });
            if (!user) {
              return res.status(400).json({ error: "User doesn't exists. Please sign up!" });
            }
          
            const updatedFields = {
              password: newPassword,
              resetPasswordLink: "",
            };
          
            _.extend(user, updatedFields);
          
            await user.save();
          
            return res.json({ message: "Great! Now you can login with your new password" });
          } catch (error) {
            return res.status(400).json({ error: "Error resetting user password" });
          }
        }
      );
    }
  }
};
