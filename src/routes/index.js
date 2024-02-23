const authRoute = require('./authRoute');
const userRoute = require('./userRoute');

const route = (app) => {
    app.use('/auth', authRoute);
    app.use('/user', userRoute);
}

module.exports = route