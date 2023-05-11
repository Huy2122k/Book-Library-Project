const db = require("../models");
const config = require("../config/auth.config");
const Account = db.account;
const { v4: uuidv4 } = require("uuid");
const Op = db.Sequelize.Op;
const sendToEmail = require("../ultis/mail");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const roles = require("../config/roles.config");
const logger = require("../ultis/logger.js");

exports.signup = (req, res) => {
    // Save User to Database
    Account.create({
            ...req.body,
            IdentityNum: undefined,
            Password: bcrypt.hashSync(req.body.Password, 8),
            AccountID: uuidv4(),
            Status: "available",
            EmailStatus: "unconfirmed",
            IdentityStatus: "unconfirmed",
            Role: req.body.Role ? req.body.Role : roles.USER,
        })
        .then((user) => {
            const token = jwt.sign({ id: user.AccountID, role: user.Role, username: user.UserName, email: user.Email },
                config.secret, {
                    expiresIn: 86400, // 24 hours
                }
            );
            logger.info("create_account_id:" + user.AccountID);
            res.status(200).send({ info: user, accessToken: token });
        })
        .catch((err) => {
            // console.log(err);
            logger.error("Can't create new account: " + err);
            res.status(500).send({ message: "something went wrong!" });
        });
};

exports.signin = (req, res) => {
    const findQueryCondition = [
        req.body.UserName ? { UserName: req.body.UserName } : undefined,
        req.body.UserName ? { Email: req.body.UserName } : undefined,
        req.body.UserName ? { Phone: req.body.UserName } : undefined,
    ];
    Account.findOne({
            where: {
                [Op.or]: findQueryCondition,
            },
        })
        .then((user) => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }
            const passwordIsValid = bcrypt.compareSync(
                req.body.Password,
                user.dataValues.Password
            );
            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!",
                });
            }
            const token = jwt.sign({ id: user.AccountID, role: user.Role, username: user.UserName, email: user.Email },
                config.secret, {
                    expiresIn: 86400, // 24 hours
                }
            );
            // set the expiry time as an hour after the current time
            const now = new Date()
            const expiresAt = new Date(+now + 3600 * 1000)
            console.log("------------------cookies saved-------------------");
            res.cookie("token", token, { expires: expiresAt, httpOnly: true })
            res.status(200).send({ info: user, accessToken: token });
            logger.info("login_account_id:" + user.AccountID);
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
            logger.error("Can't loggin: " + err);
        });
};

exports.changePassword = async(req, res) => {
    const findQueryCondition = [
        req.body.UserName ? { UserName: req.body.UserName } : undefined,
        req.body.UserName ? { Email: req.body.UserName } : undefined,
        req.body.UserName ? { Phone: req.body.UserName } : undefined,
    ];
    try {
        const user = await Account.findOne({
            where: {
                [Op.or]: findQueryCondition,
            },
        });
        if (!user) {
            return res.status(200).send({ message: "User Not found." });
        }
        const passwordIsValid = bcrypt.compareSync(
            req.body.Password,
            user.Password
        );
        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!",
            });
        }

        user.Password = bcrypt.hashSync(req.body.NewPassword, 8);
        await user.save();
        res.status(200).send({ message: "Your Password has been updated!" });
        logger.info("change_pw_accountId:" + user.AccountID);
    } catch (err) {
        res.status(500).send({ message: err.message });
        logger.error("Can't change password: " + err);
    }
};

exports.resetPassword = async(req, res) => {
    const findQueryCondition = [
        req.body.UserName ? { UserName: req.body.UserName } : undefined,
        req.body.UserName ? { Email: req.body.UserName } : undefined,
        req.body.UserName ? { Phone: req.body.UserName } : undefined,
    ];
    try {
        const user = await Account.findOne({
            where: {
                [Op.or]: findQueryCondition,
            },
        });
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }
        const resetPassWord = (Math.random() + 1).toString(36).substring(2);
        await sendToEmail(
            user.Email,
            "Reset Password",
            `<h1>Welcome</h1><p>Your new password is: <b>${resetPassWord} </b> </p>`,
            async(error, info) => {
                if (!error) {
                    console.log("Email sent: " + info.response);
                    user.Password = bcrypt.hashSync(resetPassWord, 8);
                    await user.save();
                    res.status(200).send({
                        message: "Your new password has been sent to your email!",
                    });

                    logger.info(
                        "reset_pw_accountId:" + user.AccountID
                    );
                    return;
                } else {
                    console.log(error);
                    res.status(404).send({ message: "Can not send to your email!" });
                    logger.error("Can't reset password: " + err);
                    return false;
                }
            }
        );
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};