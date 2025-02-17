const mongoose = require('mongoose');
const crypto = require('crypto');

// user schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true
    },
    payment_email: {
      type: String,
      trim: true,
      required: false,
      unique: true,
      lowercase: true
    },
    name: {
      type: String,
      trim: true,
      required: true
    },
    hashed_password: {
      type: String,
      required: true
    },
    isActive: {
    type: Boolean,
    default: false,
    required: true
    },
    activation_freq: {
      type: Number,
      default: 0
    },
    registrationToken: {
      type: String,
      default: null,
    },
    plan:{
      type: String,
      default : "free"
    },
    planDate:{
    type: Date,
    default: null
    },
    quota: {
    type: Number,
    default: 1000,
    required: true
    },
    requests:{
    type: Number,
    default: 0
    },
    requestsLeft: {
      type: Number,
      default: 1000
    },
    apiCallsPerDay: {
    type: Number,
    default: 0
    },
    concurrency:{
      type: Number,
      default: 5
    },
    validity : {
      type: Number,
      default : 30
    },
    usageArray: {
      type : [{
        date: String,
        req : Number 
      }],
      default: []
    },
    salt: String,
    resetPasswordLink: {
      data: String,
    }
  },
  {
    timestamps: true
  }
);


userSchema.pre('save', async function (next) {
  this.apiKey = this._id;
  next();
});


// virtual
userSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// methods
userSchema.methods = {
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword: function(password) {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  },

  makeSalt: function() {
    return Math.round(new Date().valueOf() * Math.random()) + '';
  }
};

module.exports = mongoose.model('User', userSchema);
