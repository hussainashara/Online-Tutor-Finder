const express = require("express")
const session = require('express-session')
const app = express()
	
// Port Number Setup
var PORT = process.env.port || 3000
var user="";
// Session Setup
app.use(session({

	// It holds the secret key for session
	secret: 'Your_Secret_Key',

	// Forces the session to be saved
	// back to the session store
	resave: true,

	// Forces a session that is "uninitialized"
	// to be saved to the store
	saveUninitialized: true
}))

app.get("/", function(req, res){
	if(user==""){
		res.redirect("/login");
	}
	else{
		req.session.user=user;
		res.redirect("/home");
	}
	// res.redirect("/login");
})


app.get("/login", function(req, res){
	user="lodu";
    res.redirect("/");
})
// app.get("/main", function(req, res){
// 	req.session.username=user;
//     res.redirect("/main/session")
// })

app.get("/home", function(req, res){
	console.log(req.session.user);
	if(req.session.user==null){
		res.send("null");
	}
	else{
		var name = req.session.user
		res.send(name)
	}
	
})
	
app.listen(80, function(error){
	if(error) throw error
	console.log("Server created Successfully on PORT :", 5000)
})
