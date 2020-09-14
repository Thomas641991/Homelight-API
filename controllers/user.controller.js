const User = require('../models/user.model');
const UserEvent = require('../models/user_event.model')
const EventController = require('./event.controller')
const bcrypt = require('bcrypt')
const auth = require('../auth/auth')

module.exports = {
	async login(req, res, next) {
		const user = await User.findOne({email: req.body.email});

		if (user !== null) {
			if (await comparePassword(req.body.password, user.password)) {
				const updatedUser = await User.findOneAndUpdate({email: user.email}, {signedIn: true}, {new: true})
				UserEvent.create(EventController.userEvent('user.login.succeeded', updatedUser));
				res.json({token: await auth.generateAccessToken(user.email)}).status(200);
			} else {
				UserEvent.create(EventController.userEvent('user.login.failed', user));
				res.sendStatus(401);
			}
		} else {
			console.log('User was not found');
			res.sendStatus(500);
		}
	},

	async register(req, res, next) {
		const hashedPassword = await hashPassword(req.body.password);
		const checkUser = await User.findOne({email: req.body.email});

		if (checkUser === null) {
			User.create({email: req.body.email, password: hashedPassword, signedIn: true}).then((user) => {
				UserEvent.create(EventController.userEvent('user.registered', user))
				res.json({token: auth.generateAccessToken(user.email)}).send(200);
			}).catch((err) => {
				console.log(console.log(err))
				res.sendStatus(500)
			})
		} else {
			console.error('User already exists: ' + checkUser)
			res.sendStatus(500)
		}
	},

	async signOut(req, res, next) {
		const user = await User.findOne({email: req.body.email});

		if (user !== null) {
			const signedOutUser = await User.findOneAndUpdate({email: user.email}, {signedIn: false}, {new: true})
			UserEvent.create(EventController.userEvent('user.signOut', signedOutUser));
			res.sendStatus(200);
		} else {
			res.sendStatus(500);
		}
	}
}

async function hashPassword(plaintextPassword) {
	const saltRounds = 10;
	return await bcrypt.hash(plaintextPassword, saltRounds);
}

async function comparePassword(plaintextPassword, hash) {
	return bcrypt.compare(plaintextPassword, hash);
}
