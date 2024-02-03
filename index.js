const path = require('path');
const file = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

//express-session
const session = require('express-session')
const flash = require('connect-flash');
const { log } = require('console');

const PORT = 5000;
const filePath = path.join(__dirname, "data.json")
const app = express();
const formDataParser = bodyParser.urlencoded({ extended: false})

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', 'public');
app.use(express.static(path.join(__dirname, "public")));

//session
app.use(session({
    secret: 'adisawant',
    resave : false,
    saveUninitialized: false
}));
app.use(flash());

app.get('/', (req, res) => {
    req.flash('message', 'Please log in to access the application.'); // Set flash message
    res.redirect('/login'); // Redirect to login page
  });
app.get("/add", (req, res)=>{
    res.render('add');
})
app.get("/index", (req, res)=>{
    res.render('index');
})
app.post("/adddata", formDataParser, (req, res)=>{
    let formData = req.body;
    file.readFile(filePath, (err, data)=>{
        if(err) throw err;
        data = JSON.parse(data);
        // let dateTime = new Date().toLocaleString();
        // formData['date-time'] = dateTime;
        data.push(formData);
        file.writeFile(filePath,JSON.stringify(data),(err)=>{
            if(err) throw err;
            res.render('add', {"status": "ok"});
        })
    })
})

app.get("/display", (req, res)=>{
    file.readFile(filePath, (err, data)=>{
        if(err) throw err;
        res.render('display', {expense: JSON.parse(data)})
    })
})

app.get('/login', (req, res) => {
    res.render('login', { message: req.flash('error')[0] });
  });
  
  app.get('/register', (req, res) => {
    res.render('register', { message: req.flash('error') });
  });
  

//login creaditionals
app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Retrieve user data from the users.json file or any other data source
    const users = require('./users.json');
  
    // Find the user with the entered username
    const user = users.find(u => u.username === username);
  
    // Check if the user exists and the password matches
    if (user && user.password === password) {
      // Set the user's session or authentication mechanism of your choice
      req.session.user = user;
  
      // Redirect to the authenticated area (e.g. dashboard)
      res.redirect('/index');
    } else {
      // Invalid credentials
      req.flash('error', 'Invalid username or password');
      res.redirect('/login');
    }
});
  

//New user register
app.post('/register',(req,res)=>{
    const {username, password} = req.body;
    const users = require('./users.json');
    //check if username already taken
    const existingUser = users.find(u => u.username === username);
    if(existingUser){
        req.flash('error','Username is already taken');
        res.redirect('/register');
        return;
    }

    const newUser = {
        username, password
    };
    users.push(newUser);

    file.writeFile('./users.json',JSON.stringify(users),(err) =>{
        if(err){
            console.error('Error writing to users.json',err);
            return;
        }
        console.log('User registered successfully');
    req.session.user = newUser;
    res.redirect('/')
    })
})

//logout 
app.get('/logout',(req,res) =>{
    req.session.destroy();
    res.redirect('/login');
})


app.listen(PORT, ()=>{console.log("server Started @"+PORT)})