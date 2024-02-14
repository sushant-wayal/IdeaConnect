const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/ideaConnect");

const ideaSchema = mongoose.Schema({
    ideaOf: {
        type: mongoose.Schema.ObjectId,
        ref: "user"
    },
    title: String,
    categories: {
        type: Array,
        default: []
    },
    intrested: {
        type: Number,
        default: 0
    },
    intrestedUser: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "user"
        }
    ],
    media: String,
    description: String,
    steps: {
        type: Array,
        default: [],
    },
    progress: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0,
    },
    likedBy: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "user",
        }
    ],
    noOfComments: {
        type: Number,
        default: 0
    },
    comments: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "comment"
        }
    ],
    noOfShare: {
        type: Number,
        default: 0
    },
    sharedBy: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "user"
        }
    ],
    createdBy: String,
    date: {
        type: Date,
        default: Date.now,
    }
})

const ideaModel = mongoose.model("idea",ideaSchema);

module.exports = ideaModel;