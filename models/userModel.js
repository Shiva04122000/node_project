const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const Schema = mongoose.Schema;
const emailValidator = require("email-validator")
const jwt=require("jsonwebtoken")

const userSchema = new Schema({
    name: {
        type: "string",
        require: true,
    },
    username: {
        type: "string",
        require: true,
        unique: true
    },
    email: {
        type: "string",
        require: true,
        unique: true,
        validate: function () {
            return emailValidator.validate(this.email)
        }
    },
    password: {
        type: "string",
        require: true,
    },
    confirmPassword: {
        type: "string",
        require: true,
        validate: function () {
            return this.password == this.confirmPassword;
        }
    },
    tokens:[{
        token:{
            type: "string",
        require: true,
        }
    }]
})

userSchema.methods.generateAuthToken= async function(){
    try{
        // console.log(this._id);
        const token=jwt.sign({_id:this._id},process.env.SECRET_KEY);
        // console.log(token)
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    }catch(error){
        resizeBy.send("the error part ", error);
        console.log("the error part ", error);
    }
}


userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        console.log(`the current password is ${this.password}`)
        this.password = await bcrypt.hash(this.password, 10);
        console.log(`the hashed password is ${this.password}`)
    }
    this.confirmPassword = undefined

    next();
})

module.exports = mongoose.model("userModel", userSchema);