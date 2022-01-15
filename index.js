var exphbs = require('express-handlebars')
const express = require('express')
const path = require('path')
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var morgan = require("morgan");
var firebase = require("firebase");
const app = express()

const session_time = 1000 * 60 * 60 * 24 * 1;

const firebaseConfig = {
  apiKey: "AIzaSyCWfHTsaNxXFlbyTSnGV8vuyb7Ar-WyT1M",
  authDomain: "form-generator-ab5b5.firebaseapp.com",
  projectId: "form-generator-ab5b5",
  storageBucket: "form-generator-ab5b5.appspot.com",
  messagingSenderId: "1013551816709",
  appId: "1:1013551816709:web:edeb18fed25dedcfc3bc6c"
};
const port = process.env.PORT || 5000;

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });

//retrieve
var user_n, pass, users = [{ id: null, name: null, password: null }];
var docRef = db.collection('admin').doc('password').collection('credentials').onSnapshot((querySnapshot) => {
  querySnapshot.forEach((doc) => {
    user_n = doc.data().username,
      pass = doc.data().password;
    console.log(user_n, pass);
    users[0].id = 1;
    users[0].name = user_n;
    users[0].password = pass;
  });
});


app.use(morgan("dev"));

app.use(bodyParser.urlencoded({ extended: true }));


app.use(cookieParser());

app.use(
  session({
    name: 'sid',
    resave: false,
    saveUninitialized: false,
    secret: 'sid_the_sloth',
    cookie: {
      maxAge: session_time,
      sameSite: true,
      secure: false,
    },

  })
);

const redirectLogin = (req, res, next) => {
  if (!req.session.userId)
    res.redirect("/")

  else
    next();

}

const redirectHome = (req, res, next) => {
  if (req.session.userId)
    res.redirect("/form")

  else
    next();

}

app.get('/', redirectHome, (req, res) => {
  const { userId } = req.session;
  console.log(req.session);
  if (userId)
    window.location.href = "/form";
  else
    res.render('data', {
      style: 'data.css'
    });
})

app.get('/form', redirectLogin, (req, res) => {
  res.render('form', {
    style: 'form.css',
  });
})
app.get('/newForm', redirectLogin, (req, res) => {
  res.render('createNew', {
    style: 'createForm.css'
  });
})
app.get('/userForm', (req, res) => {
  res.render('user_form', {
    style: 'newForm.css'
  });
})
app.get('/response', (req, res) => {
  res.render('response', {
    style: 'newForm.css'
  });
})
app.get('/view_response', (req, res) => {
  res.render('view_response', {
    style: 'newForm.css'
  });
})

app.get('/view_queresponse', (req, res) => {
  res.render('view_queresponse', {
    style: 'newForm.css',
  })
})

app.post('/', redirectHome, (req, res) => {
  const { name, password } = req.body;
  console.log(name, password);
  if (name && password) {
    console.log(name, password);
    const user = users.find(user => user.name === name && user.password === password)
    if (user) {
      req.session.userId = user.id;
      res.redirect('/form');
    }
    else
      res.redirect('/');
  }

})
app.post('/logout', redirectLogin, (req, res) => {
  req.session.destroy(err => {
    if (err)//error destroying cookie
      return res.redirect('/');
    res.clearCookie('sid');
    res.redirect('/');
  })


})
module.exports = app

app.engine('handlebars',exphbs());
app.set('view engine','handlebars');

app.use(express.static(path.join(__dirname,"static")))

app.listen(port, () => {
    console.log(`Example app listening at ${port}`)
})
