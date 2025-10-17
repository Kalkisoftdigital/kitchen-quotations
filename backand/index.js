const express = require('express');
const bodyparser = require('body-parser');
const nodemailer = require('nodemailer');
const pdf = require('html-pdf');
const fs = require('fs');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken');
//conect my sql database
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');
const axios = require('axios');
const app = express();
require('dotenv').config(); //to access .env file above index.js

const db = mysql.createConnection({
  host: process.env.DB_HOST, // MySQL server host from .env
  user: process.env.DB_USER, // MySQL username from .env
  password: process.env.DB_PASSWORD, // MySQL password from .env
  database: process.env.DB_NAME, // MySQL database name from .env
  port: process.env.DB_PORT || 3306 // MySQL port from .env, default to 3306 if not set
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage: storage });

const storages = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Initialize multer with storage options
const uploads = multer({ storage: storages });

// check MySQL database connection
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
  }
  console.log('Connected to MySQL database Successfully!!!');
});

app.use(bodyparser.json({ limit: '10mb' })); // Adjust the limit as needed
app.use(bodyparser.urlencoded({ limit: '10mb', extended: true })); // For URL-encoded payloads

// const connection = require('./connection');
app.use(cors());
// app.use(bodyparser.json());
app.listen(process.env.PORT || 3000, () => {
  // Use PORT from .env or default to 3000
  console.log(`-----------nodejs - server running on port ${process.env.PORT || 3000}-------`);
});

// Configure Nodemailer transporter with hardcoded credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: 'nabyteknashik@gmail.com', // Replace with your Email Id
    pass: 'cmzpzhzlojpksvqq' // Replace with your App Password
  }
});

app.use(express.static(path.join(__dirname, 'uploads')));

app.post('/importExcel', upload.single('excelFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const loginId = req.body.login_id;
    const superadminId = req.body.superadmin_id;
    const loginCompany = req.body.login_company;
    const loginUserName = req.body.loginUserName;
    const role = req.body.role;
    const jsonData = JSON.parse(req.body.data); // Parse the incoming JSON data

    jsonData.forEach((row) => {
      const {
        name,
        owner_mobile,
        email,
        contact_number,
        business_name,
        contact_person,
        state,
        city,
        address,
        pincode,
        gst_in,
        landline_no
      } = row;

      const query = `INSERT INTO users(name, owner_mobile, email, contact_number, business_name, contact_person, state, city, address, pincode, gst_in, landline_no, login_id, superadmin_id, login_company, loginUserName, role)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(
        query,
        [
          name,
          owner_mobile,
          email,
          contact_number,
          business_name,
          contact_person,
          state,
          city,
          address,
          pincode,
          gst_in,
          landline_no,
          loginId,
          superadminId,
          loginCompany,
          loginUserName,
          role
        ],
        (err, results) => {
          if (err) {
            // Handle error appropriately
          }
        }
      );
    });

    fs.unlinkSync(req.file.path); // Delete uploaded file after processing
    res.status(200).json({ message: 'File uploaded and data inserted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/sendQuotationEmail', async (req, res) => {
  try {
    const {
      fileName,
      pdfData,
      recipientEmail,
      customerName,
      senderEmail,
      companyEmail,
      companyName,
      userName,
      superAdmin_name,
      superAdminId,
      User_id,
      quotationId,
      companyId,
      businessName,
      serviceNames
    } = req.body;

    const pdfBuffer = Buffer.from(pdfData, 'base64');

    // Construct mail options
    const mailOptions = {
      from: senderEmail,
      to: recipientEmail,
      cc: companyEmail,
      subject: `Quotation for Modular Kitchen from Signet Kitchen Studio`,
      html: `<p>Dear <b>${customerName}</b>,</p>
      <p>Thank you for considering <b>Signet Kitchen Studio</b> for your needs. Please find the quotation attached to this email.</p>`,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer
        }
      ]
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Save data to email_send_data table
    // Save data to email_send_data table
    const insertQuery = `INSERT INTO email_send_data (fileName, recipientEmail, senderEmail, companyEmail, companyName, userName, superAdmin_name, superAdminId, User_id, quotationId, companyId, businessName, serviceNames) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await db
      .promise()
      .query(insertQuery, [
        fileName,
        recipientEmail,
        senderEmail,
        companyEmail,
        companyName,
        userName,
        superAdmin_name,
        superAdminId,
        User_id,
        quotationId,
        companyId,
        businessName,
        serviceNames
      ]);

    // Update enquiry table to set quotationMailSend to 'yes'
    const updateQuery = `UPDATE enquiry SET quotationMailSend = 'yes' WHERE business_name = ?`;

    await db.promise().query(updateQuery, [businessName]);

    // Respond with success message
    res.status(200).json({ message: 'Email sent, data saved, and enquiry updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --------------------- email send data start-------------------------------

// --------------- enquiry start-------------
// CRUD operations for Enquiry table

// get all enquiries

app.get('/allEnquiriesList', (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || 25;
  let offset = (page - 1) * pageSize;
  let userId = parseInt(req.query.userId, 10);
  let loginCompany = req.query.loginCompany;
  let userRole = req.query.userRole;

  // Base queries
  let countQuery = 'SELECT COUNT(*) AS total FROM enquiry';
  let query = 'SELECT * FROM enquiry';
  let queryParams = [];

  // Filtering logic based on userRole
  if (userRole === 'superadmin') {
    // Superadmins can see all data for their company
    if (loginCompany) {
      countQuery += ' WHERE login_company = ?';
      query += ' WHERE login_company = ?';
      queryParams.push(loginCompany);
    }
  } else if (userRole === 'manager') {
    // Managers can see all data for their company except superadmins
    if (loginCompany) {
      countQuery += " WHERE login_company = ? AND role != 'superadmin'";
      query += " WHERE login_company = ? AND role != 'superadmin'";
      queryParams.push(loginCompany);
    }
  } else if (userRole === 'executive') {
    // Executives can see all data for their company except superadmins and managers
    if (loginCompany) {
      countQuery += " WHERE login_company = ? AND role != 'superadmin' AND role != 'manager'";
      query += " WHERE login_company = ? AND role != 'superadmin' AND role != 'manager'";
      queryParams.push(loginCompany);
    }
  } else {
    // Default case if userRole is not defined or other roles are introduced
    res.status(403).send({ error: 'Access denied' });
    return;
  }

  // Append pagination to the query
  query += ' ORDER BY createdOn DESC LIMIT ?, ?';
  queryParams.push(offset, pageSize);

  // Execute count query
  db.query(countQuery, queryParams.slice(0, -2), (err, countResults) => {
    if (err) {
      res.status(500).send({ error: 'Error counting enquiries' });
      return;
    }

    let totalItems = countResults[0].total;

    // Execute data query
    db.query(query, queryParams, (err, results) => {
      if (err) {
        res.status(500).send({ error: 'Error fetching enquiries' });
        return;
      }

      res.send({ message: 'Enquiries with pagination', data: results, total: totalItems });
    });
  });
});

app.get('/enquiries', (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || 25;
  let offset = (page - 1) * pageSize;

  // Query to get the total number of items
  let countQuery = 'SELECT COUNT(*) AS total FROM enquiry';

  // Check if userId is provided in query params
  if (req.query.userId) {
    let userId = parseInt(req.query.userId, 10);

    countQuery += ' WHERE loginenq_id = ?';

    let query = 'SELECT * FROM enquiry WHERE loginenq_id = ? LIMIT ?, ?';
    db.query(countQuery, [userId], (err, countResults) => {
      if (err) {
        res.status(500).send({ error: 'Error counting enquiries for user' });
        return;
      }

      let totalItems = countResults[0].total;
      db.query(query, [userId, offset, pageSize], (err, results) => {
        if (err) {
          res.status(500).send({ error: 'Error fetching enquiries for user' });
          return;
        }

        res.send({ message: 'enquiries with pagination', data: results, total: totalItems });
      });
    });
  } else {
    // If userId is not provided, fetch all users with pagination
    let query = 'SELECT * FROM enquiry LIMIT ?, ?';
    db.query(countQuery, (err, countResults) => {
      if (err) {
        res.status(500).send({ error: 'Error counting all enquiries' });
        return;
      }

      let totalItems = countResults[0].total;
      db.query(query, [offset, pageSize], (err, results) => {
        if (err) {
          res.status(500).send({ error: 'Error fetching enquiries' });
          return;
        }

        res.send({ message: 'All enquiries with pagination', data: results, total: totalItems });
      });
    });
  }
});

// get enquiry by ID
app.get('/enquiry/:id', (req, res) => {
  let enquiryId = req.params.id;
  let query = `SELECT * FROM enquiry WHERE id = ?`;
  db.query(query, [enquiryId], (err, results) => {
    if (err) {
      res.status(500).send({
        message: 'Error fetching enquiry from database',
        error: err
      });
      return;
    }

    if (results.length > 0) {
      res.send({
        message: 'Enquiry found',
        data: results[0]
      });
    } else {
      res.status(404).send({
        message: 'Enquiry not found'
      });
    }
  });
});

// create a new enquiry
app.post('/enquiry', (req, res) => {
  let enquiry = req.body;
  let query = `INSERT INTO enquiry SET ?`;
  db.query(query, enquiry, (err, result) => {
    if (err) {
      res.status(500).send({
        message: 'Error creating new enquiry',
        error: err
      });
      return;
    }

    res.status(201).send({
      message: 'Enquiry created successfully',
      data: result
    });
  });
});

// update enquiry by ID
app.put('/enquiry/:id', (req, res) => {
  let enquiryId = req.params.id;
  let updatedEnquiry = req.body;
  let query = `UPDATE enquiry SET ? WHERE id = ?`;
  db.query(query, [updatedEnquiry, enquiryId], (err, result) => {
    if (err) {
      res.status(500).send({
        message: 'Error updating enquiry',
        error: err
      });
      return;
    }

    res.send({
      message: 'Enquiry updated successfully'
    });
  });
});

// Delete enquiry by ID
app.delete('/enquiry/:id', (req, res) => {
  let enquiryId = req.params.id;

  // First, delete related enquiry details
  let deleteEnquiryDetailsQuery = `DELETE FROM enquirydetail WHERE enquiryId = ?`;
  db.query(deleteEnquiryDetailsQuery, [enquiryId], (err, result) => {
    if (err) {
      res.status(500).send({
        message: 'Error deleting enquiry details',
        error: err
      });
      return;
    }

    // Once enquiry details are deleted, delete the enquiry
    let deleteEnquiryQuery = `DELETE FROM enquiry WHERE id = ?`;
    db.query(deleteEnquiryQuery, [enquiryId], (err, result) => {
      if (err) {
        res.status(500).send({
          message: 'Error deleting enquiry',
          error: err
        });
        return;
      }

      res.send({
        message: 'Enquiry and related details deleted successfully'
      });
    });
  });
});

// get enquiry details by enquiry ID
app.get('/enquiry/:id/details', (req, res) => {
  let enquiryId = req.params.id;
  let query = `SELECT * FROM enquirydetail WHERE enquiryId = ?`; // Use enquiryId instead of enquiry_id
  db.query(query, [enquiryId], (err, results) => {
    if (err) {
      res.status(500).send({
        message: 'Error fetching enquiry details from database',
        error: err
      });
      return;
    }

    res.send({
      message: 'Enquiry details found',
      data: results
    });
  });
});

app.get('/enquiryDashboard/:id/details', (req, res) => {
  const enquiryId = parseInt(req.params.id);
  const userId = parseInt(req.query.userId);
  const userRole = req.query.userRole; // Role from session
  const loginCompany = req.query.loginCompany; // Company from session

  // Check if the user is authenticated and has the necessary role and company
  if (!userRole || !loginCompany) {
    return res.status(403).send({ message: 'Access denied. User role or company is missing.' });
  }

  // Base query to check if the enquiry exists
  let checkEnquiryQuery = `SELECT * FROM enquiry WHERE id = ? AND login_company = ?`;
  let queryParams = [enquiryId, loginCompany];

  // Modify the query based on the user role
  if (userRole === 'superadmin') {
    // Superadmins can access all data
    // No additional filtering needed here
  } else if (userRole === 'manager') {
    // Managers can access all data for their company except superadmin
    checkEnquiryQuery += " AND role != 'superadmin'";
  } else if (userRole === 'executive') {
    // Executives can access all data for their company except superadmin and manager
    checkEnquiryQuery += " AND role != 'superadmin' AND role != 'manager'";
  } else {
    return res.status(403).send({ message: 'Access denied. User role is not recognized.' });
  }

  // Execute the check enquiry query
  db.query(checkEnquiryQuery, queryParams, (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error checking enquiry in the database', error: err });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'Enquiry not found for the specified user' });
    }

    // If the enquiry exists for the given user and role, fetch the enquiry details
    const query = 'SELECT * FROM enquirydetail WHERE enquiryId = ?';
    db.query(query, [enquiryId], (err, detailsResults) => {
      if (err) {
        return res.status(500).send({ message: 'Error fetching enquiry details from database', error: err });
      }

      res.send({
        message: 'Enquiry details found',
        data: detailsResults
      });
    });
  });
});

// Define updateEnquiryStatus function
function updateEnquiryStatus(enquiryId, newStatus) {
  let updateQuery = `UPDATE enquiry SET status_main = ? WHERE id = ?`;

  db.query(updateQuery, [newStatus, enquiryId], (err, result) => {
    if (err) {
      return;
    }
  });
}

// POST endpoint to add new enquiry detail
app.post('/enquiry/:id/detail', uploads.single('member_files'), (req, res) => {
  let enquiryId = req.params.id;
  let enquiryDetail = req.body;
  enquiryDetail.enquiryId = enquiryId; // Set the enquiryId from the URL parameter

  if (req.file) {
    enquiryDetail.member_files = req.file.filename; // Store the filename in the database
  }

  let insertQuery = `INSERT INTO enquirydetail (date, remark, status, time, member_files, enquiryId, loginUserName, role, login_company) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    insertQuery,
    [
      enquiryDetail.date,
      enquiryDetail.remark,
      enquiryDetail.status,
      enquiryDetail.time,
      enquiryDetail.member_files,
      enquiryDetail.enquiryId,
      enquiryDetail.loginUserName || '', // Ensure no null values
      enquiryDetail.role || '', // Ensure no null values
      enquiryDetail.login_company || '' // Ensure no null values
    ],
    (err, result) => {
      if (err) {
        res.status(500).send({
          message: 'Error creating new enquiry detail',
          error: err
        });
        return;
      }

      // Update status_main in enquiry table with the latest status from enquirydetail
      updateEnquiryStatus(enquiryId, enquiryDetail.status);

      res.status(201).send({
        message: 'Enquiry detail created successfully',
        data: result
      });
    }
  );
});

// Delete enquiry detail by ID

app.delete('/enquiry/:enquiryId/detail/:detailId', (req, res) => {
  let enquiryId = req.params.enquiryId;
  let detailId = req.params.detailId;

  // Construct SQL query to retrieve member_files
  let fileQuery = `SELECT member_files FROM enquirydetail WHERE id = ? AND enquiryId = ?`;

  // Execute fileQuery to retrieve member_files
  db.query(fileQuery, [detailId, enquiryId], (fileErr, fileResult) => {
    if (fileErr) {
      res.status(500).send({
        message: 'Error retrieving member_files for deletion',
        error: fileErr
      });
      return;
    }

    // Check if member_files exist and delete the file from server if it does
    if (fileResult.length > 0 && fileResult[0].member_files) {
      let fileName = fileResult[0].member_files;
      let filePath = `./uploads/${fileName}`; // Adjust the path as per your file storage location

      // Delete the file from server
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          res.status(500).send({
            message: 'Error deleting file',
            error: unlinkErr
          });
          return;
        }

        // Proceed with deleting the enquiry detail from database
        deleteEnquiryDetailFromDB();
      });
    } else {
      // No file associated or no member_files found, proceed with deleting the enquiry detail from database
      deleteEnquiryDetailFromDB();
    }
  });

  // Function to delete enquiry detail from database
  function deleteEnquiryDetailFromDB() {
    // Construct SQL query to delete enquiry detail
    let query = `DELETE FROM enquirydetail WHERE id = ? AND enquiryId = ?`;

    // Execute query
    db.query(query, [detailId, enquiryId], (err, result) => {
      if (err) {
        res.status(500).send({
          message: 'Error deleting enquiry detail',
          error: err
        });
        return;
      }

      if (result.affectedRows === 0) {
        res.status(404).send({
          message: 'Enquiry detail not found'
        });
        return;
      }

      res.send({
        message: 'Enquiry detail deleted successfully'
      });
    });
  }
});

// update enquiry detail by ID

app.put('/enquiry/detail/:id', uploads.single('member_files'), (req, res) => {
  let detailId = req.params.id;
  let { date, remark, status, time, loginUserName, role, login_company } = req.body;
  let memberFiles = req.file ? req.file.filename : null;

  let updateQuery = `UPDATE enquirydetail SET `;
  let queryParams = [];

  if (date) {
    updateQuery += `date = ?, `;
    queryParams.push(date);
  }
  if (remark) {
    updateQuery += `remark = ?, `;
    queryParams.push(remark);
  }
  if (status) {
    updateQuery += `status = ?, `;
    queryParams.push(status);
  }
  if (time) {
    updateQuery += `time = ?, `;
    queryParams.push(time);
  }
  if (memberFiles) {
    updateQuery += `member_files = ?, `;
    queryParams.push(memberFiles);
  }
  if (loginUserName) {
    updateQuery += `loginUserName = ?, `;
    queryParams.push(loginUserName);
  }
  if (role) {
    updateQuery += `role = ?, `;
    queryParams.push(role);
  }
  if (login_company) {
    updateQuery += `login_company = ?, `;
    queryParams.push(login_company);
  }

  updateQuery = updateQuery.slice(0, -2); // Remove trailing comma and space
  updateQuery += ` WHERE id = ?`;
  queryParams.push(detailId);

  db.query(updateQuery, queryParams, (err, results) => {
    if (err) {
      res.status(500).send({
        message: 'Error updating enquiry detail',
        error: err
      });
      return;
    }

    // Fetch the enquiryId associated with this detailId
    let getEnquiryIdQuery = `SELECT enquiryId FROM enquirydetail WHERE id = ?`;
    db.query(getEnquiryIdQuery, [detailId], (err, results) => {
      if (err) {
        res.status(500).send({
          message: 'Error fetching enquiryId from enquirydetail',
          error: err
        });
        return;
      }

      let enquiryId = results[0].enquiryId;

      // Fetch the latest status from enquirydetail for this enquiryId
      let getLatestStatusQuery = `SELECT status FROM enquirydetail WHERE enquiryId = ? ORDER BY id DESC LIMIT 1`;
      db.query(getLatestStatusQuery, [enquiryId], (err, results) => {
        if (err) {
          return;
        }

        if (results.length > 0) {
          let latestStatus = results[0].status;

          // Update status_main in enquiry table with the latest status
          updateEnquiryStatus(enquiryId, latestStatus);
        }

        res.send({
          message: 'Enquiry detail updated successfully'
        });
      });
    });
  });
});

//--------------- enquiry ends ----------------

// -------------------------------- QUOTATIONS start -------------------------------------
// get all QUOTATIONS

app.get('/quotationsList', (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || 25;
  let offset = (page - 1) * pageSize;
  let userId = parseInt(req.query.userId, 10);
  let loginCompany = req.query.loginCompany;
  let userRole = req.query.userRole; // Added role check

  // Base count query
  let countQuery = 'SELECT COUNT(*) AS total FROM quotation';
  let query = 'SELECT * FROM quotation';

  if (userRole === 'superadmin') {
    if (loginCompany) {
      countQuery += ' WHERE login_company = ?';
      query += ' WHERE login_company = ?';
    }
  } else {
    if (userId) {
      countQuery += ' WHERE loginserquot_id = ?';
      query += ' WHERE loginserquot_id = ?';
    }
  }

  query += ' LIMIT ?, ?';

  db.query(countQuery, [loginCompany || userId], (err, countResults) => {
    if (err) {
      res.status(500).send({ error: 'Error counting quotations' });
      return;
    }

    let totalItems = countResults[0].total;
    db.query(query, [loginCompany || userId, offset, pageSize], (err, results) => {
      if (err) {
        res.status(500).send({ error: 'Error fetching quotations' });
        return;
      }

      res.send({ message: 'Quotations with pagination', data: results, total: totalItems });
    });
  });
});
app.get('/allQuotations', (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || 25;
  let offset = (page - 1) * pageSize;
  let userId = parseInt(req.query.userId, 10);
  let loginCompany = req.query.loginCompany;
  let userRole = req.query.userRole;

  // Base queries
  let countQuery = 'SELECT COUNT(*) AS total FROM quotation';
  let query = 'SELECT * FROM quotation';
  let queryParams = [];

  // Filtering logic based on userRole
  if (userRole === 'superadmin') {
    // Superadmins can see all data for their company
    if (loginCompany) {
      countQuery += ' WHERE login_company = ?';
      query += ' WHERE login_company = ?';
      queryParams.push(loginCompany);
    }
  } else if (userRole === 'manager') {
    // Managers can see all data for their company except superadmins
    if (loginCompany) {
      countQuery += " WHERE login_company = ? AND role != 'superadmin'";
      query += " WHERE login_company = ? AND role != 'superadmin'";
      queryParams.push(loginCompany);
    }
  } else if (userRole === 'executive') {
    // Executives can see all data for their company except superadmins and managers
    if (loginCompany) {
      countQuery += " WHERE login_company = ? AND role != 'superadmin' AND role != 'manager'";
      query += " WHERE login_company = ? AND role != 'superadmin' AND role != 'manager'";
      queryParams.push(loginCompany);
    }
  } else {
    // Default case if userRole is not defined or other roles are introduced
    res.status(403).send({ error: 'Access denied' });
    return;
  }

  // Append pagination to the query
  query += ' ORDER BY customer_name, created_at ASC LIMIT ?, ?';
  queryParams.push(offset, pageSize);

  // Execute count query
  db.query(countQuery, queryParams.slice(0, -2), (err, countResults) => {
    if (err) {
      res.status(500).send({ error: 'Error counting quotations' });
      return;
    }

    let totalItems = countResults[0].total;

    // Execute data query
    db.query(query, queryParams, (err, results) => {
      if (err) {
        res.status(500).send({ error: 'Error fetching quotations' });
        return;
      }

      res.send({ message: 'Quotations with pagination', data: results, total: totalItems });
    });
  });
});

app.get('/quotations', (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || 25;
  let offset = (page - 1) * pageSize;

  // Query to get the total number of items
  let countQuery = 'SELECT COUNT(*) AS total FROM quotation';

  // Check if userId is provided in query params
  if (req.query.userId) {
    let userId = parseInt(req.query.userId, 10);

    countQuery += ' WHERE loginserquot_id = ?';

    let query = 'SELECT * FROM quotation WHERE loginserquot_id = ? LIMIT ?, ?';
    db.query(countQuery, [userId], (err, countResults) => {
      if (err) {
        res.status(500).send({ error: 'Error counting quotations for user' });
        return;
      }

      let totalItems = countResults[0].total;
      db.query(query, [userId, offset, pageSize], (err, results) => {
        if (err) {
          res.status(500).send({ error: 'Error fetching quotations for user' });
          return;
        }

        res.send({ message: 'quotations with pagination', data: results, total: totalItems });
      });
    });
  } else {
    // If userId is not provided, fetch all users with pagination
    let query = 'SELECT * FROM quotation LIMIT ?, ?';
    db.query(countQuery, (err, countResults) => {
      if (err) {
        res.status(500).send({ error: 'Error counting all quotations' });
        return;
      }

      let totalItems = countResults[0].total;
      db.query(query, [offset, pageSize], (err, results) => {
        if (err) {
          res.status(500).send({ error: 'Error fetching quotations' });
          return;
        }

        res.send({ message: 'All quotations with pagination', data: results, total: totalItems });
      });
    });
  }
});

// get quotation by ID

app.get('/quotation/:quotation_id', (req, res) => {
  let quotationId = req.params.quotation_id;

  // Fetch quotation details
  db.query(`SELECT * FROM quotation WHERE quotation_id = ?`, [quotationId], (err, quotationRows) => {
    if (err) {
      res.status(500).send({
        message: 'Error fetching quotation by ID',
        error: err
      });
      return;
    }

    // If quotation not found, send 404 response
    if (quotationRows.length === 0) {
      res.status(404).send({
        message: 'Quotation with the provided ID not found'
      });
      return;
    }

    // Fetch descriptions for the quotation
    db.query(`SELECT * FROM quotations_descriptions WHERE quotation_id = ?`, [quotationId], (err, descriptionRows) => {
      if (err) {
        res.status(500).send({
          message: 'Error fetching descriptions for the quotation',
          error: err
        });
        return;
      }

      // Combine quotation and descriptions data
      const responseData = {
        quotation: quotationRows[0],
        descriptions: descriptionRows
      };

      res.status(200).send({
        message: 'Quotation details retrieved successfully',
        data: responseData
      });
    });
  });
});

// Ensure the 'uploads' folder exists, or create it
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Multer configuration for file uploads
const storageimage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (PNG, JPG, JPEG, GIF) are allowed.'));
  }
};

const uploadimage = multer({
  storage: storageimage,
  fileFilter: fileFilter
});

// Handling POST request for quotation with multiple image uploads
app.post('/quotation', uploadimage.array('companyLogoOne', 6), (req, res) => {


  // Extract data from the request body for quotation
  const {
    loginserquot_id,
    quotation_date,
    reference,
    customer_name,
    other_charges,
    business_name,
    agent_commission,
    amount_show_hide,
    consignee_address,
    gstin_no,
    state,
    contact_number,
    email,
    transport,
    discount,
    discountedAmount,
    IGST,
    igstAmount,
    cgst,
    cgstAmount,
    sgst,
    sgstAmount,
    total_quantity,
    total_rate,
    total_amount,
    grand_total,
    integrated_amount,
    special_discount,
    special_discount_remark,
    is_coppied,
    type_of_commission,
    copy_remark,
    special_discount_total,
    grand_total_in_words,
    discounted_total_amount_display,
    remark,
    login_company,
    loginUserName,
    role,
    select_customer,
    quotations_descriptions
  } = req.body;

  // Handle multiple image uploads
  let companyLogoOne = [];
  if (req.files && req.files.length > 0) {
    companyLogoOne = req.files.map((file) => file.filename);
  } else if (req.body.companyLogoOne && Array.isArray(req.body.companyLogoOne)) {
    // Handle base64 images
    req.body.companyLogoOne.forEach((base64Image) => {
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const ext = base64Image.match(/data:image\/(\w+);base64,/)[1];
      const fileName = `itemImage_${Date.now()}_${Math.round(Math.random() * 1e9)}.${ext}`;
      const imagePath = path.join(uploadDir, fileName);

      fs.writeFileSync(imagePath, base64Data, 'base64');
      companyLogoOne.push(fileName);
    });
  }

  // Data creation query for quotation
  const quotationQuery = `INSERT INTO quotation (companyLogoOne, loginserquot_id, quotation_date, reference, customer_name, other_charges, business_name, agent_commission, amount_show_hide, consignee_address, gstin_no, state, contact_number, email, transport, discount, discountedAmount, IGST, igstAmount, cgst, cgstAmount, sgst, sgstAmount, total_quantity, total_rate, total_amount, grand_total, integrated_amount, special_discount, special_discount_remark, is_coppied, type_of_commission, copy_remark, special_discount_total, grand_total_in_words, discounted_total_amount_display, remark, login_company, loginUserName, role, select_customer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    quotationQuery,
    [
      JSON.stringify(companyLogoOne),
      loginserquot_id,
      quotation_date,
      reference,
      customer_name,
      other_charges,
      business_name,
      agent_commission,
      amount_show_hide,
      consignee_address,
      gstin_no,
      state,
      contact_number,
      email,
      transport,
      discount,
      discountedAmount,
      IGST,
      igstAmount,
      cgst,
      cgstAmount,
      sgst,
      sgstAmount,
      total_quantity,
      total_rate,
      total_amount,
      grand_total,
      integrated_amount,
      special_discount,
      special_discount_remark,
      is_coppied,
      type_of_commission,
      copy_remark,
      special_discount_total,
      grand_total_in_words,
      discounted_total_amount_display,
      remark,
      login_company,
      loginUserName,
      role,
      select_customer
    ],
    (err, result) => {
      if (err) {
        res.status(500).send({
          message: 'Error creating new quotation',
          error: err
        });
        return;
      }

      // Handle descriptions if provided
      const quotationId = result.insertId;
      if (quotations_descriptions && quotations_descriptions.length > 0) {
        const descriptionValues = quotations_descriptions.map((description) => [
          quotationId,
          description.select_service,
          description.purchase_price,
          description.shelves_count,
          description.al_profile,
          description.multitop_profile,
          description.plastic_clip,
          description.valleyht_profile,
          description.area_shutter,
          description.shutter_area_other,
          description.free_item_amount,
          description.safeTotalShutterArea,
          description.add_extra_area,
          description.free_item_desc,
          description.row_commission,
          description.item_name,
          description.item_category,
          description.itemDescription,
          description.hsn_code,
          description.unit_of_measurement,
          description.quantity,
          description.rate,
          description.initial_discount,
          description.initial_sgst,
          description.initial_cgst,
          description.initial_igst,
          description.amount
        ]);

        const descriptionQuery = `INSERT INTO quotations_descriptions (quotation_id, select_service, purchase_price, shelves_count, al_profile, multitop_profile, plastic_clip, valleyht_profile, area_shutter, shutter_area_other, free_item_amount, safeTotalShutterArea, add_extra_area, free_item_desc, row_commission, item_name, item_category, itemDescription, hsn_code, unit_of_measurement, quantity, rate, initial_discount, initial_sgst, initial_cgst, initial_igst, amount) VALUES ?`;

        db.query(descriptionQuery, [descriptionValues], (err) => {
          if (err) {
            res.status(500).send({
              message: 'Error inserting new descriptions',
              error: err
            });
            return;
          }

          res.status(201).send({
            message: 'Quotation created successfully',
            data: { quotation_id: quotationId }
          });
        });
      } else {
        res.status(201).send({
          message: 'Quotation created successfully',
          data: { quotation_id: quotationId }
        });
      }
    }
  );
});

app.put('/quotation/:quotation_id', uploadimage.array('companyLogoOne', 6), (req, res) => {
  const quotationId = req.params.quotation_id;
  const {
    select_customer,
    quotation_date,
    reference,
    customer_name,
    other_charges,
    business_name,
    agent_commission,
    amount_show_hide,
    consignee_address,
    gstin_no,
    state,
    contact_number,
    email,
    transport,
    discount,
    discountedAmount,
    IGST,
    igstAmount,
    cgst,
    cgstAmount,
    sgst,
    sgstAmount,
    total_quantity,
    total_rate,
    total_amount,
    grand_total,
    integrated_amount,
    special_discount,
    special_discount_remark,
    is_coppied,
    type_of_commission,
    copy_remark,
    special_discount_total,
    grand_total_in_words,
    discounted_total_amount_display,
    remark,
    quotations_descriptions
  } = req.body;

  // Handle multiple image uploads
  let companyLogoOne = [];
  if (req.files && req.files.length > 0) {
    companyLogoOne = req.files.map((file) => file.filename);
  } else if (req.body.companyLogoOne && Array.isArray(req.body.companyLogoOne)) {
    // Handle base64 images
    req.body.companyLogoOne.forEach((base64Image) => {
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const ext = base64Image.match(/data:image\/(\w+);base64,/)[1];
      const fileName = `itemImage_${Date.now()}_${Math.round(Math.random() * 1e9)}.${ext}`;
      const imagePath = path.join(uploadDir, fileName);

      fs.writeFileSync(imagePath, base64Data, 'base64');
      companyLogoOne.push(fileName);
    });
  }

  // Begin transaction
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).send({
        message: 'Error beginning transaction',
        error: err
      });
    }

    // First, retrieve the existing image filenames from the database (if any)
    db.query(`SELECT companyLogoOne FROM quotation WHERE quotation_id = ?`, [quotationId], (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).send({
            message: 'Error retrieving existing images',
            error: err
          });
        });
      }

      const oldImages = result[0]?.companyLogoOne ? JSON.parse(result[0].companyLogoOne) : [];

      // Delete old images from the server storage (if there are any)
      oldImages.forEach((image) => {
        const imagePath = path.join(uploadDir, image);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(`Error deleting image: ${image}`, err);
          }
        });
      });

      // Update quotation details
      db.query(
        `UPDATE quotation SET companyLogoOne = ?, select_customer = ?, quotation_date = ?, reference = ?, customer_name = ?, other_charges = ?, business_name= ?, agent_commission = ?, amount_show_hide = ?, consignee_address = ?, gstin_no = ?, state = ?, contact_number = ?, email = ?, transport = ?, discount = ?, discountedAmount = ?, IGST = ?, igstAmount = ?, cgst = ?, cgstAmount = ?, sgst = ?, sgstAmount = ?, total_quantity = ?, total_rate = ?, total_amount = ?, grand_total = ?, integrated_amount = ?, special_discount = ?, special_discount_remark = ?, is_coppied = ?, type_of_commission = ?, copy_remark = ?, special_discount_total = ?, grand_total_in_words = ?, discounted_total_amount_display = ?, remark = ? WHERE quotation_id = ?`,
        [
          JSON.stringify(companyLogoOne),
          select_customer,
          quotation_date,
          reference,
          customer_name,
          other_charges,
          business_name,
          agent_commission,
          amount_show_hide,
          consignee_address,
          gstin_no,
          state,
          contact_number,
          email,
          transport,
          discount,
          discountedAmount,
          IGST,
          igstAmount,
          cgst,
          cgstAmount,
          sgst,
          sgstAmount,
          total_quantity,
          total_rate,
          total_amount,
          grand_total,
          integrated_amount,
          special_discount,
          special_discount_remark,
          is_coppied,
          type_of_commission,
          copy_remark,
          special_discount_total,
          grand_total_in_words,
          discounted_total_amount_display,
          remark,
          quotationId
        ],
        (err, result) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).send({
                message: 'Error updating quotation',
                error: err
              });
            });
          }

          // Delete all existing quotations_descriptions for the quotation
          db.query(`DELETE FROM quotations_descriptions WHERE quotation_id = ?`, [quotationId], (err, result) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).send({
                  message: 'Error deleting existing descriptions',
                  error: err
                });
              });
            }

            // Insert new quotations_descriptions
            if (quotations_descriptions && quotations_descriptions.length > 0) {
              const descriptionValues = quotations_descriptions.map((desc) => [
                quotationId,
                desc.select_service,
                desc.purchase_price,
                desc.shelves_count,
                desc.al_profile,
                desc.multitop_profile,
                desc.plastic_clip,
                desc.valleyht_profile,
                desc.area_shutter,
                desc.shutter_area_other,
                desc.free_item_amount,
                desc.safeTotalShutterArea,
                desc.add_extra_area,
                desc.free_item_desc,
                desc.row_commission,
                desc.item_name,
                desc.item_category,
                desc.itemDescription,
                desc.hsn_code,
                desc.unit_of_measurement,
                desc.quantity,
                desc.rate,
                desc.initial_discount,
                desc.initial_sgst,
                desc.initial_cgst,
                desc.initial_igst,
                desc.amount
              ]);

              db.query(
                `INSERT INTO quotations_descriptions (quotation_id, select_service, purchase_price, shelves_count, al_profile, multitop_profile, plastic_clip, valleyht_profile, area_shutter, shutter_area_other, free_item_amount, safeTotalShutterArea, add_extra_area, free_item_desc, row_commission, item_name, item_category, itemDescription, hsn_code, unit_of_measurement, quantity, rate, initial_discount, initial_sgst, initial_cgst, initial_igst, amount) VALUES ?`,
                [descriptionValues],
                (err, result) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).send({
                        message: 'Error inserting new descriptions',
                        error: err
                      });
                    });
                  }

                  // Commit transaction
                  db.commit((err) => {
                    if (err) {
                      return db.rollback(() => {
                        res.status(500).send({
                          message: 'Error committing transaction',
                          error: err
                        });
                      });
                    }

                    res.status(200).send({
                      message: 'Quotation updated successfully'
                    });
                  });
                }
              );
            } else {
              // Commit transaction if no new descriptions to insert
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).send({
                      message: 'Error committing transaction',
                      error: err
                    });
                  });
                }

                res.status(200).send({
                  message: 'Quotation updated successfully'
                });
              });
            }
          });
        }
      );
    });
  });
});



// app.put('/quotation/:quotation_id', uploadimage.array('companyLogoOne', 6),  (req, res) => {
//   const quotationId = req.params.quotation_id;
//   const {
//     select_customer,
//     quotation_date,
//     reference,
//     customer_name,
//     other_charges,
//     business_name,
//     agent_commission,
//     amount_show_hide,
//     consignee_address,
//     gstin_no,
//     state,
//     contact_number,
//     email,
//     transport,
//     discount,
//     discountedAmount,
//     IGST,
//     igstAmount,
//     cgst,
//     cgstAmount,
//     sgst,
//     sgstAmount,
//     total_quantity,
//     total_rate,
//     total_amount,
//     grand_total,
//     integrated_amount,
//     special_discount,
//     special_discount_remark,
//     is_coppied,
//     type_of_commission,
//     copy_remark,
//     special_discount_total,
//     grand_total_in_words,
//     remark,
//     quotations_descriptions
//   } = req.body;
// // Handle multiple image uploads
// let companyLogoOne = [];
// if (req.files && req.files.length > 0) {
//   companyLogoOne = req.files.map((file) => file.filename);
// } else if (req.body.companyLogoOne && Array.isArray(req.body.companyLogoOne)) {
//   // Handle base64 images
//   req.body.companyLogoOne.forEach((base64Image) => {
//     const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
//     const ext = base64Image.match(/data:image\/(\w+);base64,/)[1];
//     const fileName = `itemImage_${Date.now()}_${Math.round(Math.random() * 1e9)}.${ext}`;
//     const imagePath = path.join(uploadDir, fileName);

//     fs.writeFileSync(imagePath, base64Data, 'base64');
//     companyLogoOne.push(fileName);
//   });
// }

//   // Begin transaction
//   db.beginTransaction((err) => {
//     if (err) {
//       return res.status(500).send({
//         message: 'Error beginning transaction',
//         error: err
//       });
//     }

//     // Update quotation details
//     db.query(
//       `UPDATE quotation SET companyLogoOne = ?, select_customer = ?, quotation_date = ?, reference = ?, customer_name = ?, other_charges = ?, business_name= ?, agent_commission = ?, amount_show_hide = ?, consignee_address = ?, gstin_no = ?, state = ?, contact_number = ?, email = ?, transport = ?, discount = ?, discountedAmount = ?, IGST = ?, igstAmount = ?, cgst = ?, cgstAmount = ?, sgst = ?, sgstAmount = ?, total_quantity = ?, total_rate = ?, total_amount = ?, grand_total = ?, integrated_amount = ?, special_discount = ?, special_discount_remark = ?, is_coppied = ?, type_of_commission = ?, copy_remark = ?, special_discount_total = ?, grand_total_in_words = ?, remark = ? WHERE quotation_id = ?`,
//       [
//         JSON.stringify(companyLogoOne),
//         select_customer,
//         quotation_date,
//         reference,
//         customer_name,
//         other_charges,
//         business_name,
//         agent_commission,
//         amount_show_hide,
//         consignee_address,
//         gstin_no,
//         state,
//         contact_number,
//         email,
//         transport,
//         discount,
//         discountedAmount,
//         IGST,
//         igstAmount,
//         cgst,
//         cgstAmount,
//         sgst,
//         sgstAmount,
//         total_quantity,
//         total_rate,
//         total_amount,
//         grand_total,
//         integrated_amount,
//         special_discount,
//         special_discount_remark,
//         is_coppied,
//         type_of_commission,
//         copy_remark,
//         special_discount_total,
//         grand_total_in_words,
//         remark,
//         quotationId
//       ],
//       (err, result) => {
//         if (err) {
//           return db.rollback(() => {
//             res.status(500).send({
//               message: 'Error updating quotation',
//               error: err
//             });
//           });
//         }

//         // Delete all existing quotations_descriptions for the quotation
//         db.query(`DELETE FROM quotations_descriptions WHERE quotation_id = ?`, [quotationId], (err, result) => {
//           if (err) {
//             return db.rollback(() => {
//               res.status(500).send({
//                 message: 'Error deleting existing descriptions',
//                 error: err
//               });
//             });
//           }

//           // Insert new quotations_descriptions
//           if (quotations_descriptions && quotations_descriptions.length > 0) {
//             const descriptionValues = quotations_descriptions.map((desc) => [
//               quotationId,
//               desc.select_service,
//               desc.purchase_price,
//               desc.shelves_count,
//               desc.al_profile,
//               desc.multitop_profile,
//               desc.plastic_clip,
//               desc.valleyht_profile,
//               desc.area_shutter,
//               desc.shutter_area_other,
//               desc.free_item_amount,
//               desc.safeTotalShutterArea,
//               desc.add_extra_area,
//               desc.free_item_desc,
//               desc.row_commission,
//               desc.item_name,
//               desc.item_category,
//               desc.itemDescription,
//               desc.hsn_code,
//               desc.unit_of_measurement,
//               desc.quantity,
//               desc.rate,
//               desc.initial_discount,
//               desc.initial_sgst,
//               desc.initial_cgst,
//               desc.initial_igst,
//               desc.amount
//             ]);

//             db.query(
//               `INSERT INTO quotations_descriptions (quotation_id, select_service, purchase_price, shelves_count, al_profile, multitop_profile, plastic_clip, valleyht_profile, area_shutter, shutter_area_other, free_item_amount, safeTotalShutterArea, add_extra_area, free_item_desc, row_commission, item_name, item_category, itemDescription, hsn_code, unit_of_measurement, quantity, rate, initial_discount, initial_sgst, initial_cgst, initial_igst, amount) VALUES ?`,
//               [descriptionValues],
//               (err, result) => {
//                 if (err) {
//                   return db.rollback(() => {
//                     res.status(500).send({
//                       message: 'Error inserting new descriptions',
//                       error: err
//                     });
//                   });
//                 }

//                 // Commit transaction
//                 db.commit((err) => {
//                   if (err) {
//                     return db.rollback(() => {
//                       res.status(500).send({
//                         message: 'Error committing transaction',
//                         error: err
//                       });
//                     });
//                   }

//                   res.status(200).send({
//                     message: 'Quotation updated successfully'
//                   });
//                 });
//               }
//             );
//           } else {
//             // Commit transaction if no new descriptions to insert
//             db.commit((err) => {
//               if (err) {
//                 return db.rollback(() => {
//                   res.status(500).send({
//                     message: 'Error committing transaction',
//                     error: err
//                   });
//                 });
//               }

//               res.status(200).send({
//                 message: 'Quotation updated successfully'
//               });
//             });
//           }
//         });
//       }
//     );
//   });
// });



// DELETE route for quotation

app.delete('/quotation/:quotation_id', (req, res) => {
  const quotationId = req.params.quotation_id;

  // Query to get the 'companyLogoOne' filenames associated with the quotation
  db.query('SELECT companyLogoOne FROM quotation WHERE quotation_id = ?', [quotationId], (err, result) => {
    if (err) {
      return res.status(500).send({
        message: 'Error retrieving quotation data',
        error: err
      });
    }

    if (result.length === 0) {
      return res.status(404).send({
        message: 'Quotation not found'
      });
    }

    // Parse the 'companyLogoOne' column to get the array of filenames
    const companyLogoOne = JSON.parse(result[0].companyLogoOne);

    // Delete images from the uploads folder
    companyLogoOne.forEach((filename) => {
      const filePath = path.join(uploadDir, filename);

      // Check if the file exists and delete it
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Synchronously delete the file
      }
    });

    // Delete the quotation from the database
    db.query('DELETE FROM quotation WHERE quotation_id = ?', [quotationId], (err, result) => {
      if (err) {
        return res.status(500).send({
          message: 'Error deleting quotation',
          error: err
        });
      }

      // Optionally delete the associated description data (if applicable)
      db.query('DELETE FROM quotations_descriptions WHERE quotation_id = ?', [quotationId], (err, result) => {
        if (err) {
          return res.status(500).send({
            message: 'Error deleting quotation descriptions',
            error: err
          });
        }

        res.status(200).send({
          message: 'Quotation and associated images deleted successfully'
        });
      });
    });
  });
});


// app.delete('/quotation/:quotation_id', (req, res) => {
//   let quotationId = req.params.quotation_id;

//   // Check if there are any associated quotation descriptions
//   let checkQuery = `SELECT * FROM quotations_descriptions WHERE quotation_id = ?`;

//   db.query(checkQuery, [quotationId], (err, result) => {
//     if (err) {
//       res.status(500).send({
//         message: 'Error checking associated quotation descriptions',
//         error: err
//       });
//       return;
//     }

//     // First, delete the associated image files
//     let getImageQuery = `SELECT companyLogoOne FROM quotation WHERE quotation_id = ?`;
//     db.query(getImageQuery, [quotationId], (err, rows) => {
//       if (err) {
//         res.status(500).send({
//           message: 'Error fetching quotation details',
//           error: err
//         });
//         return;
//       }

//       // Assuming companyLogoOne is the field storing image file name or path
//       if (rows.length > 0 && rows[0].companyLogoOne) {
//         let imagePath = path.join(__dirname, 'uploads', rows[0].companyLogoOne);

//         // Delete the image file from the uploads folder
//         fs.unlink(imagePath, (err) => {
//           if (err) {
//           
//           }
//         });
//       }

//       // Now proceed to delete associated descriptions and the quotation
//       if (result.length > 0) {
//         // Delete associated quotation descriptions first
//         let deleteDescriptionsQuery = `DELETE FROM quotations_descriptions WHERE quotation_id = ?`;

//         db.query(deleteDescriptionsQuery, [quotationId], (err, result) => {
//           if (err) {
//             res.status(500).send({
//               message: 'Error deleting associated quotation descriptions',
//               error: err
//             });
//             return;
//           }

//           // Once quotation descriptions are deleted, delete the quotation
//           let deleteQuotationQuery = `DELETE FROM quotation WHERE quotation_id = ?`;

//           db.query(deleteQuotationQuery, [quotationId], (err, result) => {
//             if (err) {
//               res.status(500).send({
//                 message: 'Error deleting quotation',
//                 error: err
//               });
//               return;
//             }

//             res.send({
//               message: 'Quotation and associated descriptions deleted successfully'
//             });
//           });
//         });
//       } else {
//         // If no associated quotation descriptions, directly delete the quotation
//         let deleteQuotationQuery = `DELETE FROM quotation WHERE quotation_id = ?`;

//         db.query(deleteQuotationQuery, [quotationId], (err, result) => {
//           if (err) {
//             res.status(500).send({
//               message: 'Error deleting quotation',
//               error: err
//             });
//             return;
//           }

//           res.send({
//             message: 'Quotation deleted successfully'
//           });
//         });
//       }
//     });
//   });
// });


app.get('/quotationId', (req, res) => {
  // Query to get the maximum quotation_id
  db.query('SELECT MAX(quotation_id) AS max_quotation_id FROM quotation', (error, result) => {
    if (error) {
      res.status(500).json({ error: 'Error fetching quotation_id' });
    } else {
      // Get the maximum quotation_id from the result
      const maxQuotationId = result[0].max_quotation_id;

      // Increment the maximum quotation_id to get the next available quotation_id
      const nextQuotationId = maxQuotationId + 1;

      // Send the nextQuotationId as the response
      res.json({ quotation_id: nextQuotationId });
    }
  });
});



// Get all descriptions for a quotation
app.get('/quotation/:quotation_id/descriptions', (req, res) => {
  let quotationId = req.params.quotation_id;
  let query = `SELECT * FROM quotations_descriptions WHERE quotation_id = ?`;
  db.query(query, [quotationId], (err, results) => {
    if (err) {
      res.status(500).send({
        message: 'Error fetching quotation descriptions from database',
        error: err
      });
      return;
    }

    res.send({
      message: 'All quotation descriptions for quotation',
      data: results
    });
  });
});
// Get all descriptions for a quotation
app.get('/quotation/:quotation_id/descriptions', (req, res) => {
  let quotationId = req.params.quotation_id;
  let query = `SELECT * FROM quotations_descriptions WHERE quotation_id = ?`;
  db.query(query, [quotationId], (err, results) => {
    if (err) {
      res.status(500).send({
        message: 'Error fetching quotation descriptions from database',
        error: err
      });
      return;
    }

    res.send({
      message: 'All quotation descriptions for quotation',
      data: results
    });
  });
});

app.delete('/quotation/:quotation_id/descriptions/:serviceId', (req, res) => {
  const quotationId = req.params.quotation_id;
  const serviceId = req.params.service_id;

  const query = `DELETE FROM quotations_descriptions WHERE id = ? AND quotation_id = ?`;

  db.query(query, [serviceId, quotationId], (err, result) => {
    if (err) {
      return res.status(500).send({
        message: 'Error deleting quotation description from database',
        error: err
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({
        message: 'No matching quotation description found to delete'
      });
    }

    res.send({
      message: 'Quotation description deleted successfully'
    });
  });
});

app.delete('/services/descriptions/:quotationdesc_id', (req, res) => {
  const quotationdescId = req.params.quotationdesc_id;

  const query = `DELETE FROM quotations_descriptions WHERE id = ? `;

  db.query(query, [quotationdescId], (err, result) => {
    if (err) {
      return res.status(500).send({
        message: 'Error deleting quotation description from database',
        error: err
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({
        message: 'No matching quotation description found to delete'
      });
    }

    res.send({
      message: 'Quotation description deleted successfully'
    });
  });
});

// DELETE /quotations/:quotationId/service/:serviceId
app.delete('/quotations/:quotationdesc_id/service/:serviceId', (req, res) => {
  const { quotationdescId, serviceId } = req.params;

  const query = `
    DELETE FROM quotations_descriptions
    WHERE quotationdesc_id = ? AND service_id = ?
  `;

  db.query(query, [quotationdescId, serviceId], (err, result) => {
    if (err) {
      return res.status(500).send({
        message: 'Error deleting service from quotation',
        error: err
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({
        message: 'No matching service found for this quotation'
      });
    }

    res.send({
      message: 'Service deleted successfully from quotation'
    });
  });
});

// DELETE /quotations/:quotationId/descriptions/:quotationDescId
app.delete('/quotations/:quotationId/descriptions/:quotationDescId', (req, res) => {
  const { quotationId, quotationDescId } = req.params;

  const query = `
    DELETE FROM quotations_descriptions
    WHERE quotation_id = ? AND quotationdesc_id = ?
  `;

  db.query(query, [quotationId, quotationDescId], (err, result) => {
    if (err) {
      return res.status(500).send({
        message: 'Error deleting quotation description from database',
        error: err
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({
        message: 'No matching quotation description found to delete'
      });
    }

    res.send({
      message: 'Quotation description deleted successfully'
    });
  });
});

// -------------------------- quotation  -----------------------------//



// Endpoint to create a new email record
app.post('/emailSend', (req, res) => {
  const {
    fileName,
    recipientEmail,
    senderEmail,
    companyEmail,
    companyName,
    userName,
    superAdmin_name,
    superAdminId,
    User_id,
    quotationId,
    companyId,
    businessName,
    serviceNames
  } = req.body;

  // Example query to insert data into email_send_data
  const query = `INSERT INTO email_send_data (fileName, recipientEmail, senderEmail, companyEmail, companyName, userName, superAdmin_name, superAdminId, User_id, quotationId, companyId, businessName, serviceNames) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [
      fileName,
      recipientEmail,
      senderEmail,
      companyEmail,
      companyName,
      userName,
      superAdmin_name,
      superAdminId,
      User_id,
      quotationId,
      companyId,
      businessName,
      serviceNames
    ],
    (err, results) => {
      if (err) {
        return res.status(500).send({
          message: 'Failed to create email record',
          error: err
        });
      }

      res.status(201).send({
        message: 'Email record created successfully',
        data: results
      });
    }
  );
});

app.get('/emailsSend', (req, res) => {
  const companyName = req.query.companyName;
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 25;
  const offset = (page - 1) * pageSize;

  if (!companyName) {
    return res.status(400).json({ error: 'Company name not provided in request.' });
  }

  // Query to get the total number of items filtered by companyName
  const countQuery = 'SELECT COUNT(*) AS total FROM email_send_data WHERE companyName = ?';

  // Query to get the paginated data filtered by companyName
  const dataQuery = 'SELECT * FROM email_send_data WHERE companyName = ? ORDER BY created_on DESC LIMIT ?, ?';

  db.query(countQuery, [companyName], (err, countResults) => {
    if (err) {
      return res.status(500).json({ error: 'Error counting email send data' });
    }

    const totalItems = countResults[0].total;

    db.query(dataQuery, [companyName, offset, pageSize], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching email send data' });
      }

      res.status(200).json({ message: 'Email send data with pagination', data: results, total: totalItems });
    });
  });
});

// Endpoint to get a single email record by ID
app.get('/emailSend/:id', (req, res) => {
  const emailId = req.params.id;
  db.query('SELECT * FROM email_send_data WHERE id = ?', [emailId], (err, results) => {
    if (err) {
      return res.status(500).send({
        message: 'Error fetching email record by ID',
        error: err
      });
    }

    if (results.length === 0) {
      return res.status(404).send({
        message: 'Email record not found'
      });
    }

    res.send({
      message: 'Email record fetched successfully',
      data: results[0]
    });
  });
});

// Endpoint to update an email record by ID
app.put('/emailSend/:id', (req, res) => {
  const emailId = req.params.id;
  const {
    fileName,
    recipientEmail,
    senderEmail,
    companyEmail,
    companyName,
    userName,
    superAdmin_name,
    superAdminId,
    User_id,
    quotationId,
    companyId,
    businessName,
    serviceNames
  } = req.body;

  // Example query to update data in email_send_data
  const query = `UPDATE email_send_data SET fileName=?, recipientEmail=?, senderEmail=?, companyEmail=?, companyName=?, userName=?, superAdmin_name=?, superAdminId=?, User_id=?, quotationId=?, companyId=?, businessName=?, serviceNames=? WHERE id=?`;

  db.query(
    query,
    [
      fileName,
      recipientEmail,
      senderEmail,
      companyEmail,
      companyName,
      userName,
      superAdmin_name,
      superAdminId,
      User_id,
      quotationId,
      companyId,
      businessName,
      serviceNames,
      emailId
    ],
    (err, results) => {
      if (err) {
        return res.status(500).send({
          message: 'Failed to update email record',
          error: err
        });
      }

      res.send({
        message: 'Email record updated successfully'
      });
    }
  );
});

// Endpoint to delete an email record by ID
app.delete('/emailSend/:id', (req, res) => {
  const emailId = req.params.id;

  db.query('DELETE FROM email_send_data WHERE id = ?', [emailId], (err, results) => {
    if (err) {
      return res.status(500).send({
        message: 'Failed to delete email record',
        error: err
      });
    }

    res.send({
      message: 'Email record deleted successfully'
    });
  });
});

// -------------------------email send data ends---------------------------
//get single user by ID

app.get('/allUsers', (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || 25;
  let offset = (page - 1) * pageSize;
  let loginCompany = req.query.loginCompany;
  let userRole = req.query.userRole;

  // Base queries
  let baseCountQuery = 'SELECT COUNT(*) AS total FROM users';
  let baseQuery = 'SELECT * FROM users';

  // Common filter for company
  let filters = ['login_company = ?'];
  let filterParams = [loginCompany];

  // Role-specific filters
  if (userRole === 'superadmin') {
    // No additional filters needed for superadmin
  } else if (userRole === 'manager') {
    filters.push("role != 'superadmin'");
  } else if (userRole === 'executive') {
    filters.push("role != 'superadmin'");
    filters.push("role != 'manager'");
  }

  // Apply filters
  if (filters.length > 0) {
    baseCountQuery += ' WHERE ' + filters.join(' AND ');
    baseQuery += ' WHERE ' + filters.join(' AND ');
  }

  // Add pagination
  baseQuery += ' LIMIT ?, ?';
  filterParams.push(offset, pageSize);

  // Execute the count query
  db.query(baseCountQuery, filterParams.slice(0, -2), (err, countResults) => {
    if (err) {
      res.status(500).send({ error: 'Error counting users' });
      return;
    }

    let totalItems = countResults[0].total;

    // Execute the data query
    db.query(baseQuery, filterParams, (err, results) => {
      if (err) {
        res.status(500).send({ error: 'Error fetching users' });
        return;
      }

      res.send({ message: 'Users with pagination', data: results, total: totalItems });
    });
  });
});
app.get('/allUserslist', (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || 25;
  let offset = (page - 1) * pageSize;
  let loginCompany = req.query.loginCompany;
  let userRole = req.query.userRole;

  // Base queries
  let baseCountQuery = 'SELECT COUNT(*) AS total FROM users';
  let baseQuery = `SELECT users.*, 
                          GROUP_CONCAT(JSON_OBJECT(
                            'id', person_descriptions.id,
                            'contact_person2', person_descriptions.contact_person2,
                            'contact_number2', person_descriptions.contact_number2
                          )) AS person_descriptions
                   FROM users 
                   LEFT JOIN person_descriptions 
                   ON users.id = person_descriptions.user_id`;

  // Common filter for company
  let filters = ['login_company = ?'];
  let filterParams = [loginCompany];

  // Role-specific filters
  if (userRole === 'superadmin') {
    // No additional filters needed for superadmin
  } else if (userRole === 'manager') {
    filters.push("role != 'superadmin'");
  } else if (userRole === 'executive') {
    filters.push("role != 'superadmin'");
    filters.push("role != 'manager'");
  }

  // Apply filters
  if (filters.length > 0) {
    baseCountQuery += ' WHERE ' + filters.join(' AND ');
    baseQuery += ' WHERE ' + filters.join(' AND ');
  }

  // Grouping to combine person descriptions
  baseQuery += ' GROUP BY users.id';

  // Add pagination
  baseQuery += ' ORDER BY users.id DESC LIMIT ?, ?';
  filterParams.push(offset, pageSize);

  // Execute the count query
  db.query(baseCountQuery, filterParams.slice(0, -2), (err, countResults) => {
    if (err) {
      res.status(500).send({ error: 'Error counting users' });
      return;
    }

    let totalItems = countResults[0].total;

    // Execute the data query
    db.query(baseQuery, filterParams, (err, results) => {
      if (err) {
        res.status(500).send({ error: 'Error fetching users' });
        return;
      }

      // Parse JSON results for person_descriptions
      results.forEach((user) => {
        user.person_descriptions = JSON.parse('[' + user.person_descriptions + ']');
      });

      res.send({ message: 'Users with pagination', data: results, total: totalItems });
    });
  });
});
// Route to get all customers/users by company name
app.get('/customersByCompany', (req, res) => {
  const loginCompany = req.query.loginCompany;

  if (!loginCompany) {
    return res.status(400).send({ error: 'loginCompany query parameter is required' });
  }

  const query = 'SELECT * FROM users WHERE login_company = ?';

  db.query(query, [loginCompany], (err, results) => {
    if (err) {
      return res.status(500).send({ error: 'Error fetching customers' });
    }

    res.send({ message: 'Customers fetched successfully', data: results });
  });
});

app.get('/usersAll', (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || 25;
  let offset = (page - 1) * pageSize;
  let userId = parseInt(req.query.userId, 10);
  let loginCompany = req.query.loginCompany;
  let userRole = req.query.userRole; // Added role check

  // Base count query
  let countQuery = 'SELECT COUNT(*) AS total FROM users';
  let query = 'SELECT * FROM users';

  if (userRole === 'superadmin') {
    if (loginCompany) {
      countQuery += ' WHERE login_company = ?';
      query += ' WHERE login_company = ?';
    }
  } else {
    if (userId) {
      countQuery += ' WHERE login_id = ?';
      query += ' WHERE login_id = ?';
    }
  }

  query += ' LIMIT ?, ?';

  db.query(countQuery, [loginCompany || userId], (err, countResults) => {
    if (err) {
      res.status(500).send({ error: 'Error counting users' });
      return;
    }

    let totalItems = countResults[0].total;
    db.query(query, [loginCompany || userId, offset, pageSize], (err, results) => {
      if (err) {
        res.status(500).send({ error: 'Error fetching users' });
        return;
      }

      res.send({ message: 'Users with pagination', data: results, total: totalItems });
    });
  });
});

// get all data from database
// app.get('/user/:id', (req, res) => {
//   let qrId = req.params.id; //to store/hold id
//   let qr = `SELECT * FROM users where id = ${qrId}`;
//   db.query(qr, (err, results) => {
//     if (err) {
//     }

//     if (results.length > 0) {
//       res.send({
//         message: 'Get user by id',
//         data: results
//       });
//     } else {
//       res.send({
//         message: 'id not found'
//       });
//     }
//   });
// });
// get all data from database

app.get('/user/:id', (req, res) => {
  const qrId = req.params.id; // Store ID from request parameters
  const qr = 'SELECT * FROM users WHERE id = ?'; // Use parameterized query

  db.query(qr, [qrId], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send({
        message: 'Internal Server Error',
        error: err.message
      });
    }

    // Check if results is defined and has items
    if (results && results.length > 0) {
      res.send({
        message: 'Get user by id',
        data: results
      });
    } else {
      res.status(404).send({
        message: 'ID not found'
      });
    }
  });
});
app.get('/users/:id', (req, res) => {
  let userId = req.params.id; //to store/hold id

  // Fetch user details
  db.query(`SELECT * FROM users WHERE id = ?`, [userId], (err, userRows) => {
    if (err) {
      res.status(500).send({
        message: 'Error fetching user by ID',
        error: err
      });
      return;
    }

    // If user not found, send 404 response
    if (userRows.length === 0) {
      res.status(404).send({
        message: 'User with the provided ID not found'
      });
      return;
    }

    // Fetch descriptions for the user
    db.query(`SELECT * FROM person_descriptions WHERE user_id = ?`, [userId], (err, descriptionRows) => {
      if (err) {
        res.status(500).send({
          message: 'Error fetching descriptions for the user',
          error: err
        });
        return;
      }

      // Combine user and descriptions data
      const responseData = {
        user: userRows[0],
        person_descriptions: descriptionRows
      };

      res.status(200).send({
        message: 'User details retrieved successfully',
        data: responseData
      });
    });
  });
});

// post method

// Create new user
app.post('/user', (req, res) => {
  const {
    name,
    owner_mobile,
    email,
    contact_number,
    business_name,
    contact_person,
    state,
    city,
    address,
    pincode,
    gst_in,
    landline_no,
    superadmin_id,
    login_company,
    role,
    loginUserName,
    login_id,
    person_description
  } = req.body;

  // Insert new user
  const insertUserQuery = `INSERT INTO users(name, owner_mobile, email, contact_number, business_name, contact_person, state, city, address, pincode, gst_in, landline_no, superadmin_id, login_company, role, loginUserName, login_id)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    insertUserQuery,
    [
      name,
      owner_mobile,
      email,
      contact_number,
      business_name,
      contact_person,
      state,
      city,
      address,
      pincode,
      gst_in,
      landline_no,
      superadmin_id,
      login_company,
      role,
      loginUserName,
      login_id
    ],
    (err, results) => {
      if (err) {
        return res.status(500).send({
          message: 'Failed to create user!',
          error: err
        });
      }

      const userId = results.insertId; // Retrieve the ID of the newly inserted user

      // Now insert into person_descriptions
      if (person_description && person_description.length > 0) {
        const insertPersonDescriptionsQuery = `INSERT INTO person_descriptions (user_id, contact_person2, contact_number2) VALUES ?`;

        const personDescriptionsValues = person_description.map((desc) => [
          userId,
          desc.contact_person2,
          desc.contact_number2 !== undefined ? desc.contact_number2 : null
        ]);

        db.query(insertPersonDescriptionsQuery, [personDescriptionsValues], (err, results) => {
          if (err) {
            return res.status(500).send({
              message: 'Failed to create person descriptions!',
              error: err
            });
          }

          res.status(201).send({
            message: 'User and person descriptions created successfully!',
            data: { userId, person_description }
          });
        });
      } else {
        res.status(201).send({
          message: 'User created successfully, no person descriptions provided!',
          data: { userId }
        });
      }
    }
  );
});

// Update user by ID
app.put('/user/:id', (req, res) => {
  const uID = req.params.id;
  const {
    name,
    owner_mobile,
    email,
    contact_number,
    business_name,
    contact_person,
    state,
    city,
    address,
    pincode,
    gst_in,
    landline_no,
    person_description = [] // Default to empty array if not provided
  } = req.body;

  // Update user details
  const updateUserQuery = `UPDATE users SET 
                           name = ?, 
                           owner_mobile = ?,
                           email = ?, 
                           contact_number = ?, 
                           business_name = ?, 
                           contact_person = ?, 
                           state = ?, 
                           city = ?, 
                           address = ?, 
                           pincode = ?, 
                           gst_in = ?, 
                           landline_no = ? 
                           WHERE id = ?`;

  db.query(
    updateUserQuery,
    [name, owner_mobile, email, contact_number, business_name, contact_person, state, city, address, pincode, gst_in, landline_no, uID],
    (err, results) => {
      if (err) {
        return res.status(500).send({
          message: 'Failed to update user data!',
          error: err
        });
      }

      // Delete existing person descriptions for this user
      const deletePersonDescriptionsQuery = 'DELETE FROM person_descriptions WHERE user_id = ?';
      db.query(deletePersonDescriptionsQuery, [uID], (err) => {
        if (err) {
          return res.status(500).send({
            message: 'Failed to delete existing person descriptions!',
            error: err
          });
        }

        // Insert new person descriptions
        const insertPersonDescriptionsPromises = person_description.map((desc) => {
          // No need to validate contact_number2 as it can be null
          return new Promise((resolve, reject) => {
            db.query(
              `INSERT INTO person_descriptions (user_id, contact_person2, contact_number2)
               VALUES (?, ?, ?)`,
              [uID, desc.contact_person2, desc.contact_number2 !== undefined ? desc.contact_number2 : null],
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
          });
        });

        // Use Promise.all to handle all person descriptions inserts
        Promise.all(insertPersonDescriptionsPromises)
          .then(() => {
            res.send({
              message: 'User and person descriptions updated successfully!'
            });
          })
          .catch((err) => {
            res.status(500).send({
              message: 'Failed to update person descriptions!',
              error: err
            });
          });
      });
    }
  );
});

//delete data by id
app.delete('/user/:id', (req, res) => {
  let uID = req.params.id;

  //data update query
  let qr = `delete from users where id = '${uID}'`;

  db.query(qr, (err, results) => {
    if (err) {
    }

    res.send({
      message: 'Data deleted successfully!'
      // data: results
    });
  });
});

//------------------------------------------------------------------------------------------------//

app.post('/signup', (req, res) => {
  const {
    sessionUser_id,
    sessionUser_name,
    created_id,
    select_company,
    username,
    email,
    password,
    confirmPassword,
    role,
    firstName,
    lastName,
    phoneNo,
    panCard,
    aadhar,
    designation,
    address,
    status
  } = req.body;

  // Step 1: Fetch the users_allowed count from the company table
  const getCompanyQuery = 'SELECT users_allowed FROM company WHERE companyName = ?';
  db.query(getCompanyQuery, [select_company], (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error fetching company details' });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'Company not found' });
    }

    const usersAllowed = results[0].users_allowed;

    // Step 2: Count existing users in the userslogin table for the given company
    const countUsersQuery = 'SELECT COUNT(*) AS userCount FROM userslogin WHERE select_company = ?';
    db.query(countUsersQuery, [select_company], (err, countResults) => {
      if (err) {
        return res.status(500).send({ message: 'Error counting users' });
      }

      const currentUserCount = countResults[0].userCount;

      // Step 3: Check if the current user count is less than users_allowed + 1
      if (currentUserCount >= usersAllowed + 1) {
        return res.status(400).send({ message: 'Users limit reached for this company' });
      }

      // Step 4: Insert the new user if the limit is not exceeded
      const query = `INSERT INTO userslogin (sessionUser_id, sessionUser_name, created_id, select_company, username, email, password, confirmPassword, role, firstName, lastName, phoneNo, panCard, aadhar, designation, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.query(
        query,
        [
          sessionUser_id,
          sessionUser_name,
          created_id,
          select_company,
          username,
          email,
          password,
          confirmPassword,
          role,
          firstName,
          lastName,
          phoneNo,
          panCard,
          aadhar,
          designation,
          address,
          status
        ],
        (err, result) => {
          if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
              res.status(500).send({ message: 'Duplicate entry' });
            } else {
              res.status(500).send({ message: 'Error creating user' });
            }
            return;
          }

          res.status(201).send({ message: 'User created successfully' });
        }
      );
    });
  });
});

// Update signup data by id
app.put('/signup/:id', (req, res) => {
  let uID = req.params.id;
  let userData = req.body;

  // Fetch the current user details to determine the current status
  let getCurrentUserQuery = `SELECT * FROM userslogin WHERE id = ?`;
  db.query(getCurrentUserQuery, [uID], (err, results) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('User not found');
      return;
    }

    let currentUser = results[0];

    // Determine the new status to update (only if provided in userData)
    let newStatus = userData.status ? (userData.status === 'active' ? 'active' : 'inactive') : currentUser.status;

    // Update query with the new status if provided
    let updateQuery = `UPDATE userslogin SET 
      created_id = ?, select_company = ?, email = ?, username = ?, password = ?, confirmPassword = ?, 
      role = ?, firstName = ?, lastName = ?, phoneNo = ?, 
      panCard = ?, aadhar = ?, designation = ?, address = ?, 
      status = ? WHERE id = ?`;

    db.query(
      updateQuery,
      [
        userData.created_id || currentUser.created_id,
        userData.select_company || currentUser.select_company,
        userData.email || currentUser.email,
        userData.username || currentUser.username,
        userData.password || currentUser.password,
        userData.confirmPassword || currentUser.confirmPassword,
        userData.role || currentUser.role,
        userData.firstName || currentUser.firstName,
        userData.lastName || currentUser.lastName,
        userData.phoneNo || currentUser.phoneNo,
        userData.panCard || currentUser.panCard,
        userData.aadhar || currentUser.aadhar,
        userData.designation || currentUser.designation,
        userData.address || currentUser.address,
        newStatus, // Update status with newStatus
        uID
      ],
      (err, results) => {
        if (err) {
          res.status(500).send('Error updating user');
        } else {
          res.status(200).send({
            message: 'User updated successfully!',
            updatedStatus: newStatus // Optionally, you can send back the updated status
          });
        }
      }
    );
  });
});

// Toggle user status endpoint
app.put('/toggle-status/:id', (req, res) => {
  const userId = req.params.id;
  const { status } = req.body;

  // Validate status
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).send({ message: 'Invalid status value' });
  }

  const query = `UPDATE userslogin SET status = ? WHERE id = ?`;
  db.query(query, [status, userId], (err, result) => {
    if (err) {
      return res.status(500).send({ message: 'Error updating user status' });
    }

    res.status(200).send({ message: 'User status updated successfully' });
  });
});

// Add route for getting all users
app.get('/signup', (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || 25;
  let offset = (page - 1) * pageSize;

  let userId = parseInt(req.query.userId, 10) || (req.session && req.session.userId ? parseInt(req.session.userId, 10) : null);

  if (!userId) {
    return res.status(400).send({ error: 'User ID not provided in query params or session.' });
  }

  // Construct count query
  let countQuery = 'SELECT COUNT(*) AS total FROM userslogin WHERE sessionUser_id = ? OR id = ?';
  let queryParams = [userId, userId];

  // Perform count query
  db.query(countQuery, queryParams, (err, countResults) => {
    if (err) {
      return res.status(500).send({ error: 'Error counting users' });
    }

    let totalItems = countResults[0].total;

    // Construct data query with pagination
    let dataQuery = 'SELECT * FROM userslogin WHERE sessionUser_id = ? OR id = ? ORDER BY created_on DESC LIMIT ?, ?';
    db.query(dataQuery, [...queryParams, offset, pageSize], (err, results) => {
      if (err) {
        return res.status(500).send({ error: 'Error fetching users.' });
      }

      res.send({ message: 'Users fetched successfully with pagination.', data: results, total: totalItems });
    });
  });
});

// get EACH data from database by id
app.get('/signup/:id', (req, res) => {
  let qrId = req.params.id; //to store/hold id
  let qr = `SELECT * FROM userslogin where id = ${qrId}`;
  db.query(qr, (err, results) => {
    if (err) {
    }

    if (results.length > 0) {
      res.send({
        message: 'Get signup user by id',
        data: results
      });
    } else {
      res.send({
        message: 'signup id not found'
      });
    }
  });
});

// Delete user endpoint
app.delete('/signup/:id', (req, res) => {
  const userId = req.params.id;

  const query = `DELETE FROM userslogin WHERE id = ?`;
  db.query(query, [userId], (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error deleting user' });
      return;
    }

    res.status(200).send({ message: 'User deleted successfully' });
  });
});

app.get('/nextUserId', (req, res) => {
  // Query to get the maximum id
  db.query('SELECT MAX(id) AS max_id FROM userslogin', (error, result) => {
    if (error) {
      res.status(500).json({ error: 'Error fetching user id' });
    } else {
      // Get the maximum id from the result
      const maxUserId = result[0].max_id;

      // Increment the maximum id to get the next available user id
      const nextUserId = maxUserId + 1;

      // Send the nextUserId as the response
      res.json({ user_id: nextUserId });
    }
  });
});

// ------------------------------------------------------------------------------------------------------- //
// Sign-in endpoint
app.post('/signin', (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Check if user exists with the provided email and password
  const query = `SELECT * FROM userslogin WHERE email = ? AND password = ?`;
  db.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error signing in' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    // Check user status
    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Your account is not verified' });
    }

    // Here you can create a token for authentication if needed
    res.status(200).json({ message: 'Sign-in successful', user });
  });
});
//--------------------------------------------------------------------------------------------//

// ---------------------------------------------category---------------------------------------------//

// Create a new category
app.post('/category', (req, res) => {
  let { sessionLogCat_id, login_company, loginUserName, category_name, sub_category, description, status } = req.body;

  // Data creation query
  let query = `INSERT INTO categories_item_master (sessionLogCat_id, login_company, loginUserName, category_name, sub_category, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [sessionLogCat_id, login_company, loginUserName, category_name, sub_category, description, status], (err, result) => {
    if (err) {
      res.status(500).send({
        message: 'Error creating new category',
        error: err
      });
      return;
    }

    res.status(201).send({
      message: 'Category created successfully',
      data: result
    });
  });
});

app.get('/categoriesList', (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || 25;
  let offset = (page - 1) * pageSize;
  let company = req.query.company;

  // Query to get the total number of items
  let countQuery = 'SELECT COUNT(*) AS total FROM categories_item_master';

  if (company) {
    countQuery += ' WHERE login_company = ?';

    let query = 'SELECT * FROM categories_item_master WHERE login_company = ? ORDER BY created_at DESC LIMIT ?, ?';
    db.query(countQuery, [company], (err, countResults) => {
      if (err) {
        res.status(500).send({ error: 'Error counting categories_item_master for company' });
        return;
      }

      let totalItems = countResults[0].total;
      db.query(query, [company, offset, pageSize], (err, results) => {
        if (err) {
          res.status(500).send({ error: 'Error fetching categories_item_master for company' });
          return;
        }

        res.send({ message: 'categories_item_master with pagination', data: results, total: totalItems });
      });
    });
  } else {
    // If company is not provided, fetch all services with pagination
    let query = 'SELECT * FROM categories_item_master ORDER BY created_at DESC LIMIT ?, ?';
    db.query(countQuery, (err, countResults) => {
      if (err) {
        res.status(500).send({ error: 'Error counting all categories_item_master' });
        return;
      }

      let totalItems = countResults[0].total;
      db.query(query, [offset, pageSize], (err, results) => {
        if (err) {
          res.status(500).send({ error: 'Error fetching categories_item_master' });
          return;
        }

        res.send({ message: 'All categories_item_master with pagination', data: results, total: totalItems });
      });
    });
  }
});

app.get('/categories', (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || 25;
  let offset = (page - 1) * pageSize;

  // Query to get the total number of items
  let countQuery = 'SELECT COUNT(*) AS total FROM categories_item_master';

  // Check if userId is provided in query params
  if (req.query.userId) {
    let userId = parseInt(req.query.userId, 10);

    countQuery += ' WHERE sessionLogCat_id = ?';

    let query = 'SELECT * FROM categories_item_master WHERE sessionLogCat_id = ? LIMIT ?, ?';
    db.query(countQuery, [userId], (err, countResults) => {
      if (err) {
        res.status(500).send({ error: 'Error counting categories for user' });
        return;
      }

      let totalItems = countResults[0].total;
      db.query(query, [userId, offset, pageSize], (err, results) => {
        if (err) {
          res.status(500).send({ error: 'Error fetching categories for user' });
          return;
        }

        res.send({ message: 'categories with pagination', data: results, total: totalItems });
      });
    });
  } else {
    // If userId is not provided, fetch all users with pagination
    let query = 'SELECT * FROM categories_item_master LIMIT ?, ?';
    db.query(countQuery, (err, countResults) => {
      if (err) {
        res.status(500).send({ error: 'Error counting all categories' });
        return;
      }

      let totalItems = countResults[0].total;
      db.query(query, [offset, pageSize], (err, results) => {
        if (err) {
          res.status(500).send({ error: 'Error fetching categories' });
          return;
        }

        res.send({ message: 'All categories with pagination', data: results, total: totalItems });
      });
    });
  }
});

// Retrieve only active categories
// Retrieve active categories by sessionLogCat_id
app.get('/categories/active/:sessionLogCatId', (req, res) => {
  let sessionLogCatId = req.params.sessionLogCatId;
  let query = `SELECT * FROM categories_item_master WHERE status = 'active' AND sessionLogCat_id = ?`;

  db.query(query, [sessionLogCatId], (err, results) => {
    if (err) {
      res.status(500).send({
        message: 'Error fetching active categories from database',
        error: err
      });
      return;
    }

    res.send({
      message: 'Active categories fetched successfully',
      data: results
    });
  });
});

app.get('/categoriesList/active', (req, res) => {
  let company = req.query.company;

  if (!company) {
    return res.status(400).send({ message: 'Company parameter is required' });
  }

  // Query to get all active categories for the company
  let query = 'SELECT * FROM categories_item_master WHERE status = "active" AND login_company = ?';

  db.query(query, [company], (err, results) => {
    if (err) {
      return res.status(500).send({
        message: 'Error fetching active categories from database',
        error: err
      });
    }

    res.send({
      message: 'Active categories fetched successfully',
      data: results
    });
  });
});

// Retrieve a category by ID
app.get('/category/:id', (req, res) => {
  let categoryId = req.params.id;
  let query = `SELECT * FROM categories_item_master WHERE id = ?`;
  db.query(query, [categoryId], (err, results) => {
    if (err) {
      res.status(500).send({
        message: 'Error fetching category from database',
        error: err
      });
      return;
    }

    if (results.length > 0) {
      res.send({
        message: 'Category found',
        data: results[0]
      });
    } else {
      res.status(404).send({
        message: 'Category not found'
      });
    }
  });
});

// Update a category by ID

app.put('/category/:id', (req, res) => {
  let uID = req.params.id;
  let userData = req.body;

  let updateQuery = `UPDATE categories_item_master SET 
    category_name = ?, sub_category = ?, loginUserName = ?, description = ?, status = ? WHERE id = ?`;

  db.query(
    updateQuery,
    [
      userData.category_name,
      userData.sub_category,
      userData.loginUserName, // Make sure this is included
      userData.description,
      userData.status,
      uID
    ],
    (err, results) => {
      if (err) {
        res.status(500).send('Error updating category');
      } else {
        res.status(200).send({
          message: 'Category updated successfully!',
          updatedStatus: userData.status
        });
      }
    }
  );
});

// Delete a category by ID
app.delete('/category/:id', (req, res) => {
  let categoryId = req.params.id;

  // Data deletion query
  let query = `DELETE FROM categories_item_master WHERE id = ?`;

  db.query(query, [categoryId], (err, result) => {
    if (err) {
      res.status(500).send({
        message: 'Error deleting category',
        error: err
      });
      return;
    }

    res.send({
      message: 'Category deleted successfully'
    });
  });
});
// -------------------------------------------service-----------------------------------------------------
// Create a new service

app.post('/service', upload.single('companyLogo'), (req, res) => {
  console.log('--- Incoming Request to /service ---');
  console.log('Body:', req.body);
  console.log('File:', req.file);
  let {
    loginSessionSer_id,
    login_company,
    loginUserName,
    select_category,
    select_sub_category,
    shelves_count,
    selling_price,
    priceB,
    purchase_price,
    al_profile,
    plastic_clip,
    multitop_profile,
    service_name,
    service_desc,
    valleyht_profile,
    shutter_area_other,
    basic_purchase_price,
    unit_of_measurement
  } = req.body;

  // Check if a file was uploaded
  let companyLogo = null;
  if (req.file) {
    companyLogo = req.file.filename; // Store the filename in the database
  }

  // Data creation query for service
let serviceQuery = `INSERT INTO services (
  loginSessionSer_id, login_company, loginUserName, select_category,
  select_sub_category, shelves_count, selling_price, priceB, purchase_price,
  al_profile, plastic_clip, multitop_profile, service_name, service_desc,
  valleyht_profile, shutter_area_other, basic_purchase_price, unit_of_measurement, companyLogo
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

db.query(
  serviceQuery,
  [
 loginSessionSer_id,
  login_company,
  loginUserName,
  select_category,
  select_sub_category,
  shelves_count,
  selling_price,
  priceB,           
  purchase_price,
    al_profile,
    plastic_clip,
    multitop_profile,
    service_name,
    service_desc,
    valleyht_profile,
    shutter_area_other,
    basic_purchase_price,
    unit_of_measurement,
    companyLogo
  ],
      (err, result) => {
      if (err) {
        res.status(500).send({
          message: 'Error creating new service',
          error: err
        });
        return;
      }

      // Extract the ID of the newly created service
      const serviceId = result.insertId;

      // Respond with success message and the service ID
      res.status(201).send({
        message: 'Service created successfully',
        data: {
          service_id: serviceId
        }
      });
    }
  );
});

app.get('/itemsDropdown', (req, res) => {
  let company = req.query.company;

  if (company) {
    let query = 'SELECT * FROM services WHERE login_company = ?';

    db.query(query, [company], (err, results) => {
      if (err) {
        res.status(500).send({ error: 'Error fetching services for company' });
        return;
      }

      res.send({ message: 'Services fetched successfully', data: results });
    });
  } else {
    res.status(400).send({ error: 'Company parameter is required' });
  }
});
// app.get('/itemsDropdown', (req, res) => {
//   let company = req.query.company;
//   let subCategory = req.query.subCategory; // Get the subCategory parameter

//   let query = 'SELECT * FROM services WHERE login_company = ?';
//   let queryParams = [company];

//   // If subCategory is provided, add it to the query
//   if (subCategory) {
//     query += ' AND select_sub_category = ?';
//     queryParams.push(subCategory);
//   }

//   if (company) {
//     db.query(query, queryParams, (err, results) => {
//       if (err) {
//         res.status(500).send({ error: 'Error fetching services for company' });
//         return;
//       }

//       res.send({ message: 'Services fetched successfully', data: results });
//     });
//   } else {
//     res.status(400).send({ error: 'Company parameter is required' });
//   }
// });

app.get('/itemsList', (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || 10;
  let offset = (page - 1) * pageSize;
  let company = req.query.company;

  // Query to get the total number of items
  let countQuery = 'SELECT COUNT(*) AS total FROM services';

  if (company) {
    countQuery += ' WHERE login_company = ?';

    let query = 'SELECT * FROM services WHERE login_company = ? ORDER BY created_at DESC LIMIT ?, ?';
    db.query(countQuery, [company], (err, countResults) => {
      if (err) {
        res.status(500).send({ error: 'Error counting services for company' });
        return;
      }

      let totalItems = countResults[0].total;
      db.query(query, [company, offset, pageSize], (err, results) => {
        if (err) {
          res.status(500).send({ error: 'Error fetching services for company' });
          return;
        }

        res.send({ message: 'services with pagination', data: results, total: totalItems });
      });
    });
  } else {
    // If company is not provided, fetch all services with pagination
    let query = 'SELECT * FROM services ORDER BY created_at DESC LIMIT ?, ?';
    db.query(countQuery, (err, countResults) => {
      if (err) {
        res.status(500).send({ error: 'Error counting all services' });
        return;
      }

      let totalItems = countResults[0].total;
      db.query(query, [offset, pageSize], (err, results) => {
        if (err) {
          res.status(500).send({ error: 'Error fetching services' });
          return;
        }

        res.send({ message: 'All services with pagination', data: results, total: totalItems });
      });
    });
  }
});

// Retrieve all services
app.get('/services', (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || 25;
  let offset = (page - 1) * pageSize;

  // Query to get the total number of items
  let countQuery = 'SELECT COUNT(*) AS total FROM services';

  // Check if userId is provided in query params
  if (req.query.userId) {
    let userId = parseInt(req.query.userId, 10);

    countQuery += ' WHERE loginSessionSer_id = ?';

    let query = 'SELECT * FROM services WHERE loginSessionSer_id = ? LIMIT ?, ?';
    db.query(countQuery, [userId], (err, countResults) => {
      if (err) {
        res.status(500).send({ error: 'Error counting services for user' });
        return;
      }

      let totalItems = countResults[0].total;
      db.query(query, [userId, offset, pageSize], (err, results) => {
        if (err) {
          res.status(500).send({ error: 'Error fetching services for user' });
          return;
        }

        res.send({ message: 'services with pagination', data: results, total: totalItems });
      });
    });
  } else {
    // If userId is not provided, fetch all users with pagination
    let query = 'SELECT * FROM services LIMIT ?, ?';
    db.query(countQuery, (err, countResults) => {
      if (err) {
        res.status(500).send({ error: 'Error counting all services' });
        return;
      }

      let totalItems = countResults[0].total;
      db.query(query, [offset, pageSize], (err, results) => {
        if (err) {
          res.status(500).send({ error: 'Error fetching services' });
          return;
        }

        res.send({ message: 'All services with pagination', data: results, total: totalItems });
      });
    });
  }
});

// Retrieve service by ID
app.get('/service/:service_id', (req, res) => {
  let serviceId = req.params.service_id;

  // Fetch service details
  db.query(`SELECT * FROM services WHERE service_id = ?`, [serviceId], (err, serviceRows) => {
    if (err) {
      res.status(500).send({
        message: 'Error fetching service by ID',
        error: err
      });
      return;
    }

    // If service not found, send 404 response
    if (serviceRows.length === 0) {
      res.status(404).send({
        message: 'Service with the provided ID not found'
      });
      return;
    }

    // Fetch descriptions for the service
    db.query(`SELECT * FROM service_descriptions WHERE service_id = ?`, [serviceId], (err, descriptionRows) => {
      if (err) {
        res.status(500).send({
          message: 'Error fetching descriptions for the service',
          error: err
        });
        return;
      }

      // Combine service and descriptions data
      const responseData = {
        service: serviceRows[0],
        descriptions: descriptionRows
      };

      res.status(200).send({
        message: 'Service details retrieved successfully',
        data: responseData
      });
    });
  });
});

// Update service by ID
// Update service details and descriptions by ID
// app.put('/service/:service_id', upload.single('companyLogo'), (req, res) => {
//   let serviceId = req.params.service_id;
//   let {
//     select_category,
//     select_sub_category,
//     loginUserName,
//     shelves_count,
//     selling_price,
//     purchase_price,
//     al_profile,
//     plastic_clip,
//     multitop_profile,
//     service_name,
//     service_desc,
//     valleyht_profile,
//     shutter_area_other,
//     basic_purchase_price,
//     unit_of_measurement,
//     selectedOption
//   } = req.body;

//   // If an image was uploaded, get the filename
//   const newCompanyLogo = req.file ? req.file.filename : null;

//   // Check if the service exists
//   db.query(`SELECT * FROM services WHERE service_id = ?`, [serviceId], (err, rows) => {
//     if (err) {
//       res.status(500).send({
//         message: 'Error checking if service exists',
//         error: err
//       });
//       return;
//     }
//     if (rows.length === 0) {
//       // If service not found, send 404 response
//       res.status(404).send({
//         message: 'Service with the provided ID not found'
//       });
//       return;
//     }

//     // Get the current companyLogo from the existing service
//     const currentCompanyLogo = rows[0].companyLogo;

//     // If no new image is provided, keep the current image
//     const companyLogo = newCompanyLogo || currentCompanyLogo;

//     // Update service details
//     db.query(
//       `UPDATE services SET select_category = ?, select_sub_category = ?, loginUserName = ?, shelves_count = ?, selling_price = ?, purchase_price = ?, al_profile = ?, plastic_clip = ?, multitop_profile = ?, service_name = ?, service_desc = ?, valleyht_profile = ?, shutter_area_other = ?, basic_purchase_price = ?, unit_of_measurement = ?, selectedOption = ?, companyLogo = ? WHERE service_id = ?`,
//       [
//         select_category,
//         select_sub_category,
//         loginUserName,
//         shelves_count,
//         selling_price,
//         purchase_price,
//         al_profile,
//         plastic_clip,
//         multitop_profile,
//         service_name,
//         service_desc,
//         valleyht_profile,
//         shutter_area_other,
//         basic_purchase_price,
//         unit_of_measurement,
//         selectedOption,
//         companyLogo,
//         serviceId
//       ],
//       (err, result) => {
//         if (err) {
//           res.status(500).send({
//             message: 'Error updating service',
//             error: err
//           });
//           return;
//         }

//         // Respond with success message
//         res.status(200).send({
//           message: 'Service details updated successfully',
//           data: result
//         });
//       }
//     );
//   });
// });
app.put('/service/:service_id', upload.single('companyLogo'), (req, res) => {
  let serviceId = req.params.service_id;
  let {
    select_category,
    select_sub_category,
    loginUserName,
    shelves_count,
    selling_price,
    priceB,
    purchase_price,
    al_profile,
    plastic_clip,
    multitop_profile,
    service_name,
    service_desc,
    valleyht_profile,
    shutter_area_other,
    basic_purchase_price,
    unit_of_measurement,
    selectedOption
  } = req.body;

  // If an image was uploaded, get the filename
  const newCompanyLogo = req.file ? req.file.filename : null;

  // Check if the service exists
  db.query(`SELECT * FROM services WHERE service_id = ?`, [serviceId], (err, rows) => {
    if (err) {
      res.status(500).send({
        message: 'Error checking if service exists',
        error: err
      });
      return;
    }
    if (rows.length === 0) {
      // If service not found, send 404 response
      res.status(404).send({
        message: 'Service with the provided ID not found'
      });
      return;
    }

    // Get the current companyLogo from the existing service
    const currentCompanyLogo = rows[0].companyLogo;

    // If a new logo is uploaded, delete the old one
    if (newCompanyLogo && currentCompanyLogo) {
      let oldLogoPath = path.join(__dirname, 'uploads', currentCompanyLogo);

      // Delete the old company logo from the file system
      fs.unlink(oldLogoPath, (err) => {
        if (err) {
          console.log('Error deleting old company logo:', err);
        } else {
          console.log('Old company logo deleted successfully');
        }
      });
    }

    // Use the new logo if uploaded, otherwise keep the current one
    const companyLogo = newCompanyLogo || currentCompanyLogo;

    // Update service details
    db.query(
      `UPDATE services SET select_category = ?, select_sub_category = ?, loginUserName = ?, shelves_count = ?, selling_price = ?,priceB = ?, purchase_price = ?, al_profile = ?, plastic_clip = ?, multitop_profile = ?, service_name = ?, service_desc = ?, valleyht_profile = ?, shutter_area_other = ?, basic_purchase_price = ?, unit_of_measurement = ?, selectedOption = ?, companyLogo = ? WHERE service_id = ?`,
      [
        select_category,
        select_sub_category,
        loginUserName,
        shelves_count,
        selling_price,
        priceB,
        purchase_price,
        al_profile,
        plastic_clip,
        multitop_profile,
        service_name,
        service_desc,
        valleyht_profile,
        shutter_area_other,
        basic_purchase_price,
        unit_of_measurement,
        selectedOption,
        companyLogo,
        serviceId
      ],
      (err, result) => {
        if (err) {
          res.status(500).send({
            message: 'Error updating service',
            error: err
          });
          return;
        }

        // Respond with success message
        res.status(200).send({
          message: 'Service details updated successfully',
          data: result
        });
      }
    );
  });
});

// For deleting a service

app.delete('/service/:id', (req, res) => {
  let serviceId = req.params.id;

  // Fetch the service to get the image filename
  let fetchServiceQuery = `SELECT companyLogo FROM services WHERE service_id = ?`;

  db.query(fetchServiceQuery, [serviceId], (err, result) => {
    if (err) {
      res.status(500).send({
        message: 'Error fetching service details',
        error: err
      });
      return;
    }

    if (result.length > 0) {
      let companyLogo = result[0].companyLogo;

      if (companyLogo) {
        let imagePath = path.join(__dirname, 'uploads', companyLogo);

        fs.unlink(imagePath, (err) => {
          if (err) {
          }
        });
      }
    }

    // Finally, delete the service
    let deleteServiceQuery = `DELETE FROM services WHERE service_id = ?`;

    db.query(deleteServiceQuery, [serviceId], (err) => {
      if (err) {
        res.status(500).send({
          message: 'Error deleting service',
          error: err
        });
        return;
      }

      res.send({
        message: 'Service deleted successfully'
      });
    });
  });
});

//---------------------------- services --------------------------------------------
//---------------------------- services description --------------------------------------------
// Update service description by ID
app.put('/service/:service_id/description', (req, res) => {
  let serviceId = req.params.service_id;
  let { service_description } = req.body;

  // Check if the service exists
  db.query(`SELECT * FROM services WHERE service_id = ?`, [serviceId], (err, rows) => {
    if (err) {
      res.status(500).send({
        message: 'Error checking if service exists',
        error: err
      });
      return;
    }
    if (rows.length === 0) {
      // If service not found, send 404 response
      res.status(404).send({
        message: 'Service with the provided ID not found'
      });
      return;
    }

    // Update service description
    db.query(
      `UPDATE service_descriptions SET service_description = ? WHERE service_id = ?`,
      [service_description, serviceId],
      (err, result) => {
        if (err) {
          res.status(500).send({
            message: 'Error updating service description',
            error: err
          });
          return;
        }

        res.status(200).send({
          message: 'Service description updated successfully',
          data: result
        });
      }
    );
  });
});

// -----------------------------------------------------------------------------------------

// ---------------------------- service-descriptions ----------------------------------
// Create a new service description

app.post('/service/:service_id/description', (req, res) => {
  let serviceId = req.params.service_id;
  let { service_description } = req.body;

  // Check if the service_id exists in the services table
  db.query(`SELECT * FROM services WHERE service_id = ?`, [serviceId], (err, rows) => {
    if (err) {
      res.status(500).send({
        message: 'Error creating new service description',
        error: err
      });
      return;
    }
    if (rows.length === 0) {
      // If service_id does not exist, send an error response
      res.status(404).send({
        message: 'Service with the provided ID not found'
      });
      return;
    }

    // Check if the description already exists for the service
    db.query(
      `SELECT * FROM service_descriptions WHERE service_id = ? AND service_description = ?`,
      [serviceId, service_description],
      (err, existingRows) => {
        if (err) {
          res.status(500).send({
            message: 'Error checking existing service descriptions',
            error: err
          });
          return;
        }

        // If the description already exists, send an error response
        if (existingRows.length > 0) {
          res.status(400).send({
            message: 'Description already exists for the service'
          });
          return;
        }

        // Data creation query for service description
        let query = `INSERT INTO service_descriptions (service_id, service_description) VALUES (?, ?)`;

        db.query(query, [serviceId, service_description], (err, result) => {
          if (err) {
            res.status(500).send({
              message: 'Error creating new service description',
              error: err
            });
            return;
          }

          res.status(201).send({
            message: 'Service description created successfully',
            data: result
          });
        });
      }
    );
  });
});

// Retrieve all service descriptions for a service
app.get('/service/:service_id/descriptions', (req, res) => {
  let serviceId = req.params.service_id;
  let query = `SELECT * FROM service_descriptions WHERE service_id = ?`;
  db.query(query, [serviceId], (err, results) => {
    if (err) {
      res.status(500).send({
        message: 'Error fetching service descriptions from database',
        error: err
      });
      return;
    }

    res.send({
      message: 'All service descriptions for service',
      data: results
    });
  });
});

// Retrieve a service description by ID
app.get('/service/description/:id', (req, res) => {
  let descriptionId = req.params.id;
  let query = `SELECT * FROM service_descriptions WHERE id = ?`;
  db.query(query, [descriptionId], (err, results) => {
    if (err) {
      res.status(500).send({
        message: 'Error fetching service description from database',
        error: err
      });
      return;
    }

    if (results.length > 0) {
      res.send({
        message: 'Service description found',
        data: results[0]
      });
    } else {
      res.status(404).send({
        message: 'Service description not found'
      });
    }
  });
});

// Delete a service description by ID
app.delete('/service/description/:id', (req, res) => {
  let descriptionId = req.params.id;

  // Data deletion query
  let query = `DELETE FROM service_descriptions WHERE description_id = ?`; // Change 'id' to 'description_id'

  db.query(query, [descriptionId], (err, result) => {
    if (err) {
      res.status(500).send({
        message: 'Error deleting service description',
        error: err
      });
      return;
    }

    res.send({
      message: 'Service description deleted successfully'
    });
  });
});
// -----------------------------------------------------------------------------------------

// Get all companies

// Multer storage configuration

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// POST endpoint to create a new company
app.post('/company', upload.single('companyLogo'), (req, res) => {
  const company = req.body;
  const userId = req.body.user_id; // Assuming you pass user_id in the request body

  // Check if a file was uploaded
  if (req.file) {
    company.companyLogo = req.file.filename; // Store the filename in the database
  }

  // Database insertion query with user_id included
  const query = `INSERT INTO company 
    (user_id, users_allowed, start_date, end_date, companyName, firstName, lastName, email, phoneNo, landline, companyPhoneNo, companyLandline, companyType, gstIN, bankDetails, ifscCode, companyAddress, country, state, district, city, pincode, accountNo, companyLogo, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [
      userId,
      company.users_allowed,
      company.start_date,
      company.end_date,
      company.companyName,
      company.firstName,
      company.lastName,
      company.email,
      company.phoneNo,
      company.landline,
      company.companyPhoneNo,
      company.companyLandline,
      company.companyType,
      company.gstIN,
      company.bankDetails,
      company.ifscCode,
      company.companyAddress,
      company.country,
      company.state,
      company.district,
      company.city,
      company.pincode,
      company.accountNo,
      company.companyLogo, // Ensure this is the filename stored in 'uploads' directory
      company.status
    ],
    (err, result) => {
      if (err) {
        res.status(500).send({ error: 'Error creating company' });
        return;
      }

      res.status(201).send({ message: 'Company created successfully', companyId: result.insertId });
    }
  );
});

// Update company status and related user statuses
app.put('/company/:id', upload.single('companyLogo'), (req, res) => {
  const companyId = req.params.id;
  const updatedCompany = req.body;
  const userId = req.body.user_id; // Assuming you pass user_id in the request body

  // Fetch the current company details to determine the current logo path
  db.query('SELECT companyLogo, companyName FROM company WHERE id = ?', [companyId], (err, results) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching company' });
      return;
    }

    if (results.length === 0) {
      res.status(404).send({ error: 'Company not found' });
      return;
    }

    const currentLogoPath = results[0].companyLogo;
    const companyName = results[0].companyName;

    // Check if a new file was uploaded and update companyLogo accordingly
    if (req.file) {
      updatedCompany.companyLogo = req.file.path;

      // Delete old logo file if it exists
      if (currentLogoPath) {
        fs.unlink(currentLogoPath, (err) => {
          if (err) console.error('Error deleting old logo file:', err);
        });
      }
    } else {
      updatedCompany.companyLogo = currentLogoPath; // Keep the existing logo path
    }

    // Update query with user_id included
    const updateQuery = `UPDATE company SET 
      user_id = ?,
      users_allowed = ?,
      start_date = ?, 
      end_date = ?,
      companyName = ?,
      firstName = ?,
      lastName = ?,
      email = ?,
      phoneNo = ?,
      landline = ?,
      companyPhoneNo = ?,
      companyLandline = ?,
      companyType = ?,
      gstIN = ?,
      bankDetails = ?,
      ifscCode = ?,
      companyAddress = ?,
      country = ?,
      state = ?,
      district = ?,
      city = ?,
      pincode = ?,
      accountNo = ?,
      companyLogo = ?,
      status = ?
      WHERE id = ?`;

    db.query(
      updateQuery,
      [
        userId,
        updatedCompany.users_allowed,
        updatedCompany.start_date,
        updatedCompany.end_date,
        updatedCompany.companyName,
        updatedCompany.firstName,
        updatedCompany.lastName,
        updatedCompany.email,
        updatedCompany.phoneNo,
        updatedCompany.landline,
        updatedCompany.companyPhoneNo,
        updatedCompany.companyLandline,
        updatedCompany.companyType,
        updatedCompany.gstIN,
        updatedCompany.bankDetails,
        updatedCompany.ifscCode,
        updatedCompany.companyAddress,
        updatedCompany.country,
        updatedCompany.state,
        updatedCompany.district,
        updatedCompany.city,
        updatedCompany.pincode,
        updatedCompany.accountNo,
        updatedCompany.companyLogo,
        updatedCompany.status,
        companyId
      ],
      (err) => {
        if (err) {
          res.status(500).send({ error: 'Error updating company' });
          return;
        }

        // Update related users' statuses based on company status
        let updateUserStatusQuery;
        let userStatusMessage;

        if (updatedCompany.status === 'inactive') {
          updateUserStatusQuery = `UPDATE userslogin SET status = 'inactive' WHERE select_company = ?`;
          userStatusMessage = 'Company and related user statuses updated to inactive. Please renew the company.';
        } else if (updatedCompany.status === 'active') {
          updateUserStatusQuery = `UPDATE userslogin SET status = 'active' WHERE select_company = ?`;
          userStatusMessage = 'Company and related user statuses updated to active.';
        }

        if (updateUserStatusQuery) {
          db.query(updateUserStatusQuery, [companyName], (err) => {
            if (err) {
              res.status(500).send({ error: 'Error updating user statuses' });
              return;
            }

            res.send({ message: userStatusMessage });
          });
        } else {
          res.send({ message: 'Company updated successfully' });
        }
      }
    );
  });
});

app.get('/companies', (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || 25;
  let offset = (page - 1) * pageSize;

  // Query to get the total number of items
  let countQuery = 'SELECT COUNT(*) AS total FROM company';

  // Check if userId is provided in query params
  if (req.query.userId) {
    let userId = parseInt(req.query.userId, 10);

    countQuery += ' WHERE user_id = ?';

    let query = 'SELECT * FROM company WHERE user_id = ? ORDER BY created_at DESC LIMIT ?, ?';
    db.query(countQuery, [userId], (err, countResults) => {
      if (err) {
        res.status(500).send({ error: 'Error counting companies for user' });
        return;
      }

      let totalItems = countResults[0].total;
      db.query(query, [userId, offset, pageSize], (err, results) => {
        if (err) {
          res.status(500).send({ error: 'Error fetching companies for user' });
          return;
        }

        res.send({ message: 'companies with pagination', data: results, total: totalItems });
      });
    });
  } else {
    // If userId is not provided, fetch all users with pagination
    let query = 'SELECT * FROM company ORDER BY created_at DESC LIMIT ?, ?';
    db.query(countQuery, (err, countResults) => {
      if (err) {
        res.status(500).send({ error: 'Error counting all companies' });
        return;
      }

      let totalItems = countResults[0].total;
      db.query(query, [offset, pageSize], (err, results) => {
        if (err) {
          res.status(500).send({ error: 'Error fetching companies' });
          return;
        }

        res.send({ message: 'All companies with company', data: results, total: totalItems });
      });
    });
  }
});

// GET endpoint to fetch companies with pagination and filter by userId and status
app.get('/active-companies', (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let pageSize = parseInt(req.query.pageSize) || 25;
  let offset = (page - 1) * pageSize;
  let userId = req.query.userId ? parseInt(req.query.userId) : null;
  let status = req.query.status || 'active'; // Default status to 'active' if not provided

  let query;
  let queryParams = [];

  if (userId) {
    query = `SELECT * FROM company WHERE user_id = ? AND status = ? LIMIT ?, ?`;
    queryParams = [userId, status, offset, pageSize];
  } else {
    query = `SELECT * FROM company WHERE status = ? LIMIT ?, ?`;
    queryParams = [status, offset, pageSize];
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching companies' });
      return;
    }

    res.send({ message: `Companies with status '${status}' and pagination`, data: results });
  });
});
// GET endpoint to fetch companies ending within 30 days or 1 month
const moment = require('moment');

app.get('/companies-ending-soon', (req, res) => {
  const startDate = moment().format('YYYY-MM-DD'); // Current date
  const endDate = moment().add(30, 'days').format('YYYY-MM-DD'); // 30 days later

  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || 25;
  let offset = (page - 1) * pageSize;

  // Define base query and parameters
  const countQuery = 'SELECT COUNT(*) AS totalItems FROM company WHERE end_date BETWEEN ? AND ?';
  const dataQuery = 'SELECT * FROM company WHERE end_date BETWEEN ? AND ? LIMIT ? OFFSET ?';
  const queryParams = [startDate, endDate];

  // Function to execute query and handle response
  const executeQuery = (query, params, successMessage) => {
    db.query(query, params, (err, results) => {
      if (err) {
        return res.status(500).send({ error: `Error ${successMessage.toLowerCase()}` });
      }

      const totalItems = results[0]?.totalItems || 0;

      // Fetch paginated results
      db.query(dataQuery, [...queryParams, pageSize, offset], (err, dataResults) => {
        if (err) {
          return res.status(500).send({ error: `Error fetching ${successMessage.toLowerCase()}` });
        }

        res.send({ message: successMessage, data: dataResults, totalItems });
      });
    });
  };

  // Fetch total count of companies ending soon
  executeQuery(countQuery, queryParams, 'Companies ending soon');
});

app.get('/company/:id', (req, res) => {
  const companyId = req.params.id;
  db.query('SELECT * FROM company WHERE id = ?', [companyId], (err, results) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching company' });
      return;
    }
    if (results.length === 0) {
      res.status(404).send({ error: 'Company not found' });
      return;
    }
    res.send({ company: results[0] });
  });
});

// Delete company by ID
app.delete('/company/:id', (req, res) => {
  const companyId = req.params.id;

  // Fetch company details to get the logo path for deletion
  db.query('SELECT companyLogo FROM company WHERE id = ?', [companyId], (err, results) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching company' });
      return;
    }

    if (results.length === 0) {
      res.status(404).send({ error: 'Company not found' });
      return;
    }

    const logoPath = results[0].companyLogo;

    // Delete company from database
    db.query('DELETE FROM company WHERE id = ?', [companyId], (err, result) => {
      if (err) {
        res.status(500).send({ error: 'Error deleting company' });
        return;
      }

      // Delete associated logo file if exists
      if (logoPath) {
        // Construct the full path to the file using path.join
        const filePath = path.join(__dirname, 'uploads', logoPath);

        // Delete the file
        fs.unlink(filePath, (err) => {
          if (err) {
            // Handle error deleting file

            res.status(500).send({ error: 'Error deleting logo file' });
            return;
          }
        });
      }

      // Send response only after all operations are completed
      res.send({ message: 'Company deleted successfully' });
    });
  });
});

// enquiry master

// Get enquiries by SessionMaster_id

app.get('/enquiriesMasters', (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  let pageSize = parseInt(req.query.pageSize, 10) || 25;
  let offset = (page - 1) * pageSize;

  // Query to get the total number of items
  let countQuery = 'SELECT COUNT(*) AS total FROM enquiry_master';

  // Check if userId is provided in query params
  if (req.query.userId) {
    let userId = parseInt(req.query.userId, 10);

    countQuery += ' WHERE SessionMaster_id = ?';

    let query = 'SELECT * FROM enquiry_master WHERE SessionMaster_id = ? ORDER BY created_at DESC LIMIT ?, ?';
    db.query(countQuery, [userId], (err, countResults) => {
      if (err) {
        res.status(500).send({ error: 'Error counting EnquiriesMasters for user' });
        return;
      }

      let totalItems = countResults[0].total;
      db.query(query, [userId, offset, pageSize], (err, results) => {
        if (err) {
          res.status(500).send({ error: 'Error fetching EnquiriesMasters for user' });
          return;
        }

        res.send({ message: 'EnquiriesMasters with pagination', data: results, total: totalItems });
      });
    });
  } else {
    // If userId is not provided, fetch all users with pagination
    let query = 'SELECT * FROM enquiry_master ORDER BY created_on DESC LIMIT ?, ?';
    db.query(countQuery, (err, countResults) => {
      if (err) {
        res.status(500).send({ error: 'Error counting all EnquiriesMasters' });
        return;
      }

      let totalItems = countResults[0].total;
      db.query(query, [offset, pageSize], (err, results) => {
        if (err) {
          res.status(500).send({ error: 'Error fetching EnquiriesMasters' });
          return;
        }

        res.send({ message: 'All EnquiriesMasters with pagination', data: results, total: totalItems });
      });
    });
  }
});

app.get('/active-enquiriesMasters', (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let pageSize = parseInt(req.query.pageSize) || 25;
  let offset = (page - 1) * pageSize;
  let loginCompany = req.query.loginCompany;
  let status = req.query.status || 'active'; // Default status to 'active' if not provided

  if (!loginCompany) {
    return res.status(400).send({ error: 'loginCompany is required' });
  }

  let query = `SELECT * FROM enquiry_master WHERE login_company = ? AND status = ? LIMIT ?, ?`;
  let queryParams = [loginCompany, status, offset, pageSize];

  db.query(query, queryParams, (err, results) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching EnquiriesMasters' });
      return;
    }

    res.send({ message: `EnquiriesMasters with status '${status}' and pagination`, data: results });
  });
});

// get single enquiriesMaster by ID

app.get('/enquiriesMaster/:id', (req, res) => {
  let qrId = req.params.id; //to store/hold id
  let qr = `SELECT * FROM enquiry_master where id = ${qrId}`;
  db.query(qr, (err, results) => {
    if (err) {
    }

    if (results.length > 0) {
      res.send({
        message: 'Get enquiriesMaster by id',
        data: results
      });
    } else {
      res.send({
        message: 'id not found'
      });
    }
  });
});

// create a new enquiriesMaster
app.post('/enquiriesMaster', (req, res) => {
  let { status_name, status, SessionMaster_id, login_company, role } = req.body;
  if (status === '') {
    status = 'inactive';
  }
  let query = `INSERT INTO enquiry_master (status_name, status, SessionMaster_id, login_company, role) VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [status_name, status, SessionMaster_id, login_company, role], (err, results) => {
    if (err) {
      res.status(500).send({ error: 'Failed to create enquiry', message: err.message });
      return;
    }

    res.status(201).send({ message: 'Enquiry created successfully!', data: results });
  });
});

// Update a enquiriesMaster
app.put('/enquiriesMaster/:id', (req, res) => {
  const id = req.params.id;
  const { status_name, status } = req.body;

  db.query('UPDATE enquiry_master SET status_name = ?, status = ? WHERE id = ?', [status_name, status, id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error updating EnquiriesMaster' });
    } else {
      res.status(200).json({ message: 'EnquiriesMaster updated successfully' });
    }
  });
});

// DELETE enquiriesMaster by ID
app.delete('/enquiriesMaster/:id', (req, res) => {
  let enquiryId = req.params.id;

  let query = `DELETE FROM enquiry_master WHERE id = ?`;
  db.query(query, [enquiryId], (err, results) => {
    if (err) {
      res.status(500).send({
        message: 'Failed to delete enquiriesMaster',
        error: err
      });
      return;
    }

    res.send({
      message: 'EnquiriesMaster deleted successfully!'
    });
  });
});
// enquiry master

// ------------------------------------------------------//
// Create a new state

app.post('/states', (req, res) => {
  let { state_name, status } = req.body;

  // Data creation query
  let query = `INSERT INTO states (state_name, status) VALUES (?, ?)`;

  db.query(query, [state_name, status], (err, result) => {
    if (err) {
      res.status(500).send({
        message: 'Error creating new state',
        error: err
      });
      return;
    }

    res.status(201).send({
      message: 'state created successfully',
      data: result
    });
  });
});
// Read all states with pagination
app.get('/states', (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let pageSize = parseInt(req.query.pageSize) || 25;
  let offset = (page - 1) * pageSize;

  let query = `SELECT * FROM states LIMIT ?, ?`;
  db.query(query, [offset, pageSize], (err, results) => {
    if (err) {
      res.status(500).send({
        message: 'Error fetching states',
        error: err
      });
      return;
    }

    res.send({
      message: 'All states data with pagination',
      data: results
    });
  });
});
// Get state by ID

app.get('/states/:id', (req, res) => {
  const id = req.params.id;
  let query = `SELECT * FROM states WHERE id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send({
        message: 'Error fetching states from database',
        error: err
      });
      return;
    }

    if (results.length > 0) {
      res.send({
        message: 'states found',
        data: results[0]
      });
    } else {
      res.status(404).send({
        message: 'states not found'
      });
    }
  });
});
// Update a state
app.put('/states/:id', (req, res) => {
  const id = req.params.id;
  const { state_name, status } = req.body;

  db.query('UPDATE states SET state_name = ?, status = ? WHERE id = ?', [state_name, status, id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error updating state' });
    } else {
      res.status(200).json({ message: 'State updated successfully' });
    }
  });
});

// Delete a state
app.delete('/states/:id', (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM states WHERE id = ?', id, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error deleting state' });
    } else {
      res.status(200).json({ message: 'State deleted successfully' });
    }
  });
});

//-------------------------------------------------------------------------

// Create a new city

app.post('/cities', (req, res) => {
  let { state_id, state_name, city_name, status } = req.body;

  // Data creation query
  let query = `INSERT INTO cities (state_id,state_name, city_name, status) VALUES (?, ?, ? ,?)`;

  db.query(query, [state_id, state_name, city_name, status], (err, result) => {
    if (err) {
      res.status(500).send({
        message: 'Error creating new city',
        error: err
      });
      return;
    }

    res.status(201).send({
      message: 'city created successfully',
      data: result
    });
  });
});

app.get('/cities', (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let pageSize = parseInt(req.query.pageSize) || 25;
  let offset = (page - 1) * pageSize;

  let query = `SELECT * FROM cities LIMIT ?, ?`;
  db.query(query, [offset, pageSize], (err, results) => {
    if (err) {
      res.status(500).send({
        message: 'Error fetching cities',
        error: err
      });
      return;
    }

    res.send({
      message: 'All cities data with pagination',
      data: results
    });
  });
});

app.get('/cities/:id', (req, res) => {
  const id = req.params.id;
  let query = `SELECT * FROM cities WHERE id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send({
        message: 'Error fetching cities from database',
        error: err
      });
      return;
    }

    if (results.length > 0) {
      res.send({
        message: 'cities found',
        data: results[0]
      });
    } else {
      res.status(404).send({
        message: 'cities not found'
      });
    }
  });
});

// Update a city
app.put('/cities/:id', (req, res) => {
  const id = req.params.id;
  const { state_id, state_name, city_name, status } = req.body;

  db.query(
    'UPDATE cities SET state_id =?, state_name = ?,city_name = ?, status = ? WHERE id = ?',
    [state_id, state_name, city_name, status, id],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Error updating cities' });
      } else {
        res.status(200).json({ message: 'cities updated successfully' });
      }
    }
  );
});

// Delete a city

app.delete('/cities/:id', (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM cities WHERE id = ?', id, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error deleting city' });
    } else {
      res.status(200).json({ message: 'city deleted successfully' });
    }
  });
});

// ------------------------------------------------------------
