var express = require('express');
var mongoose = require('mongoose');
var Case = require('../models/caseModel.js');
var Hearing = require('../models/hearing.js');

var addNewCase = function(req,res){
      reqobj = {
         caseName  : req.body.caseName,
         engagedFor : req.body.engagedFor,
         courtName  : req.body.courtName,
         clientname  : req.body.clientname,
         opposite_Party_Name  : req.body.opposite_Party_Name,
         opposite_Party_Advocate  : req.body.opposite_Party_Advocate,
         applicable_Act  : req.body.applicable_Act,
         remarks   : req.body.remarks,
         case_state  : req.body.case_state,
         endDate : req.body.endDate,
         startDate : req.body.startDate
       };
        if(reqobj.caseName && reqobj.engagedFor && reqobj.courtName && reqobj.clientname && reqobj.opposite_Party_Name && reqobj.opposite_Party_Advocate && reqobj.applicable_Act){
              Case.create(reqobj,(err,data) => {
                  if(err){
                  res.json({message : "There  is error to save  info in db",status : 400,err:err})
                  }
                  else if(data){
                  res.json({message: "Your case has been listed in our files!.",status : 200 })
                }
                else{
                  res.json({message : "Please enter the correct details"})
                }
              })
            }
            else {
               res.json({message : "Please enter the all required fields ",status : 400})
            }
    }

makeCaseImportant =  (req,res) => {
    condition ={_id : req.body.caseId};
    updateParams = {
      important : req.body.important,
      isAdjourned : req.body.isAdjourned
    }

    Case.updateOne(condition,{$set : updateParams},(err,data)=>{
      if(err){
        res.json({message : "There is error to update data in db",status : 400})
      }else if(data){
        res.json({message : "You make, your case is important!.",status : 200,records : data})
      }else{
        res.json({message : "Error to get data",status : 400})
      }
    })
  }

  getAllCase =  (req,res) => {
    _id = req.body.userId;
    Case.find({},(err,data)=>{
      if(err){
        res.json({message : "There is error to get data from db",data : 400})
      }else if(data){
        res.json({message : "All cases records  here",status : 200,records : data})
      }else{
        res.json({message : "Error to get data",status : 400})
      }
    })
  }

 getCurrentCase =  (req,res) => {
    _id = req.body.userId;
    searchDate = new Date(req.body.date);
    
    Case.find({startDate : searchDate},(err,data)=>{
      if(err){
        res.json({message : "There is error to get data from db",data : 400})
      }else if(data){
        res.json({message : "All cases records  here",status : 200,records : data})
      }else{
        res.json({message : "Error to get data",status : 400})
      }
    })
  }


   getCaseById =  (req,res) => {
    let Id = req.body.id;
    Case.find({_id : Id},(err,data)=>{
      if(err){
        res.json({message : "There is error to get data from db", status : 400})
      }else if(data){
        res.json({message : "Your Case.",status : 200,records : data})
      }else{
        res.json({message : "Error to get data",status : 400})
      }
    })
  }


    addNewHearing = (req,res)=>{
      reqobj = {
                  selectCase : req.body.caseId,
                  fixedFor :req.body.fixedFor,
                  scheduled_Date :req.body.scheduled_Date,
                  remarks  : req.body.remarks
      }
        if(reqobj.selectCase,reqobj.fixedFor && reqobj.scheduled_Date && reqobj.remarks){
      Hearing.create(reqobj,(err,data)=>{
        if(err){
        res.json({message : "There  is error to save  info in db",data : 400})
        }
        else if(data){
        res.json({message: "New hearing of case Scheduled successfully",data : 200 })
      }
      else{
        res.json({message : "Please enter the correct details"})
      }
    })
  }
  else {
     res.json({message : "Please enter the all required fields ",data : 200})
  }

}
getHearingByUserid =  (req,res) => {
  _id = req.body.userId;
  Hearing.findOne({_id},{}).populate("selectCase").exec(function(err, data){
            if(err){
              res.json({message : "Please enter the correct details",status :400})
            }else if(data) {
              res.json({message : "Hearing detailed received sucessfully",status:200,data :data})
            }else {res.json({message : "Please enter the correct userId",status : 400})
          }
  })
}
//get All hearing api regarding all cases .
 getAllHearing = (req,res)=>{
   Hearing.find({}).populate("selectCase").exec(function(err, data){
     if(err){
       res.json({message : "error to get data from db",status : 400})
     }else if(data) {
       res.json({message : "All hearing details are get sucessfully regarding all cases",status : 200,data:data})
     }else{
       res.json({message : "error to get the data",status : 400})
     }
   })
 }

getCaseByDate = (req, res) =>{

  console.log("***filter",req.body);

if(req.body.startDate!='' || req.body.endDate !='' || req.body.caseName){
let startDate = new Date(req.body.startDate);
let endDate = new Date(req.body.endDate);

let condition ={};
  if(req.body.caseName){
    condition = {
      caseName : {'$regex' : req.body.caseName, '$options' : 'i'}
    }
  }

  else if(startDate!='' || endDate !=''){
    console.log('**date find::',startDate,endDate);
     conditions = {
        $and: [
                {isDeleted: false},
                { $or : [
                            {startDate : {"$gte":startDate}},
                            {endDate :{"$lte" :endDate}}
                        ]
                }
            ]   
    };  
  }

    Case.find(condition,{},function(err,data){
      if(err)  res.json({message : "error to get the data",status : 400})
      if(!data) res.json({message : "No data found!.",status : 400, data : []})
      else res.json({message : "Get data successfully!.",status : 200, data : data})  
    });
}
  else{
    return res.json({message : "Please select filter type!.",status : 400, data : []})  
  }

}
     exports.addNewCase = addNewCase;
     exports.getAllCase = getAllCase;
     exports.addNewHearing = addNewHearing;
     exports.getHearingByUserid = getHearingByUserid;
     exports.getAllHearing = getAllHearing;
     exports.getCaseById = getCaseById;
     exports.getCaseByDate = getCaseByDate;
     exports.makeCaseImportant = makeCaseImportant;
     exports.getCurrentCase = getCurrentCase;