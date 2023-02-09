const UserModel = require('../models/userModel')

module.exports = {
    adminSession: (req, res, next) => {
        if (req.session.adminLogin) {
            next()
        } else {
            res.redirect('/admin')
        }
    },
    userBlocked: async (req, res, next) => {
        let id = req.session.userId
        if (id) {
            let user = await UserModel.findById({ _id: id })
            console.log(user.status);
            if (user.status) {
                req.session.destroy()
                res.redirect('/')
            } else {
                next()
            }
        } else {
            next()
        }
    },
}