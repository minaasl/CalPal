const express = require("express")
const app = express();
const https=require('https')
var bodyParser = require("body-parser")
const mongoose = require("mongoose");
const bcrypt = require ("bcrypt");
const cookieSession = require("cookie-session");

const ejs = require('ejs')
const port = 3002;

const User = require("./model/User");



app.set('view engine', 'ejs')
var path = require("path")
const {Router, response} = require("express");

app.use(bodyParser.urlencoded({extended: true}))

app.use(bodyParser.json())
const dbConfig = require('./config/database.config.js');
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Database Connected Successfully!!");
}).catch(err => {
    console.log('Could not connect to the database');
    process.exit();
});


app.use("/", require("./routes/root"));
app.use("/blogs", require("./routes/blogs"));
app.use("/reviews", require("./routes/reviews"));
app.use("/categories", require("./routes/categories"));
app.use("/assets", express.static(__dirname+"/assets"));
app.use('/js',express.static(__dirname +'/js'));




app.get("/",((req, res) => {
    res.sendFile(__dirname+"index.html")
}))

app
    .get("/", (req, res) => {
        res.render("index");
    })
    .get("/login", (req, res) => {
        res.render("login");
    })
    .get("/register", (req, res) => {
        res.render("register");
    })



app
    .post("/login", async (req, res) => {
        const { email, password } = req.body;

        // check for missing filds
        if (!email || !password) return res.send("Please enter all the fields");

        const doesUserExits = await User.findOne({ email });

        if (!doesUserExits) return res.send("invalid username or password");

        const doesPasswordMatch = await bcrypt.compare(
            password,
            doesUserExits.password
        );

        if (!doesPasswordMatch) return res.send("invalid useranme or password");

        // else he\s logged in
        req.session.user = {
            email,
        };

        res.redirect("/");
    })

    .post("/register", async (req, res) => {
        const { email, password } = req.body;

        // check for missing filds
        if (!email || !password) return res.send("Please enter all the fields");

        const doesUserExitsAlreay = await User.findOne({ email });

        if (doesUserExitsAlreay) return res.send("A user with that email already exits please try another one!");

        // lets hash the password
        const hashedPassword = await bcrypt.hash(password, 12);
        const latestUser = new User({ email, password: hashedPassword });

        latestUser
            .save()
            .then(() => {
                res.redirect("/");
            })
            .catch((err) => console.log(err));
    });

//logout

// app.get("/logout", authenticateUser, (req, res) => {
//     req.session.user = null;
//     res.redirect("/login");
// });

// server config
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started listening on port: ${PORT}`);
});



app.post("/",((req, res) => {
    let cityName = req.body.city
    let key = "4df015897fa37bd9eced801f518cc5e7"
    let url = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + key + "&units=metric&mode=json"
    https.get(url, function (response) {
        response.on('data', data=>{
            //console.log(data)
            let a = JSON.parse(data)
            let temp=a.main.temp
            let cond=a.weather[0].description
            res.send("weather in "+cityName+"is: "+cond+""+temp+" degrees above celcius")
        })
    })
    // res.send(response)
}))

app.listen(port, () =>
    console.log(`App listening at http://localhost:${port}`)
);


