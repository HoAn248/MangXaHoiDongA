//-_=+
const cookieParser = require('cookie-parser')
let express = require('express')
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose')
const url = "mongodb+srv://hoducan24082002User:123123123@cluster0.is2ds.mongodb.net/Users?retryWrites=true&w=majority"
let CLIENT_ID = '280278390329-j8tbcuu85ntn9sihn4t71499ed3m6kar.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);
let app = express()
const PORT = process.env.PORT || 3000
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log('kết nối');
})
const schema = mongoose.Schema
const khungUsers = new schema({
    name: {
        type: String,
        trim: true,
        default: ''
    },
    firstName: {
        type: String,
        trim: true,
        default: ''
    },
    lastName: {
        type: String,
        trim: true,
        default: ''
    },
    idSv: {
        type: String,
        trim: true,
        default: ''
    },
    dateOfBirth: {
        type: String,
        trim: true,
        default: ''
    },
    classSv: {
        type: String,
        trim: true,
        default: ''
    },
    homeTown: {
        type: String,
        trim: true,
        default: ''
    },
    phoneNumber: {
        type: Number,
        trim: true,
        default: ''
    },
    rank: {
        type: String,
        trim: true,
        default: ''
    },
    gender: {
        type: String,
        trim: true,
        default: ''
    },
    avt: {
        type: String,
        trim: true,
        default: ''
    },
    email: {
        type: String,
        trim: true,
        default: ''
    },
    typeEmail: {
        type: String,
        trim: true,
        default: ''
    }
},
    {
        collection: 'Users'
    })
const moduleMongoose = mongoose.model('Users', khungUsers)
const khungMessage = new schema({
    name: String
},
    {
        collection: 'Messages'
    })
const moduleMongooseMessage = mongoose.model('Messages', khungMessage)
moduleMongooseMessage.find({})
.then(e=>{
    // console.log(e);
})

app.set('view engine', 'ejs')
app.use(express.json())
app.use(cookieParser())
app.get('/', (req, res) => {
    res.render('index')
})
app.get('/login', (req, res) => {
    res.render('login')
})
function cutEmail(email) {
    console.log(email);
    let iEmail = email.indexOf('@')
    let id = ''
    for (let i = 0; i < iEmail; i++) {
        id += email[i]
    }

    return id.slice(-5)
}
app.post('/login', (req, res) => {
    let token = req.body.token
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        return payload
    }
    verify()
        .then((data) => {
            if (data.hd === 'donga.edu.vn') {
                moduleMongoose.find({ email: data.email })
                    .then(user => {
                        if (user.length === 0) {
                            moduleMongoose.create({
                                name: data.name,
                                firstName: data.given_name,
                                lastName: data.family_name,
                                idSv: cutEmail(data.email),
                                avt: data.picture,
                                email: data.email,
                                typeEmail: data.hd
                            })
                        }
                        res.cookie('session-token', token)
                        res.send('success')
                    })
            } else {
                res.send('lose')
            }

        })
        .catch(console.error);
})
app.get('/home', checkAuthenticated, (req, res) => {
    let user = req.user
    res.render('home', {user})
})

app.get('/logout', (req, res) => {
    res.clearCookie('session-token')
    // chuyển hướng
    res.redirect('/login')
})
function checkAuthenticated(req, res, next) {
    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
        user.hd = payload.hd;
    }
    verify()
        .then(() => {
            req.user = user;
            next();
        })
        .catch(err => {
            res.redirect('/login')
        })

}
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
/*
<!-- <div class="users">
                <img src="https://lh3.googleusercontent.com/a-/AOh14Gg3eg9Uv5PxX6MhTxwf7dCuesTdFu7ffeiagvj5=s96-c"
                    alt="">
                <span class="span-L">Hello</span>
                <p class="name-L">Hồ Đức An</p>
            </div>
            <div class="users users-R">
                <span class="span-R">Hello</span>
                <img src="https://lh3.googleusercontent.com/a-/AOh14Gg3eg9Uv5PxX6MhTxwf7dCuesTdFu7ffeiagvj5=s96-c"
                    alt="">
                <p class="name-R">Hồ Đức An</p>
            </div> -->
*/