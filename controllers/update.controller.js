const User = require('../models/auth.model');

const updatePlanController = async(req,res) => {
    const plan = req.body.buttonValue ;
    const id = req.body.id;
    
    console.log(plan);

    await User.findById(id , (err,user) => {
        user.plan = plan

        user.save((err) => {
            if(err)
            {
                res.json("Field Not Updated")
                console.log('Error : '+err);
            }
        })
        res.json("Field Updated")
    })
}

module.exports = updatePlanController