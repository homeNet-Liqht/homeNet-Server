const authRoute = require('./authRoute')

const route = (app) => {
    app.use('/auth', authRoute);
    app.use('/', async (req, res) => {
        res.send("Hello World")
    });
}

module.exports = route