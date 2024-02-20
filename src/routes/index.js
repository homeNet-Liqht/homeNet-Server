const authRoute = require('./authRoute')

const route = (app) => {
    app.use('/auth', authRoute);
}

module.exports = route