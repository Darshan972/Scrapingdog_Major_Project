const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

let baseURL =
process.env.NODE_ENV === "production"
  ? "https://api.server.js" // production
  : "http://localhost:3000";

const createCheckoutSession = async(plan) => {
  const session = await stripe.checkout.sessions.create({
  success_url: `${baseURL}`,
  cancel_url: `${baseURL}/billing`,
  payment_method_types: ['card'],
  line_items: [
    {price: plan, quantity: 1},
  ],
  mode: 'subscription',
});
return session;
}


module.exports = {
  createCheckoutSession
}