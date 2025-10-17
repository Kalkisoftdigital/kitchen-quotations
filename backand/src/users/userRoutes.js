const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const app = require('../../index'); 
//conect my sql database

const db = mysql.createConnection({
    host: 'localhost', // MySQL server host
    user: 'root', // root is name in MySQL username
    password: '', // always blank in xampp
    database: 'lead_management_project',
    port: 3306
  });
  
//get single user by ID
router.get('/users', (req, res) => {
    console.log('Get all users');
    let qrr = `SELECT * FROM users`;
    db.query(qrr, (err, results) => {
      if (err) {
        console.log(err, 'error');
      }
  
      if (results.length > 0) {
        res.send({
          message: 'All users Data',
          data: results
        });
      }
    });
  });
  
  // get all data from database
  router.get('/user/:id', (req, res) => {
    console.log('Get each users BY ID', req.params.id);
    let qrId = req.params.id; //to store/hold id
    let qr = `SELECT * FROM users where id = ${qrId}`;
    db.query(qr, (err, results) => {
      if (err) {
        console.log(err);
      }
  
      if (results.length > 0) {
        res.send({
          message: 'Get user by id',
          data: results
        });
      } else {
        res.send({
          message: 'id not found'
        });
      }
    });
  });
  
  // post method
  router.post('/user', (req, res) => {
    console.log(req.body, 'post data successfully');
    let fullName = req.body.fullname;
    let Email = req.body.email;
    let Mobile = req.body.mobile;
    let BusinessName = req.body.businessname;
  
    let ContactPerson = req.body.contact_person;
    let SelectState = req.body.select_state;
    let SelectCity = req.body.select_city;
    let Address = req.body.address;
    let Pincode = req.body.pincode;
    let Gst_in = req.body.GST_IN;
    let LandlineNo = req.body.landline_no;
  
    //data create query
    let qr = `insert into users(fullname,email,mobile,businessname,contact_person,select_state,select_city,address,pincode,GST_IN,landline_no)
    value(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
    db.query(qr, [fullName, Email, Mobile, BusinessName, ContactPerson, SelectState, SelectCity, Address, Pincode, Gst_in, LandlineNo], (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send({
          message: 'Failed to create data!',
          error: err
        });
        return;
      }
  
      res.status(201).send({
        message: 'Data created successfully!',
        data: results
      });
    });
  });
  
  //update data by id
  router.put('/user/:id', (req, res) => {
    console.log(req.body, 'update data');
    let uID = req.params.id;
    let fullName = req.body.fullname;
    let Email = req.body.email;
    let Mobile = req.body.mobile;
    let BusinessName = req.body.businessname;
  
    let ContactPerson = req.body.contact_person;
    let SelectState = req.body.select_state;
    let SelectCity = req.body.select_city;
    let Address = req.body.address;
    let Pincode = req.body.pincode;
    let Gst_in = req.body.GST_IN;
    let LandlineNo = req.body.landline_no;
    //data update query
    let qr = `update users set fullname = '${fullName}', email = '${Email}', 
    mobile = '${Mobile}', businessname = '${BusinessName}',
    contact_person = '${ContactPerson}',
    select_state = '${SelectState}', select_city = '${SelectCity}', address = '${Address}',
    pincode = '${Pincode}', GST_IN = '${Gst_in}', landline_no = '${LandlineNo}' where id = ${uID}`;
  
    db.query(qr, (err, results) => {
      if (err) {
        console.log(err);
      }
  
      res.send({
        message: 'Data updated successfully!'
        // data: results
      });
    });
  });
  
  //delete data by id
  router.delete('/user/:id', (req, res) => {
    console.log(req.body, 'data deleted');
    let uID = req.params.id;
  
    //data update query
    let qr = `delete from users where id = '${uID}'`;
  
    db.query(qr, (err, results) => {
      if (err) {
        console.log(err);
      }
  
      res.send({
        message: 'Data deleted successfully!'
        // data: results
      });
    });
  });

  module.exports = router;