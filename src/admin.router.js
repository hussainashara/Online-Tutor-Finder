const AdminBro = require('admin-bro');
const AdminBroExpress = require('@admin-bro/express');
const AdminBroMongoose = require('@admin-bro/mongoose')
const mongoose = require('mongoose');
const Register = require('./models/register');
const Student = require('./models/student');
const Tutor = require('./models/tutor');
const Admin = require('./models/admin');
AdminBro.registerAdapter(AdminBroMongoose);

const adminBro = new AdminBro({
  databases: [mongoose],
  rootPath: '/admin',
  resources : [ 
    {
      resource : Register,
      options : {
        properties : {
          _id : {isVisible : false}
        }
      }
    },
    {
      resource : Tutor,
      options : {
        properties : {
          _id : {isVisible : false},
          register : {isVisible : false}
        }
      }
    }, 
    {
      resource : Student,
      options : {
        properties :{
            _id : {isVisible : false},
            register : {isVisible : false}
        }
      }
    },
    // {
    //   resource : Admin,
    //   options : {
    //     properties : {
    //       _id : {isVisible : false}
    //     }
    //   }
    // }
  ],

  branding : {
    logo : 'https://lh3.googleusercontent.com/QvrazItwHX9NH-Zo6tYSQa9x_mGc3Rl_iGnRgNmbq8JU28HXh4F34cPVjsP__rbKbtwj=s85',
    companyName : 'Online Tutor Finder',
    softwareBrothers : false
  },  
});

// const data = Admin.find()


admin = {email : 'prashant.aghara2111@gmail.com' , password : 'prashant21'}


const router = AdminBroExpress.buildAuthenticatedRouter(adminBro,
  {
  cookieName : process.env.ADMIN_COOKIE_NAME || 'admin-bro',
  cookiePassword : process.env.ADMIN_COOKIE_PASSWORD || 'superlong-password-for-browser',
  authenticate : async (email,password) =>{
    // if((email == data.email && password == data.password)){
    //   return admin1;
    // }
    if(email == admin.email  && password == admin.password){
      return admin
    }
    else{
      return null;
    }
  }
});

module.exports = router;