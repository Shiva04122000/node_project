//  ---------------------  importing Packages  -----------------------------------
require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const userSchema = require('./models/userModel')

const userRouter =express.Router();
app.use('/',userRouter);




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// -------------------------------------------  listen at port  -----------------------------------------------

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Listening at port 4000");
})

// --------------------------- connection with Mongodb Atlas ----------------------------------------------

mongoose.set("strictQuery", false);
const mongoURI = `mongodb+srv://Shiva:Shiva123@cluster0.bhneber.mongodb.net/${process.env.COLLECTION}`;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("Connect to DB successfully");
  })
  .catch((err) => {
    console.log("Failed to connect", err);
  });

// -------------------------------- page routes  --------------------------------------

app.set("view engine", "ejs");

userRouter
.route('/main')
.get(protectRoute,getMain)

function getMain(req,res){
  res.render('main')
}

app.get('/', (req, res) => {
  res.send("this is the home page")
})

app.get('/login', (req, res) => {
  res.render("login")
})

app.get('/register', (req, res) => {
  res.render("register")
})

// app.get('/main', (req, res) => {
//   res.render("main")
// })

// -----------------     database post methods   ---------------------------

app.post('/register', async (req, res) => {

  const { name, username, email, password,confirmPassword } = req.body
  try {
    const userAdded = new userSchema({
      name: name,
      username: username,
      email: email,
      password: password,
      confirmPassword: confirmPassword
    })
    const token=await userAdded.generateAuthToken();
    console.log("the register token part",token)

    const registered = await userAdded.save()
    res.status(201).render("login")

  } catch (err) {
    return res.send({
      status: 400,
      message: "Internal Server Error, Please Register again!",
      error: err,
    });
  }
})


app.post('/login', async (req, res) => {
  const { loginId, password } = req.body

  try {
    let userFound;
    if (loginId !== "string") {
      userFound = await userSchema.findOne({ email: loginId })
    } else {
      userFound = await userSchema.findOne({ username: loginId })
    }

    const isMatch = await bcrypt.compare(password, userFound.password)

    const token=await userFound.generateAuthToken();
    console.log("the login token part",token)

    if (isMatch) {
      // res.cookie('isLoggedIn',true);
      res.render("main")
      // res.status(200).send("Login succesful")
    } else {
      res.status(400).send("Incorrect Password")
    }
  } catch (error) {
    return res.send({
      status: 400,
      message: "No User Found , Plz Register",
      error: error,
    });
  }
})
 
let flag=true;
async function protectRoute(req,res,next){
  if(flag){
    next();
  }else{
    return res.json({
      message:"plz login to have the access to data"
    })
  }
}



