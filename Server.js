const express = require('express');
const router = express.Router();
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const user = require('./user.model.js')
const admin=require('./signIn.model.js')
const port = process.env.PORT||3100;
const connection_url = "mongodb+srv://opendata:IBUiChVnjY2EXRY7@cluster0.1zzfs.mongodb.net/test";
const methodOverride = require('method-override');

const conn = mongoose.createConnection(connection_url);
const ckanUrl =" http://opendatabayern.de/api/3/action/";
const apikey="e6cf1719-b1e4-47ec-aa33-a797bdd43858";
const axios = require("axios").create({baseUrl: ckanUrl});
const header = {
    'Authorization': apikey,
    'Content-Type': 'application/json',
};
const SMTPClient = require('emailjs');



// status 0-> request pending
//        1-> request approved
//        2-> request rejected



// TO AVOID CORS POLICY ERRORS
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.use(express.json())
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');


//TO LISTEN THE PORT
app.listen(port);
mongoose.connect(connection_url, {
    dbName: "opendatabayern"
});


//REGISTRATION REQUEST BY THE USER
app.post('/api/register', async (req, res) => {
    
    let body=req.body;
    body.status=0,
    body.timeStamp=new Date();
    let signInUser=""
    
    if (body.email != null && body.email != null ) {
        try{
        signInUser = await user.findOne({email: body.email});
        }catch{
            signInUser =false; 
        }
        if (!signInUser) {
            try {
                const RegisterUser = await user.create(
                   body
                )
                res.status(200).send({ status: "ok", code: 200, result: RegisterUser });
            }
            catch (error) {
                res.status(400).send({ status: error, code: 400, error: "Please Try Again" });
            }
        }
        else {
            if(signInUser.status==2 )
             {
                user.updateOne({ email: body.email }, {$push:body}).then(result => {
                    res.status(200).json({ status: "ok", code: 200, result:result });
                  
                    }).catch(error => {
                    
                        res.status(400).json({ status: "error", code: 400, error: "Please Try Again"  });
                })
             }
             else if(signInUser.status==1)
             {
                res.status(201).json({ status: "ok", code: 201, result: "Your request is already accepted" });
             }
             else 
             {
                res.status(202).json({ status: "ok", code: 202, result: "Your request is pending" });
             }
        }
    }else
    {
        res.status(401).json({ status: "error", code: 400, error: "Please Try Again" });
    }

})



// TO GET DATA FOR ADMIN's DASHBOARD
app.get('/api/requests', async (req, res) => {
   
        user.find({ 'status': 0 }).then(result => {
          res.status(200).json({ status: "ok", code: 200, result: result });
             
        }).catch(error => {
            res.status(401).json({ status: "error", code: 401, error: error });
        })
   
})



// LOGIN VERIFICATION FOR ADMIN PORTAL
app.post('/api/adminLogin',async (req, res) => {
    
        let body=req.body;
    
    if (body.username != null && body.username!= "" ) {
       
        try{
        admin.findOne({username: body.username}).then(result=>{
             res.status(200).json({ status: "ok", code: 200, result:result });
        }).catch(err=>{
            res.status(400).json({ status: "error", code: 400, error: "Username or password is not correct!" });
        })
        }catch{
            res.status(400).json({ status: "error", code: 400, error: "Please Try Again" });
        }
    }

     
})


// TO ASSIGN STATUS

var usern = "";
app.post('/api/result',async (req, res) => {
    body=req.body;
    body.timeStamp=new Date();
    body.status = 1;

    let signInUser=""
    if (body.email != null && body.email != "" ) {
         user.updateOne({ email: body.email }, body).then(async result => {
                if(body.status==1)
                    {try{
                    let username = await setUsername(body, 0);
                    res.status(200).json({ status: "ok", code: 200, result:username });
                    }
                    catch{
                    res.status(400).json({ status: "error", code: 400, error: "Please Try Again"});
                    }}
                else{
                    res.status(200).json({ status: "ok", code: 200, result:usern });
                }
                }).catch(error => {
                    res.status(400).json({ status: "error", code: 400, error: "Please Try Again" });
            })
    }
    else
    {
        res.status(400).json({ status: "error", code: 400, error: "Please Try Again"});
    }
  
})


// TO ASSIGN STATUS
app.post('/api/createUser',async (req, res) => {
   let body=req.body;
        console.log(body)
   
        user.findOne({username: body.username}).then((result)=>{
            res.status(200).json({ status: "ok", code: 200, result:result });
             }).catch(err=>{
                 res.status(400).json({ status: "error", code: 402, error: "Please Try Again" });
             })
            
        .catch(err=>{
            res.status(400).json({ status: "error", code: 400, error: "Username or password is not correct!" });
        })
        
    })
  
  


app.post('/api/decline',async (req, res) => {
    body=req.body;
    body.timeStamp=new Date();
    body.status=2;

    if (body.email != null && body.email != "" ) {
         user.updateOne({ email: body.email }, body).then( (result) => {
               res.status(200).json({ status: "ok", code: 200, result:result });
                
            }).catch((error) => {
                res.status(400).json({ status: "error", code: 400, error: "Please Try Again"});
            })
    }
    else
    {
        res.status(400).json({ status: "error", code: 400, error: "Please Try Again"});
    }
  
})

async function setUsername(body,i)
{
    let done=false;
    let userExist=false;
    if(body.status==1)
        {
             let username_str=body.name+body.surname;
             if(i>0)username_str+=i;
             username_str=username_str.toLowerCase();
              try{
                   userExist = await user.findOne({username: username_str});
                }catch{
                    userExist =false; 
                }
                if (!userExist) {
                    
                    try {
                        usern = username_str;
                        user.updateOne({ email: body.email }, { username: username_str }).then(res => {
                            done = true
                            return usern;
                    }).catch(err=>{
                       return err;
                    })}
                    catch{
                        return "Please Try Again"
                    }
                }
                else {
                    while(done==false)
                    {
                        try {
                           usern = username_str;
                           let username = await setUsername(body, i + 1);
                            return usern;
                        }
                        catch{
                            return "Please Try Again"
                        }
                    }
                }
    }




}



app.post('/api/email', async (req, res) => {

   
    const nodemailer = require('nodemailer');
    let transporter = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        service: 'gmail',
        auth: {
            user: 'opendatabayern', 
            pass: 'OpenDataBayern1234' 
        }
      
    })

    message = {
        html: req.body.body,
        from: 'opendatabayern@gmail.com',
        to: req.body.to,
        subject: req.body.subject,
    }

    transporter.sendMail(message, function (err, info) {
        if (err) {
            res.status(400).json({ status: "ok", code: 400, err: err});

        } else {
            res.status(200).json({ status: "error", code: 200, result: info });

        }
    })
    
})



app.get('/api/getUsername/', async (req, res) => {
    user.find({ 'email': req.query.email }).then(result => {
        res.status(200).json({ status: "ok", code: 200, result: result });

    }).catch(error => {
        res.status(401).json({ status: "error", code: 401, error: error });
    })

})


async function getUsername(email){
    let ans=await user.findOne({ 'email': email }).then(result => {
         return result;   
       }).catch(error => {
         return "";
     })
 
     return ans;
 }














