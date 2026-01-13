import { Schema, model } from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs';
import crypto from "crypto";
const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "please enter your name"]
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
        lowercase: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: "Please enter a valid email"
        }
    },
    password: {
        type: String,
        required: [true, "Please provide your password"],
        minLength: [8, "Password must be at least 8 characters long"],
        validate: {
            validator: function (value) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
            },
            message: 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.'
        },
        select: false
    },
    confirm_password: {
        type: String,
        required: [true, "Please confirm your password"],
    },
    photo: { type: String },
    phone: {
        type: String,
        validate: {
            validator: function (v) {
                return /^(?:\+20|0)?1[0125][0-9]{8}$/.test(v);
            },
            message: "invalid phone number"
        }
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastlogout: {
        type: Date,
        default: null
    }
});
userSchema.pre("save", async function () {
    const user = this;
    if (user.confirm_password !== user.password) {
        throw new Error("Passwords do not match");
    }
    user.confirm_password = undefined;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 12);
    }
});
userSchema.methods.correctPassword = async function (candidatepassword, userpassword) {
    return await bcrypt.compare(candidatepassword, userpassword);
};
userSchema.methods.createPasswordResetToken = function () {
    const user = this;
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};
export default model("User", userSchema);
