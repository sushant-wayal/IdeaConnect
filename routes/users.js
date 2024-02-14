const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/ideaConnect");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        unique: false
    },
    passowrd: String,
    firstName: String,
    lastName: String,
    conturyCode: String,
    phoneNumber: String,
    email: String,
    DOB: String,
    gender: String,
    secret: String,
    defaultProfileImage: {
        type: String,
        default: "defaultOther.jpg",
    },
    profileImage: {
        type: String,
        default: "defaultOther.jpg",
    },
    followers: Number,
    following: Number,
    noOfIdeas: Number,
    followerList: {
        type: Array,
        default: [],
    },
    followingList: {
        type: Array,
        default: [],
    },
    ideas: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "idea",
        }
    ]
})

userSchema.plugin(plm);

module.exports = mongoose.model("user",userSchema);