const jwt = require("jsonwebtoken")
const { StatusCodes } = require('http-status-codes')
const UserSchema = require("../models/userModel")
const CustomError = require('../errors/customError')
require('dotenv')

const register = async (req, res) => {
    try {
        const { username, password } = req.body
        const findUser = await UserSchema.findOne({ username })
        if (!findUser) {
            const user = await UserSchema.create({ username, password})
            const token = jwt.sign({ userID: user._id, username: user.username }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXP
            })
            res.status(StatusCodes.ACCEPTED).json({
                user: user,
                token: token
            })
        }
        else
            throw new CustomError('User already exists', StatusCodes.BAD_REQUEST)
    } catch (error) {
        res.status(error.errStatus || 400).json({ message: error.message })
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await UserSchema.findOne({ username })
        if (!user)
            throw new CustomError("User doesn't exist", StatusCodes.NOT_FOUND)
        const correctPass = await user.comparePassword(password)
        if (!correctPass)
            throw new CustomError("Incorrect password", StatusCodes.BAD_REQUEST)
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXP
        })
        res.status(StatusCodes.ACCEPTED).json({
            user: {
                username: user.username,
                joined_at: user.createdAt,
                id: user._id
            },
            token: token
        })

    } catch (error) {
        res.status(error.errStatus || 400).json({ message: error.message })
    }
}

const setAvalability = async (req, res) => {
    try {
        const { isActive, user_id } = req.body;
        const user = await UserSchema.findOne({ _id: user_id }); // Ensure req.user is populated with authenticated user's data.
        if (!user) {
            throw new CustomError("User doesn't exist", StatusCodes.NOT_FOUND);
        }

        user.isActive = isActive; // Update isActive status based on the received value.
        await user.save(); // Save the user document with the updated isActive status.
        
        res.status(StatusCodes.ACCEPTED).json({ message: "User status updated" });
    } catch (error) {
        res.status(error.errStatus || 400).json({ message: error.message })
    }
}

const getUser = async (req, res) => {
    try {
        const user = await UserSchema.findOne({ _id: req.params.user_id });
        if (!user) {
            throw new CustomError("User not found", StatusCodes.NOT_FOUND);
        }
        res.status(StatusCodes.OK).json({ user });
    }
    catch (error) {
        res.status(error.errStatus || 400).json({ message: error.message });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await UserSchema.find({});
        res.status(StatusCodes.OK).json({ users });
    }
    catch (error) {
        res.status(error.errStatus || 400).json({ message: error.message });
    }
}

module.exports = { register, login, setAvalability, getUser, getAllUsers }