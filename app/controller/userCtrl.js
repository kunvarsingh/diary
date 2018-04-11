var express = require('express');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
var User = require('../models/userModel.js');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var registration = function(req, res) {

      let Password = req.body.Password;
      //let Email = req.body.email;
      let confirmpassword = { confirmpassword : req.body.confirmpassword };
      var token;
      if(confirmpassword.confirmpassword == Password) {

            User.findOne({Email:req.body.Email},{},(err,data)=>{
              if(err){  res.json({ message : "There are error due to ",err  }) }
                 if(!data){
                   crypto.randomBytes(10,(err,buf)=>{
                     token = buf.toString('hex');
                     req.body.verificationToken = token;
                   });
                    bcrypt.hash(Password, 10, (err, hash)=> {
                      if (err) {
                          res.json({ message: "unable to bcrypt the password",status: 200 })
                        } else if (hash){
                              let requestObj = {
                                  FirstName: req.body.FirstName,
                                  LasName: req.body.LastName,
                                  Phone: req.body.Phone,
                                  Email : req.body.Email,
                                  Password: hash,
                                  State : req.body.State,
                                  City :  req.body.City,
                                  Gender : req.body.Gender,
                                  verificationToken :req.body.verificationToken
                                  };

                                  if(requestObj.FirstName && requestObj.LasName && requestObj.Phone && requestObj.Email && requestObj.Gender && requestObj.State && requestObj.City){
                                    User.create(requestObj,(err, data)=>{
                                      if (err) {
                                            console.log('errrrrrrrrrrrrrrrrrr', err);
                                             res.json({ message: "error, There is unable to store record in db",status: 400 })
                                           } else if (data) {

                                               res.json({meassage :"New Account has been register successfully",status : 200})
                                               var transporter = nodemailer.createTransport({
                                                service: 'gmail',
                                                auth: {
                                                    user: 'XXXXX',
                                                    pass: 'XXXX'
                                                }
                                            });
                                            var mailOptions = {
                                                from: 'XXXXXX',
                                                to: 'XXXXXX',
                                                subject: 'Advocate case dairy',
                                                text: 'this is the link for reset the password'
                                            };
                                            transporter.sendMail(mailOptions, function(error, info) {
                                                if (error) {
                                                    console.log(error);
                                                } else {
                                                    console.log('Email sent: ' + info.response);
                                                }
                                            })
                                          }
                                             else {
                               console.log("hi there are hash", data.Email);
                                res.json({ message: "There are an error to get the data", status: 400 })
                            }
                          })
                        }
                          else {res.json({ message : "Please enter the all required field ",meaasge : 400 })
                      console.log("errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",err);
                        }

                    }
                     else {
                        res.json({  message: "Password is unable to bcrypt the password" , status: 400 })
                    }
                })
              }
              else {
                res.json({messagge : "This email id is already register with us",status : 400})}
             })
      }
      else {
            res.json({ message: "Password and confirmPassword not match " });
        }
    }
    login = function(req,res) {
                var reqObj = {
                   Email : req.body.email,
                   Password : req.body.password
                };

                if(reqObj.Email && reqObj.Password){

                  User.findOne({Email :req.body.email},{},function(err ,data){
                    if(err){
                     return res.json({message : "Err, unable to get the data",err,status : 400})
                    }

                    if(data) {
                      // console.log('Hi, javedkhannnnnnnnnnnnnnnnnnnnnn',data);
                      bcrypt.compare(req.body.password,data.Password,function(err  ,success){
                        if(err){
                          res.json({message : "unable to campare the password",status : 400})
                        } else if(success){
                             var token = jwt.sign({id:data._id},'secret',{ expiresIn: '1h' });
                             return res.json({status :200, message : "User login successfully",auth : true,token : token , data : data })

                       var userid =  function(req, res) {
                        var token = req.headers['token'];
                        jwt.verify(token, "name", function(err, decoded) {
                          if (err) return res.json(err);
                          return res.json(decoded);
                        });
                }
                 }else {
                   return res.json({ message : "Please enter the correct password ",status:400})
                 }
               })
             }
               else { return res.json({message : "Your email is not register with us, Please signup first!.",status : 400})}

              })
            }else {
           return res.json({message : "Please enter email & password!.",status : 400})
          }
        }

        verifyEmail = (req,res)=>{
          User.findOne({verificationToken : req.body.verificationToken},(err,data) => {
            if(err){
              res.json({message : "error to get data from the DB"});
          }else if(data){
            console.log('There are data',data);
            if(data.verifyEmail.verificationStatus === true){
              res.json({message : "This email id is alredy Verified",status : 400})
            }else {
              var verificationStatus = data.verifyEmail.verificationStatus;
                var user_id = data._id;
                if (verificationStatus === true) { // already verified
                    console.log("account verified");
                    res.status(200).send({status : 400,message: "Account Already verified."});
                } else { // to be verified
                  //  data.Email = data.verifyEmail.Email;
                    data.verifyEmail = {
                        Email: data.Email,
                        verificationStatus: true
                    };
                    data.save(function (err, data) {
                        if (err) {
                            res.status(203).send({status : 400,message: "Something went wrong."});
                        } else {
                            res.json({message : "email verified sucessfully",data :200,data : data})

                          }
                        });
        }
      }}else {
          res.json({message : "Please provide the coorrect token",status :400})
        }

        })

        }

        var forgotPassword = function(req,res){
          var Email = req.body.Email;
          crypto.randomBytes(10,function(err,buf){
            var token = buf.toString('hex');
            let condition = { }
            User.findOne({Email : req.body.Email},{},(err,data)=>{
              if(err){
                res.json({message : "error to check data from the DB"})
              }else if(data){
                if(data && data.verifyEmail.verificationStatus){
                        data.resetPasswordToken = token,
                        data.resetPasswordExpires = Date.now() + 3600000;
                        data.save(function (err, data) {
                      if(err){
                        res.json({message : "Please enter the valid email Id",status : 400})
                      }else if(data){
                        console.log('this is very good this to come here',data);
                        res.json({message : "reset verification token has been send successfully on you mail iD",ststus : 400})
                        var transporter = nodemailer.createTransport({
                         service: 'gmail',
                         auth: {
                             user: 'javedkhan199501@gmail.com',
                             pass: 'arshwrarshi'
                         }
                     });
                     var mailOptions = {
                         from: 'javedkhan199501@gmail.com',
                         to: 'javedkhan19950@gmail.com',
                         subject: 'Reset Password token',
                         text: 'there are theresetPasswordToken`+data.resetPasswordToken +`'
                     };
                     transporter.sendMail(mailOptions, function(error, info) {
                         if (error) {
                             console.log(error);
                         } else {
                             console.log('Email sent: ' + info.response);
                         }
                     })
                      } else {
                        res.json({message : "Your email ID still not verified Please first verified the email iD",status :400})
                        console.log('there are error',err)
                    }

              })
            }
          } else {
            res.json({message : "Your email id is not register with us ",status : 400})
          console.log('There are error in this field ',err);
        }
      })
    })
  }

  checkEmail = function(req, res){
     User.findOne({Email: req.body.email},{}, function (err, data) {
            if (err) {
                res.send({message: 'No record found.',status:400});
            } else {
                if (!data) {
                    res.send({message: 'Email not found!.',status:400, isExists : false});
                }
                else {
                  res.send({message: 'good job!.',status:200, isExists : true});
                }
            }
  });
}

  var updatePassword = function (req, res) {
    if (req.body.newPassword && req.body.email) {
        User.findOne({Email: req.body.email}, function (err, data) {
            if (err) {
                res.send({message: 'No record found.',status:400});
            } else {
                if (!data) {
                    res.send({message: 'Email not found!.',status:400});
                } else {

                    bcrypt.genSalt(10, function (err, salt) {
                        console.log('***salet***',salt);
                    bcrypt.hash(req.body.newPassword, salt, function (err, hash) {
                            console.log('***hash***',hash);
                               if (err) {
                                   res.json({
                                       message: "error to bcrypt newPassword",
                                       status: 400
                                   })
                               }
                               if (hash) {
                                    data.password = hash;
                                    data.resetPasswordToken = undefined;
                                    data.resetPasswordExpires = undefined;
                                    let condition = {resetPasswordToken: req.body.token};
                                    let updated = {
                                        "$set" : {
                                        "Password" : hash,
                                        "resetPasswordToken" : undefined,
                                        "resetPasswordExpires" : undefined
                                    }
                                }

                                    User.update(condition,updated,function(err, update){
                                                  if (err) {
                                            res.send({message: 'No record found.',status:400});
                                        } else {
                                            console.log('***user save***',data);
                                            res.send({message: 'Password has been successfully updated.',status:200});
                                        }
                                    })

                               }else{
                                res.send({status: 400,message :"Not set password"})
                               }

                    });
                });

                }
            }
        });
    }
    else{
        res.send({message :'Please fill all required fields!.',status:400});
    }
};


  var resetPasswordByUserId = function(req, res) {
  var currentPassword    = req.body.currentPassword;
  var newPassword        = req.body.newPassword;
  var confirmNewPassword = req.body.confirmNewPassword;
  var _id = req.body.userId;

  if (currentPassword && newPassword && confirmNewPassword && _id) {
      User.findOne({ _id }, {}, function(err, data) {
          if (err) {
              res.json({
                  message: "please enter the correct userId",
                  status: 400
              })
          } else
          if (data) {
              bcrypt.compare(currentPassword, data.Password, function(err, result) {
                  console.log("hashhhhhhhhhhhhhhhhhhhhhhhhhhhhhh compare", result);
                  if (err) {
                      res.json({
                          message: "Wrong , due to wrong current password",
                          err,
                          status: 400
                      })
                  } else
                  if (result) {
                      if (newPassword === confirmNewPassword) {
                          bcrypt.hash(confirmNewPassword, 10, function(err, hash) {

                              if (err) {
                                  res.json({
                                      message: "error to bcrypt newPassword",
                                      status: 400
                                  })
                              }
                              if (hash) {
                                  console.log("thereeeeeeeeeeeeeeee", data.Password);
                                  User.findOneAndUpdate({ _id: _id}, {
                                      "$set": {"Password": hash}}, (err, rcd) => {
                                      console.log("hashhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh new pass", hash);
                                      if (err) {
                                          res.json({
                                              message: "new password unable to bcrypt the password",
                                              status: 400
                                          })
                                      } else if (rcd) {
                                          res.json({
                                              message: "Password Changed Successfully",
                                              status: 200


                                          })
                                      } else {
                                          res.json({
                                              message: "new password unable to bcrypt the password",
                                              status: 400
                                          })
                                      }
                                  })

                              } else {
                                  res.json({
                                      message: "newPassword not bcrypt sucessfully",
                                      status: 400
                                  })
                              }
                          })
                      } else {
                          res.json({
                              message: "Newpassword and confirmNewPassword does not match",
                              status: 400
                          })
                      }
                  } else {
                      res.json({
                          message: "CurrentPassword not matched",
                          status: 400
                      })
                  }

              })
          } else {
              res.json({
                  message: "Please enter the correct userId ",
                  status: 400
              })
          }
      })
  } else {
      res.json({
          message: "Please enter the all required inputs",
          status: 400
      })
  }
}

var sendOTPmail =function(req, res){
  let email = req.body.email;

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'XXXXX',
            pass: 'XXXX'
        }
    });
    let OTP = Math.floor((Math.random() * 10000) + 1);
    var mailOptions = {
        from: 'XXXXXX',
        to: email,
        subject: 'Advocate case dairy email verification!.',
        text: "Your verification code is :"+OTP
    };
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
          // User.updateOne({Email : email},{$set : {OTP : OTP }},function(err,data){
          //   if(err) res.send({data :[], message :"error occured in server!.",status: 400})
          //     if(data){
          //       res.send({message :"OTP send on your mail!.",status: 200})
          //         console.log('Email sent: ' + info.response);
          //     }
          // })
          console.log('Email sent: ' + info.response);
        }
    })
}

    exports.registration = registration;
    exports.login  = login;
    exports.verifyEmail = verifyEmail;
    exports.forgotPassword = forgotPassword;
    exports.resetPasswordByUserId = resetPasswordByUserId;
    exports.updatePassword = updatePassword;
    exports.checkEmail = checkEmail;
    exports.sendOTPmail = sendOTPmail;