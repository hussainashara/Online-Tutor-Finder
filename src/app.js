//------required packages------
const express = require('express');
const app = express();
const path = require('path');
const { render } = require('pug');
const nodemailer = require('nodemailer');
const admin = require('./admin.router');
const bodyParser = require('body-parser');
const multer = require('multer');
// const session = require('express-session');
const cookieParser = require('cookie-parser');
const urlrequest = require('request-promise');
const alert = require('alert');
// const popup = require('popups')

//global variables
var user="";
var category="";
var subname;
var poscode;
var tutorprice;
var tutorrating;
var studentaddress="";
var distancebetwn;
var level;
var searcharray1;


//-----Setting paths for CSS and PUG-----
const static_path = path.join(__dirname, "../static");

// app.use(express.urlencoded({ extended: false }));
app.use(express.static(static_path));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

require("./db/conn");
const Register = require("./models/register");
const Tutor = require("./models/tutor");
const Student = require("./models/student");
const { parse } = require('path');
const Book = require("./models/book");

//-----Routing-----
app.get("/",(req,res)=>{
    res.render('welcome.pug');
});
app.get("/register", (req, res) => {
    res.render('register.pug');
});
app.get("/student", (req, res) => {
    res.render('student.pug');
});
app.get("/tutor", (req, res) => {
    res.render('tutor.pug');
});
app.get("/login", (req, res) => {
    res.render('login.pug');
});

app.get("/logout",(req,res)=>{
 user="";
 category="";
 res.redirect("/");
});

app.get("/forget", (req, res) => {
    res.render('forget.pug');
});
app.get("/verify", (req, res) => {
    res.render('otp.pug');
});
app.get("/password", (req, res) => {
    res.render('new.pug');
});
app.use('/admin', admin);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//-----Database Interaction-----
app.post("/register", async (req, res) => {
    try {
        var uname;
        var flag;
        flag = req.body.user;
        uname = req.body.username;
        var usern = await Register.findOne({ username: uname });
        if (usern === null) {
            var emailfind = await Register.findOne({ email: req.body.email });
            if (emailfind === null) {
                const register = new Register({
                    account: req.body.user,
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password
                });
                await register.save();
                if (flag == "Tutor") {
                            res.render('tutor.pug');
                        }
                        if (flag == "Student") {
                            res.render('student.pug');
                        }
                        user = uname;
                        category = flag;
                    }
            else if (emailfind.email === req.body.email) {
                res.render('register.pug', { msg1: 'Email Registered' });
            }
        }
        else if (usern.username === uname) {
            res.render('register.pug', { msg: 'Username Exist, Please Choose other' });
        }
    }
    catch (error) {
        console.log(error);
    }
});
//-----register as a tutor-----
app.post("/tutor", async (req, res) => {
    try {
        const tutor = new Tutor({
            username: user,
            firstname: req.body.fname,
            lastname: req.body.lname,
            gender: req.body.gender,
            phone: req.body.phone,
            address1: req.body.add1,
            address2: req.body.add2,
            town: req.body.town,
            pincode: req.body.pincode,
            state: req.body.state,
            country: req.body.country,
            qualification: req.body.qualify
        });
        await tutor.save();
        res.redirect('/home');
    } catch (error) {
        console.log(error);
    }
});
//-----register as a student-----
app.post("/student", async (req, res) => {
    try {
        const student = new Student({
            username: user,
            firstname: req.body.fname,
            lastname: req.body.lname,
            gender: req.body.gender,
            phone: req.body.phone,
            address1: req.body.add1,
            address2: req.body.add2,
            town: req.body.town,
            pincode: req.body.pincode,
            state: req.body.state,
            country: req.body.country,
        });
        await student.save();
        res.redirect('/home');
    } catch (error) {
        console.log(error);
    }
});
//-----login-----
app.post("/login", async (req, res) => {
    try {
        const uname = req.body.username;
        const pass = req.body.password;
        const data = await Register.findOne({ username: uname });
        if (data.password == pass) {
            user = uname;
            category = data.account;   
            res.redirect("/home");
        } else {
            res.render('login.pug', { msg1: 'UserName And Password Not Matched' })
        }
        // console.log(data);
    } catch (error) {
        res.render('login.pug', { msg1: 'UserName And Password Not Matched' })
        // alert("Username not matched");
    }
});



app.get('/home', (req, res)=>{
    if(user==""){
        res.redirect("/");
    }
    else if(category=="Student"){
      Student.findOne({username:user},function(err,studentdata){
          if(err){
              console.log("error in view profile of student");
          }
          else{
              res.status(200).render('home.pug',{records:studentdata , category});
          }
      })
  }
  // teacher -------------------------------------------------------------------------
  else{
      Tutor.findOne({username:user},function(err,tutordata){
          if(err){
              console.log("error in view profile of teacher");
          }
          else{
              res.status(200).render('home.pug',{records:tutordata , category});
          }
      }) 
  }
})
app.get('/search', (req, res)=>{
    
    // console.log(studentaddress);
    if(req.query.subject!=null && req.query.postalcode!=null && req.query.stuaddress!=null && req.query.searchlevel!=null){
        subname = req.query.subject;
        poscode = req.query.postalcode;
        studentaddress=req.query.stuaddress;
        level=req.query.searchlevel;
        searcharray1 = {subname1:subname,poscode1:poscode,studentaddress1:studentaddress};
        // console.log(subname);

        Tutor.find({subject:subname,pincode:poscode,searchlevel:level},function(err,dataa){
            if(err){
                console.log("error searching data");
                res.status(200).render('search.pug',{records:[],message:"Pls enter details properly"});
            }
            else{
                // console.log(dataa);
                if(subname=="" || poscode=="" || studentaddress=="" || level==""){
                    res.status(200).render('search.pug',{records:[],message:"Pls enter all fields"});
                }
                else if(dataa==""){
                    res.status(200).render('search.pug',{records:[],message:"No data Found"});
                }
                else{
                    res.status(200).render('search.pug',{records:dataa,searcharray1});
                }
                
            }
        })
    }
    else if((req.query.subject==null && req.query.postalcode==null && req.query.stuaddress==null) && (req.query.tutorratingselect!=null || req.query.priceselect!=null  || req.query.distancebtwn!=null))
    {
        tutorprice = req.query.priceselect;
        tutorrating = req.query.tutorratingselect;
        distancebetwn = req.query.distancebtwn;
        // console.log(tutorprice+" ,"+tutorrating+" ,"+subname+","+poscode);

        // tutor price filter
        if(distancebetwn=="nun" && tutorrating=="nun" && tutorprice!="nun"){
              // console.log(JSON.parse(tutorprice).$gt);
              var pricegt=JSON.parse(tutorprice).$gt;
              var pricelt=JSON.parse(tutorprice).$lt;
              // console.log(subname+","+poscode);
              Tutor.find({subject:subname,pincode:poscode,searchlevel:level,fees:{$gte:pricegt,$lte:pricelt}},function(err,dataa){
                  if(err){
                      console.log("error searching data");
                      res.status(200).render('search.pug',{records:[],message:"Pls enter details properly"});
                  }
                  else{
                      if(subname=="" || poscode=="" ){
                          res.status(200).render('search.pug',{records:[],message:"Pls enter all fields"});
                      }
                      else if(dataa==""){
                          res.status(200).render('search.pug',{records:[],message:"No data Found"});
                      }
                      else{
                          res.status(200).render('search.pug',{records:dataa,searcharray1});
                      }
                      
                  }
              })
        }
        // tutor rating filter
        else if(distancebetwn=="nun" && tutorrating!="nun" && tutorprice=="nun"){
            var ratinggt=parseInt(tutorrating);
            Tutor.find({subject:subname,pincode:poscode,searchlevel:level,rating:{$gt:ratinggt}},function(err,dataa){
                if(err){
                    console.log("error searching data");
                    res.status(200).render('search.pug',{records:[],message:"Pls enter details properly"});
                }
                else{
                    if(subname=="" || poscode=="" ){
                        res.status(200).render('search.pug',{records:[],message:"Pls enter all fields"});
                    }
                    else if(dataa==""){
                        res.status(200).render('search.pug',{records:[],message:"No data Found"});
                    }
                    else{
                        res.status(200).render('search.pug',{records:dataa,searcharray1});
                    }
                    
                }
            })
        }
        // tutor distance filter
        else if(distancebetwn!="nun" && tutorrating=="nun" && tutorprice=="nun"){
            Tutor.find({subject:subname,pincode:poscode,searchlevel:level},function(err,dataa){
                if(err){
                    console.log("error searching data");
                    res.status(200).render('search.pug',{records:[],message:"Pls enter details properly"});
                }
                else{
                    if(subname=="" || poscode=="" ){
                        res.status(200).render('search.pug',{records:[],message:"Pls enter all fields"});
                    }
                    else if(dataa==""){
                        res.status(200).render('search.pug',{records:[],message:"No data Found"});
                    }
                    else{
                        var data2=[];
                        var distancebt;
                        var j=0;
                        void async function(){
                          for(var i=0;i<dataa.length;i++){
                              var tutoraddress = dataa[i].address1;
                              // console.log(studentaddress+" "+ tutoraddress);
                              var site= "https://maps.distancematrixapi.com/maps/api/distancematrix/json?origins="+studentaddress+"&destinations="+tutoraddress+"&departure_time=now&key=AlphaDMAWcV4R0eBboB7z2jxtfRqm1TjNUeXKwG0";  
                              // console.log(i+"-----");
                              
                              await urlrequest({
                                  url:site,
                                  json:true
                              },(err,response,body)=>
                              {
                                if(body==null){
                                    res.status(200).render('search.pug',{records:[],message:"Sorry! Pls try again"});
                                }
                                else{
                                    distancebt = body.rows[0].elements[0].distance.value;
                                }
                                
                                  if(distancebt<req.query.distancebtwn){
                                      data2[j]= dataa[i];
                                      j=j+1;
                                  }
                              });
                           }
                           if(data2==""){
                             res.status(200).render('search.pug',{records:[],message:"No data Found"});
                           }
                           else{
                             res.status(200).render('search.pug',{records:data2,searcharray1});
                           }
                           
                          }();
                    }
                    
                }
            })
        }
        //  price  and rating filter
        else if(distancebetwn=="nun" && tutorrating!="nun" && tutorprice!="nun"){
            var pricegt=JSON.parse(tutorprice).$gt;
            var pricelt=JSON.parse(tutorprice).$lt;
            var ratinggt=parseInt(tutorrating);
            Tutor.find({subject:subname,pincode:poscode,searchlevel:level,fees:{$gte:pricegt,$lte:pricelt},rating:{$gt:ratinggt}},function(err,dataa){
                if(err){
                    console.log("error searching data");
                    res.status(200).render('search.pug',{records:[],message:"Pls enter details properly"});
                }
                else{
                    if(subname=="" || poscode=="" ){
                        res.status(200).render('search.pug',{records:[],message:"Pls enter all fields"});
                    }
                    else if(dataa==""){
                        res.status(200).render('search.pug',{records:[],message:"No-- data Found"});
                    }
                    else{
                        res.status(200).render('search.pug',{records:dataa,searcharray1});
                    }
                    
                }
            })
        }
        //  rating  and distance filter
        else if(distancebetwn!="nun" && tutorrating!="nun" && tutorprice=="nun"){
            var ratinggt=parseInt(tutorrating);
            Tutor.find({subject:subname,pincode:poscode,searchlevel:level,rating:{$gt:ratinggt}},function(err,dataa){
                if(err){
                    console.log("error searching data");
                    res.status(200).render('search.pug',{records:[],message:"Pls enter details properly"});
                }
                else{
                    if(subname=="" || poscode=="" ){
                        res.status(200).render('search.pug',{records:[],message:"Pls enter all fields"});
                    }
                    else if(dataa==""){
                        res.status(200).render('search.pug',{records:[],message:"No data Found"});
                    }
                    else{
                        var data2=[];
                        var distancebt;
                        var j=0;
                        void async function(){
                          for(var i=0;i<dataa.length;i++){
                              var tutoraddress = dataa[i].address1;
                              // console.log(studentaddress+" "+ tutoraddress);
                              var site= "https://maps.distancematrixapi.com/maps/api/distancematrix/json?origins="+studentaddress+"&destinations="+tutoraddress+"&departure_time=now&key=AlphaDMAWcV4R0eBboB7z2jxtfRqm1TjNUeXKwG0";  
                              // console.log(i+"-----");
                              
                              await urlrequest({
                                  url:site,
                                  json:true
                              },(err,response,body)=>
                              {
                                if(body==null){
                                    res.status(200).render('search.pug',{records:[],message:"Sorry! Pls try again"});
                                }
                                else{
                                    distancebt = body.rows[0].elements[0].distance.value;
                                }
                                  if(distancebt<req.query.distancebtwn){
                                      data2[j]= dataa[i];
                                      j=j+1;
                                  }
                              });
                           }
                           if(data2==""){
                            res.status(200).render('search.pug',{records:[],message:"No data Found"});
                          }
                          else{
                            res.status(200).render('search.pug',{records:data2,searcharray1});
                          }
                          }();
                    }
                    
                }
            })
        }
        //  price  and distance filter
        else if(distancebetwn!="nun" && tutorrating=="nun" && tutorprice!="nun"){
            var pricegt=JSON.parse(tutorprice).$gt;
            var pricelt=JSON.parse(tutorprice).$lt;
            // console.log(subname+","+poscode);
            Tutor.find({subject:subname,pincode:poscode,searchlevel:level,fees:{$gte:pricegt,$lte:pricelt}},function(err,dataa){
                if(err){
                    console.log("error searching data");
                    res.status(200).render('search.pug',{records:[],message:"Pls enter details properly"});
                }
                else{
                    if(subname=="" || poscode=="" ){
                        res.status(200).render('search.pug',{records:[],message:"Pls enter all fields"});
                    }
                    else if(dataa==""){
                        res.status(200).render('search.pug',{records:[],message:"No data Found"});
                    }
                    else{
                        var data2=[];
                        var distancebt;
                        var j=0;
                        void async function(){
                          for(var i=0;i<dataa.length;i++){
                              var tutoraddress = dataa[i].address1;
                              // console.log(studentaddress+" "+ tutoraddress);
                              var site= "https://maps.distancematrixapi.com/maps/api/distancematrix/json?origins="+studentaddress+"&destinations="+tutoraddress+"&departure_time=now&key=AlphaDMAWcV4R0eBboB7z2jxtfRqm1TjNUeXKwG0";  
                              // console.log(i+"-----");
                              
                              await urlrequest({
                                  url:site,
                                  json:true
                              },(err,response,body)=>
                              {
                                if(body==null){
                                    res.status(200).render('search.pug',{records:[],message:"Sorry! Pls try again"});
                                }
                                else{
                                    distancebt = body.rows[0].elements[0].distance.value;
                                }
                                  if(distancebt<req.query.distancebtwn){
                                      data2[j]= dataa[i];
                                      j=j+1;
                                  }
                              });
                           }
                           if(data2==""){
                            res.status(200).render('search.pug',{records:[],message:"No data Found"});
                          }
                          else{
                            res.status(200).render('search.pug',{records:data2,searcharray1});
                          }
                          }();
                    }
                    
                }
            })
        }
        // all filters
        else if(distancebetwn!="nun" && tutorrating!="nun" && tutorprice!="nun"){   
            var pricegt=JSON.parse(tutorprice).$gt;
            var pricelt=JSON.parse(tutorprice).$lt;
            var ratinggt=parseInt(tutorrating);
            Tutor.find({subject:subname,pincode:poscode,searchlevel:level,fees:{$gte:pricegt,$lte:pricelt},rating:{$gt:ratinggt}},function(err,dataa){
                if(err){
                    console.log("error searching data");
                    res.status(200).render('search.pug',{records:[],message:"Pls enter details properly"});
                }
                else{
                    if(subname=="" || poscode=="" ){
                        res.status(200).render('search.pug',{records:[],message:"Pls enter all fields"});
                    }
                    else if(dataa==""){
                        res.status(200).render('search.pug',{records:[],message:"No data Found"});
                    }
                    else{
                        var data2=[];
                        var distancebt;
                        var j=0;
                        void async function(){
                          for(var i=0;i<dataa.length;i++){
                              var tutoraddress = dataa[i].address1;
                              // console.log(studentaddress+" "+ tutoraddress);
                              var site= "https://maps.distancematrixapi.com/maps/api/distancematrix/json?origins="+studentaddress+"&destinations="+tutoraddress+"&departure_time=now&key=AlphaDMAWcV4R0eBboB7z2jxtfRqm1TjNUeXKwG0";  
                              // console.log(i+"-----");
                              
                              await urlrequest({
                                  url:site,
                                  json:true
                              },(err,response,body)=>
                              {
                                    if(body==null){
                                    res.status(200).render('search.pug',{records:[],message:"Sorry! Pls try again"});
                                }
                                else{
                                    distancebt = body.rows[0].elements[0].distance.value;
                                }
                                  if(distancebt<req.query.distancebtwn){
                                      data2[j]= dataa[i];
                                      j=j+1;
                                  }
                              });
                           }
                           if(data2==""){
                            res.status(200).render('search.pug',{records:[],message:"No data Found"});
                          }
                          else{
                            res.status(200).render('search.pug',{records:data2,searcharray1});
                          }
                          }();
                    }
                    
                }
            })
        }
        else{}
      
    }
    else
    {
        res.status(200).render('search.pug',{records:[],indicator:"nop"});
    }
    
});
var tutoruser; 
app.get('/tutordescpage',async (req, res)=>{
    var uname=req.query.username;
    var bookTutormsg = "";
    tutoruser = uname;
    if(category=="Student"){
        Book.find({student : user, tutor : uname},function (err, data) {
            // console.log(data);
            if(err){
                console.log(err);
            }
            else{
                if(data=="")
                {
                    bookTutormsg = "NotBooked";
                    Tutor.find({username:uname},{feedbacks:{$elemMatch:{student_username:user}}},function(err,matchdata){
                        if(err){
                            console.log("error in matching feedback data");
                        } 
                        else{
                            Tutor.findOne({username:uname},function(err,tutordata){
                                if(err){
                                    console.log("error in view profile of teacher");
                                }
                                else{
                                    res.status(200).render('tutordescpage.pug',{tutdata:tutordata,type:"feedbackCant",bookTutormsg});
                                }
                            }) 
                        }
                    })
                    // console.log(bookTutormsg+"---------");
                }
                else{
                    bookTutormsg = "booked";
                    Tutor.find({username:uname},{feedbacks:{$elemMatch:{student_username:user}}},function(err,matchdata){
                        if(err){
                            console.log("error in matching feedback data");
                        } 
                        else if(matchdata[0].feedbacks!=""){
                            Tutor.findOne({username:uname},function(err,tutordata){
                                if(err){
                                    console.log("error in view profile of teacher");
                                }
                                else{
                                    res.status(200).render('tutordescpage.pug',{tutdata:tutordata,type:"feedbackCant",bookTutormsg});
                                }
                            }) 
                        }
                        else{
                            Tutor.findOne({username:uname},function(err,tutordata){
                                if(err){
                                    console.log("error in view profile of teacher");
                                }
                                else{
                                    res.status(200).render('tutordescpage.pug',{tutdata:tutordata,type:"feedbackCan",bookTutormsg});
                                }
                            }) 
                        }
                    })
                    // console.log(bookTutormsg+"-------");
                }
            }
        })
    }
    else{
        Tutor.findOne({username:uname},function(err,tutordata){
            if(err){
                console.log("error in view profile of teacher");
            }
            else{
                res.status(200).render('tutordescpage.pug',{tutdata:tutordata,type:"tutor logined",bookTutormsg:"tutor logined"});
            }
        }) 
    }
    

})
app.post('/savefeedbacks',(req,res)=>{
    var username=req.body.tutoruname;
    var feedbackrating=req.body.feedbackratings;
    var feedbacktext=req.body.feedbacktext;
    var feedback={
        student_username:user,
        student_rating:feedbackrating,
        student_text:feedbacktext
    };
    Tutor.findOneAndUpdate({username:username},
        {$push:{feedbacks:feedback}
        },function(err,doc){
            if(err){
            console.log("error taking data frm edit profile")
            }
        })
    res.redirect('/tutordescpage'+'?username='+username);
})
app.post('/view-profile', (req, res)=>{

    if(category=="Student"){
                // tutor edited profile update func
                Student.findOneAndUpdate({username:user},
                {$set:
                    {
                        firstname: req.body.first_name,
                        lastname: req.body.last_name,
                        phone: req.body.phone,
                        town: req.body.town,
                        state: req.body.state,
                        country: req.body.country,
                        gender: req.body.gender,
                        address1: req.body.address1,
                        address2: req.body.address2,
                        subject : req.body.subjectname,
                        about: req.body.desc,
                        class:req.body.class
                    }
                },function(err,doc){
                    if(err){
                    console.log("error taking data frm edit profile")
                    }
                })

        // render view page after edit
        Student.findOne({username:user},function(err,studentdata){
            if(err){
                console.log("error in view profile of student");
            }
            else{
                res.status(200).render('stview.pug',{studata:studentdata});
            }
        })
    }

    // teacher -------------------------------------------------------------------------
    else{

          // tutor edited profile update func
                Tutor.findOneAndUpdate({username:user},
                {$set:
                    {
                        firstname: req.body.first_name,
                        lastname: req.body.last_name,
                        phone: req.body.phone,
                        town: req.body.town,
                        state: req.body.state,
                        country: req.body.country,
                        qualification: req.body.qualification,
                        gender: req.body.gender,
                        address1: req.body.address1,
                        address2: req.body.address2,
                        subject : req.body.subjectname,
                        fees:req.body.fees,
                        about: req.body.desc,
                        searchlevel:req.body.searchlevel
                    }
                },function(err,doc){
                    if(err){
                    console.log("error taking data frm edit profile")
                    }
                })
        // render view page after edit
            Tutor.findOne({username:user},function(err,tutordata){
                if(err){
                    console.log("error in view profile of teacher");
                }
                else{
                    res.status(200).render('tuview.pug',{tutdata:tutordata});
                }
            }) 
    }

});
app.get('/view-profile', (req, res)=>{
    // student---------------------------------------------------------------------
    if(category=="Student"){
        Student.findOne({username:user},function(err,studentdata){
            if(err){
                console.log("error in view profile of student");
            }
            else{
                res.status(200).render('stview.pug',{studata:studentdata});
            }
        })
    }
    // teacher -------------------------------------------------------------------------
    else{
        Tutor.findOne({username:user},function(err,tutordata){
            if(err){
                console.log("error in view profile of teacher");
            }
            else{
                res.status(200).render('tuview.pug',{tutdata:tutordata});
            }
        }) 
    }
    
});
app.get('/edit-profile-tut', (req, res)=>{
    Tutor.findOne({username:user},function(err,tutordata){
        if(err){
            console.log("error in view profile of teacher");
        }
        else{
            res.status(200).render('tutoredit.pug',{tutdata:tutordata});
        }
    }) 
   
});
app.get('/edit-profile-stu', (req, res)=>{
    Student.findOne({username:user},function(err,studentdata){
        if(err){
            console.log("error in view profile of student");
        }
        else{
            res.status(200).render('studentedit.pug',{studata:studentdata});
        }
    })
   
});
//forget Password
var email;
var otp = Math.random();
console.log(otp);
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);
let transporter = nodemailer.createTransport({
    // host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'Gmail',
    auth: {
        user: 'tutorfinder0208@gmail.com',
        pass: 'tutor0208'
    }

});
app.post("/forget", (req, res) => {
    email = req.body.email;
    // console.log(email);
    var mailOptions = {
        from: 'tutorfinder0208@gmail.com',
        to: req.body.email,
        subject: "OTP for Password Change",
        html: "<h3>OTP for Password change is : </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>"
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render('otp.pug');
    });
});
app.post("/verify", (req, res) => {
    if (req.body.otp == otp) {
        res.render('new.pug');
    }
    else {
        res.render('otp.pug', { msg: 'OTP is incorrect Please Re-enter' });
    }
});
app.post("/password", async (req, res) => {
    // uname = req.body.uname;
    const uname = req.body.username;
    const newpass = req.body.password;
    const data = await Register.findOneAndUpdate({ username: uname }, { password: newpass }, function (err, doc) {
        if (err) {
            console.log("error");
        }
        else {
            res.render('login.pug', { msg: 'Your Password Updated please LogIn' });
        }
    });
});
app.post('/resend', function (req, res) {
    var mailOptions = {
        from: 'tutorfinder0208@gmail.com',
        to: email,
        subject: "OTP for Password Change",
        html: "<h3>OTP for Password change is : </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>"
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        res.render('otp', { msg1: "OTP has been Re-sent" });
    });

});
//reset Password
app.get("/reset", (req, res) => {
    res.render('reset.pug');
}).post('/reset',async function(req,res) {
    const uname = req.body.username;
    const old = req.body.old;
    const newpass = req.body.new;
    const data = await Register.findOneAndUpdate({ username: uname }, { password: newpass }, function (err, doc) {
        if (err) {
            console.log("error");
        }
        else {
            res.render('login.pug', { msg: 'Your Password Updated please LogIn' });
        }
    });

});

app.post('/book',async(req,res)=>{
    data1 = await Register.findOne({username:user});
    data2 = await Register.findOne({username : tutoruser});
    data3 = await Tutor.findOne({username : tutoruser});
    const book = new Book({
        tutor : tutoruser,
        student : user
    });
    console.log(book);
    await book.save();
    var mailOptions = {
        from: 'tutorfinder0208@gmail.com',
        to: data1.email,
        subject: "Booked Tutor",
        html: "<p>You have booked Tutor Mr/Mrs " + data3.firstname + " for the subject " + data3.subject + "having fees of Rs" + data3.fees + ".</p>" 
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
    });
    var mailOptions1 = {
        from: 'tutorfinder0208@gmail.com',
        to: data2.email,
        subject: "Booked By Student",
        html: "<p>You have been booked by Mr/Mrs " + user + " for the subject " + data3.subject + ".</p>" + "<p> Please Check the Dashboard For more Info</p>" 
    };
    transporter.sendMail(mailOptions1, (error, info) => {
        if (error) {
            return console.log(error);
        }
    });
    alert("booked succesfully");
    res.redirect('/tutordescpage'+'?username='+tutoruser);
    // res.redirect('/success');
});

app.get('/dashboard',async(req,res)=>{
    const cursor = Book.find({tutor : user}).cursor();
    var array = [];
    for(let doc = await cursor.next(); doc != null; doc = await cursor.next()){
        // console.log(doc);
        await Student.findOne({username : doc.student},function (err,data) {
            if(err){
                console.log(err);
                res.render('dashboard.pug',{records:[], msg : "No data Found"});
            }
            else{
                // console.log(data);
                array.push(data);
            }
        });
        
    }
    var len = array.length;
    // console.log(len);
    if(array == [])
    {
       res.render('dashboard.pug',{records:[],len});
    }
    else{
        res.render('dashboard.pug',{records : array,len});
    }
    // console.log(array);
    // res.send("DASHBOARD");
});
//Server Starting
app.listen(3000, () => {
    console.log("Server Started....");
});