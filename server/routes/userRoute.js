const express = require('express')
const router = express.Router()
const {
    register,
    login,
    setAvalability,
    getUser,
    getAllUsers
} = require('../controllers/authController')

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/set-avalability').post(setAvalability)
router.route('/get-user/:user_id').get(getUser);
router.route('/all-users').get(getAllUsers)


module.exports = router