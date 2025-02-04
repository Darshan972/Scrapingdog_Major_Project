const express = require('express')
const router = express.Router()

const updatePlanController = require('../controllers/update.controller.js')

router.post('/update' , updatePlanController);

module.exports = router