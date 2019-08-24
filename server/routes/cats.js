var express = require('express')
var router = express.Router()

const cats = {
    cats: [
        {
            id: 44,
            name: 'Lanta',
            photo:
                'https://s3.amazonaws.com/bitmakerhq/resources/web-development/bitkittens/lanta.jpg',
            fun_fact: 'Likes to pretend she is a cat',
            created_at: '2016-06-30T20:11:32.647Z',
            updated_at: '2016-06-30T20:11:32.647Z'
        },
        {
            id: 41,
            name: 'Timone',
            photo:
                'https://s3.amazonaws.com/bitmakerhq/resources/web-development/bitkittens/timone.jpg',
            fun_fact: 'He likes to dress fancy',
            created_at: '2016-06-30T20:11:32.559Z',
            updated_at: '2016-06-30T20:11:32.559Z'
        },
        {
            id: 47,
            name: 'Sahara',
            photo:
                'https://s3.amazonaws.com/bitmakerhq/resources/web-development/bitkittens/sahara.jpg',
            fun_fact: 'likes laser pointers and is a nap enthusiast',
            created_at: '2016-06-30T20:11:32.775Z',
            updated_at: '2016-06-30T20:11:32.775Z'
        }
    ]
}
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*') // update to match the domain you will make the request from
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
})

router.get('/', (req, res) => res.json(cats))

module.exports = router
