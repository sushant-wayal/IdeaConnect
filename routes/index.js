var express = require('express');
var router = express.Router();
const userModel = require("./users");
const ideaModel = require("./ideas");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");

passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res) {
	const authFailed = req.flash("error")[0];
	let msg = "";
	if (authFailed) {
		msg = "Incorrect Username or Password. Try Again";
	}
	res.render('index',{
		message: msg,
	})
});

router.get("/deleteAll",async function(req,res) {
	await userModel.deleteMany({});
	await ideaModel.deleteMany({});
	res.send("done");
})

router.get("/reset/:username",async function(req,res) {
	const user = await userModel.findOne({
		username: req.params.username,
	})
	user.ideas.forEach( async ideaId => {
		const idea = await ideaModel.findById(ideaId);
		idea.intrested = 0;
		idea.intrestedUser = [];
		await idea.save();
	})
	res.send("done");
})

router.get("/profile/:username",isLoggedIn, async function(req,res) {
	const user = await userModel.findOne({
		username : req.params.username
	});
	const onlineUser = await userModel.findOne({
		username: req.user.username,
	});
	let allInfo = [];
	for (ideaId of user.ideas) {
		const currIdea = await ideaModel.findById(ideaId);
		let intrested = false;
		for (let intrestedUser of currIdea.intrestedUser) {
			if (intrestedUser.toString() == onlineUser._id.toString()) {
				intrested = true;
				break;
			}
		}
		allInfo.push([currIdea,intrested]);
	}
	let sameUser = false;
	if (req.params.username == req.user.username) {
		sameUser = true;
	}
	let alreadyFollowed = false;
	if (!sameUser) {
		for (let following of onlineUser.followingList) {
			if (following.toString() == user._id.toString()) {
				alreadyFollowed = true;
				break;
			}
		}
	}
	if (user) {
		res.render("profile",{
			user: user,
			onlineUserId: onlineUser._id,
			sameUser: sameUser,
			allInfo: allInfo,
			alreadyFollowed: alreadyFollowed,
		});
	}
	else {
		res.send("No User Found");
	}
});

router.get("/api/ideas/:ideaId",async function(req,res) {
	let ideaId = req.params.ideaId;
	let idea = await ideaModel.findById(ideaId);
	res.json(idea);
})

router.get("/createNewAccount",function(req,res){
	let registerProfilePhoto = "defaultOther.jpg";
	const msgs = req.flash("registerProfilePhoto");
	if (msgs.length > 0) {
		registerProfilePhoto = msgs[0];
		req.flash("registerProfilePhotoforProfile");
		req.flash("registerProfilePhotoforProfile",registerProfilePhoto);
	}
	res.render("createNewAccount", {
		registerProfilePhoto,
	});
})

router.post("/registerProfilePhoto", upload.single("file"),function(req,res) {
	req.flash("registerProfilePhoto",req.file.filename);
	res.redirect("/createNewAccount");
})

router.post("/createNewAccount",function(req,res){
	let defaultProfileImage = "defaultOther.jpg";
	if (req.body.gender == "male") {
		defaultProfileImage = "defaultMale.jpeg";
	}
	else if (req.body.gender == "female") {
		defaultProfileImage = "defaultFemale.jpeg";
	}
	let profileImage = defaultProfileImage;
	const msgs = req.flash("registerProfilePhotoforProfile");
	if (msgs.length > 0) {
		profileImage = msgs[msgs.length-1];
	}
	let firstName = req.body.firstname;
	firstName = firstName.charAt(0).toUpperCase()+firstName.slice(1);
	let lastName = "";
	if (req.body.lastname) {
		lastName = req.body.lastname;
		lastName = lastName.charAt(0).toUpperCase()+lastName.slice(1);
	}
	let userData = new userModel({
		username: req.body.username,
		firstName,
		lastName,
		contryCode: req.body.countryCode,
		phoneNumber: req.body.phoneNumber,
		email: req.body.email,
		DOB: req.body.dob,
		gender: req.body.gender,
		secret: req.body.secret,
		defaultProfileImage,
		profileImage,
		followers: 0,
		following: 0,
		noOfIdeas: 0
	});
	userModel.register(userData, req.body.password)
	.then(function(registereduser) {
		passport.authenticate("local")(req,res,function(){
			res.redirect('/ideas');
		})
	})
})

router.post("/login", passport.authenticate("local",{
	successRedirect: "/ideas",
	failureRedirect: '/',
	failureFlash: true,
}),function(req,res){})

router.get("/logout", function(req,res,next) {
	req.logout(function(err){
		if (err) return next(err);
		res.cookie("signined",false);
		res.redirect('/');
	})
})

function isLoggedIn(req,res,next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

router.get("/ideas",isLoggedIn,async function(req,res) {
	const currUser = await userModel.findOne({
		username: req.user.username,
	});
	let allInfo = [];
	for (let following of currUser.followingList) {
		const followedUser = await userModel.findById(following);
		for (let idea of followedUser.ideas) {
			const currIdea = await ideaModel.findById(idea);
			const ideaOf = await userModel.findById(currIdea.ideaOf);
			let intrested = false;
			for (let intrestedUser of currIdea.intrestedUser) {
				if (intrestedUser.toString() == currUser._id.toString()) {
					intrested = true;
					break;
				}
			}
			allInfo.push([currIdea,ideaOf.profileImage,intrested]);
		}
	}
	allInfo.sort((a,b) => b[0].date-a[0].date);
	res.render("ideas",{
		user: currUser,
		allInfo: allInfo,
	});
})

router.get("/createNewIdea",function(req,res){
	let ideaMedia;
	const msgs = req.flash("addMedia");
	if (msgs.length > 0) {
		ideaMedia = msgs[0];
		req.flash("addMediaForIdea");
		req.flash("addMediaForIdea",ideaMedia);
	}
	res.render("createNewIdea",{
		ideaMedia: ideaMedia,
	});
})


router.post("/addMedia", upload.single("file"), function (req,res) {
	req.flash("addMedia",req.file.filename);
	res.redirect("/createNewIdea");
})

router.post("/createNewIdea",async function(req,res){
	let steps = [];
	let categories = [];
	let progress = 0;
	for (property in req.body) {
		if (property == "startStepInput" || property == "completeStepInput" || property.startsWith("stepInput")) {
			steps.push(req.body[property]);
		}
		else if (property.startsWith("categoryInput")) {
			categories.push(req.body[property]);
		}
		else if (property.startsWith("checkbox") || property == "startCheckbox" || property == "completeCheckbox") {
			if (req.body[property] == "on") {
				progress++;
			}
		}
	}
	let msgs = req.flash("addMediaForIdea");
	const currUser = await userModel.findOne({
		username: req.user.username,
	});
	const newIdea =  await ideaModel.create({
		ideaOf: currUser._id,
		title: req.body.ideatitle,
		categories: categories,
		media: msgs[msgs.length-1],
		description: req.body.idea,
		summary: req.body.ideasummary,
		steps: steps,
		progress: progress,
		createdBy: currUser.username,
	});
	currUser.ideas.unshift(newIdea._id);
	currUser.noOfIdeas += 1;
	newIdea.ideaOf = currUser._id;
	await currUser.save();
	await newIdea.save();
	res.redirect(`/profile/${req.user.username}`);
})

router.get("/follow",async function(req,res) {
	const userfollowing = await userModel.findOne({
		username: req.user.username,
	});
	userfollowing.following += 1;
	const userfollowed = await userModel.findOne({
		username: req.query.username,
	});
	userfollowed.followers += 1;
	userfollowing.followingList.push(userfollowed._id);
	userfollowed.followerList.push(userfollowing._id);
	await userfollowing.save();
	await userfollowed.save();
	res.redirect(`/profile/${req.query.username}`);
})

router.get("/uploadImage",function(req,res) {
	res.render("uploadImage");
})

router.post("/uploadProfilePhoto", upload.single("file"),async function(req,res,next){
	if (!req.file) {
		return res.status(404).send("No files were uploaded");
	}
	const currUser = await userModel.findOne({
		username: req.user.username,
	});
	currUser.profileImage = req.file.filename;
	await currUser.save();
	res.redirect(`/profile/${req.user.username}`);
})

router.get("/contactUs",function(req,res) {
	res.send("Contact Us");
})

router.get("/about",function(req,res) {
	res.send("About");
})

router.get("/privacy",function(req,res) {
	res.send("Privacy");
})

router.get("/api/updateProgress/:ideaId/:updatedProgress",async function(req,res){
	const idea = await ideaModel.findById(req.params.ideaId);
	idea.progress = req.params.updatedProgress,
	idea.save();
	res.json("done");
})

router.get("/makeIntrest/:userId/:ideaId", async function(req,res) {
	const idea = await ideaModel.findById(req.params.ideaId);
	idea.intrestedUser.push(req.params.userId);
	idea.intrested++;
	await idea.save();
	res.redirect("/ideas");
})

router.get("/api/intrestedUser/:ideaId", async function(req,res) {
	const idea = await ideaModel.findById(req.params.ideaId);
	let intrestedUser = [];
	for (let userId of idea.intrestedUser) {
		const user = await userModel.findById(userId);
		intrestedUser.push(user);
	}
	res.json(intrestedUser);
})

router.get("/api/isLiked/:userId/:ideaId", async function(req,res) {
	const idea = await ideaModel.findById(req.params.ideaId);
	for (let userId of idea.likedBy) {
		if (userId.toString() == req.params.userId.toString()) {
			return res.json(true);
		}
	}
	res.json(false);
})

router.get("/api/like/:userId/:ideaId",async function(req,res) {
	const idea = await ideaModel.findById(req.params.ideaId);
	idea.likedBy.push(req.params.userId);
	idea.likes++;
	await idea.save();
	res.json("done");
})

router.get("/api/likedBy/:ideaId", async function(req,res) {
	const idea = await ideaModel.findById(req.params.ideaId);
	let likedBy = [];
	for (let userId of idea.likedBy) {
		const user = await userModel.findById(userId);
		likedBy.push(user);
	}
	res.json(likedBy);
})

module.exports = router;
