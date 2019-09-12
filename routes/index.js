const express = require('express')
const router = express.Router()
const quizzes = require('./quizzes')

router.use('/quizzes', quizzes)
module.exports = router
