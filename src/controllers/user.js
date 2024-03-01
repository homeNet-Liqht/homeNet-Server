const User = require("../models/user");
const bcrypt = require("bcrypt");

const userController = {

    currentUser: async (req, res) => {
        try {
            const user = await User.findById(req.idDecoded);
            if (!user) res.status(404).json({
                code: 404,
                data: "Cannot find this user"
            });

            const {
                password,
                refresh_token,
                otp,
                otp_exp,
                resetPasswordExpires,
                resetPasswordToken,
                created_at,
                updated_at,
                ...others
            } = user._doc;
            return res.status(200).json({
                code: 200,
                ...others,
            });

        } catch (error) {
            res.status(500).json({
                code: 500,
                data: error.message
            })
        }
    },

    updatePassword: async (req, res) => {

        try {

            const password = req.body.newPassword;

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const updatedPassword = await User.findOneAndUpdate({
                email: req.body.email
            }, {
                $set: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpires: null
                }
            }, {
                new: true
            })
            if (!updatedPassword) return res.status(400).json({
                code: 400,
                data: "Something went wrong, try again!"
            })
            res.status(201).json({
                code: 200,
                data: "Update password successfully"
            });

        } catch (error) {
            console.error("Error updating password:", error);
            res.status(500).json({
                code: 500,
                data: error.message
            });
        }

    },

    editInformation: async (req, res) => {
        try {
            const {
                name,
                birthday,
                phone
            } = req.body;

            const user = await User.findById(req.params.uid);
            if (!user) return res.status(404).json({
                code: 404,
                data: "Cannot find this user!"
            });

            const updatedUser = await User.findByIdAndUpdate(
                req.params.uid, {
                    $set: {
                        name,
                        birthday,
                        phone
                    }
                }, {
                    new: true
                }
            );
            const {
                password,
                refresh_token,
                otp,
                otp_exp,
                resetPasswordExpires,
                resetPasswordToken,
                created_at,
                updated_at,
                ...others
              } = updatedUser._doc;
              return res.status(201).json({
                code: 200,
                data: others
              });

        } catch (error) {
            res.status(500).json({
                code: 500,
                data: error.message
            })
        }
    }
}


module.exports = {
    userController
}