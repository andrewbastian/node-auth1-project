const express = require("express")
const bcrypt = require("bcryptjs")
const Users = require("../users/users-model")

const router = express.Router()

router.post("/register", async (req, res, next) => {
	try {
		const { username } = req.body
		const user = await Users.findBy({ username }).first()

		if (user) {
			return res.status(409).json({
				message: "Username is already taken",
			})
		}

		res.status(201).json(await Users.add(req.body))
	} catch(err) {
		next(err)
	}
})
//Part I code: w/o tokens
// router.post("/login", async (req, res, next) => {
// 	try {
// 		const { username, password } = req.body
// 		const user = await Users.findBy({ username }).first()

// 		// since bcrypt hashes generate different results due to the salting,
// 		// we rely on the magic internals to compare hashes rather than doing it
// 		// manually with "!=="
// 		const passwordValid = await bcrypt.compare(password, user.password)

// 		if (!user || !passwordValid) {
// 			return res.status(401).json({
// 				message: "Invalid Credentials",
// 			})
// 		}

// 		res.json({
// 			message: `Welcome ${user.username}!`,
// 		})
// 	} catch(err) {
// 		next(err)
// 	}
// })

//Part II w tokens:

router.post("/login", async(req, res, next) => {
    try {
        const {
            username,
            password
        } = req.body
        const user = await Users.findBy({
            username
        }).first()
        const passwordValid = await bcrypt.compare(password, user.password)

        if (!user || !passwordValid) {
            return res.status(401).json({
                message: "Invalid Credentials",
            })
        }
        req.session.user = user

        res.json({
            message: `Welcome ${user.username}!`,
        })
    } catch (err) {
        next(err)
    }
})

router.get("/logout", restrict(), (req, res, next) => {
	// this will delete the session in the database and try to expire the cookie,
	// though it's ultimately up to the client if they delete the cookie or not.
	// but it becomes useless to them once the session is deleted server-side.
	req.session.destroy((err) => {
		if (err) {
			next(err)
		} else {
			res.json({
				message: "Successfully logged out",
			})
		}
	})
})

module.exports = router
