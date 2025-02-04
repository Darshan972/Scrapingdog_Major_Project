const express = require("express");
const router = express.Router();
const User = require("../models/auth.model")
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Stripe = require("./../controllers/stripe.controller");
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

const AWS = require("aws-sdk");
const getValidity = () => {
  let current = new Date();
  current.setMonth(current.getMonth() + 1, current.getDate());
  dt = new Date(current);
  
  let firstDate = new Date();
      secondDate = dt
      timeDifference = Math.abs(secondDate.getTime() - firstDate.getTime());
    
  let differenceDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
  
  return differenceDays;
}

let api_key;
const fulfillOrder = async(session) => {
  try {
    let date_ob = new Date();
    console.log("Fullfilling order");
    console.log(session)
    console.log(api_key)

    let user;

    if(api_key)
    {
      user = await User.findById(api_key);
    }
    else{
      let email = session.customer_email
      user = await User.findOne({
        email
      })
    }

    if(session.amount_paid == 3000)
    {
      if(user.plan)
      {
        user.validity = getValidity()+4;
        user.planDate = date_ob;
        user.quota = 160000;
        user.requests = 0;
        user.requestsLeft = 160000;
        user.concurrency = 10;
        user.plan = "LITE"
        user.payment_email = session.customer_email
        // sendEmailToCustomer(user.email, session.customer_name, user.plan, session.invoice_pdf);
      }
    }
    else if(session.amount_paid == 10000)
    {
      if(user.plan)
      {
        user.validity = getValidity()+4;
        user.planDate = date_ob;
        user.quota = 800000;
        user.requests = 0;
        user.requestsLeft = 800000;
        user.concurrency = 20;
        user.plan = "STANDARD"
        user.payment_email = session.customer_email
        // sendEmailToCustomer(user.email, session.customer_name, user.plan, session.invoice_pdf);
      }
    }
    else if(session.amount_paid == 20000)
    {
      if(user.plan)
      {
        user.validity = getValidity()+4;
        user.planDate = date_ob;
        user.quota = 2600000;
        user.requests = 0;
        user.requestsLeft = 2600000;
        user.concurrency = 50;
        user.plan = "PRO"
        user.payment_email = session.customer_email
        // sendEmailToCustomer(user.email, session.customer_name, user.plan, session.invoice_pdf);
      }
    }

    await user.save();

    api_key = "";
  } catch (e) {
    console.log("Error : " + e);
  }

    
  }


router.post("/checkout", async (req, res) => {
  const product = req.body.btnValue;
  api_key = req.body.api_key
  try {
    const session = await Stripe.createCheckoutSession(product);
    return res.json(session);
  } catch (e) {
    console.log(e);
    res.status(400);
    return res.send({
      error: {
        message: e.message,
      },
    });
  }
});




module.exports = router;
