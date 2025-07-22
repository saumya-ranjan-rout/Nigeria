const mysql = require('mysql');
const odbc = require('odbc');
const async = require('async');
const express = require("express");
const cors = require('cors');
const app = express();
const sqlString = require('sqlstring');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const properties = require(`./properties.json`);
const environment = properties.env.environment || 'development';
const authenticateJWT = require('./middleware/authenticateJWT');
const dateUtils = require('./date/dateUtils');
//const CustomDateLibrary = require('./date/CustomDateLibrary');
const authUtils = require('./auth/authUtils');

//require('dotenv').config();
// Determine the environment (default to 'development' if not set)
//const environment = process.env.NODE_ENV || 'development';

// Load the configuration file based on the environment
const config = require(`./config.${environment}.json`);

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// Specify the DSN in the connection string
const odbcConnectionString = 'DSN=' + config.odbc.DSN + ';UID=' + config.odbc.UID + ';PWD=' + config.odbc.PWD + ';';

//console.log("odbcConnectionString: ", odbcConnectionString);

// Mock MySQL configuration
const dbConfig = {
  host: config.database.host,
  user: config.database.username,
  password: config.database.password,
  port: config.database.port,
  database: config.database.databaseName,
  connectionLimit: 10,
};

const db = mysql.createConnection(dbConfig);
db.connect();

// Create a MySQL connection pool
const dbPool = mysql.createPool(dbConfig);

// Utility function to get a connection from the pool
const getPoolConnection = () => {
  return new Promise((resolve, reject) => {
    dbPool.getConnection((err, connection) => {
      if (err) {
        console.error('Error acquiring connection:', err);
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
};

// Utility function to execute a query
const executeQuery = (connection, sqlQuery, values) => {
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};



// Function to begin a transaction
const beginTransaction = async (connection) => {
  await connection.beginTransaction();
};

// Function to commit a transaction
const commitTransaction = async (connection) => {
  await connection.commit();
};

// Function to rollback a transaction
const rollbackTransaction = async (connection) => {
  await connection.rollback();
};

module.exports = db;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(cors());
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
// Increase the payload size limit to 10MB (adjust the limit as per your requirement)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Secret key for JWT (keep this secret in a real application)
//const secretKey = 'your-secret-key';
//const secretKey = process.env.YOUR_SECRET_KEY;
const secretKey = config.auth.secretKey;
console.log('Secret Key:', secretKey);

//const customDate = new CustomDateLibrary();
//console.log('Current Date:', customDate.getCurrentDate());
const currentDate = dateUtils.getCurrentDate("DD-MM-YYYY");
console.log("currentDate:: DD-MM-YYYY", currentDate);
const currentDate2 = dateUtils.getCurrentDate("DD/MM/YYYY");
console.log("currentDate:: DD/MM/YYYY", currentDate2);
const currentDateTime = dateUtils.getCurrentDate("YYYY-MM-DD HH:mm:ss");
console.log("currentDateTime:: DD-MM-YYYY", currentDateTime);
const currentMonthYear = dateUtils.getCurrentMonthYear();
console.log("currentMonthYear:: MM/YYYY", currentMonthYear);
const currentYear = dateUtils.getCurrentYear();
console.log("currentYear:: YYYY", currentYear);
const currentMonth = dateUtils.getCurrentMonth();
console.log("currentMonth:: MM", currentMonth);
const currentTimestamp = dateUtils.getCurrentUnixTimestamp();
console.log("currentTimestamp:: ", currentTimestamp);
//console.log(dateUtils.getThisWeekAllDates("DD-MM-YYYY"));
//console.log(dateUtils.getThisMonthAllDates("DD-MM-YYYY"));

// API endpoint for login validation
app.post('/signin', async (req, res) => {
  let connection;
  try {
    const { email, password } = req.body;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Perform validation by querying the MySQL table
    const user = await executeQuery(connection, 'SELECT id, roleid, username, entryid, email, pass FROM geopos_users WHERE (email = ? OR username = ?) AND banned = 0', [email, email]);

    if (user.length > 0) {
      const userId = `${user[0].id}`;
      const hashedPassword = authUtils.hashPassword(password, userId);
      console.log("hashedPassword", hashedPassword);

      if (hashedPassword === user[0].pass) {
        // Credentials are valid
        const user_details = {
          id: user[0].id,
          roleid: user[0].roleid,
          username: user[0].username,
          entryid: user[0].entryid,
          email: user[0].email,
        };

        const token = jwt.sign(user_details, secretKey);
        console.log("token:", token);
        console.log("user:", user);

        res.json({ success: true, result: user, token: token });
      } else {
        // Credentials are invalid
        res.json({ success: false, message: 'Invalid password' });
      }
    } else {
      // Credentials are invalid
      res.json({ success: false, message: 'Invalid username' });
    }

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});

//============================================ Item Category Start =====================================================

/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     ItemCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           example: 10
 *         category_name:
 *           type: string
 *           example: "BRAID"
 * 
 * /item-category/add:
 *   post:
 *     summary: Add a new item Category.
 *     description: Adds a new item category to the database.
 *     tags:
 *       - Item Category
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: JSON object containing the category_name to be added.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_name:
 *                 type: string
 *                 description: The name of the item category to be added.
 *     responses:
 *       200:
 *         description: Successful response indicating the item category has been added.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "Item category added successfully."
 *       409:
 *         description: Conflict response indicating that the item category name already exists.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Duplicate: item category name already exists."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Failed to add item category. Please try again."
 *
 * @function
 * @async
 * @name addItemCategory
 * @memberof module:Routes/Item Category
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query or insertion.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post("/item-category/add", authenticateJWT, async (req, res) => {
  let connection;
  try {
    /**
    * Extract the category_name from the request body.
    * @type {string} name - The name of the item category to be added.
    */
    var name = req.body.category_name;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Check for duplication
    const checkDuplicationSql = 'SELECT id FROM item_category WHERE category_name = ?';
    const checkResult = await executeQuery(connection, checkDuplicationSql, [name]);

    // If a record with the same name exists, return a response indicating duplication
    if (checkResult.length > 0) {
      console.log('Duplicate');
      return res.status(409).send("Duplicate: item category name already exists.");
    }

    // If no duplication, proceed with the insertion
    const insertSql = 'INSERT INTO item_category (category_name) VALUES (?)';
    const insertResult = await executeQuery(connection, insertSql, [name]);

    console.log('Insert successful:', insertResult);
    res.status(200).send({ status: "Success", message: "Item category added successfully." });
  } catch (error) {
    /**
     * Handle exceptions and send an appropriate response.
     * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
     */
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});

/**
 * @swagger
 * /item-category:
 *   get:
 *     summary: Get all item categories.
 *     description: Retrieves all item categories from the database.
 *     tags:
 *       - Item Category
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with an array of item categories.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 category_name: "Category 1"
 *               - id: 2
 *                 category_name: "Category 2"
 *       403:
 *         description: Forbidden error indicating the user is not authorized to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               message: "You are not authorized to perform this action."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Failed to retrieve item categories. Please try again."
 *
 * @function
 * @name getItemCategories
 * @memberof module:Routes/Item Category
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {ForbiddenError} Will throw an error if the user is not authorized to perform this action.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get("/item-category", authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Authorization check: Only 'admin' users are allowed
    if (req.user.roleid !== 5) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    // Get a connection from the pool
    connection = await getPoolConnection();
    // Perform queries using the 'connection'
    const sqlQuery = 'SELECT * FROM item_category';
    const result = await executeQuery(connection, sqlQuery);

    // Send the list of item categories as the response to the client.
    res.send(result);

  } catch (error) {
    /**
     * Handle exceptions and send an appropriate response.
     * @throws {ForbiddenError} Will throw an error if the user is not authorized.
     * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
    */
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during fetch' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});



//============================================ Item Category End =====================================================

//============================================ Section Start =====================================================

/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     Section:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         section_name:
 *           type: string
 *           example: "Example Section"
 *         target_unit:
 *           type: string
 *           example: "Example Unit"
 *         section_type:
 *           type: string
 *           example: "Example Type"
 * 
 * /section/add:
 *   post:
 *     summary: Add a new section.
 *     description: Adds a new section to the database.
 *     tags:
 *       - Section
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: JSON object containing the section_name to be added.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               section_name:
 *                 type: string
 *                 description: The name of the section to be added.
 *     responses:
 *       200:
 *         description: Successful response indicating the section has been added.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "Inserted successfully"
 *       409:
 *         description: Conflict response indicating that the section name already exists.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Duplicate: Section name already exists."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal Server Error - Insertion failed"
 *
 * @function
 * @name addSection
 * @memberof module:Routes/Section
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query or insertion.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post("/section/add", authenticateJWT, async (req, res) => {
  let connection;
  try {
    /**
     * Extract the section_name from the request body.
     * @type {string} sectionname - The name of the section to be added.
     */
    var sectionname = req.body.section_name;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Check for duplication
    const checkDuplicationSql = 'SELECT id FROM section WHERE section_name = ?';
    const checkResult = await executeQuery(connection, checkDuplicationSql, [sectionname]);

    // If a record with the same name exists, return a response indicating duplication
    if (checkResult.length > 0) {
      console.log('Duplicate');
      return res.status(409).send("Duplicate: Section name already exists.");
    }

    // If no duplication, proceed with the insertion
    const insertSql = 'INSERT INTO section (section_name) VALUES (?)';
    const insertResult = await executeQuery(connection, insertSql, [sectionname]);

    console.log('Insert successful:', insertResult);
    res.status(200).send({ status: "Success", message: "Inserted successfully" });

  } catch (error) {
    /**
      * Handle exceptions and send an appropriate response.
      * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
      */
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});


/**
 * @swagger
 * /section:
 *   get:
 *     summary: Get all sections.
 *     description: Retrieves all sections from the database.
 *     tags:
 *       - Section
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with an array of sections.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 section_name: "Section 1"
 *               - id: 2
 *                 section_name: "Section 2"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Failed to retrieve sections. Please try again."
 *
 * @function
 * @name getSections
 * @memberof module:Routes/Section
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get("/section", authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await getPoolConnection();
    /**
     * Perform a database query to get all sections.
     * @type {Array} result - An array containing the query result.
     */
    const result = await executeQuery(connection, "SELECT * FROM section");
    // Send the list of sections as the response to the client.
    res.send(result);

  } catch (error) {
    /**
    * Handle exceptions and send an appropriate response.
    * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
    */
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});


/**
 * @swagger
 * /section/total-count:
 *   get:
 *     summary: Get the total count of sections.
 *     description: |
 *       This endpoint retrieves the total count of sections from the database.
 *     tags:
 *       - Section
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of sections.
 *         content:
 *           application/json:
 *             example:
 *               totalSection: 20
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalSectionCount
 * @memberof module:Routes/Section
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/section/total-count', authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await getPoolConnection();

    /**
     * Perform a database query to get the total count of sections.
     * @type {Array} result - An array containing the query result.
     */
    const result = await executeQuery(connection, 'SELECT COUNT(*) as rowCount FROM section');

    /**
     * Extract the total section count from the query result.
     * @type {number} rowCount - The total count of sections.
     */
    const rowCount = result[0].rowCount;

    /**
     * Prepare the response object with the total section count.
     * @type {Object} response - The response object.
     * @property {number} totalSection - The total count of sections.
     */
    const response = {
      totalSection: rowCount,
    };

    // Send the response to the client.
    res.send(response);
  } catch (error) {
    /**
     * Handle exceptions and send an appropriate response.
     * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
     */
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});


/**
 * @swagger
 * /section/{roleid}/{userid}:
 *   get:
 *     summary: Get section details based on role and user ID.
 *     description: |
 *       This endpoint retrieves section details based on the provided role and user ID. If the role is not 3 (operator),
 *       it returns all available sections; otherwise, it returns the sections assigned to the operator.
 *     tags:
 *       - Section
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve section details.
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve section details.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with section details.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 section_name: "Section A"
 *               - id: 2
 *                 section_name: "Section B"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getSectionDetails
 * @memberof module:Routes/Section
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/section/:roleid/:userid', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.params.roleid;
    const userid = req.params.userid;

    // Get a connection from the pool
    connection = await getPoolConnection();

    let query = `SELECT * FROM section`;
    if (roleid == 3) {
      query = `SELECT * FROM section WHERE id IN (SELECT section FROM operator_assign WHERE name_id = ${userid} GROUP BY section)`;
    }
    // Execute the query and handle the result
    const results = await executeQuery(connection, query);

    // Send the response to the client
    res.json(results);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});



/**
 * @swagger
 * /section/{id}:
 *   get:
 *     summary: Get a specific section by ID.
 *     description: Retrieves a specific section from the database based on its ID.
 *     tags:
 *       - Section
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the section to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response with the section details.
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               section_name: "Section 1"
 *       404:
 *         description: Not Found response indicating that the section with the given ID was not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Section not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Server error"
 *
 * @function
 * @name getSectionById
 * @memberof module:Routes/Section
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get("/section/:id", authenticateJWT, async (req, res) => {
  let connection;
  try {
    /**
     * Extract the id from the request parameters.
     * @type {number} id - The ID of the section to retrieve.
     */
    const id = req.params.id;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Construct the SQL query with a placeholder
    const query = 'SELECT id, section_name FROM section WHERE id = ?';

    // Execute the query with the id as a parameter
    const results = await executeQuery(connection, query, [id]);

    if (results.length > 0) {
      // Extract the section details from the query result
      const section = results[0];
      // Send the section details as the response to the client.
      res.status(200).json(section);
    } else {
      // Return a Not Found response if the section with the given ID was not found.
      res.status(404).json({ message: 'Section not found' });
    }

  } catch (error) {
    /**
     * Handle exceptions and send an appropriate response.
     * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
     */
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});

/**
 * @swagger
 * /section/update:
 *   put:
 *     summary: Update a section.
 *     description: Update the details of a specific section in the database.
 *     tags:
 *       - Section
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: JSON object containing the section details to be updated.
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             id: 1
 *             section_name: "Updated Section Name"
 *     responses:
 *       200:
 *         description: Successful response indicating that the section was updated successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: "Section updated successfully."
 *       400:
 *         description: Bad Request response indicating a validation or client error.
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid request body"
 *       409:
 *         description: Conflict response indicating that the new section name is a duplicate.
 *         content:
 *           application/json:
 *             example:
 *               error: "Duplicate section name"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               error: "An error occurred while updating the section."
 *
 * @function
 * @name updateSection
 * @memberof module:Routes/Section
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put("/section/update", authenticateJWT, async (req, res) => {
  let connection;
  try {
    /**
     * Extract the section details from the request body.
     * @type {number} id - The ID of the section to be updated.
     * @type {string} sname - The updated name of the section.
     */

    const id = req.body.id;
    const sname = req.body.section_name;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Check for duplication
    const checkDuplicationSql = 'SELECT id FROM section WHERE section_name = ? AND id != ?';
    const checkResult = await executeQuery(connection, checkDuplicationSql, [sname, id]);

    // If a record with the same name exists (other than the current one being updated), return a response indicating duplication
    if (checkResult.length > 0) {
      console.log('Duplicate');
      res.status(409).json({ error: 'Duplicate section name' });
    } else {
      // If no duplication, proceed with the update
      const updateSql = 'UPDATE section SET section_name = ? WHERE id = ?';
      const updateResult = await executeQuery(connection, updateSql, [sname, id]);

      console.log('Update successful:', updateResult);
      res.json({ message: 'Section updated successfully.' });
    }
  } catch (error) {
    /**
      * Handle exceptions and send an appropriate response.
      * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
      */
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});

/**
 * @swagger
 * /section/delete/{id}:
 *   delete:
 *     summary: Delete a section.
 *     description: Delete a specific section from the database.
 *     tags:
 *       - Section
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the section to be deleted.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response indicating that the section was deleted successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: "Section deleted successfully."
 *       404:
 *         description: Not Found response indicating that the section with the specified ID was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: "Section not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               error: "An error occurred while deleting the section."
 *
 * @function
 * @name deleteSection
 * @memberof module:Routes/Section
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.delete("/section/delete/:id", authenticateJWT, async (req, res) => {
  let connection;
  try {
    /**
     * Extract the section ID from the request parameters.
     * @type {number} id - The ID of the section to be deleted.
     */
    const id = req.params.id;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Perform the database query to delete the section with the specified ID
    const deleteResult = await executeQuery(connection, "DELETE FROM section WHERE id = ?", [id]);

    // Check if any rows were affected by the delete operation
    if (deleteResult.affectedRows > 0) {
      // The section was deleted successfully
      console.log(deleteResult);
      res.json({ message: 'Section deleted successfully.' });
    } else {
      // The section with the specified ID was not found
      res.status(404).json({ error: 'Section not found' });
    }
  } catch (error) {
    /**
     * Handle exceptions and send an appropriate response.
     * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
     */
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  }
});

//============================================ Section End =====================================================

//============================================ Shift Start =====================================================


/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     Shift:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Example Shift"
 *         nhrs:
 *           type: integer
 * 
 * /shift:
 *   get:
 *     summary: Get all shifts.
 *     description: Retrieve shift data from the database.
 *     tags:
 *       - Shift
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with the shift data.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "Shift 1"
 *                 nhrs: 8
 *               - id: 2
 *                 name: "Shift 2"
 *                 nhrs: 8
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getShiftData
 * @memberof module:Routes/Shift
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get("/shift", authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await getPoolConnection();

    // Perform a database query to get all shifts
    const shifts = await executeQuery(connection, "SELECT * FROM geopos_shift");

    // Send the list of shifts as the response to the client.
    res.send(shifts);

  } catch (error) {
    /**
    * Handle exceptions and send an appropriate response.
    * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
    */
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});


/**
 * @swagger
 * /shift/{roleid}/{userid}:
 *   get:
 *     summary: Get shift details based on role and user ID.
 *     description: |
 *       This endpoint retrieves shift details based on the provided role and user ID. If the role is not 3 (operator),
 *       it returns all available shifts; otherwise, it returns the shift assigned to the operator.
 *     tags:
 *       - Shift
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve shift details.
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve shift details.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with shift details.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "Morning"
 *                 start_time: "08:00:00"
 *                 end_time: "16:00:00"
 *               - id: 2
 *                 name: "Afternoon"
 *                 start_time: "16:00:00"
 *                 end_time: "00:00:00"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getShiftDetails
 * @memberof module:Routes/Shift
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/shift/:roleid/:userid', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.params.roleid;
    const userid = req.params.userid;
    // Get a connection from the pool
    connection = await getPoolConnection();

    let query = `SELECT * FROM geopos_shift`;
    if (roleid == 3) {
      query = `SELECT * FROM geopos_shift WHERE name=(SELECT shift FROM employees_moz WHERE entryid=(SELECT entryid FROM geopos_users WHERE id=${userid}))`;
    }

    // Execute the query and handle the result
    const results = await executeQuery(connection, query);

    // Send the response to the client
    res.json(results);
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});



/**
 * @swagger
 * /shift/add:
 *   post:
 *     summary: Add a new shift.
 *     description: Add a new shift to the database.
 *     tags:
 *       - Shift
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shift_name:
 *                 type: number
 *                 description: The name of the new shift.
 *     responses:
 *       200:
 *         description: Successful response with insertion status.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "Inserted successfully"
 *       409:
 *         description: Duplicate shift name.
 *         content:
 *           text/plain:
 *             example: "Duplicate: Shift already exist."
 *       500:
 *         description: Internal server error.
 *         content:
 *           text/plain:
 *             example: "Internal Server Error - Duplicate check failed"
 *
 * @function
 * @name addShift
 * @memberof module:Routes/Shift
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post("/shift/add", authenticateJWT, async (req, res) => {
  let connection;
  try {
    var shname = req.body.shift_name;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Check for duplication
    const checkDuplicationSql = `SELECT id FROM geopos_shift WHERE name = ? OR nhrs = ?`;

    // Execute the query with placeholders
    const checkResult = await executeQuery(connection, checkDuplicationSql, [shname, shname]);

    // If a record with the same name exists, return a response indicating duplication
    if (checkResult.length > 0) {
      console.log('Duplicate');
      res.status(409).send("Duplicate: Shift already exists.");
    } else {
      // If no duplication, proceed with the insertion
      const insertSql = `INSERT INTO geopos_shift (name, nhrs) VALUES (?, ?)`;

      // Execute the query with placeholders
      await executeQuery(connection, insertSql, [`${shname}HRS`, shname]);

      console.log('Insert successful');
      res.status(200).send({ status: "Success", message: "Inserted successfully" });
    }

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  }
  finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});


//============================================ Shift End =====================================================

//============================================ Worker Type Start =====================================================


/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     WorkerType:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Example Worker Type"
 * 
 * /worker-type/add:
 *   post:
 *     summary: Add a new worker type.
 *     description: Add a new worker type to the database.
 *     tags:
 *       - Worker Type
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workertype_name:
 *                 type: string
 *                 description: The name of the new worker type.
 *     responses:
 *       201:
 *         description: Successful response with insertion status.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "Inserted successfully"
 *       409:
 *         description: Duplicate worker type name.
 *         content:
 *           text/plain:
 *             example: "Duplicate: Worker type already exist."
 *       500:
 *         description: Internal server error.
 *         content:
 *           text/plain:
 *             example: "Internal Server Error - Duplicate check failed"
 *
 * @function
 * @name addWorkerType
 * @memberof module:Routes/WorkerType
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post("/worker-type/add", authenticateJWT, async (req, res) => {
  let connection;
  try {
    var wtname = req.body.workertype_name;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Check for duplication
    const checkDuplicationSql = 'SELECT id FROM geopos_workertype WHERE name = ?';

    // Execute the query with placeholders
    const checkResult = await executeQuery(connection, checkDuplicationSql, [wtname]);

    // If a record with the same name exists, return a response indicating duplication
    if (checkResult.length > 0) {
      console.log('Duplicate');
      res.status(409).send("Duplicate: Worker type already exists.");
    } else {
      // If no duplication, proceed with the insertion
      const insertSql = 'INSERT INTO geopos_workertype (name) VALUES (?)';

      // Execute the query with placeholders
      await executeQuery(connection, insertSql, [wtname]);

      console.log('Insert successful');
      res.status(201).send({ status: "Success", message: "Inserted successfully" });
    }
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});


/**
 * @swagger
 * /worker-type:
 *   get:
 *     summary: Get all worker types.
 *     description: Retrieve worker type data from the database.
 *     tags:
 *       - Worker Type
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with the worker type data.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "Worker Type 1"
 *               - id: 2
 *                 name: "Worker Type 2"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getWorkerTypeData
 * @memberof module:Routes/WorkerType
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get("/worker-type", authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await getPoolConnection();

    // Perform the database query to get all worker types
    const query = 'SELECT id, name FROM geopos_workertype';

    // Execute the query using the connection
    const result = await executeQuery(connection, query);

    // Send the list of worker types as the response to the client.
    res.send(result);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});


//============================================ Worker Type End =====================================================

//============================================ Employee Role Start =====================================================

/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     EmpType:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Example Employee Type"
 * 
 * /employee-role:
 *   get:
 *     summary: Get all employee roles.
 *     description: Retrieve employee roles data from the database.
 *     tags:
 *       - Employee Role
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with the employee roles data.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "Role 1"
 *               - id: 2
 *                 name: "Role 2"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getEmployeeRoles
 * @memberof module:Routes/EmployeeRole
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get("/employee-role", authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await getPoolConnection();

    // Perform the database query to get all employee roles
    const query = 'SELECT * FROM geopos_emptype';

    // Execute the query using the connection
    const result = await executeQuery(connection, query);

    // Send the list of employee roles as the response to the client.
    res.send(result);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});


/**
 * @swagger
 * /employee-role/{id}:
 *   get:
 *     summary: Get employee role by ID.
 *     description: |
 *       This endpoint retrieves details about an employee role based on the provided role ID.
 *     tags:
 *       - Employee Role
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the employee role to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with details about the employee role.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "Manager"
 *       '404':
 *         description: The specified employee role was not found.
 *         content:
 *           application/json:
 *             example:
 *               message: "Employee role not found"
 *       '500':
 *         description: Internal server error during the retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               message: "Error fetching employee role"
 *
 * @function
 * @name getEmployeeRoleById
 * @memberof module:Routes/Employee
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {NotFoundError} Will throw an error if the specified employee role is not found.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/employee-role/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await getPoolConnection();

    // Extract the id from the request parameters
    const id = req.params.id;

    // Construct the SQL query with a placeholder
    const query = 'SELECT * FROM geopos_emptype WHERE id = ?';

    // Execute the query with the id as a parameter using the connection
    const result = await executeQuery(connection, query, [id]);

    // Send the response to the client
    res.send(result);



  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});

//============================================ Employee Role End =====================================================

//============================================ Item Start =====================================================


/**
 * @swagger
 * /item/item-color-code/add/{itemId}:
 *   post:
 *     summary: Add color code for an item.
 *     description: Add a new color code for a specific item identified by itemId.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: The ID of the item for which the color code is being added.
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Color code details to be added.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: The product code.
 *               desc:
 *                 type: string
 *                 description: The description of the product code.
 *             required:
 *               - code
 *               - desc
 *     responses:
 *       '200':
 *         description: Successful response with a status and message.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "Color Code Inserted successfully"
 *       '409':
 *         description: Duplicate record error.
 *         content:
 *           application/json:
 *             example:
 *               status: "Error"
 *               message: "Duplicate product_code"
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name addItemColorCode
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post('/item/item-color-code/add/:itemId', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const { code, desc } = req.body;
    console.log("code:", code);
    console.log("desc:", desc);
    const itemId = req.params.itemId;
    console.log("currentDate:", currentDate);

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Check for duplicate product_code before insertion
    const duplicateCheckQuery = 'SELECT * FROM item_code WHERE product_code = ? AND product_id = ?';

    // Execute the query with the code and itemId as parameters using the connection
    const checkResult = await executeQuery(connection, duplicateCheckQuery, [code, itemId]);

    if (checkResult.length > 0) {
      // Duplicate product_code found, return an error response
      res.status(409).json({ status: 'Error', message: 'Duplicate product_code' });
    } else {
      // No duplicate found, proceed with insertion
      const insertQuery = 'INSERT INTO item_code (product_code, product_des, date, product_id) VALUES (?, ?, ?, ?)';

      // Execute the query with code, desc, currentDate, and itemId as parameters using the connection
      await executeQuery(connection, insertQuery, [code, desc, currentDate, itemId]);

      res.status(200).json({ status: 'Success', message: 'Color Code Inserted successfully' });
    }
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});

/**
 * @swagger
 * /item/item-color-code/{itemId}:
 *   get:
 *     summary: Get color codes for a specific item.
 *     description: Fetches color codes for a given item ID from the item_code table.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []  # Security definition, modify as per your authentication mechanism
 *     parameters:
 *       - name: itemId
 *         in: path
 *         required: true
 *         description: The ID of the item for which color codes are requested.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A JSON array of color codes.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 product_code: "ABC123"
 *                 product_des: "Red Color"
 *                 date: "2024-02-20"
 *                 product_id: 123
 *               - id: 2
 *                 product_code: "XYZ456"
 *                 product_des: "Blue Color"
 *                 date: "2024-02-20"
 *                 product_id: 123
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during color codes retrieval"
 *
 * @function
 * @name getColorCodesForItem
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get("/item/item-color-code/:itemId", authenticateJWT, async (req, res) => {
  let connection;
  try {
    const itemId = req.params.itemId;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Construct the SQL query with a placeholder
    const query = 'SELECT * FROM item_code WHERE product_id = ?';

    // Execute the query with the itemId as a parameter using the connection
    const result = await executeQuery(connection, query, [itemId]);

    // Send the response to the client
    res.send(result);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});


/**
 * @swagger
 * /item/item-section-target/{itemId}:
 *   get:
 *     summary: Get sections target data for a specific item.
 *     description: Fetches sections target data for a given item ID from the item_section_moz table.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: itemId
 *         in: path
 *         required: true
 *         description: The ID of the item for which sections data is requested.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A JSON array of sections data.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 section_name: "Section 1"
 *                 item_description: "Item Description 1"
 *                 target_unit: "Unit 1"
 *                 target: 10
 *                 n_target: 5
 *               - id: 2
 *                 section_name: "Section 2"
 *                 item_description: "Item Description 2"
 *                 target_unit: "Unit 2"
 *                 target: 15
 *                 n_target: 7
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during sections retrieval"
 *
 * @function
 * @name getSectionsForItem
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/item/item-section-target/:itemId', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const itemId = req.params.itemId;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Fetch sections data from the item_section_moz table
    const query = `
      SELECT s.section_name, s.target_unit, ism.target, ism.n_target, ism.id, im.item_description
      FROM item_section_moz ism
      LEFT JOIN section s ON ism.section_id = s.id
      LEFT JOIN item_masterr im ON ism.item_id = im.id
      WHERE ism.item_id = ?
    `;

    // Execute the query with the connection
    const results = await executeQuery(connection, query, [itemId]);

    const sections = results.map((row) => ({
      id: row.id,
      section_name: row.section_name,
      item_description: row.item_description,
      target_unit: row.target_unit,
      target: row.target,
      n_target: row.n_target,
    }));

    res.json(sections);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});

/**
 * @swagger
 * /item/section-target/{id}:
 *   get:
 *     summary: Get target details for a specific item section.
 *     description: Fetches target details including section name, target unit, target, and item ID for a given item section ID.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []  # Security definition, modify as per your authentication mechanism
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the item section for which details are requested.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Target details retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               sectionName: "Section 1"
 *               targetUnit: "Unit 1"
 *               target: 10
 *               n_target: 5
 *               item_id: 1
 *       '404':
 *         description: Section and target not found.
 *         content:
 *           application/json:
 *             example:
 *               error: "Section and target not found"
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during target details retrieval"
 *
 * @function
 * @name getTargetDetailsForItemSection
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/item/section-target/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const id = req.params.id;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Fetch section name, target unit, and target from the Section and item_section_moz tables
    const query = `
      SELECT s.section_name, s.target_unit, ism.target, ism.n_target, ism.item_id
      FROM item_section_moz ism
      INNER JOIN section s ON ism.section_id = s.id
      WHERE ism.id = ?
      LIMIT 1
    `;

    // Execute the query with the id as a parameter using the connection
    const results = await executeQuery(connection, query, [id]);

    if (results.length === 0) {
      // Handle the case where no section and target is found for the itemId
      res.status(404).json({ error: 'Section and target not found' });
      return;
    }

    const sectionName = results[0].section_name;
    const targetUnit = results[0].target_unit;
    const target = results[0].target;
    const n_target = results[0].n_target;
    const item_id = results[0].item_id;

    res.json({ sectionName, targetUnit, target, n_target, item_id });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});

/**
 * @swagger
 * /item/color-code/update/{id}:
 *   put:
 *     summary: Update color code information.
 *     description: Updates the information of a color code identified by its ID.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the color code to be updated.
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Color code details to be updated.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_code:
 *                 type: string
 *                 description: The updated product code.
 *               product_des:
 *                 type: string
 *                 description: The updated product description.
 *               product_id:
 *                 type: integer
 *                 description: The itemId.
 *             required:
 *               - product_code
 *               - product_des
 *               - product_id
 *     responses:
 *       '200':
 *         description: Successful response with a status and message.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "Color Code updated successfully"
 *       '409':
 *         description: Duplicate record error.
 *         content:
 *           application/json:
 *             example:
 *               status: "Error"
 *               message: "Duplicate: product_code already exists!"
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name updateItemColorCode
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put('/item/color-code/update/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const id = req.params.id;
    const { product_code, product_des, product_id } = req.body;
    console.log("product_id", product_id);

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Check for duplicate product_code before updating
    const duplicateCheckQuery = 'SELECT * FROM item_code WHERE product_id=? AND product_code = ? AND id <> ?';
    const checkResult = await executeQuery(connection, duplicateCheckQuery, [product_id, product_code, id]);

    if (checkResult.length > 0) {
      // Duplicate product_code found, return an error response
      res.status(409).send('Duplicate: product_code already exists!');
    } else {
      // No duplicate found, proceed with the update
      const updateQuery = 'UPDATE item_code SET product_code = ?, product_des = ? WHERE id = ?';
      const updateValues = [product_code, product_des, id];

      // Execute the update query with the updateValues using the connection
      await executeQuery(connection, updateQuery, updateValues);

      console.log('Color Code updated');
      res.status(200).json({ status: 'Success', message: 'Color Code updated successfully' });
    }
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});



/**
 * @swagger
 * /item/color-code/{id}:
 *   get:
 *     summary: Get color code details for a specific item.
 *     description: Fetches color code details for a given color code ID from the item_code table.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []  # Security definition, modify as per your authentication mechanism
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the color code for which details are requested.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A JSON array of color code details.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 product_code: "ABC123"
 *                 product_des: "Red"
 *                 date: "2024-02-20T12:34:56Z"
 *                 product_id: 123
 *       '404':
 *         description: Color code not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Color code not found"
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during color code retrieval"
 *
 * @function
 * @name getColorCode
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/item/color-code/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const id = req.params.id;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Construct the SQL query with a placeholder
    const query = 'SELECT * FROM item_code WHERE id = ?';

    // Execute the query with the id as a parameter using the connection
    const results = await executeQuery(connection, query, [id]);

    if (results.length === 0) {
      // Handle the case where no item data is found for the given id
      res.status(404).json({ error: 'Item data not found' });
    } else {
      res.json(results);
    }
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});


/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     ItemMaster:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         category_id:
 *           type: integer
 *           example: 2
 *         subcategory_id:
 *           type: integer
 *           example: 3
 *         item_group:
 *           type: string
 *           example: "Example Group"
 *         item_description:
 *           type: string
 *           example: "Example Description"
 *         kg:
 *           type: integer
 *           example: 5
 *         string:
 *           type: integer
 *           example: 3
 *         pcs:
 *           type: integer
 *           example: 10
 *         line:
 *           type: string
 *           example: "Example Line"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2024-03-01T12:00:00Z"
 * 
 * /item:
 *   get:
 *     summary: Get all items.
 *     description: Retrieve item data from the database.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with the item data.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "Item 1"
 *                 category_name: "Category 1"
 *                 subcategory_name: "Subcategory 1"
 *               - id: 2
 *                 name: "Item 2"
 *                 category_name: "Category 2"
 *                 subcategory_name: "Subcategory 2"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getItemData
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get("/item", authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await getPoolConnection();

    // Extract the roleId from the authenticated user
    const roleId = req.user.roleid;

    // Construct the SQL query based on the roleId
    let query = `
      SELECT item_masterr.*, item_category.category_name, item_subcategory.subcategory_name
      FROM item_masterr
      LEFT JOIN item_category ON item_masterr.category_id = item_category.id
      LEFT JOIN item_subcategory ON item_masterr.subcategory_id = item_subcategory.id
    `;
    // If roleId is 3, modify the query accordingly
    if (roleId === 3) {
      query = `
    SELECT item_masterr.*, item_category.category_name, item_subcategory.subcategory_name
    FROM item_masterr
    LEFT JOIN item_category ON item_masterr.category_id = item_category.id
    LEFT JOIN item_subcategory ON item_masterr.subcategory_id = item_subcategory.id
    `;
    }

    // Execute the query with the connection
    const result = await executeQuery(connection, query);

    // Send the response to the client
    res.send(result);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});


/**
 * @swagger
 * /item/total-count:
 *   get:
 *     summary: Get the total count of items.
 *     description: |
 *       This endpoint retrieves the total count of items from the database.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of items.
 *         content:
 *           application/json:
 *             example:
 *               totalItem: 50
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalItemCount
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/item/total-count', authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await getPoolConnection();

    // Execute the query to get the total count of items
    const result = await executeQuery(connection, 'SELECT COUNT(*) as rowCount FROM item_masterr');

    // Extract the total item count from the query result
    const rowCount = result[0].rowCount;

    // Prepare the response object with the total item count
    const response = {
      totalItem: rowCount,
    };

    // Send the response to the client
    res.send(response);

  } catch (error) {
    /**
     * Handle exceptions and send an appropriate response.
     * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
     */
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});

/**
 * @swagger
 * /item/{roleid}/{userid}:
 *   get:
 *     summary: Get item details based on role and user ID.
 *     description: |
 *       This endpoint retrieves item details based on the provided role and user ID. If the role is not 3 (operator),
 *       it returns all available items; otherwise, it returns the items assigned to the operator.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve item details.
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve item details.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with item details.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 item_description: "Item A"
 *               - id: 2
 *                 item_description: "Item B"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getItemDetails
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/item/:roleid/:userid', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.params.roleid;
    const userid = req.params.userid;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Construct the SQL query based on the user role
    let query;
    if (roleid == 3) {
      query = `
        SELECT * FROM item_masterr
        WHERE id IN (
          SELECT product_name FROM operator_assign
          WHERE name_id = ${userid}
          GROUP BY product_name
        )
      `;
    } else {
      query = 'SELECT * FROM item_masterr';
    }

    // Execute the query and handle the result
    const results = await executeQuery(connection, query);

    // Send the results to the client
    res.json(results);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});



/**
 * @swagger
 * /item/add-with-section-target:
 *   post:
 *     summary: Add a new item with sections and targets.
 *     description: Add a new item to the item master with associated sections and targets.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: Item details to be added with sections and targets.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: number
 *                 description: The ID of the category.
 *               item_description:
 *                 type: string
 *                 description: The description of the item.
 *               item_group:
 *                 type: string
 *                 description: The group of the item.
 *               sections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     section_id:
 *                       type: number
 *                       description: The ID of the section.
 *                     target:
 *                       type: number
 *                       description: The target for the section.
 *                     n_target:
 *                       type: number
 *                       description: The normalized target for the section.
 *                 description: An array of sections with their targets.
 *             required:
 *               - category_id
 *               - item_description
 *               - item_group
 *               - sections
 *     responses:
 *       200:
 *         description: Successful response with a status and message.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "Item details added successfully"
 *       409:
 *         description: Duplicate record error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Duplicate: Item data already exist!"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during insertion"
 *
 * @function
 * @name addItemWithSections
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post('/item/add-with-section-target', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const { category_id, item_description, item_group, sections } = req.body;

    //console.log("category_id", category_id);
    //console.log("item_description", item_description);
    //console.log("item_group", item_group);
    //console.log("sections", sections);

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Start a MySQL transaction
    await beginTransaction(connection);

    // Check for duplication based on category_id, item_description, and item_group
    const checkDuplicationSql = `
      SELECT * FROM item_masterr 
      WHERE category_id = ? AND item_description = ? AND item_group = ?
    `;

    const duplicationCheckResult = await executeQuery(connection, checkDuplicationSql, [
      category_id,
      item_description,
      item_group,
    ]);

    if (duplicationCheckResult.length > 0) {
      // If a record with the same details exists, send a duplication response
      await rollbackTransaction(connection);
      res.status(409).json({ success: false, message: 'Duplicate item details' });
      return;
    }

    // Insert item master data
    const insertItemSql = 'INSERT INTO item_masterr (category_id, item_description, item_group) VALUES (?, ?, ?)';
    const itemResult = await executeQuery(connection, insertItemSql, [
      category_id,
      item_description,
      item_group,
    ]);

    const itemId = itemResult.insertId;

    // Insert item sections
    const insertSectionsSql = 'INSERT INTO item_section_moz (item_id, section_id, target, n_target) VALUES ?';

    // Extract the values from the sections array
    const sectionValues = sections.map((itemSection) => [
      itemId,
      itemSection.id,
      itemSection.target,
      itemSection.n_target,
    ]);

    await executeQuery(connection, insertSectionsSql, [sectionValues]);

    // Commit the transaction if everything is successful
    await commitTransaction(connection);

    res.status(200).json({ status: 'Success', message: 'Item details added successfully' });

  } catch (error) {
    console.error('Error:', error.message);

    // Rollback the transaction for any exception occurs
    await rollbackTransaction(connection);

    res.status(500).json({ success: false, message: 'An error occurred during login' });
  }
  finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});






/**
 * @swagger
 * /item/{itemId}:
 *   get:
 *     summary: Get item details by ID.
 *     description: Fetches details of a specific item by its ID.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: The ID of the item to be retrieved.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with item details.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 category_id: 1
 *                 item_description: "Item A"
 *                 item_group: "Group A"
 *       '404':
 *         description: Item not found.
 *         content:
 *           application/json:
 *             example:
 *               error: "Item not found"
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during item retrieval"
 *
 * @function
 * @name getItemById
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/item/:itemId', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const itemId = req.params.itemId;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Example query using MySQL with async/await
    const query = 'SELECT * FROM item_masterr WHERE id = ?';

    // Execute the query with the connection
    const results = await executeQuery(connection, query, [itemId]);

    // Send the response to the client
    res.json(results);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("Connection released");
    }
  }
});

/**
 * @swagger
 * /item/update/{itemId}:
 *   put:
 *     summary: Edit item details.
 *     description: Edits the details of a specific item identified by its ID.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: The ID of the item to be edited.
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Item details to be updated.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: number
 *                 description: The updated category ID.
 *               item_group:
 *                 type: string
 *                 description: The updated item group.
 *               item_description:
 *                 type: string
 *                 description: The updated item description.
 *             required:
 *               - category_id
 *               - item_group
 *               - item_description
 *     responses:
 *       '200':
 *         description: Successful response with a status and message.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "ItemMaster updated successfully"
 *       '409':
 *         description: Duplicate record error.
 *         content:
 *           application/json:
 *             example:
 *               status: "Error"
 *               message: "Duplicate: Item master already exists."
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name editItemDetails
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put('/item/update/:itemId', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const itemId = req.params.itemId;
    const { category_id, item_group, item_description } = req.body;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Check for duplicate item_description before performing the update
    const duplicateCheckQuery = 'SELECT * FROM item_masterr WHERE item_description = ? AND category_id = ? AND item_group = ? AND id <> ?';
    const duplicateCheckValues = [item_description, category_id, item_group, itemId];

    const duplicateCheckResult = await executeQuery(connection, duplicateCheckQuery, duplicateCheckValues);

    if (duplicateCheckResult.length > 0) {
      // Duplicate item_description found
      res.status(409).send('Duplicate: Item master already exists.');
    } else {
      // No duplicate found, proceed with the update
      const updateQuery = 'UPDATE item_masterr SET category_id = ?, item_group = ?, item_description = ? WHERE id = ?';
      const updateValues = [category_id, item_group, item_description, itemId];

      const updateResult = await executeQuery(connection, updateQuery, updateValues);

      console.log('ItemMaster updated successfully');
      res.json({ status: 'Success', message: 'ItemMaster updated successfully' });
    }
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("Connection released");
    }
  }
});


/**
 * @swagger
 * /item/delete/{id}:
 *   delete:
 *     summary: Delete item and related data.
 *     description: Deletes an item and its related data (sections and color codes) identified by its ID.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the item to be deleted.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with a status and message.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "Item and related data deleted successfully."
 *               deleted_id: 123
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during item deletion"
 *
 * @function
 * @name deleteItemAndRelatedData
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.delete("/item/delete/:id", authenticateJWT, async (req, res) => {
  let connection;
  try {
    const id = req.params.id;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Begin the transaction
    await beginTransaction(connection);

    // Delete from item_masterr
    await executeQuery(connection, "DELETE FROM item_masterr WHERE id = ?", [id]);

    // Delete related rows from other tables
    await executeQuery(connection, "DELETE FROM item_section_moz WHERE item_id = ?", [id]);
    await executeQuery(connection, "DELETE FROM item_code WHERE product_id = ?", [id]);

    // Commit the transaction if all deletions are successful
    await commitTransaction(connection);

    console.log('Transaction committed successfully.');
    res.json({ status: 'Success', message: 'Item and related data deleted successfully.', deleted_id: id });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);

    // Rollback the transaction for any exception occurs
    await rollbackTransaction(connection);

    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("Connection released");
    }
  }
});




/**
 * @swagger
 * /item/section-target/update:
 *   put:
 *     summary: Update target values for a specific item section.
 *     description: Updates the target values (target and night target) for a specific item section based on the provided parameters.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []  # Security definition, modify as per your authentication mechanism
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *                 description: The ID of the item section target to be updated.
 *               updatedtarget:
 *                 type: number
 *                 description: The updated target value.
 *               updatednighttarget:
 *                 type: number
 *                 description: The updated night target value.
 *     responses:
 *       '200':
 *         description: Target values updated successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: "Target values updated successfully."
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during target values update"
 *
 * @function
 * @name updateItemTargetValues
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put('/item/section-target/update', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const itemId = req.body.id;
    const updatedTarget = req.body.updatedtarget;
    const updatedn_target = req.body.updatednighttarget;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = 'UPDATE item_section_moz SET target = ?, n_target = ? WHERE id = ?';

    // Execute the query with updatedTarget, updatedn_target, and itemId as parameters using the connection
    await executeQuery(connection, query, [updatedTarget, updatedn_target, itemId]);

    res.json({ message: 'Target value updated successfully.' });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});


/**
 * @swagger
 * /item/section-target/delete/{id}:
 *   delete:
 *     summary: Delete a specific item section target.
 *     description: Deletes a specific item section target based on the provided ID.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []  # Security definition, modify as per your authentication mechanism
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the item section target to be deleted.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Section target deleted successfully.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "Section target deleted successfully."
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during section target deletion"
 *
 * @function
 * @name deleteItemSectionTarget
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.delete("/item/section-target/delete/:id", authenticateJWT, async (req, res) => {
  let connection;
  try {
    const id = req.params.id;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Construct the delete query
    const deleteQuery = 'DELETE FROM item_section_moz WHERE id = ?';

    // Execute the delete query with the id as a parameter using the connection
    await executeQuery(connection, deleteQuery, [id]);

    res.status(200).json({ status: 'Success', message: 'Section target deleted successfully.' });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  }
  finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});




/**
 * @swagger
 * /item/color-code/delete/{id}:
 *   delete:
 *     summary: Delete color code by ID.
 *     description: Deletes a color code entry from the item_code table based on its ID.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []  # Security definition, modify as per your authentication mechanism
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the color code to be deleted.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Color code deleted successfully.
 *         content:
 *           application/json:
 *             example:
 *               status: 'Success'
 *               message: 'Color Code deleted successfully.'
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: 'An error occurred while deleting the color code.'
 *
 * @function
 * @name deleteColorCode
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.delete('/item/color-code/delete/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const itemId = req.params.id;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Construct the delete query
    const deleteQuery = 'DELETE FROM item_code WHERE id = ?';

    // Execute the delete query with the itemId as a parameter using the connection
    await executeQuery(connection, deleteQuery, [itemId]);

    res.json({ status: 'Success', message: 'Color Code deleted successfully.' });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});



//============================================ Item End =====================================================

//============================================ Target Plan Start =====================================================


/**
 * @swagger
 * 
  * components:
 *   schemas:
 *     TargetPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         product_id:
 *           type: integer
 *           example: 2
 *         plan:
 *           type: integer
 *           example: 100
 *         datetime:
 *           type: string
 *           example: "2024-03-01 12:00:00"
 * 
 * /target-plan/add:
 *   post:
 *     summary: Add or update target plans.
 *     description: Adds or updates target plans for multiple products and dates.
 *     tags:
 *       - Target Plan
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: Array of target plan records.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 product_id:
 *                   type: number
 *                   description: The ID of the product.
 *                 plan:
 *                   type: number
 *                   description: The target plan value.
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: The date for the target plan.
 *             example:
 *               - product_id: 1
 *                 plan: 100
 *                 date: "21-02-2024"
 *     responses:
 *       '200':
 *         description: Successful response with a status and message.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "Records inserted/updated successfully"
 *       '400':
 *         description: Invalid request format.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Invalid request format. Expecting an array of records."
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during target plan processing"
 *
 * @function
 * @name addTargetPlan
 * @memberof module:Routes/TargetPlan
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post('/target-plan/add', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const records = req.body;

    //console.log(records);
    if (!Array.isArray(records)) {
      res.status(400).send('Invalid request format. Expecting an array of records.');
      return;
    }

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Start a MySQL transaction
    await beginTransaction(connection);

    const insertOrUpdateRecord = async (record) => {
      const { product_id, plan, date } = record;

      const checkDuplicateQuery = 'SELECT * FROM target_plan WHERE product_id = ? AND datetime = ?';
      const results = await executeQuery(connection, checkDuplicateQuery, [product_id, date]);

      if (results.length > 0) {
        const updateQuery = 'UPDATE target_plan SET plan = ? WHERE product_id = ? AND datetime = ?';
        await executeQuery(connection, updateQuery, [plan, product_id, date]);
      } else {
        const insertQuery = 'INSERT INTO target_plan (product_id, plan, datetime) VALUES (?, ?, ?)';
        await executeQuery(connection, insertQuery, [product_id, plan, date]);
      }

    };

    // Use Promise.all to process each record concurrently
    await Promise.all(records.map(insertOrUpdateRecord));

    // Commit the transaction if all records are processed successfully
    await commitTransaction(connection);

    res.json({ status: 'Success', message: 'Records inserted/updated successfully' });

  } catch (error) {
    // Rollback the transaction in case of any error
    await rollbackTransaction(connection);
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});



/**
 * @swagger
 * /target-plan/search-by-date:
 *   get:
 *     summary: Search target plan data by date.
 *     description: Searches target plan data for a specific date, including item details.
 *     tags:
 *       - Target Plan
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         description: The date (dd-mm-yyyy) for which target plan data is requested.
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: Successful response with target plan data and date.
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - product_id: 1
 *                   plan: 100
 *                   datetime: "2024-02-21"
 *                   item_description: "Item A"
 *                   item_group: "Group A"
 *               date: "2024-02-21"
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during target plan retrieval"
 *
 * @function
 * @name searchTargetPlanByDate
 * @memberof module:Routes/TargetPlan
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get("/target-plan/search-by-date", authenticateJWT, async (req, res) => {
  let connection;
  try {
    const date = req.query.date;
    //console.log("date", date);

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Construct the SQL query with a placeholder
    const query = `
      SELECT target_plan.*,item_masterr.item_description,item_masterr.item_group
      FROM target_plan
      LEFT JOIN item_masterr ON target_plan.product_id = item_masterr.id
      WHERE target_plan.datetime = ?
    `;

    // Execute the query with the date as a parameter using the connection
    const result = await executeQuery(connection, query, [date]);

    res.json({ data: result, date: date });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});

/**
 * @swagger
 * /target-plan/delete/{id}:
 *   delete:
 *     summary: Delete target plan data by ID.
 *     description: Deletes target plan data for a specific ID.
 *     tags:
 *       - Target Plan
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the target plan data to delete.
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       '200':
 *         description: Successful response indicating successful deletion.
 *         content:
 *           application/json:
 *             example:
 *               message: "Plan vs target deleted successfully."
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during plan vs target deletion"
 *
 * @function
 * @name deleteTargetPlanById
 * @memberof module:Routes/TargetPlan
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.delete("/target-plan/delete/:id", authenticateJWT, async (req, res) => {
  let connection;
  try {
    const id = req.params.id;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Construct the delete query
    const deleteQuery = 'DELETE FROM target_plan WHERE id = ?';

    // Execute the delete query with the id as a parameter using the connection
    await executeQuery(connection, deleteQuery, [id]);

    res.json({ message: 'plan vs target deleted successfully.' });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});

/**
 * @swagger
 * /target-plan/current-month:
 *   get:
 *     summary: Retrieve target plan data for the current month.
 *     description: Retrieve target plan data for the current month, including item details and daily plans.
 *     tags:
 *       - Target Plan
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response with target plan data for the current month.
 *         content:
 *           application/json:
 *             example:
 *               - item_group: "Group1"
 *                 item_description: "Item1"
 *                 day0: 10
 *                 day1: 15
 *                 day2: 20
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred while fetching target plan data."
 */
app.get("/target-plan/current-month", authenticateJWT, async (req, res) => {
  let connection;
  try {
    const thisMonthDatesArray = dateUtils.getThisMonthAllDates("DD-MM-YYYY");
    //console.log(thisMonthDatesArray);

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Construct the main query to fetch target_plan data with item details
    const mainQuery = `
      SELECT target_plan.*, item_masterr.item_description, item_masterr.item_group
      FROM target_plan
      LEFT JOIN item_masterr ON target_plan.product_id = item_masterr.id
    `;

    // Execute the main query using the connection
    const result = await executeQuery(connection, mainQuery);

    //console.log("result.length", result.length);

    let processedResult = [];

    for (const rowData of result) {
      const processedRow = { item_group: rowData.item_group, item_description: rowData.item_description };

      for (let index2 = 0; index2 < thisMonthDatesArray.length; index2++) {
        const date = thisMonthDatesArray[index2];
        const date_wise_query = `SELECT plan FROM target_plan WHERE product_id = ? AND datetime = ?`;
        //console.log(date_wise_query);

        // Execute the date-specific query using the connection
        const result2 = await executeQuery(connection, date_wise_query, [rowData.product_id, date]);

        const plan = result2.length > 0 ? result2[0].plan : "-";
        const dayKey = "day" + index2;
        processedRow[dayKey] = plan;
      }

      processedResult.push(processedRow);
    }

    // Send the response with the processed result
    res.json(processedResult);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});




/**
 * @swagger
 * /target-plan/import:
 *   post:
 *     summary: Import target plan data from a CSV file.
 *     description: Upload a CSV file containing target plan data and import it into the database.
 *     tags:
 *       - Target Plan
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userfile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Successful response with import status.
 *         content:
 *           application/json:
 *             example:
 *               status: Success
 *               message: Data Imported Successfully!
 *       '400':
 *         description: Bad request, no file uploaded.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: No file uploaded
 *       '500':
 *         description: Internal server error during import.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: Database Import Error! Please check your file and its content.
 */
app.post('/target-plan/import', authenticateJWT, upload.single('userfile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const filePath = file.path;

    console.log("filePath", filePath);

    const targets = [];

    fs.createReadStream(filePath)
      .pipe(csv({ separator: ',' }))
      .on('data', (record) => {
        const productcode = record.productcode;
        const productdescription = record.productdescription;
        const plan = record.plan;
        const excelDate = record.date;

        if (productcode && productdescription && plan && excelDate) {
          const dateParts = excelDate.split('/');
          if (dateParts.length === 3) {
            const year = dateParts[2];
            const month = dateParts[0].padStart(2, '0');
            const day = dateParts[1].padStart(2, '0');
            const datetime = `${day}-${month}-${year}`;
            targets.push({ productcode, productdescription, plan, datetime });
          } else {
            // Assume date is already in dd-mm-yyyy
            targets.push({ productcode, productdescription, plan, datetime: excelDate });
          }
        }
      })
      .on('end', () => {
        fs.unlinkSync(filePath); // Delete file after processing

        const data = [];
        let processedCount = 0;

        if (targets.length === 0) {
          return res.json({ status: 'Success', message: 'No valid rows to import' });
        }

        targets.forEach((target) => {
          const { productcode, plan, datetime } = target;
          const productQuery = `SELECT id FROM item_masterr WHERE item_group = '${productcode}'`;

          db.query(productQuery, (err, results) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ status: 'Error', message: 'Database Query Error' });
            }

            if (results.length > 0) {
              const product_id = results[0].id;

              const duplicateCheckQuery = `SELECT id FROM target_plan WHERE product_id = ${product_id} AND datetime = '${datetime}'`;

              db.query(duplicateCheckQuery, (err2, results2) => {
                if (err2) {
                  console.error(err2);
                  return res.status(500).json({ status: 'Error', message: 'Database Query Error' });
                }

                if (results2.length === 0) {
                  data.push({ product_id, plan, datetime });
                }

                processedCount++;

                if (processedCount === targets.length) {
                  if (data.length > 0) {
                    const insertQuery = `INSERT INTO target_plan (product_id, plan, datetime) VALUES ?`;
                    db.query(insertQuery, [data.map(item => [item.product_id, item.plan, item.datetime])], (insertErr) => {
                      if (insertErr) {
                        console.error(insertErr);
                        return res.status(500).json({ status: 'Error', message: 'Insert Failed' });
                      }
                      return res.json({ status: 'Success', message: 'Data Imported Successfully!' });
                    });
                  } else {
                    return res.json({ status: 'Success', message: 'No new records to insert' });
                  }
                }
              });
            } 
          });
        });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'Error', message: 'Import Failed! Check the uploaded file.' });
  }
});




/**
 * @swagger
 * /target-plan/export:
 *   get:
 *     summary: Export target plan data to a CSV file.
 *     description: |
 *       This endpoint exports target plan data from the database to a CSV file and provides it for download. The exported file will contain information about product descriptions, plans, and dates.
 *     tags:
 *       - Target Plan
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the exported CSV file for download.
 *         content:
 *           application/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       '404':
 *         description: Not found response indicating no data to export.
 *         content:
 *           application/json:
 *             example:
 *               message: "No data to export"
 *       '500':
 *         description: Internal server error during the export process.
 *         content:
 *           application/json:
 *             example:
 *               message: "Error exporting data"
 *
 * @function
 * @name exportTargetPlan
 * @memberof module:Routes/TargetPlan
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the export process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/target-plan/export', async (req, res) => {
  try {
    // Fetch data from your database table
    const data = await fetchItemFromDatabase(); // Implement this function
    //console.log(data);
    // if (!data || data.length === 0) {
    //   // return res.status(404).json({ message: 'No data to export' });
    //    res.status(404).send('No data to export');
    // }
    const fileName = "plan_target.csv";
    const filePath = path.join(__dirname, 'downloads', fileName);

    console.log(filePath);
    // Create a CSV writer
    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
         { id: 'product_code', title: 'productcode' },
        { id: 'product_des', title: 'productdescription' }, // Replace with your column names
        { id: 'loc', title: 'plan' }, // Replace with your column names
        { id: 'date', title: 'date' }, // Replace with your column names
        // Add more columns as needed
      ],
    });
    // Write data to CSV file
    csvWriter.writeRecords(data)
      .then(() => {
        // Stream the file for download
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        // Check if the file exists
        if (fs.existsSync(filePath)) {
          res.download(filePath, 'plan_target.csv'); // Send the file as an attachment
          //res.sendFile(filePath);
          // After streaming is complete, end the response and delete the file
          res.on('finish', () => {
            fileStream.close(() => {
              fs.unlink(filePath, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                } else {
                  console.log('File deleted:', filePath);
                }
              });
            });
          });
        } else {
          res.status(404).send('File not found');
        }
      })
      .catch(err => {
        console.error('Error writing CSV file:', err);
        res.status(500).json({ message: 'Error exporting data' });
      });
  } catch (err) {
    console.error('Error exporting data:', err);
    res.status(500).json({ message: 'Error exporting data' });
  }
});
// Define the fetchDataFromDatabase function
function fetchItemFromDatabase() {
  return new Promise((resolve, reject) => {
    const query = "SELECT product_des,loc,DATE_FORMAT(CURRENT_DATE(), '%m-%d-%Y') as date FROM item_code"; // Replace with your table and column names
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching data from the database:', error);
        reject(error);
      } else {
        console.log("fetched results::", results);
        resolve(results);
      }
    });
  });
}

//============================================ Target Plan End =====================================================

//============================================ Operator Start =====================================================

/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     Employees:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: "john_doe"
 *         entryid:
 *           type: string
 *           example: "EMP001"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         passive_type:
 *           type: string
 *           example: "ACT"
 *         address:
 *           type: string
 *           example: "123 Main St"
 *         city:
 *           type: string
 *           example: "Cityville"
 *         region:
 *           type: string
 *           example: "Regionville"
 *         country:
 *           type: string
 *           example: "Countryland"
 *         postbox:
 *           type: string
 *           example: "PO Box 456"
 *         phone:
 *           type: string
 *           example: "123-456-7890"
 *         phonealt:
 *           type: string
 *           example: "987-654-3210"
 *         picture:
 *           type: string
 *           example: "example.png"
 *         sign:
 *           type: string
 *           example: "sign.png"
 *         joindate:
 *           type: string
 *           example: "2024-03-01"
 *         type:
 *           type: integer
 *           example: 1
 *         dept:
 *           type: string
 *           example: "HR"
 *         degis:
 *           type: integer
 *           example: 2
 *         salary:
 *           type: number
 *           format: double
 *           example: 50000.00
 *         clock:
 *           type: integer
 *           example: 1
 *         clockin:
 *           type: integer
 *           example: 1
 *         clockout:
 *           type: integer
 *           example: 2
 *         c_rate:
 *           type: number
 *           format: double
 *           example: 20.50
 *         email:
 *           type: string
 *           example: "john.doe@example.com"
 *         roleid:
 *           type: integer
 *           example: 1
 *         worker_role:
 *           type: string
 *           example: "Supervisor"
 *         workertype:
 *           type: string
 *           example: "Full-time"
 *         shift:
 *           type: string
 *           example: "Morning Shift"
 *         product:
 *           type: string
 *           example: "Product A, Product B"
 *         line:
 *           type: string
 *           example: "Assembly Line 1"
 *         section_id:
 *           type: string
 *           example: "SEC001"
 *         emp_count:
 *           type: string
 *           example: "100"
 *         status:
 *           type: string
 *           example: "P"
 *         date:
 *           type: string
 *           example: "2024-03-01"
 *         yes_status:
 *           type: string
 *           example: "Approved"
 *         yes_date:
 *           type: string
 *           example: "2024-03-02"
 *         site:
 *           type: string
 *           example: "Site A"
 *         update_date:
 *           type: string
 *           example: "2024-03-03"
 *         yes_status_new:
 *           type: string
 *           example: "Approved"
 *         yes_date_new:
 *           type: string
 *           example: "2024-03-04"
 * 
 * /operator/assignment:
 *   get:
 *     summary: Get operator assignments.
 *     description: Retrieve information about operator assignments.
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response with operator assignments.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name_id: 123
 *                 product_name: 'Product 1'
 *                 section: 'Section A'
 *                 site: 'Site 1'
 *                 shift: 'Morning'
 *                 date: '2024-02-21'
 *                 entryid: 'operator123'
 *                 roleid: 2
 *                 name: 'Operator Name'
 *                 item_description: 'Description of Product 1'
 *                 section_name: 'Section A'
 *               - id: 2
 *                 name_id: 456
 *                 product_name: 'Product 2'
 *                 section: 'Section B'
 *                 site: 'Site 2'
 *                 shift: 'Evening'
 *                 date: '2024-02-21'
 *                 entryid: 'operator456'
 *                 roleid: 3
 *                 name: 'Another Operator'
 *                 item_description: 'Description of Product 2'
 *                 section_name: 'Section B'
 *       '500':
 *         description: Internal server error during retrieval operation.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: 'An error occurred during login'
 *
 * @function
 * @async
 * @name getOperatorAssignments
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database operation.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get("/operator/assignment", authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await getPoolConnection();

    // Construct the SQL query with LEFT JOINs
    const query = `
      SELECT operator_assign.*, geopos_users.entryid, geopos_users.roleid, geopos_users.name, 
             item_masterr.item_description, section.section_name 
      FROM operator_assign
      LEFT JOIN item_masterr ON operator_assign.product_name = item_masterr.id
      LEFT JOIN section ON operator_assign.section = section.id
      LEFT JOIN geopos_users ON operator_assign.name_id = geopos_users.id
    `;

    // Execute the query with the connection
    const result = await executeQuery(connection, query);

    // Send the result to client
    res.send(result);

  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("Connection released");
    }
  }
});


/**
 * @swagger
 * /operator/operators/{ids}:
 *   get:
 *     summary: Get operators by entry IDs.
 *     description: |
 *       This endpoint retrieves operator details based on the specified entry IDs.
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: ids
 *         required: true
 *         description: Comma-separated entry IDs to filter operators by.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with operator details.
 *         content:
 *           application/json:
 *             example:
 *               - entryid: 1
 *                 name: OperatorA
 *               - entryid: 2
 *                 name: OperatorB
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during data retrieval"
 *
 * @function
 * @name getOperatorsByIds
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/operator/operators/:ids', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const entryIds = req.params.ids;
    //console.log(entryIds);
    //const entryIdsArray = Array.isArray(entryIds) ? entryIds : [entryIds];

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Use the IN operator in the SQL query to check for multiple entryid values
    const query = `SELECT entryid, name FROM employees_moz WHERE id IN (${entryIds})`;
    //console.log("query", query);

    // Execute the query with the connection and entryIds as parameters
    const results = await executeQuery(connection, query, entryIds);

    // Send the response to the client
    res.json(results);

  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("Connection released");
    }
  }
});

/**
 * @swagger
 * /operator/assignment/{id}:
 *   get:
 *     summary: Get assignments for an operator.
 *     description: Retrieve assignments for an operator based on their ID from the `operator_assign` table.
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the operator for whom assignments are to be retrieved.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with assignment details.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name_id: 123
 *                 product_name: "Product 1"
 *                 section: "Section A"
 *                 site: "Site 1"
 *                 shift: "Morning"
 *                 date: "2024-02-21"
 *                 section_name: "Section A"
 *                 item_description: "Product 1 Description"
 *               - id: 2
 *                 name_id: 123
 *                 product_name: "Product 2"
 *                 section: "Section B"
 *                 site: "Site 2"
 *                 shift: "Evening"
 *                 date: "2024-02-21"
 *                 section_name: "Section B"
 *                 item_description: "Product 2 Description"
 *       '404':
 *         description: Operator assignments not found.
 *         content:
 *           application/json:
 *             example:
 *               message: "No assignments found for the operator with ID 123"
 *       '500':
 *         description: Internal server error during assignment retrieval.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during assignment retrieval"
 *
 * @function
 * @name getOperatorAssignments
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/operator/assignment/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const operatorId = req.params.id;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Construct the SQL query with LEFT JOINs and placeholders
    const query = `
      SELECT operator_assign.*, section.section_name, item_masterr.item_description
      FROM operator_assign
      LEFT JOIN section ON operator_assign.section = section.id
      LEFT JOIN item_masterr ON operator_assign.product_name = item_masterr.id
      WHERE operator_assign.name_id = ?
    `;

    // Execute the query with the connection and operatorId as parameters
    const result = await executeQuery(connection, query, [operatorId]);

    // Send the response to the client
    res.json(result);

  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("Connection released");
    }
  }
});


/**
 * @swagger
 * /operator:
 *   get:
 *     summary: Get operator details.
 *     description: |
 *       This endpoint retrieves details of operators (users with role ID 3).
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response with operator details.
 *         content:
 *           application/json:
 *             example:
 *               - entryid: 1
 *                 name: "Operator A"
 *                 role: "Operator"
 *               - entryid: 2
 *                 name: "Operator B"
 *                 role: "Operator"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getOperatorDetails
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/operator', authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await getPoolConnection();

    // Construct the SQL query with LEFT JOINs and placeholders
    const query = `
      SELECT employees_moz.*, geopos_emptype.name AS role
      FROM employees_moz
      LEFT JOIN geopos_emptype ON employees_moz.roleid = geopos_emptype.id
      WHERE employees_moz.roleid = ?
    `;
    // Execute the query with the connection and specified roleid as parameters
    const results = await executeQuery(connection, query, ['3']);

    // Send the response to the client
    res.json(results);

  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("Connection released");
    }
  }
});

/**
 * @swagger
 * /operator/total-count:
 *   get:
 *     summary: Get the total count of operators.
 *     description: Retrieves the total count of operators from the database.
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with the total count of operators.
 *         content:
 *           application/json:
 *             example:
 *               totalOperators: 42
 *       401:
 *         description: Unauthorized error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized error
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 *
 * @function
 * @async
 * @name getTotalOperators
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {UnauthorizedError} Will throw an error if the request is unauthorized.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/operator/total-count', authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await getPoolConnection();

    // Construct the SQL query with a placeholder for the roleid
    const query = 'SELECT COUNT(*) as rowCount FROM geopos_users WHERE roleid=?';

    // Execute the query with the connection and roleid as parameters
    const result = await executeQuery(connection, query, [3]);

    // Extract the total count of operators from the query result
    const rowCount = result[0].rowCount;

    const response = {
      totalOperators: rowCount,
    };

    // Send the response to the client.
    res.send(response);

  } catch (error) {
    /**
     * Handle exceptions and send an appropriate response.
     * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
     */
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("Connection released");
    }
  }
});


/**
 * @swagger
 * /operator/{roleId}/{userId}:
 *   get:
 *     summary: Get operator details based on role and user ID.
 *     description: Retrieves operator details based on the provided role and user ID.
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID representing the role.
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID representing the user.
 *     responses:
 *       '200':
 *         description: Successful response with operator details.
 *         content:
 *           application/json:
 *             example:
 *               operatorDetails: [{}]
 *       '401':
 *         description: Unauthorized error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized error
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 *
 * @function
 * @async
 * @name getOperatorDetails
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {UnauthorizedError} Will throw an error if the request is unauthorized.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/operator/:roleId/:userId', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.params.roleId;
    const userid = req.params.userId;
    //console.log("roleid:", roleid);
    //console.log("userid:", userid);

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Common part of the SQL query
    const commonQuery = `
      SELECT employees_moz.*, geopos_users.banned, geopos_users.roleid, geopos_users.email, geopos_users.loc, geopos_emptype.name as emptype
      FROM employees_moz
      LEFT JOIN geopos_users ON employees_moz.entryid = geopos_users.entryid
      LEFT JOIN geopos_emptype ON geopos_users.roleid = geopos_emptype.id
      WHERE geopos_users.roleid = ?`;

    // Role-specific condition
    const roleCondition = roleid === '5' ? '' : ' AND geopos_users.id = ?';

    // Complete the SQL query
    const query = `${commonQuery}${roleCondition} ORDER BY geopos_users.id DESC`;

    // Execute the query with the connection and parameters
    const result = await executeQuery(connection, query, roleid === '5' ? ['3'] : ['3', userid]);

    // Send the response to the client
    res.send(result);

  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("Connection released");
    }
  }
});

/**
 * @swagger
 * /operator/add:
 *   post:
 *     summary: Add a new operator.
 *     description: Add a new operator with the provided details.
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               entryid:
 *                 type: string
 *               password:
 *                 type: string
 *               workertype:
 *                 type: string
 *               shift:
 *                 type: string
 *               site:
 *                 type: string
 *             required:
 *               - name
 *               - username
 *               - email
 *               - entryid
 *               - workertype
 *               - shift
 *               - site
 *     responses:
 *       '200':
 *         description: Successful response with the status of the operation.
 *         content:
 *           application/json:
 *             example:
 *               message: Record inserted successfully
 *               status: true
 *       '400':
 *         description: Bad request or entry ID already exists.
 *         content:
 *           application/json:
 *             example:
 *               message: Entry ID or email/username already exists
 *               status: false
 *       '500':
 *         description: Internal server error during the operation.
 *         content:
 *           application/json:
 *             example:
 *               message: Unable to create user
 *               status: false
 *
 * @function
 * @async
 * @name addOperator
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {BadRequestError} Will throw an error if the request is malformed or entry ID already exists.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database queries.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post('/operator/add', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const entryid = req.body.entryid;
    const pass = req.body.password !== "" ? req.body.password : '123456';
    const worktyp = req.body.workertype;
    const shift = req.body.shift;
    const site = req.body.site;

    const roleid = '3';

    // console.log("name", name);
    // console.log("username", username);
    // console.log("email", email);
    // console.log("entryid", entryid);
    // console.log("pass", pass);
    // console.log("worktyp", worktyp);
    // console.log("shift", shift);
    // console.log("site", site);
    // return;

    // const tags = machine.split(',');
    // const numTags = tags.length - 1;
    // const empCount = (1 / numTags).toFixed(4);

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Start a MySQL transaction
    await beginTransaction(connection);

    const rowcheck = `SELECT * FROM geopos_users WHERE entryid="${entryid}"`;
    const rowcheck1 = `SELECT * FROM employees_moz WHERE entryid="${entryid}"`;
    const rowcheck2 = `SELECT * FROM geopos_users WHERE email="${email}" OR username="${username}"`;

    const result = await executeQuery(connection, rowcheck);

    if (result.length > 0) {
      const id = result[0].id
      console.log("exist id:", id);
      res.status(200).json({ message: 'Entry Id already Exists', status: false })
      return;
    }
    else {
      const resultt = await executeQuery(connection, rowcheck2);
      if (resultt.length > 0) {
        res.status(200).json({ message: 'Email or username already Exists', status: false })
        return;
      } else {
        const userInsertResult = await executeQuery(
          connection,
          'INSERT INTO geopos_users (email,username,name,roleid,entryid,date_created) VALUES (?,?,?,?,?,?)',
          [email, username, name, roleid, entryid, currentDateTime]
        );
        if (userInsertResult) {
          const userId = userInsertResult.insertId;
          console.log("userId", userId);
          const resultt1 = await executeQuery(connection, rowcheck1);
          if (resultt1.length > 0) {
            // Rollback the transaction for any exception occurs
            await rollbackTransaction(connection);
            res.status(200).json({ message: 'Entryid already Exists', status: false });
            return;
          } else {
            const employeeInsertResult = await executeQuery(
              connection,
              'INSERT INTO employees_moz (username,entryid,email,name,roleid,workertype,shift,site,date) VALUES (?,?,?,?,?,?,?,?,?)',
              [username, entryid, email, name, roleid, worktyp, shift, site, currentDate]
            );
            if (employeeInsertResult) {
              const userIdAsString = userId.toString();
              const hashedPassword = authUtils.hashPassword(pass, userIdAsString);

              const result2222 = await executeQuery(
                connection,
                'UPDATE geopos_users SET pass=? WHERE entryid=?',
                [hashedPassword, entryid]
              );

              if (result2222) {
                // Commit the transaction if everything is successful
                await commitTransaction(connection);

                res.status(200).json({ message: 'Record inserted successfully', status: true });
              } else {
                // Rollback the transaction for any exception occurs
                await rollbackTransaction(connection);
                res.status(200).json({ message: 'Unable to create user 3', status: false });
              }
            } else {
              // Rollback the transaction for any exception occurs
              await rollbackTransaction(connection);
              res.status(200).json({ message: 'Unable to create user 2', status: false });
            }
          }
        } else {
          // Rollback the transaction for any exception occurs
          await rollbackTransaction(connection);
          res.status(200).json({ message: 'Unable to create user 3', status: false });
        }
      }
    }
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    // Rollback the transaction for any exception occurs
    await rollbackTransaction(connection);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log("Connection released");
    }
  }
});



/**
 * @swagger
 * /operator/{id}:
 *   get:
 *     summary: Get operator details by ID.
 *     description: Retrieves operator details based on the provided ID.
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID representing the operator.
 *     responses:
 *       '200':
 *         description: Successful response with operator details.
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               username: john_doe
 *               entryid: 123456
 *               email: john@example.com
 *               name: John Doe
 *               roleid: 3
 *               workertype: Full-time
 *               shift: Morning
 *               site: Site A
 *               date: 2024-02-21T12:34:56.789Z
 *       '404':
 *         description: Record not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Record not found
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 *
 * @function
 * @async
 * @name getOperatorById
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {NotFoundError} Will throw an error if the record is not found.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/operator/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const id = req.params.id;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `
  SELECT employees_moz.*,geopos_users.email
  FROM employees_moz
  LEFT JOIN geopos_users ON employees_moz.entryid = geopos_users.entryid
  WHERE employees_moz.id = ?
`;
    // Execute the query using the connection
    const result = await executeQuery(connection, query, [id]);

    // Check the result and respond accordingly
    if (result.length === 0) {
      res.status(404).send('Record not found');
    } else {
      res.send(result[0]); // Since we use "LIMIT 1" in the query, we send the first row directly.
    }
  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log("Connection released");
    }
  }
});



/**
 * @swagger
 * /operator/update:
 *   put:
 *     summary: Update operator details.
 *     description: Update operator details in both the employees_moz and geopos_users tables.
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               entryid:
 *                 type: string
 *               workertype:
 *                 type: string
 *               shift:
 *                 type: string
 *               site:
 *                 type: string
 *               id:
 *                 type: integer
 *             required:
 *               - name
 *               - entryid
 *               - workertype
 *               - shift
 *               - site
 *               - id
 *     responses:
 *       '200':
 *         description: Successful response with update status.
 *         content:
 *           application/json:
 *             example:
 *               status: Success
 *               message: Records Updated successfully
 *       '404':
 *         description: Record not found or not updated.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: Record not Updated
 *       '500':
 *         description: Internal server error during update.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: Database Update Error
 *
 * @function
 * @async
 * @name updateOperator
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {NotFoundError} Will throw an error if the record is not found.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database update.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put('/operator/update', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const name = req.body.name;
    const entryid = req.body.entryid;
    const worktyp = req.body.workertype;
    const shift = req.body.shift;
    const site = req.body.site;
    const id = req.body.id;

    // console.log("name", name);
    // console.log("entryid", entryid);
    // console.log("worktyp", worktyp);
    // console.log("shift", shift);
    // console.log("site", site);
    // console.log("id", id);
    // return;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Start a MySQL transaction
    await beginTransaction(connection);

    // Update the record in the employees_moz table
    const updateEmployeesQuery = 'UPDATE employees_moz SET entryid=?, name=?, workertype=?, shift=?, site=? WHERE id = ?';
    const result1 = await executeQuery(connection, updateEmployeesQuery, [entryid, name, worktyp, shift, site, id]);

    // If the update in employees_moz is successful, update geopos_users
    if (result1.affectedRows > 0) {
      // Update the corresponding record in the geopos_users table based on username
      const updateUsersQuery = 'UPDATE geopos_users SET name=? WHERE entryid = ?';
      const result2 = await executeQuery(connection, updateUsersQuery, [name, entryid]);

      // Commit the transaction if the update in geopos_users is successful
      await commitTransaction(connection);

      if (result2.affectedRows === 0) {
        // No records were updated in geopos_users
        res.status(404).json({ status: 'Error', message: 'Record not Updated' });
      } else {
        // Records updated successfully in both tables
        res.status(200).json({ status: 'Success', message: 'Records Updated successfully' });
      }
    } else {
      // Rollback the transaction for any exception occurs
      await rollbackTransaction(connection);
      // No records were updated in employees_moz
      res.status(404).json({ status: 'Error', message: 'Record not Updated' });
    }
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    // Rollback the transaction for any exception occurs
    await rollbackTransaction(connection);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});

/**
 * @swagger
 * /operator/disable/{entryid}:
 *   put:
 *     summary: Disable operator by EntryId.
 *     description: Disable an operator by updating the geopos_users table and deleting corresponding records in the operator_assign table.
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: entryid
 *         required: true
 *         description: EntryId of the operator to be disabled.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with disable status.
 *         content:
 *           application/json:
 *             example:
 *               status: Success
 *               message: Record Updated successfully
 *       '500':
 *         description: Internal server error during disable operation.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: Database Update Error
 *
 * @function
 * @async
 * @name disableOperator
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {NotFoundError} Will throw an error if the operator record is not found.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database update.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put('/operator/disable/:entryid', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const entryid = req.params.entryid; // ID will be a string here

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Start a MySQL transaction
    await beginTransaction(connection);

    // Retrieve the user ID using the provided entryid
    const results = await executeQuery(connection, 'SELECT id FROM geopos_users WHERE entryid = ?', [entryid]);


    if (results.length > 0) {
      const op_id = results[0].id;

      // Update geopos_users to disable the operator
      await executeQuery(connection, 'UPDATE geopos_users SET banned=?, verification_code=? WHERE entryid = ?', [1, '', entryid]);

      // Delete records from operator_assign table
      await executeQuery(connection, 'DELETE FROM operator_assign WHERE name_id= ?', [op_id]);

      // Commit the transaction if everything is successful
      await commitTransaction(connection);

      res.status(200).json({ message: 'Record Updated successfully', status: 'Success' });
    } else {
      // No matching record found
      res.status(404).json({ status: 'Error', message: 'No matching record found' });
    }
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    // Rollback the transaction for any exception occurs
    await rollbackTransaction(connection);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /operator/enable/{entryid}:
 *   put:
 *     summary: Enable operator by EntryId.
 *     description: Enable an operator by updating the `banned` field in the `geopos_users` table.
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: entryid
 *         required: true
 *         description: EntryId of the operator to be enabled.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with enable status.
 *         content:
 *           application/json:
 *             example:
 *               status: Success
 *               message: Record Updated successfully
 *       '404':
 *         description: Operator record not found.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: Record not Updated
 *       '500':
 *         description: Internal server error during enable operation.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: Database Update Error
 *
 * @function
 * @async
 * @name enableOperator
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {NotFoundError} Will throw an error if the operator record is not found.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database update.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put('/operator/enable/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const id = req.params.id; // ID will be a string here
    console.log("id", id);

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Update geopos_users to enable the operator
    const result = await executeQuery(connection, 'UPDATE geopos_users SET banned = ? WHERE entryid = ?', [0, id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Record Updated successfully', status: 'Success' });
    } else {
      // No records were updated in geopos_users
      res.status(404).json({ status: 'Error', message: 'Record not Updated' });
    }
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});



/**
 * @swagger
 * /operator/assign-work:
 *   post:
 *     summary: Assign work to an operator.
 *     description: Assign work to an operator by inserting records into the `operator_assign` table.
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: Data required for work assignment.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: The ID of the operator.
 *               shift:
 *                 type: string
 *                 description: The shift for the assignment.
 *               site:
 *                 type: string
 *                 description: The site for the assignment.
 *               selectedProducts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: integer
 *                       description: The value of the selected product.
 *               selectedSections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: integer
 *                       description: The value of the selected section.
 *     responses:
 *       '201':
 *         description: Successful response with assignment status.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "2 records inserted successfully"
 *       '200':
 *         description: Records already assigned to the same operator or others.
 *         content:
 *           application/json:
 *             example:
 *               message: "Records are already assigned to the same operator or other having names: user1, user2"
 *       '500':
 *         description: Internal server error during assignment operation.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred"
 *
 * @function
 * @async
 * @name assignWorkToOperator
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database operation.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post("/operator/assign-work", authenticateJWT, async (req, res) => {
  let connection;
  try {
    const { id, shift, site, selectedProducts, selectedSections } = req.body;

    // console.log("id", id);
    // console.log("shift", shift);
    // console.log("site", site);
    // console.log("selectedProducts", selectedProducts);
    // console.log("selectedSections", selectedSections);
    // console.log("currentDate", currentDate);
    // return;

    // Define an array to store the records to insert
    const existUserNames = [];

    // Define an array to store the records to insert
    const recordsToInsert = [];

    // Create an array of promises to check for duplicates
    const duplicateChecks = [];

    // Get a connection from the pool
    connection = await getPoolConnection();

    for (const product of selectedProducts) {
      for (const section of selectedSections) {
        // Create a promise for each duplicate check
        const duplicateCheck = new Promise((resolve, reject) => {
          const rowcheck = `SELECT operator_assign.*,geopos_users.name FROM operator_assign LEFT JOIN geopos_users ON operator_assign.name_id = geopos_users.id  WHERE product_name=? and section=? and site=? and shift=?`;
          console.log(rowcheck);

          // Use executeQuery function instead of db.query
          executeQuery(connection, rowcheck, [product.value, section.value, site, shift])
            .then((result) => {
              if (result.length > 0) {
                existUserNames.push(result[0].name);
                //duplicateExist = true;
                // resolve(true); // Duplicate found
              } else {
                recordsToInsert.push([id, product.value, section.value, site, shift, currentDate]);
                //insertExist = true;
                // resolve(false); // No duplicate found
              }
              resolve();
            })
            .catch((err) => {
              reject(err);
            });

          // db.query(rowcheck, function (err, result) {
          //   if (err) {
          //     reject(err);
          //   } else if (result.length > 0) {
          //     existUserNames.push(result[0].name);
          //     //duplicateExist = true;
          //     // resolve(true); // Duplicate found
          //   } else {
          //     recordsToInsert.push([id, product.value, section.value, site, shift, currentDate]);
          //     //insertExist = true;
          //     // resolve(false); // No duplicate found
          //   }
          //   resolve();
          // });
        });

        duplicateChecks.push(duplicateCheck);
      }
    }

    // Wait for all duplicate checks to complete
    await Promise.all(duplicateChecks);

    //duplicates.some(duplicate => duplicate)
    if (recordsToInsert.length > 0 && existUserNames.length == 0) {
      // Insert the generated records into the database
      const insertQuery = 'INSERT INTO operator_assign (name_id, product_name, section, site, shift, date) VALUES ?';
      await executeQuery(connection, insertQuery, [recordsToInsert]);

      res.status(200).json({ success: true, message: `${recordsToInsert.length} records inserted successfully` });
    }
    else if (recordsToInsert.length > 0 && existUserNames.length > 0) {
      // Insert the generated records into the database
      const insertQuery = 'INSERT INTO operator_assign (name_id, product_name, section, site, shift, date) VALUES ?';
      await executeQuery(connection, insertQuery, [recordsToInsert]);

      res.status(200).json({ success: true, message: `${recordsToInsert.length} records inserted successfully and other records are already exist having names ${existUserNames}` });


    } else {
      res.status(200).json({ success: false, message: 'Records are already assigned to the same operator or other having names ' + existUserNames });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});






/**
 * @swagger
 * /operator/assignment/update:
 *   put:
 *     summary: Update assignments for operators.
 *     description: Update assignments for operators in the `operator_assign` table.
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: JSON object containing user and assignment IDs to be updated.
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             user: 12345
 *             ids: [1, 2, 3]
 *     responses:
 *       '200':
 *         description: Successful response after updating assignments.
 *         content:
 *           application/json:
 *             example:
 *               status: Success
 *               message: "Records Updated successfully"
 *       '404':
 *         description: No records found to update.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: "Records not Updated"
 *       '500':
 *         description: Internal server error during assignment update.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: "Error updating records"
 *
 * @function
 * @name updateOperatorAssignments
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put('/operator/assignment/update', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const { user, ids } = req.body;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `UPDATE operator_assign SET name_id= ? WHERE id IN (${ids})`;

    // Use executeQuery function instead of db.query
    const result = await executeQuery(connection, query, [user]);

    if (result.affectedRows === 0) {
      // No records were updated in operator_assign
      res.status(404).json({ message: 'Records not Updated', status: 'Error' });
    } else {
      // Records updated successfully in operator_assign
      res.status(200).json({ message: 'Records Updated successfully', status: 'Success' });
    }
  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});




/**
 * @swagger
 * /operator/assignment/delete/{id}:
 *   delete:
 *     summary: Delete an assignment for an operator by ID.
 *     description: Delete a specific assignment for an operator from the `operator_assign` table.
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the assignment to be deleted.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response after deleting the assignment.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Data deleted successfully"
 *       '500':
 *         description: Internal server error during assignment deletion.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during assignment deletion"
 *
 * @function
 * @name deleteOperatorAssignment
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.delete('/operator/assignment/delete/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const id = req.params.id;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const deleteQuery = 'DELETE FROM operator_assign WHERE id = ?';

    // Use executeQuery function instead of db.query
    const result = await executeQuery(connection, deleteQuery, [id]);

    if (result.affectedRows === 0) {
      // No records were deleted in operator_assign
      res.status(404).json({ message: 'Record not Deleted', status: 'Error' });
    } else {
      // Record deleted successfully in operator_assign
      res.status(200).json({ message: 'Record Deleted successfully', status: 'Success' });
    }
  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /operator/update-shift:
 *   post:
 *     summary: Update shift for multiple employees.
 *     description: Update the shift for multiple employees identified by their entryIds.
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             shift: '9HRS'
 *             entryIds: '123,456,789'
 *     responses:
 *       '200':
 *         description: Successful response with update status.
 *         content:
 *           application/json:
 *             example:
 *               status: Success
 *               message: 'Details updated successfully.'
 *       '400':
 *         description: Bad request due to missing parameters.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: 'Shift and entryIds are required.'
 *       '500':
 *         description: Internal server error during the update operation.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: 'Internal Server Error'
 *
 * @function
 * @name updateShiftForEmployees
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {BadRequestError} Will throw an error if required parameters are missing.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database update.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post('/operator/update-shift', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const { shift, entryIds } = req.body;
    if (!shift || !entryIds) {
      return res.status(400).json({ status: 'Error', message: 'Shift and entryIds are required.' });
    }
    const entryIdsArray = entryIds.split(',');
    // Query to check if the employee with the given entryId exists
    const checkQuery = 'SELECT id FROM employees_moz WHERE id = ? ';

    // Query to update data for each entryId
    const updateQuery = 'UPDATE employees_moz SET shift = ? WHERE id = ?';

    // Counter to keep track of processed entries
    let processedCount = 0;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const updateData = async (entryId) => {
      const checkValues = [entryId];

      try {
        // Check if the employee exists
        const checkResult = await executeQuery(connection, checkQuery, checkValues);

        if (checkResult.length === 1) {
          // Employee exists, update the data
          const updateValues = [shift, entryId];
          const updateResult = await executeQuery(connection, updateQuery, updateValues);

          if (updateResult.affectedRows === 1) {
            processedCount++;
            console.log(`Data updated for entryId: ${entryId}`);
          }
        } else {
          // Employee does not exist, skip the update for this entryId
          processedCount++;
          console.log(`Employee not found for entryId: ${entryId}`);
        }

        // Check if all entries have been processed
        if (processedCount === entryIdsArray.length) {
          res.json({ status: 'Success', message: 'Details updated successfully.' });
        }
      } catch (updateErr) {
        console.error('Error updating data:', updateErr);
        res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
      }
    };

    // Use Promise.all to execute all updateData calls concurrently
    await Promise.all(entryIdsArray.map(updateData));
  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


app.delete('/operator/delete/:id', authenticateJWT, (req, res) => {
  try {
    const id = req.params.id; // ID will be a string here
    console.log("id", id);
    db.query('SELECT * FROM employees_moz WHERE entryid = ?', id, (err, result1) => {
      if (err) {
        console.error("Error selecting employee:", err);
        return res.status(500).send('Error deleting record');
      }

      if (result1.length === 0) {
        return res.status(404).send('Record not found');
      }

      db.query('DELETE FROM employees_moz WHERE entryid = ?', id, (err, result) => {
        if (err) {
          console.error("Error deleting employee:", err);
          return res.status(500).send('Error deleting record');
        }

        db.query('DELETE FROM geopos_users WHERE entryid = ?', id, (err2, result2) => {
          if (err2) {
            console.error("Error deleting user:", err2);
            return res.status(500).send('Error deleting record');
          }

          res.status(200).send('Data Deleted successfully');
        });
      });

    });
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  }
});


//============================================ Operator End =====================================================

//============================================ User Start =====================================================

/**
 * @swagger
 * 
  * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         pass:
 *           type: string
 *           example: "hashed_password"
 *         entryid:
 *           type: string
 *           example: "unique_entry_id"
 *         username:
 *           type: string
 *           example: "username"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         banned:
 *           type: boolean
 *           example: false
 *         last_login:
 *           type: string
 *           format: date-time
 *           example: "2024-03-01T12:00:00Z"
 *         last_activity:
 *           type: string
 *           format: date-time
 *           example: "2024-03-01T12:00:00Z"
 *         date_created:
 *           type: string
 *           format: date-time
 *           example: "2024-03-01T12:00:00Z"
 *         roleid:
 *           type: integer
 *           example: 1
 *         picture:
 *           type: string
 *           example: "example.png"
 *         loc:
 *           type: integer
 *           example: 1
 *         cid:
 *           type: integer
 *           example: 1
 *         lang:
 *           type: string
 *           example: "english"
 *         user_status:
 *           type: integer
 *           example: 1
 * 
 * /user:
 *   get:
 *     summary: Get users based on role ID.
 *     description: |
 *       This endpoint retrieves users based on the provided role ID.
 *       If no role ID is provided, it returns all non-banned users.
 *     tags:
 *       - User
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         description: The role ID of the users to retrieve.
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with user details.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "John Doe"
 *                 email: "john@example.com"
 *                 entryid: 12345
 *               - id: 2
 *                 name: "Jane Doe"
 *                 email: "jane@example.com"
 *                 entryid: 54321
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getUsers
 * @memberof module:Routes/User
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/user', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleId = req.query.roleid;
    var query = 'SELECT * FROM geopos_users WHERE banned=0';
    if (roleId !== '' && roleId !== undefined && roleId != null) {
      query = `SELECT * FROM geopos_users WHERE roleid=${roleId} AND banned=0`;
    }

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Use executeQuery function instead of db.query
    const result = await executeQuery(connection, query);

    res.send(result);
  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user by ID.
 *     description: |
 *       This endpoint retrieves a user based on the provided ID.
 *       The ID can be either the user's internal ID or entry ID.
 *     tags:
 *       - User
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the user to retrieve (internal ID or entry ID).
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with user details.
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               name: "John Doe"
 *               email: "john@example.com"
 *               entryid: 12345
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getUserById
 * @memberof module:Routes/User
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/user/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const id = req.params.id;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Use executeQuery function instead of db.query
    const result = await executeQuery(
      connection,
      'SELECT * FROM geopos_users WHERE id=? OR entryid=?',
      [id, id]
    );

    if (result.length > 0) {
      res.send(result[0]); // Send only the first result (if any)
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /user/update-password:
 *   put:
 *     summary: Update user password.
 *     description: |
 *       This endpoint allows users to update their passwords.
 *       The request must include the new password, user ID, and entry ID.
 *     tags:
 *       - User
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirmPassword:
 *                 type: string
 *                 description: The new password to be set.
 *               userId:
 *                 type: integer
 *                 description: The user ID for which the password is being updated.
 *               entryid:
 *                 type: integer
 *                 description: The entry ID of the user.
 *             required:
 *               - confirmPassword
 *               - userId
 *               - entryid
 *     responses:
 *       '200':
 *         description: Successful response with a message indicating the password update.
 *         content:
 *           application/json:
 *             example:
 *               message: "Record updated successfully"
 *       '404':
 *         description: The specified record was not found.
 *         content:
 *           application/json:
 *             example:
 *               message: "Record not updated"
 *       '500':
 *         description: Internal server error during the update process.
 *         content:
 *           application/json:
 *             example:
 *               message: "Error updating record"
 *
 * @function
 * @name updateUserPassword
 * @memberof module:Routes/User
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the update process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put('/user/update-password', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const newpassword = req.body.confirmPassword;
    const uid = req.body.userId;
    const entryid = req.body.entryid;

    console.log("uid", uid);
    const userId = `${uid}`; // Converts the integer to a string using template literals

    const hashedPassword = authUtils.hashPassword(newpassword, userId);
    console.log("userId :", userId);
    console.log("hashedPassword :", hashedPassword);


    // Get a connection from the pool
    connection = await getPoolConnection();

    // Use executeQuery function instead of db.query
    const updateResult = await executeQuery(
      connection,
      'UPDATE geopos_users SET pass = ? WHERE entryid = ?',
      [hashedPassword, entryid]
    );
    if (updateResult.affectedRows === 0) {
      res.status(404).json({ message: 'Record not updated' });
    } else {
      res.status(200).json({ message: 'Record updated successfully' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error hashing password' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});

/**
 * @swagger
 * /user/update-language:
 *   put:
 *     summary: Update user language preference.
 *     description: |
 *       This endpoint updates the language preference for a user in the 'geopos_users' table based on the provided language parameter.
 *     tags:
 *       - User
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 description: The new language preference for the user.
 *     responses:
 *       '200':
 *         description: Successful response indicating the successful update of the user's language preference.
 *         content:
 *           application/json:
 *             example:
 *               message: "Language updated successfully"
 *       '500':
 *         description: Internal server error during the language update process.
 *         content:
 *           application/json:
 *             example:
 *               error: "Failed to update language"
 *
 * @function
 * @name updateUserLanguage
 * @memberof module:Routes/User
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the language update process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put('/user/update-language', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const { language } = req.body;
    const userId = 9; // Assuming you have a specific user ID

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Use executeQuery function instead of db.query
    const updateResult = await executeQuery(
      connection,
      'UPDATE geopos_users SET lang = ? WHERE id = ?',
      [language, userId]
    );

    if (updateResult.affectedRows === 0) {
      res.status(404).json({ message: 'Language not updated' });
    } else {
      res.status(200).json({ message: 'Language updated successfully' });
    }
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
    //res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});

//============================================ User End =====================================================

//============================================ Worker Start =====================================================

/**
 * @swagger
 * 
 * /worker/add:
 *   post:
 *     summary: Add a new worker.
 *     description: Add a new worker with the provided details.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: John Doe
 *             type: 1
 *             product: 1,2
 *             entryid: ABC123
 *             workertype: DIRECT
 *             shift: 9HRS
 *             site: NAKURU
 *             sectionId: 1,2
 *             join_date: '21-02-2024'
 *     responses:
 *       '200':
 *         description: Successful response with insert status.
 *         content:
 *           application/json:
 *             example:
 *               status: Success
 *               message: 'Record inserted successfully'
 *       '404':
 *         description: Record not inserted.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: 'Record not inserted'
 *       '409':
 *         description: EntryId already exists.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: 'EntryId already exists !'
 *       '500':
 *         description: Internal server error during the insertion.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: 'Error inserted record'
 *
 * @function
 * @name addWorker
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {ConflictError} Will throw an error if the EntryId already exists.
 * @throws {NotFoundError} Will throw an error if there's an issue with the database insertion.
 * @throws {InternalServerError} Will throw an error if there's an internal server error.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post('/worker/add', authenticateJWT, async (req, res) => {
  let connection;
  try {
    console.log(req.body);
    const name = req.body.name;
    const type = req.body.type;
    const product = req.body.product;
    const entryid = req.body.entryid;
    const worktyp = req.body.workertype;
    const shift = req.body.shift;
    const site = req.body.site;
    const sectionId = req.body.sectionId;
    const join_date = req.body.join_date;
    console.log("join_date", join_date);
    const roleid = '1';

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Use executeQuery function instead of db.query
    const rowCheckQuery = 'SELECT * FROM employees_moz WHERE entryid=?';
    const rowCheckResult = await executeQuery(connection, rowCheckQuery, [entryid]);

    if (rowCheckResult.length > 0) {
      res.status(409).send('EntryId already exists!');
    } else {
      const insertQuery =
        'INSERT INTO employees_moz (entryid, name, workertype, shift, site, joindate, type, roleid, product, section_id, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const insertResult = await executeQuery(
        connection,
        insertQuery,
        [entryid, name, worktyp, shift, site, join_date, type, roleid, product, sectionId, currentDate]
      );

      if (insertResult.affectedRows === 0) {
        res.status(404).send('Record not inserted');
      } else {
        res.status(200).json({ status: 'Success', message: 'Record inserted successfully' });
      }
    }
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /worker:
 *   get:
 *     summary: Get worker details based on specified criteria.
 *     description: |
 *       This endpoint retrieves worker details based on various criteria such as products, site, shift, and sections.
 *       The query parameters are optional.
 *     tags:
 *       - Worker
 *     parameters:
 *       - in: query
 *         name: products
 *         description: Comma-separated product IDs to filter workers by.
 *         schema:
 *           type: string
 *       - in: query
 *         name: site
 *         description: Site name to filter workers by.
 *         schema:
 *           type: string
 *       - in: query
 *         name: shift
 *         description: Shift name to filter workers by.
 *         schema:
 *           type: string
 *       - in: query
 *         name: sections
 *         description: Comma-separated section IDs to filter workers by.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with worker details.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: John Doe
 *                 products: Product1, Product2
 *                 site: SiteA
 *                 shift: Shift1
 *                 sections: SectionA, SectionB
 *                 role: RoleA
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during data retrieval"
 *
 * @function
 * @name getWorkers
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/worker', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const { products, site, shift, sections } = req.query;

    console.log("products", products);
    console.log("site", site);
    console.log("shift", shift);
    console.log("sections", sections);

    // Get a connection from the pool
    connection = await getPoolConnection();

    let whereConditions = [];
    whereConditions.push(`employees_moz.roleid != '3'`);

    if (products !== '' && products !== undefined && products != null) {
      whereConditions.push(`employees_moz.product IN (${products})`);
    }
    if (site !== '' && site !== undefined && site != null) {
      whereConditions.push(`employees_moz.site='${site}'`);
    }
    if (shift !== '' && shift !== undefined && shift != null) {
      whereConditions.push(`employees_moz.shift='${shift}'`);
    }
    if (sections !== '' && sections !== undefined && sections != null) {
      whereConditions.push(`employees_moz.section_id IN (${sections})`);
    }

    const whereClause = whereConditions.join(' AND ');

    let query2 = `
      SELECT employees_moz.*, section.section_name,geopos_emptype.name as role,item_masterr.item_description
      FROM employees_moz
      LEFT JOIN geopos_emptype ON employees_moz.roleid = geopos_emptype.id
      LEFT JOIN section ON employees_moz.section_id = section.id
      LEFT JOIN item_masterr ON employees_moz.product = item_masterr.id
      WHERE ${whereClause}
    `;

    const query = `
    SELECT employees_moz.*, 
           IFNULL(GROUP_CONCAT(DISTINCT item_masterr.item_description),'') as item_names,
           IFNULL(GROUP_CONCAT(DISTINCT section.section_name),'') as section_names,
           geopos_emptype.name as emptype
    FROM employees_moz
    LEFT JOIN item_masterr ON FIND_IN_SET(item_masterr.id, employees_moz.product) > 0
    LEFT JOIN geopos_emptype ON employees_moz.roleid = geopos_emptype.id
    LEFT JOIN section ON FIND_IN_SET(section.id, employees_moz.section_id) > 0
    WHERE ${whereClause}
    GROUP BY employees_moz.id
  `;

    const result = await executeQuery(connection, query);

    res.json(result);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /worker/total-count:
 *   get:
 *     summary: Get the total count of active workers.
 *     description: |
 *       This endpoint retrieves the total count of active workers based on role, passive_type, and date.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of active workers.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkers: 25
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalActiveWorkers
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/worker/total-count', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleId = '1';
    const passiveType = 'ACT';

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Use sqlString.format for parameterized query
    const query = `SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND passive_type=? AND date=?`;

    // Perform the database query using await
    const result = await executeQuery(connection, query, [roleId, passiveType, currentDate]);

    // Extract the total count of active workers from the query result
    const rowCount = result[0].rowCount;

    // Prepare the response object with the total count of active workers
    const response = {
      totalWorkers: rowCount,
    };

    // Send the response to the client
    res.send(response);

  } catch (error) {
    /**
     * Handle exceptions and send an appropriate response.
     * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
     */
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /worker/total-count/{site}:
 *   get:
 *     summary: Get the total count of workers at a specific site.
 *     description: Retrieves the total count of workers at a specific site from the database based on role, date, and status.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: site
 *         schema:
 *           type: string
 *         description: The site identifier for which to fetch the total workers.
 *     responses:
 *       200:
 *         description: Successful response with the total count of workers.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkers: 42
 *       401:
 *         description: Unauthorized error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized error
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 *
 * @function
 * @async
 * @name getTotalWorkers
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {UnauthorizedError} Will throw an error if the request is unauthorized.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/worker/total-count/:site', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleId = '1';
    const site = req.params.site;
    const passiveType = 'ACT';

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Use sqlString.format for parameterized query
    const query = sqlString.format(
      'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND site=? AND passive_type=? AND date=?',
      [roleId, site, passiveType, currentDate]
    );

    // Perform the database query using await
    const result = await executeQuery(connection, query);

    // Extract the total count of workers at the specific site from the query result
    const rowCount = result[0].rowCount;

    // Prepare the response object with the total count of workers
    const response = {
      totalWorkers: rowCount,
    };

    // Send the response to the client
    res.send(response);
  } catch (error) {
    /**
     * Handle exceptions and send an appropriate response.
     * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
     */
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /worker/total-present:
 *   get:
 *     summary: Get the total count of workers currently present.
 *     description: |
 *       This endpoint retrieves the total count of workers currently present from the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of workers currently present.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkersPresent: 15
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalWorkersPresent
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/worker/total-present', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleId = '1';
    const passiveType = 'ACT';
    const status = 'P';

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Use sqlString.format for parameterized query
    const query = `SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND passive_type=? AND date=? AND status=?`;

    // Perform the database query using await
    const result = await executeQuery(connection, query, [roleId, passiveType, currentDate, status]);

    // Extract the total count of workers currently present from the query result
    const rowCount = result[0].rowCount;

    // Prepare the response object with the total count of workers currently present
    const response = {
      totalWorkersp: rowCount,
    };

    // Send the response to the client
    res.send(response);

  } catch (error) {
    /**
     * Handle exceptions and send an appropriate response.
     * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
     */
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});

/**
 * @swagger
 * /worker/total-present/{site}:
 *   get:
 *     summary: Get the total count of workers currently present at a specific site.
 *     description: Retrieves the total count of workers currently present at a specific site from the database based on role, date, and status.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: site
 *         schema:
 *           type: string
 *         description: The site identifier for which to fetch the total workers present.
 *     responses:
 *       200:
 *         description: Successful response with the total count of workers present.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkersPresent: 42
 *       401:
 *         description: Unauthorized error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized error
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 *
 * @function
 * @async
 * @name getTotalWorkersPresent
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {UnauthorizedError} Will throw an error if the request is unauthorized.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/worker/total-present/:site', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleId = '1';
    const passiveType = 'ACT';
    const status = 'P';
    const site = req.params.site;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Use sqlString.format for parameterized query
    const query = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND site=? AND passive_type=? AND date=? AND status=?';

    // Perform the database query using await
    const result = await executeQuery(connection, query, [roleId, site, passiveType, currentDate, status]);

    // Extract the total count of workers currently present at the specific site from the query result
    const rowCount = result[0].rowCount;

    // Prepare the response object with the total count of workers currently present
    const response = {
      totalWorkersp: rowCount,
    };

    // Send the response to the client
    res.send(response);
  } catch (error) {
    /**
     * Handle exceptions and send an appropriate response.
     * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
     */
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /worker/total-absent:
 *   get:
 *     summary: Get the total count of workers currently absent.
 *     description: |
 *       This endpoint retrieves the total count of workers currently absent from the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of workers currently absent.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkersAbsent: 10
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalWorkersAbsent
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/worker/total-absent', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleId = '1';
    const passiveType = 'ACT';
    const status = 'A';

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Use sqlString.format for parameterized query
    const query = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND passive_type=? AND date=? AND status=?';

    // Perform the database query using await
    const result = await executeQuery(connection, query, [roleId, passiveType, currentDate, status]);

    // Extract the total count of workers currently absent from the query result
    const rowCount = result[0].rowCount;

    // Prepare the response object with the total count of workers currently absent
    const response = {
      totalWorkersa: rowCount,
    };

    // Send the response to the client
    res.send(response);

  } catch (error) {
    /**
     * Handle exceptions and send an appropriate response.
     * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
     */
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});

/**
 * @swagger
 * /worker/total-absent/{site}:
 *   get:
 *     summary: Get the total count of workers currently absent at a specific site.
 *     description: Retrieves the total count of workers currently absent at a specific site from the database based on role, date, and status.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: site
 *         schema:
 *           type: string
 *         description: The site identifier for which to fetch the total workers absent.
 *     responses:
 *       200:
 *         description: Successful response with the total count of workers absent.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkersAbsent: 42
 *       401:
 *         description: Unauthorized error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized error
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 *
 * @function
 * @async
 * @name getTotalWorkersAbsent
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {UnauthorizedError} Will throw an error if the request is unauthorized.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/worker/total-absent/:site', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleId = '1';
    const passiveType = 'ACT';
    const status = 'A';
    const site = req.params.site;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Use sqlString.format for parameterized query
    const query = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND site = ? AND passive_type=? AND date=? AND status=?';

    // Perform the database query using await
    const result = await executeQuery(connection, query, [roleId, site, passiveType, currentDate, status]);

    // Extract the total count of workers currently absent from the query result
    const rowCount = result[0].rowCount;

    // Prepare the response object with the total count of workers currently absent
    const response = {
      totalWorkersa: rowCount,
    };

    // Send the response to the client
    res.send(response);

  } catch (error) {
    /**
     * Handle exceptions and send an appropriate response.
     * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
     */
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /worker/delete/{id}:
 *   delete:
 *     summary: Delete a worker by ID.
 *     description: Delete a worker by ID from the employees_moz table.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the worker to be deleted.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with deletion status.
 *         content:
 *           application/json:
 *             example:
 *               status: Success
 *               message: Data Deleted successfully
 *       '404':
 *         description: Worker record not found.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: Record not found.
 *       '500':
 *         description: Internal server error during deletion operation.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: 'Error deleting record'
 *
 * @function
 * @name deleteWorkerById
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {NotFoundError} Will throw an error if the worker record is not found.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during deletion.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.delete('/worker/delete/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const id = req.params.id;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Use sqlString.format for parameterized query
    const query = 'DELETE FROM employees_moz WHERE roleid=? AND id= ?';
    const result = await executeQuery(connection, query, [1, id]);

    if (result.affectedRows === 0) {
      // No records were deleted
      res.status(404).send('Record not found.');
    } else {
      res.status(200).send('Data deleted successfully');
    }

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /worker/zone:
 *   get:
 *     summary: Get worker details based on specified criteria for assigned zones.
 *     description: |
 *       This endpoint retrieves worker details based on various criteria such as product, section, site, and shift for assigned zones.
 *       The query parameters are optional.
 *     tags:
 *       - Worker
 *     parameters:
 *       - in: query
 *         name: product
 *         description: Product ID to filter workers by.
 *         schema:
 *           type: string
 *       - in: query
 *         name: section
 *         description: Section ID to filter workers by.
 *         schema:
 *           type: string
 *       - in: query
 *         name: site
 *         description: Site name to filter workers by.
 *         schema:
 *           type: string
 *       - in: query
 *         name: shift
 *         description: Shift name to filter workers by.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with worker details for assigned zones.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: John Doe
 *                 products: Product1, Product2
 *                 site: SiteA
 *                 shift: Shift1
 *                 sections: SectionA, SectionB
 *                 role: RoleA
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during data retrieval"
 *
 * @function
 * @name getWorkersByZone
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/worker/zone', authenticateJWT, async (req, res) => {
  let connection;
  try {
    var product_name = req.query.product;
    var section = req.query.section;
    var site = req.query.site;
    var shift = req.query.shift;

    // Concatenate "HRS" to the shift value
    if (shift !== '' && shift !== undefined && shift != null) {
      shift += 'HRS';
    }
    let whereConditions = [];
    if (product_name !== '' && product_name !== undefined && product_name != null) {
      //whereConditions.push(`employees_moz.product = '${product_name}'`);
      whereConditions.push(`find_in_set(${product_name}, employees_moz.product)`);
    }
    if (section !== '' && section !== undefined && section != null) {
      //whereConditions.push(`employees_moz.section_id = '${section}'`);
      whereConditions.push(`find_in_set(${section}, employees_moz.section_id)`);
    }
    if (site !== '' && site !== undefined && site != null) {
      whereConditions.push(`employees_moz.site = '${site}'`);
    }
    if (shift !== '' && shift !== undefined && shift != null) {
      whereConditions.push(`employees_moz.shift = '${shift}'`);
    }
    // Log the whereConditions array:
    //console.log('Where Conditions:', whereConditions);
    // Add the condition to exclude roleid = 3
    whereConditions.push(`employees_moz.roleid = 1`);
    whereConditions.push(`employees_moz.passive_type = 'ACT'`);

    const whereClause = whereConditions.join(' AND ');
    const query = `
  SELECT employees_moz.*, 
         GROUP_CONCAT(DISTINCT item_masterr.item_description) as item_names,
         GROUP_CONCAT(DISTINCT section.section_name) as section_names, 
         geopos_emptype.name as emptype
  FROM employees_moz
  LEFT JOIN item_masterr ON FIND_IN_SET(item_masterr.id, employees_moz.product) > 0
  LEFT JOIN geopos_emptype ON employees_moz.roleid = geopos_emptype.id
  LEFT JOIN section ON FIND_IN_SET(section.id, employees_moz.section_id) > 0
  WHERE ${whereClause}
  GROUP BY employees_moz.id
`;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Perform the database query using await
    const results = await executeQuery(connection, query);

    const data = {
      timesheet: results,
      shift: shift,
      site: site,
      section: section,
      product_name: product_name,
    };

    res.json(data);

  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});



/**
 * @swagger
 * /worker/zone/update:
 *   put:
 *     summary: Update worker details for assigned zones.
 *     description: |
 *       This endpoint updates worker details for assigned zones based on product, section, and entryIds.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             product_name: 1
 *             section: 2
 *             entryIds: "1,2,3"
 *           schema:
 *             type: object
 *             properties:
 *               product_name:
 *                 type: integer
 *                 description: The ID of the product to be updated.
 *               section:
 *                 type: integer
 *                 description: The section ID to be updated.
 *               entryIds:
 *                 type: string
 *                 description: Comma-separated entry IDs to identify workers to be updated.
 *     responses:
 *       '200':
 *         description: Successful response with update status.
 *         content:
 *           application/json:
 *             example:
 *               status: Success
 *               message: Details updated successfully.
 *       '400':
 *         description: Bad request due to missing or invalid parameters.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: Product, section, and entryIds are required.
 *       '500':
 *         description: Internal server error during the update operation.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: Internal Server Error
 *
 * @function
 * @name updateWorkerZones
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the update.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put('/worker/zone/update', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const { product_name, section, entryIds } = req.body;

    if (!product_name || !section || !entryIds) {
      return res.status(400).json({ status: 'Error', message: 'Product, section, and entryIds are required.' });
    }
    const entryIdsArray = entryIds.split(',');

    // Query to check if the employee with the given entryId exists
    const checkQuery = 'SELECT * FROM employees_moz WHERE id = ? ';

    // Query to update data for each entryId
    const updateQuery = 'UPDATE employees_moz SET product = ?, section_id = ? WHERE id = ?';

    // Query to insert data
    const insertQuery = 'INSERT INTO change_product (emp_id, product_old, product_new, section_old, section_new) VALUES (?,?,?,?,?)';

    // Counter to keep track of processed entries
    let processedCount = 0;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Start a MySQL transaction
    await beginTransaction(connection);

    for (const entryId of entryIdsArray) {
      try {
        const checkResult = await executeQuery(connection, checkQuery, [entryId]);

        if (checkResult.length === 1) {
          const employeeData = checkResult[0];

          await executeQuery(connection, updateQuery, [product_name, section, entryId]);
          await executeQuery(connection, insertQuery, [employeeData.id, employeeData.product, product_name, employeeData.section_id, section]);

          processedCount++;
          console.log(`Data updated and inserted for entryId: ${entryId}`);
        } else {
          processedCount++;
          console.log(`Employee not found for entryId: ${entryId}`);
        }

        if (processedCount === entryIdsArray.length) {
          // Commit the transaction if all entries are processed successfully
          await commitTransaction(connection);
          res.json({ status: 'Success', message: 'Details updated successfully.' });
        }
      } catch (error) {
        console.error('Error processing entryId:', entryId, error);
        // Rollback the transaction in case of an error
        await rollbackTransaction(connection);
        res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
      }
    }
  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    // Rollback the transaction in case of an error
    await rollbackTransaction(connection);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /worker/workers/{ids}:
 *   get:
 *     summary: Get workers by entry IDs.
 *     description: |
 *       This endpoint retrieves worker details based on the specified entry IDs.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: ids
 *         required: true
 *         description: Comma-separated entry IDs to filter workers by.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with worker details.
 *         content:
 *           application/json:
 *             example:
 *               - entryid: 1
 *                 name: WorkerA
 *               - entryid: 2
 *                 name: WorkerB
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during data retrieval"
 *
 * @function
 * @name getWorkersByIds
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/worker/workers/:ids', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const entryIds = req.params.ids;
    //const entryIdsArray = Array.isArray(entryIds) ? entryIds : [entryIds];

    // Use the IN operator in the SQL query to check for multiple entryid values
    const query = `SELECT entryid,name FROM employees_moz WHERE id IN (${entryIds})`;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const results = await executeQuery(connection, query);

    res.json(results);
  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});



/**
 * @swagger
 * /worker/shift/update:
 *   post:
 *     summary: Update shift for multiple workers.
 *     description: |
 *       This endpoint updates the shift for multiple workers based on the provided entry IDs.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             shift: NewShift
 *             entryIds: "1,2,3"
 *           schema:
 *             type: object
 *             properties:
 *               shift:
 *                 type: string
 *                 description: The new shift value.
 *               entryIds:
 *                 type: string
 *                 description: Comma-separated entry IDs of workers to update.
 *     responses:
 *       '200':
 *         description: Successful response with update status.
 *         content:
 *           application/json:
 *             example:
 *               status: Success
 *               message: Details updated successfully.
 *       '400':
 *         description: Bad request.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: "Shift and entryIds are required."
 *       '500':
 *         description: Internal server error during data update.
 *         content:
 *           application/json:
 *             example:
 *               status: Error
 *               message: "Internal Server Error"
 *
 * @function
 * @name updateShiftForWorkers
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {BadRequestError} Will throw an error if shift or entryIds are missing.
 * @throws {InternalServerError} Will throw an error if there's an internal server error.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post('/worker/shift/update', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const { shift, entryIds } = req.body;
    if (!shift || !entryIds) {
      return res.status(400).json({ status: 'Error', message: 'Shift and entryIds are required.' });
    }
    const entryIdsArray = entryIds.split(',');

    if (entryIdsArray.length === 0) {
      return res.status(400).json({ status: 'Error', message: 'No entryIds provided.' });
    }

    // Query to check if the employee with the given entryId exists
    const checkQuery = 'SELECT id FROM employees_moz WHERE id = ? ';

    // Query to update data for each entryId
    // const updateQuery = 'UPDATE employees_moz SET shift = CONCAT(?, "HRS"), date = ? WHERE id = ?';
    const updateQuery = 'UPDATE employees_moz SET shift = ? WHERE id = ?';

    // Counter to keep track of processed entries
    let processedCount = 0;

    // Get a connection from the pool
    connection = await getPoolConnection();

    for (const entryId of entryIdsArray) {
      try {
        const checkResult = await executeQuery(connection, checkQuery, [entryId]);

        if (checkResult.length === 1) {
          // Employee exists, update the data
          const updateValues = [shift, entryId];
          await executeQuery(connection, updateQuery, updateValues);

          processedCount++;
          console.log(`Data updated for entryId: ${entryId}`);
        } else {
          // Employee does not exist, skip the update for this entryId
          processedCount++;
          console.log(`Employee not found for entryId: ${entryId}`);
        }

        if (processedCount === entryIdsArray.length) {
          res.json({ status: 'Success', message: 'Details updated successfully.' });
        }
      } catch (error) {
        console.error('Error processing entryId:', entryId, error);
        res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
      }
    }
  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});

/**
 * @swagger
 * /worker/yes-date:
 *   get:
 *     summary: Get the earliest "yes_date" from the employees_moz table.
 *     description: |
 *       This endpoint retrieves the earliest "yes_date" from the employees_moz table, representing the date when employees acknowledged "yes."
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response with the earliest "yes_date."
 *         content:
 *           application/json:
 *             example:
 *               yes_date: "2024-02-28"
 *       '500':
 *         description: Internal server error during the retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               error: "An error occurred during retrieval."
 *
 * @function
 * @name getEarliestYesDate
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/worker/yes-date', authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await getPoolConnection();

    // Query to fetch the earliest "yes_date" from the employees_moz table
    const query1 = 'SELECT yes_date FROM employees_moz ORDER BY id ASC LIMIT 1';

    // Use async/await to handle asynchronous code
    const result = await executeQuery(connection, query1);

    const y_date = result[0].yes_date;
    res.json(y_date);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});



/**
 * @swagger
 * /worker/update-attendance:
 *   put:
 *     summary: Update or insert worker attendance records.
 *     description: |
 *       This endpoint updates or inserts worker attendance records based on the current date and specific site information. The attendance records are calculated and processed for LIKONI and NAKURU sites. The operation updates the 'employees_moz' table and the 'attendance' table in the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response indicating the successful update or insertion of worker attendance records.
 *         content:
 *           application/json:
 *             example:
 *               message: "Updated"
 *       '500':
 *         description: Internal server error during the update or insertion process.
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 *
 * @function
 * @name updateAttendanceRecords
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the update or insertion process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put('/worker/update-attendance', authenticateJWT, async (req, res) => {
  let connection;
  try {
    console.log("currentDate", currentDate);
    console.log("currentMonthYear:: MM/YYYY", currentMonthYear);
    console.log("currentDate2", currentDate2);
    console.log("currentTimestamp", currentTimestamp);

    // Get a connection from the pool
    connection = await getPoolConnection();

    const odbc_con = await odbc.connect(odbcConnectionString);
    console.log(`ODBC Connected`);

    const updateAttendanceRecordsAsync = async (site) => {
      console.log(`Updating attendance for ${site} site.`);

      const siteSql = `
      SELECT COUNT(*) as li
      FROM employees_moz
      WHERE date = '${currentDate}' AND status = 'P' AND site = '${site}'`;
      const siteResult = await executeQuery(connection, siteSql);

      if (siteResult[0].li) {

        const attendanceSql = `
          SELECT * FROM attendance
          WHERE date = '${currentDate}' AND site = '${site}'`;

        const attendanceResult = await executeQuery(connection, attendanceSql);

        if (attendanceResult.length > 0) {
          const updateAttendanceSql = `
              UPDATE attendance
              SET permanent = '${siteResult[0].li}'
              WHERE id = '${attendanceResult[0].id}'`;

          await executeQuery(connection, updateAttendanceSql);
          console.log(`Updated attendance for ${site} site.`);
        } else {
          const insertAttendanceSql = `
                INSERT INTO attendance (permanent, date, mon, time_stamp, site)
                VALUES ('${siteResult[0].li}', '${currentDate}', '${currentMonthYear}', '${currentTimestamp}', '${site}')`;
          await executeQuery(connection, insertAttendanceSql);
          console.log(`Inserted attendance for ${site} site.`);
        }
      }
    };


    const sqlQuery = `
    SET NOCOUNT ON;

DECLARE @page_size INT = 6000;
DECLARE @page INT = 1;

;WITH [data] AS (
    SELECT DISTINCT 
        EMP_DISPLAY_NUMBER,CLK_DATE,CONFIG_LOCATION
    FROM 
        Style_Kenya.HRMV8.VW_INTE_LABOUR_PRODUCTIVITY
    WHERE  
        CAST(CLK_DATE AS DATE) = CAST(GETDATE() AS DATE) AND CONFIG_LOCATION = 'NAKURU' OR CONFIG_LOCATION= 'MLOLONGO' OR CONFIG_LOCATION= 'LIKONI' OR CONFIG_LOCATION= 'ENTERPRISE'  
)

SELECT
    [data].EMP_DISPLAY_NUMBER,
    [data].CLK_DATE,
    [data].CONFIG_LOCATION,
    emp_data.[employee_number],
    emp_data.[NAME],
    emp_data.[JOINED_DATE],
    emp_data.[DEPARTMENT],
    emp_data.[BASIC_SALARY],
    emp_data.[EMP_ACTIVE_HRM_FLG],
    emp_data.[EMP_ACTIVE_PAYROLL_FLG]
FROM 
    [data]
JOIN (
    SELECT 
        VW_HS_HR_EMPDTLV5.EMP_DISPLAY_NUMBER as 'employee_number',
        VW_HS_HR_EMPDTLV5.EMP_FULLNAME as 'NAME',
        VW_HS_HR_EMPDTLV5.EMP_DATE_JOINED as 'JOINED_DATE',
        VW_HS_HR_EMPDTLV5.HIE_NAME_4 as 'DEPARTMENT',
        VW_HS_HR_EMPDTLV5.EBSAL_BASIC_SALARY as 'BASIC_SALARY',
        VW_HS_HR_EMPDTLV5.EMP_ACTIVE_HRM_FLG,
        VW_HS_HR_EMPDTLV5.EMP_ACTIVE_PAYROLL_FLG
    FROM   
        Style_Kenya.HRMV8.VW_HS_HR_EMPDTLV5
    WHERE  
        VW_HS_HR_EMPDTLV5.EMP_ACTIVE_HRM_FLG = 1 
        AND VW_HS_HR_EMPDTLV5.EMP_ACTIVE_PAYROLL_FLG = 1
      
) AS emp_data ON [data].EMP_DISPLAY_NUMBER = emp_data.[employee_number]
ORDER BY     
    [data].CLK_DATE DESC
OFFSET 
    @page_size * (@page - 1) ROWS FETCH NEXT @page_size ROWS ONLY;
    `;

    // Execute the SQL query
    const result = await odbc_con.query(sqlQuery);
    console.log("length", result.length);



    const updateSql = `
  UPDATE employees_moz
  SET status = CASE
    WHEN entryid NOT LIKE 'LUP%' THEN 'A'
    WHEN entryid LIKE 'LUP%' THEN 'P'
  END,
  date = '${currentDate}'
  WHERE entryid NOT LIKE 'LUP%' OR entryid LIKE 'LUP%'`;

    const updateResult = await executeQuery(connection, updateSql);

    const inputFormat = 'YYYY-MM-DD HH:mm:ss.SSS';
    const outputFormat = 'DD-MM-YYYY';
    var count = 0;

    for (const row of result) {
      try {
        const sonuc = row.EMP_DISPLAY_NUMBER;
        const dept = row.DEPARTMENT;
        const bs = row.BASIC_SALARY;
        const cd = dateUtils.convertDateFormat(row.CLK_DATE, inputFormat, outputFormat);
        const jd = dateUtils.convertDateFormat(row.JOINED_DATE, inputFormat, outputFormat);
        const name = row.NAME;
        const site = row.CONFIG_LOCATION;

        //console.log("row.CLK_DATE : ", row.CLK_DATE);
        //console.log("row.JOINED_DATE : ", row.JOINED_DATE);
        //console.log("cd : ", cd);
        //console.log("jd : ", jd);
        //console.log(sonuc);

        // Perform the UPDATE operation
        const updateSql2 = `
                UPDATE employees_moz
                SET status='P', update_date=CURRENT_TIMESTAMP, joindate='${jd}', dept='${dept}', salary='${bs}'
                WHERE entryid='${sonuc}'`;
        console.log(`Updating employees_moz for entryid ${sonuc}.`);
        count++;
        await executeQuery(connection, updateSql2);
      } catch (error) {
        console.error('Error in loop iteration:', error);
        res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
      }
    }//end for each loop

    // result.forEach(async (row) => {

    //   const sonuc = row.EMP_DISPLAY_NUMBER;
    //   const dept = row.DEPARTMENT;
    //   const bs = row.BASIC_SALARY;
    //   const cd = dateUtils.convertDateFormat(row.CLK_DATE, inputFormat, outputFormat);
    //   const jd = dateUtils.convertDateFormat(row.JOINED_DATE, inputFormat, outputFormat);
    //   const name = row.NAME;
    //   const site = row.CONFIG_LOCATION;

    //   //console.log("row.CLK_DATE : ", row.CLK_DATE);
    //   //console.log("row.JOINED_DATE : ", row.JOINED_DATE);
    //   //console.log("cd : ", cd);
    //   //console.log("jd : ", jd);
    //   //console.log(sonuc);

    //   // Perform the UPDATE operation
    //   const updateSql2 = `
    //             UPDATE employees_moz
    //             SET status='P', update_date=CURRENT_TIMESTAMP, joindate='${jd}', dept='${dept}', salary='${bs}'
    //             WHERE entryid='${sonuc}'`;
    //   console.log(`Updating employees_moz for entryid ${sonuc}.`);
    //   count++;
    //   await executeQuery(connection, updateSql2);

    // });//end for each loop
    console.log(`count`, count);
    console.log(`employees_moz Updated.`);
    await updateAttendanceRecordsAsync('LIKONI');
    await updateAttendanceRecordsAsync('NAKURU');



    console.log(`All site Updated.`);
    res.status(200).json({ message: 'Updated' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("connection released");
    }
  }
});


app.put('/worker/update-attendance222', authenticateJWT, async (req, res) => {
  try {
    console.log("currentDate", currentDate);
    console.log("currentMonthYear:: MM/YYYY", currentMonthYear);
    console.log("currentDate2", currentDate2);
    console.log("currentTimestamp", currentTimestamp);

    // Function to update or insert attendance records for a specific site
    const updateAttendanceRecords = (site) => {
      // Calculate the attendance records after all employee_moz records are updated


      // SQL query to update or insert attendance records for the specified site
      const siteSql = `
      SELECT COUNT(*) as li
      FROM employees_moz
      WHERE date = '${currentDate}' AND status = 'P' AND site = '${site}'`;

      db.query(siteSql, (siteError, siteResult) => {
        if (siteError) {
          console.error(`Error counting records for ${site} site:`, siteError);
        } else {
          const li = siteResult[0].li;

          const attendanceSql = `
          SELECT * FROM attendance
          WHERE date = '${currentDate}' AND site = '${site}'`;

          db.query(attendanceSql, (attendanceError, attendanceResult) => {
            if (attendanceError) {
              console.error(`Error fetching attendance for ${site} site:`, attendanceError);
            } else {
              if (attendanceResult.length > 0) {
                const updateAttendanceSql = `
                UPDATE attendance
                SET permanent = '${li}'
                WHERE id = '${attendanceResult[0].id}'`;

                db.query(updateAttendanceSql, (updateAttendanceError) => {
                  if (updateAttendanceError) {
                    console.error(`Error updating attendance for ${site} site:`, updateAttendanceError);
                  } else {
                    // Handle the result of the attendance record update (check affected rows)
                    console.log(`updated attendance for ${site} site:`);
                  }
                });
              } else {
                const insertAttendanceSql = `
                INSERT INTO attendance (permanent, date, mon, time_stamp, site)
                VALUES ('${li}', '${currentDate}', '${currentMonthYear}', '${currentTimestamp}', '${site}')`;

                db.query(insertAttendanceSql, (insertAttendanceError) => {
                  if (insertAttendanceError) {
                    console.error(`Error inserting attendance for ${site} site:`, insertAttendanceError);
                  } else {
                    // Handle the result of the attendance record insertion (check affected rows)
                    console.log(`inserted attendance for ${site} site:`);
                  }
                });
              }
            }
          });
        }
      });
    };




    // Initialize a flag to track the completion status
    let isComplete = true;

    const handleComplete = () => {

      if (isComplete) {
        console.log('isComplete :', isComplete);
        // Proceed with updating attendance records for LIKONI and NAKURU
        updateAttendanceRecords('LIKONI');
        updateAttendanceRecords('NAKURU');
        res.status(200).json({ message: 'Updated' });
      } else {
        console.log('isComplete :', isComplete);
        res.status(500).json({ message: 'Internal server error' });
      }
    };


    const updateSql = `
  UPDATE employees_moz
  SET status = CASE
    WHEN entryid NOT LIKE 'LUP%' THEN 'A'
    WHEN entryid LIKE 'LUP%' THEN 'P'
  END,
  date = '${currentDate}'
  WHERE entryid NOT LIKE 'LUP%' OR entryid LIKE 'LUP%'`;

    db.query(updateSql, (updateError, result) => {
      if (updateError) {
        console.error('Error updating records:', updateError);
        isComplete = false;
        handleComplete();
      } else {


        // Establish the connection
        odbc.connect(odbcConnectionString, (error, connection) => {
          if (error) {
            console.error('Error connecting to SQL Server:', error);
            isComplete = false;
            handleComplete();
          }
          console.log('ODBC Connected');

          const sqlQuery = `
    SET NOCOUNT ON;

DECLARE @page_size INT = 6000;
DECLARE @page INT = 1;

;WITH [data] AS (
    SELECT DISTINCT 
        EMP_DISPLAY_NUMBER,CLK_DATE,CONFIG_LOCATION
    FROM 
        Style_Kenya.HRMV8.VW_INTE_LABOUR_PRODUCTIVITY
    WHERE  
        CAST(CLK_DATE AS DATE) = CAST(GETDATE() AS DATE) AND CONFIG_LOCATION = 'NAKURU' OR CONFIG_LOCATION= 'MLOLONGO' OR CONFIG_LOCATION= 'LIKONI' OR CONFIG_LOCATION= 'ENTERPRISE'  
)

SELECT
    [data].EMP_DISPLAY_NUMBER,
    [data].CLK_DATE,
    [data].CONFIG_LOCATION,
    emp_data.[employee_number],
    emp_data.[NAME],
    emp_data.[JOINED_DATE],
    emp_data.[DEPARTMENT],
    emp_data.[BASIC_SALARY],
    emp_data.[EMP_ACTIVE_HRM_FLG],
    emp_data.[EMP_ACTIVE_PAYROLL_FLG]
FROM 
    [data]
JOIN (
    SELECT 
        VW_HS_HR_EMPDTLV5.EMP_DISPLAY_NUMBER as 'employee_number',
        VW_HS_HR_EMPDTLV5.EMP_FULLNAME as 'NAME',
        VW_HS_HR_EMPDTLV5.EMP_DATE_JOINED as 'JOINED_DATE',
        VW_HS_HR_EMPDTLV5.HIE_NAME_4 as 'DEPARTMENT',
        VW_HS_HR_EMPDTLV5.EBSAL_BASIC_SALARY as 'BASIC_SALARY',
        VW_HS_HR_EMPDTLV5.EMP_ACTIVE_HRM_FLG,
        VW_HS_HR_EMPDTLV5.EMP_ACTIVE_PAYROLL_FLG
    FROM   
        Style_Kenya.HRMV8.VW_HS_HR_EMPDTLV5
    WHERE  
        VW_HS_HR_EMPDTLV5.EMP_ACTIVE_HRM_FLG = 1 
        AND VW_HS_HR_EMPDTLV5.EMP_ACTIVE_PAYROLL_FLG = 1
      
) AS emp_data ON [data].EMP_DISPLAY_NUMBER = emp_data.[employee_number]
ORDER BY     
    [data].CLK_DATE DESC
OFFSET 
    @page_size * (@page - 1) ROWS FETCH NEXT @page_size ROWS ONLY;
    `;

          connection.query(sqlQuery, (error, rows) => {
            if (error) {
              console.error('Error executing SQL query:', error);
              isComplete = false;
              handleComplete();
            } else {
              //console.log('Query result:', rows);
              // Log the number of rows in the result set
              console.log('Number of rows:', rows.length);
              let total_rows = rows.length; // rows 
              let counter = 0; // Initialize a counter variable
              // Iterate through the rows and perform the operations
              const inputFormat = 'YYYY-MM-DD HH:mm:ss.SSS';
              const outputFormat = 'DD-MM-YYYY';
              rows.forEach((row) => {

                const sonuc = row.EMP_DISPLAY_NUMBER;
                const dept = row.DEPARTMENT;
                const bs = row.BASIC_SALARY;
                const cd = dateUtils.convertDateFormat(row.CLK_DATE, inputFormat, outputFormat);
                const jd = dateUtils.convertDateFormat(row.JOINED_DATE, inputFormat, outputFormat);
                const name = row.NAME;
                const site = row.CONFIG_LOCATION;
                // console.log("row.CLK_DATE : ", row.CLK_DATE);
                // console.log("row.JOINED_DATE : ", row.JOINED_DATE);

                //console.log("cd : ", cd);
                //console.log("jd : ", jd);

                //console.log(sonuc);
                // Perform the UPDATE operation
                const updateSql = `
                UPDATE employees_moz
                SET status='P', update_date=CURRENT_TIMESTAMP, joindate='${jd}', dept='${dept}', salary='${bs}'
                WHERE entryid='${sonuc}'`;
                //console.log("Query :", updateSql);
                db.query(updateSql, (updateError) => {
                  if (updateError) {
                    console.error('Error updating record:', updateError);
                    isComplete = false;
                    handleComplete();
                  } else {
                    // Increment the counter with each iteration
                    counter++;
                    console.log('counter :', counter);
                    if (counter == total_rows) {
                      connection.close((closeError) => {
                        if (closeError) {
                          console.error('Error closing connection:', closeError);
                          isComplete = false;
                          handleComplete();
                        } else {
                          console.log('Connection closed.');
                          isComplete = true;
                          handleComplete();
                        }
                      });
                    }
                  }
                });//end of employees_moz update query

              });//end for each loop

            }
          });
        });
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



/**
 * @swagger
 * /worker/update-back-attendance:
 *   put:
 *     summary: Update back attendance records for LIKONI and NAKURU.
 *     description: |
 *       This endpoint updates back attendance records for LIKONI and NAKURU based on the specified criteria, including the number of days ago and the from date.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: Data for updating back attendance records.
 *       content:
 *         application/json:
 *           example:
 *             daysAgo: 2
 *             fromdate: "2024-02-28"
 *     responses:
 *       '200':
 *         description: Successful response after updating back attendance records.
 *         content:
 *           application/json:
 *             example:
 *               message: "Updated"
 *       '500':
 *         description: Internal server error during the update process.
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 *
 * @function
 * @name updateBackAttendance
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the update process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put('/worker/update-back-attendance', authenticateJWT, async (req, res) => {
  let connection;
  let odbcConnection;
  try {

    //console.log('invoked :API');
    const daysAgo = req.body.daysAgo;
    const fromDate = req.body.fromdate;
    //console.log('Pdate:', fromDate);
    const inputFormat = 'YYYY-MM-DD';
    const outputFormat = 'DD-MM-YYYY';
    const formattedFromDate = dateUtils.convertDateFormat(fromDate, inputFormat, outputFormat);
    //console.log('Previous date:', formattedFromDate);

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Start a MySQL transaction
    await beginTransaction(connection);

    const updateSql = `
  UPDATE employees_moz
  SET yes_status = CASE
    WHEN entryid NOT LIKE 'LUP%' THEN 'A'
    WHEN entryid LIKE 'LUP%' THEN 'P'
  END,
  yes_date = ?
  WHERE entryid NOT LIKE 'LUP%' OR entryid LIKE 'LUP%'`;

    const updateResult = await executeQuery(connection, updateSql, [formattedFromDate]);



    // Establish the ODBC connection
    odbcConnection = await odbc.connect(odbcConnectionString);

    const sqlQuery = `
   set nocount on
 declare @page_size int = 6000;
 declare @page int = 1;

;with [data] as (
   select distinct
     EMP_DISPLAY_NUMBER,CLK_DATE

    from
 Style_Kenya.HRMV8.VW_INTE_LABOUR_PRODUCTIVITY
    where
 cast(CLK_DATE as Date) = CAST(GETDATE()-${daysAgo} AS date) and CONFIG_LOCATION= 'NAKURU' OR CONFIG_LOCATION= 'MLOLONGO' OR CONFIG_LOCATION= 'LIKONI'
)
select
   EMP_DISPLAY_NUMBER,CLK_DATE
from
    [data]
order by
   CLK_DATE desc
offset
    @page_size * (@page - 1) rows fetch next @page_size rows only;
    `;

    const rows = await odbcConnection.query(sqlQuery);

    // Log the number of rows in the result set
    console.log('Number of rows:', rows.length);

    let counter = 0; // Initialize a counter variable

    // Iterate through the rows and perform the operations
    for (const row of rows) {
      const entryid = row.EMP_DISPLAY_NUMBER;
      // Perform the UPDATE operation
      const loopUpdateSql = `
                UPDATE employees_moz
                SET yes_status='P', yes_date= ?
                WHERE entryid= ?`;

      await executeQuery(connection, loopUpdateSql, [formattedFromDate, entryid]);
      // Increment the counter with each iteration
      counter++;
    }

    // Commit the transaction if all entries are processed successfully
    await commitTransaction(connection);

    console.log('Transaction committed.');
    res.status(200).json({ message: 'Updated' });


  } catch (error) {
    console.error('Error:', error);
    // Rollback the transaction for any exception occurs
    await rollbackTransaction(connection);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    // Close MySQL connection pool and ODBC connection
    if (connection) {
      connection.release();
      console.log('Connection released.');
    }

    if (odbcConnection) {
      await odbcConnection.close();
      console.log('ODBC Connection closed.');
    }
  }
});


app.put('/worker/update-back-attendance22222222', authenticateJWT, (req, res) => {
  try {
    console.log('invoked :API');
    const daysAgo = req.body.daysAgo;
    const fromDate = req.body.fromdate;
    console.log('Pdate:', fromDate);
    const inputFormat = 'YYYY-MM-DD';
    const outputFormat = 'DD-MM-YYYY';
    const formattedFromDate = dateUtils.convertDateFormat(fromDate, inputFormat, outputFormat);
    console.log('Previous date:', formattedFromDate);
    // Initialize a flag to track the completion status
    let isComplete = true;
    const handleComplete = () => {
      if (isComplete) {
        console.log('isComplete :', isComplete);
        // Proceed with updating attendance records for LIKONI and NAKURU
        res.status(200).json({ message: 'Updated' });
      } else {
        console.log('isComplete :', isComplete);
        res.status(500).json({ message: 'Internal server error' });
      }
    };

    const updateSql = `
  UPDATE employees_moz
  SET yes_status = CASE
    WHEN entryid NOT LIKE 'LUP%' THEN 'A'
    WHEN entryid LIKE 'LUP%' THEN 'P'
  END,
  yes_date = '${formattedFromDate}'
  WHERE entryid NOT LIKE 'LUP%' OR entryid LIKE 'LUP%'`;

    db.query(updateSql, (updateError, result) => {
      if (updateError) {
        console.error('Error updating records:', updateError);
        isComplete = false;
        handleComplete();
      } else {


        // Establish the connection
        odbc.connect(odbcConnectionString, (error, connection) => {
          if (error) {
            console.error('Error connecting to SQL Server:', error);
            isComplete = false;
            handleComplete();
          }
          console.log('Connected');

          const sqlQuery = `
   set nocount on
 declare @page_size int = 6000;
 declare @page int = 1;

;with [data] as (
   select distinct
     EMP_DISPLAY_NUMBER,CLK_DATE

    from
 Style_Kenya.HRMV8.VW_INTE_LABOUR_PRODUCTIVITY
    where
 cast(CLK_DATE as Date) = CAST(GETDATE()-${daysAgo} AS date) and CONFIG_LOCATION= 'NAKURU' OR CONFIG_LOCATION= 'MLOLONGO' OR CONFIG_LOCATION= 'LIKONI'
)
select
   EMP_DISPLAY_NUMBER,CLK_DATE
from
    [data]
order by
   CLK_DATE desc
offset
    @page_size * (@page - 1) rows fetch next @page_size rows only;
    `;
          console.log(sqlQuery);
          connection.query(sqlQuery, (error, rows) => {
            if (error) {
              console.error('Error executing SQL query:', error);
              isComplete = false;
              handleComplete();
            } else {
              //console.log('Query result:', rows);
              // Log the number of rows in the result set
              console.log('Number of rows:', rows.length);
              let total_rows = rows.length; // rows 
              let counter = 0; // Initialize a counter variable
              // Iterate through the rows and perform the operations
              rows.forEach((row) => {
                const sonuc = row.EMP_DISPLAY_NUMBER;
                // Perform the UPDATE operation
                const updateSql = `
                UPDATE employees_moz
                SET yes_status='P', yes_date='${formattedFromDate}'
                WHERE entryid='${sonuc}'`;
                //console.log("Query :", updateSql);
                db.query(updateSql, (updateError) => {
                  if (updateError) {
                    console.error('Error updating record:', updateError);
                    isComplete = false;
                    handleComplete();
                  } else {
                    // Increment the counter with each iteration
                    counter++;
                    console.log('counter :', counter);
                    if (counter == total_rows) {
                      connection.close((closeError) => {
                        if (closeError) {
                          console.error('Error closing connection:', closeError);
                          isComplete = false;
                          handleComplete();
                        } else {
                          console.log('Connection closed.');
                          isComplete = true;
                          handleComplete();
                        }
                      });
                    }
                  }
                });//end of employees_moz update query

              });//end for each loop

            }
          });
        });
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Serve static files (e.g., your downloadable files)
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));


/**
 * @swagger
 * /worker/download-attendance:
 *   get:
 *     summary: Download employee attendance data as a CSV file.
 *     description: |
 *       This endpoint allows users to download employee attendance data in CSV format. The data is filtered based on certain conditions, and the resulting CSV file is provided for download.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response with the CSV file for download.
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       '500':
 *         description: Internal server error during the download process.
 *         content:
 *           application/json:
 *             example:
 *               status: "Error"
 *               message: "Server error"
 *
 * @function
 * @name downloadEmployeeAttendance
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the download process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/worker/download-attendance', authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `SELECT entryid,status,site FROM employees_moz WHERE passive_type='ACT' and roleid='1'`;

    // Use the custom promise-based query method
    const results = await executeQuery(connection, query);
    console.log(results)
    // Extract the relevant data from the database query results
    const data = results.map((row) => ({
      entryid: row.entryid,
      status: row.status,
      site: row.site,
    }));

    // Prepare CSV data
    const csvData = [
      ['entryid', 'status', 'site'],
      ...data.map((row) => Object.values(row)),
    ];

    // Create CSV file
    const fileName = 'Employee-Attendance Backup.csv';
    // Check if the directory exists, create it if not
    const csvFolderPath = path.join(__dirname, 'csv_files');
    await fs.promises.mkdir(csvFolderPath, { recursive: true });

    const filePath = path.join(csvFolderPath, fileName);
    const csvContent = csvData.map((row) => row.join(',')).join('\n');

    // Use fs.promises.writeFile for asynchronous file writing
    await fs.promises.writeFile(filePath, csvContent);

    // Check if the file is created successfully
    const fileExists = await fs.promises.access(filePath).then(() => true).catch(() => false);

    if (!fileExists) {
      console.error('Error creating the CSV file.');
      res.status(500).json({ status: 'Error', message: 'Server error' });
      return;
    }

    // Set response headers and send the file as an attachment
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ status: 'Error', message: 'Server error' });
      } else {
        console.log('File sent successfully');
        // Delete the file after it has been sent
        fs.promises.unlink(filePath).then(() => console.log('File deleted successfully'));
      }
    });
  } catch (error) {
    console.error('Error executing query or processing data:', error);
    res.status(500).json({ status: 'Error', message: 'Server error' });
  } finally {
    // Close MySQL connection pool and ODBC connection
    if (connection) {
      connection.release();
      console.log('Connection released.');
    }
  }
});


/**
 * @swagger
 * /worker/import-attendance:
 *   post:
 *     summary: Import worker attendance data from a CSV file.
 *     description: |
 *       This endpoint allows the import of worker attendance data from a CSV file. The file should contain information about workers' attendance, and the data will be processed and updated in the 'employees_moz' table in the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userfile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Successful response indicating the successful import of worker attendance data.
 *         content:
 *           application/json:
 *             example:
 *               message: "CSV processing completed"
 *       '400':
 *         description: Bad request indicating that no file was uploaded.
 *         content:
 *           application/json:
 *             example:
 *               message: "No file uploaded"
 *       '500':
 *         description: Internal server error during the import process.
 *         content:
 *           application/json:
 *             example:
 *               message: "An error occurred"
 *
 * @function
 * @name importWorkerAttendance
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the import process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post('/worker/import-attendance', authenticateJWT, upload.single('userfile'), async (req, res) => {
  let connection;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;

    const filePath = file.path;
    const parser = csv({ delimiter: ',' });

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Start a MySQL transaction
    await beginTransaction(connection);

    parser.on('readable', async () => {
      let record;
      while ((record = parser.read())) {
        //console.log('Records:', record);

        const entryid = record.entryid;
        const status = record.status;
        const site = record.site;

        //console.log('entryid:', entryid);
        //console.log('status:', status);
        //console.log('site:', site);

        try {
          const rowcheck = `SELECT * FROM employees_moz WHERE entryid="${entryid}"`;
          const result = await executeQuery(connection, rowcheck);

          if (result.length > 0) {
            //console.log('EntryId already exists!', entryid);
            const eid = result[0].id;

            try {
              // Update the record
              await executeQuery(connection, 'UPDATE employees_moz SET status=?, date=? WHERE id = ?', [status, currentDate, eid]);
              //console.log('EntryId updated', entryid);
            } catch (err4) {
              console.error('Error updating record:', err4);
              // Rollback the transaction in case of an error
              await rollbackTransaction(connection);
              res.status(500).send('Error updating record');
              return;
            }
          } else {
            console.log('EntryId does not exist!', entryid);
          }
        } catch (err) {
          console.error('Error executing query:', err);
          // Rollback the transaction in case of an error
          await rollbackTransaction(connection);
          return res.status(500).send('Error executing query');
        }
      }
    });

    parser.on('end', async () => {
      console.log('CSV parsing ended');
      // Commit the transaction when everything is complete
      await commitTransaction(connection);
      // Respond when everything is complete
      return res.status(200).json({ message: 'CSV processing completed' });
    });

    // Pipe the file stream to the parser
    fs.createReadStream(filePath).pipe(parser);

  } catch (error) {
    console.error('An error occurred:', error);
    // Rollback the transaction in case of an error
    await rollbackTransaction(connection);
    return res.status(500).json({ message: 'An error occurred' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
});



/**
 * @swagger
 * /worker/import:
 *   post:
 *     summary: Import worker data from a CSV file.
 *     description: |
 *       This endpoint allows the import of worker data from a CSV file. The file should contain information about workers, and the data will be processed and updated in the 'employees_moz' table in the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userfile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Successful response indicating the successful import of worker data.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "Data Imported Successfully!"
 *       '400':
 *         description: Bad request indicating that no file was uploaded.
 *         content:
 *           application/json:
 *             example:
 *               status: "Error"
 *               message: "No file uploaded"
 *       '500':
 *         description: Internal server error during the import process.
 *         content:
 *           application/json:
 *             example:
 *               status: "Error"
 *               message: "Database Import Error! Please check your file and its content."
 *
 * @function
 * @name importWorkerData
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the import process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post('/worker/import', authenticateJWT, upload.single('userfile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;

    const filePath = file.path;
    const parser = csv({ delimiter: ',' });

    const employees = [];

    parser.on('readable', () => {
      let record;
      while ((record = parser.read())) {
        //console.log('Records:', record); // Log the record to the console

        const entryid = record.entryid;
        const name = record.name;
        const workertype = record.workertype;
        const shift = record.shift;
        const product_name = record.product_name;
        const section = record.section;
        const site = record.site;

        // console.log('entryid:', entryid);
        // console.log('name:', name);
        // console.log('workertype:', workertype);
        // console.log('shift:', shift);
        // console.log('product_name:', product_name);
        // console.log('section:', section);
        // console.log('site:', site);

        //console.log('Record Length:', Object.keys(record).length);

        if (record) {
          employees.push({ entryid, name, workertype, shift, product_name, section, site });
        } else {
          console.log('Skipping invalid record:', record);
        }
      }
    });

    parser.on('end', () => {
      fs.unlinkSync(filePath); // Delete the uploaded file

      const data = [];
      const update_data = [];
      let i = 0;
      // Iterate through the targets
      employees.forEach((employee) => {
        const entryid2 = employee.entryid;
        const name2 = employee.name;
        const workertype2 = employee.workertype;
        const shift2 = employee.shift;
        const product_name2 = employee.product_name;
        const section2 = employee.section;
        const site2 = employee.site;
        const roleid2 = 1;

        const inputString = product_name2;
        const resultArray = inputString.split(',');
        const outputString = "'" + resultArray.join("','") + "'";


        // Query to get the product_id from the database based on productdescription
        const productQuery = `SELECT GROUP_CONCAT(id) as id FROM item_masterr WHERE item_description IN(${outputString})`;

        //console.log("productQuery:", productQuery);

        db.query(productQuery, (error, results) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ status: 'Error', message: 'Database Query Error' });
          }
          if (results.length > 0) {
            const product_id = results[0].id;
            // console.log("product_id:", product_id);
            const inputString2 = section2;
            const resultArray2 = inputString2.split(',');
            const outputString2 = "'" + resultArray2.join("','") + "'";
            //  Query to get the section_id from the database based on section
            const sectionQuery = `SELECT GROUP_CONCAT(id) as id FROM section WHERE section_name IN(${outputString2})`;
            //console.log(sectionQuery);
            db.query(sectionQuery, (error2, results2) => {
              // console.log("hiiiiiiiiiiiiii", results2);
              if (error2) {
                console.error(error2);
                return res.status(500).json({ status: 'Error', message: 'Database Query Error' });
              }

              if (results2.length > 0) {
                const section_id = results2[0].id;
                // console.log("section_id", section_id);
                console.log('entryid:', entryid2);
                console.log('name:', name2);
                console.log('workertype:', workertype2);
                console.log('shift:', shift2);
                console.log('product_name:', product_name2);
                console.log('product_id:', product_id);
                console.log('section:', section2);
                console.log('section_id:', section_id);
                console.log('site:', site2);
                console.log('roleid:', roleid2);
                console.log('date:', currentDate);
                console.log('::::::::::::::::::::::::::::::::::::');
                // Query to check for duplicates based on product_id and datetime in the target_plan table
                const duplicateCheckQuery = `SELECT id FROM employees_moz WHERE entryid = '${entryid2}'`;

                db.query(duplicateCheckQuery, (error3, results3) => {
                  if (error3) {
                    console.error(error3);
                    return res.status(500).json({ status: 'Error', message: 'Database Query Error' });
                  }

                  if (results3.length === 0) {

                    data.push({ entryid: entryid2, name: name2, roleid: roleid2, workertype: workertype2, shift: shift2, product: product_id, section_id: section_id, site: site2, date: currentDate }); // Add insert record details to the data array
                  }
                  else {
                    update_data.push({ entryid: entryid2, name: name2, roleid: roleid2, workertype: workertype2, shift: shift2, product: product_id, section_id: section_id, site: site2, date: currentDate });
                  }


                  i++;

                  // Check if all targets have been processed
                  if (i === employees.length) {
                    if (data.length > 0 || update_data.length > 0) {
                      if (data.length > 0) {
                        // insert new records
                        const insertQuery = `INSERT INTO employees_moz (entryid, name, roleid, workertype, shift, product, section_id, site, date) VALUES ?`;

                        db.query(insertQuery, [data.map(item => [item.entryid, item.name, item.roleid, item.workertype, item.shift, item.product, item.section_id, item.site, item.date])], (insertError, insertResult) => {
                          if (insertError) {
                            console.error(insertError);
                            return res.status(500).json({ status: 'Error', message: 'Database Insert Error' });
                          }

                          let j = 0;

                          if (update_data.length > 0) {
                            // Assuming update_data is an array of objects containing update information
                            update_data.forEach((item) => {
                              const updateQuery = `UPDATE employees_moz
                      SET name = '${item.name}',
                          roleid = '${item.roleid}',
                          workertype = '${item.workertype}',
                          shift = '${item.shift}',
                          product = '${item.product}',
                          section_id = '${item.section_id}',
                          site = '${item.site}',
                          date = '${item.date}'
                      WHERE entryid = '${item.entryid}'`;

                              db.query(updateQuery, (updateError, updateResult) => {
                                j++;
                                if (updateError) {
                                  console.error(updateError);
                                  return res.status(500).json({ status: 'Error', message: 'Database Update Error' });
                                }
                                if (j === update_data.length) {
                                  res.json({ status: 'Success', message: 'Data Imported Successfully!' });
                                }

                              });
                            });
                          }
                          else {
                            res.json({ status: 'Success', message: 'Data Imported Successfully!' });
                          }
                        });

                      }
                      else {

                        let j = 0;

                        // Assuming update_data is an array of objects containing update information
                        update_data.forEach((item) => {
                          const updateQuery = `UPDATE employees_moz
                      SET name = '${item.name}',
                          roleid = '${item.roleid}',
                          workertype = '${item.workertype}',
                          shift = '${item.shift}',
                          product = '${item.product}',
                          section_id = '${item.section_id}',
                          site = '${item.site}',
                          date = '${item.date}'
                      WHERE entryid = '${item.entryid}'`;

                          db.query(updateQuery, (updateError, updateResult) => {
                            j++;
                            if (updateError) {
                              console.error(updateError);
                              return res.status(500).json({ status: 'Error', message: 'Database Update Error' });
                            }
                            if (j === update_data.length) {
                              res.json({ status: 'Success', message: 'Data Imported Successfully!' });
                            }

                          });
                        });

                      }

                    }
                    else {
                      res.json({ status: 'Success', message: 'No updates or new records to insert' });
                    }
                  }
                });

              }
              else {

                i++;

                // Check if all targets have been processed
                if (i === employees.length) {
                  if (data.length > 0 || update_data.length > 0) {
                    if (data.length > 0) {
                      // insert new records
                      const insertQuery = `INSERT INTO employees_moz (entryid, name, roleid, workertype, shift, product, section_id, site, date) VALUES ?`;

                      db.query(insertQuery, [data.map(item => [item.entryid, item.name, item.roleid, item.workertype, item.shift, item.product, item.section_id, item.site, item.date])], (insertError, insertResult) => {
                        if (insertError) {
                          console.error(insertError);
                          return res.status(500).json({ status: 'Error', message: 'Database Insert Error' });
                        }

                        let j = 0;

                        if (update_data.length > 0) {
                          // Assuming update_data is an array of objects containing update information
                          update_data.forEach((item) => {
                            const updateQuery = `UPDATE employees_moz
                      SET name = '${item.name}',
                          roleid = '${item.roleid}',
                          workertype = '${item.workertype}',
                          shift = '${item.shift}',
                          product = '${item.product}',
                          section_id = '${item.section_id}',
                          site = '${item.site}',
                          date = '${item.date}'
                      WHERE entryid = '${item.entryid}'`;

                            db.query(updateQuery, (updateError, updateResult) => {
                              j++;
                              if (updateError) {
                                console.error(updateError);
                                return res.status(500).json({ status: 'Error', message: 'Database Update Error' });
                              }
                              if (j === update_data.length) {
                                res.json({ status: 'Success', message: 'Data Imported Successfully!' });
                              }

                            });
                          });
                        }
                        else {
                          res.json({ status: 'Success', message: 'Data Imported Successfully!' });
                        }
                      });

                    }
                    else {

                      let j = 0;

                      // Assuming update_data is an array of objects containing update information
                      update_data.forEach((item) => {
                        const updateQuery = `UPDATE employees_moz
                      SET name = '${item.name}',
                          roleid = '${item.roleid}',
                          workertype = '${item.workertype}',
                          shift = '${item.shift}',
                          product = '${item.product}',
                          section_id = '${item.section_id}',
                          site = '${item.site}',
                          date = '${item.date}'
                      WHERE entryid = '${item.entryid}'`;

                        db.query(updateQuery, (updateError, updateResult) => {
                          j++;
                          if (updateError) {
                            console.error(updateError);
                            return res.status(500).json({ status: 'Error', message: 'Database Update Error' });
                          }
                          if (j === update_data.length) {
                            res.json({ status: 'Success', message: 'Data Imported Successfully!' });
                          }

                        });
                      });

                    }

                  }
                  else {
                    res.json({ status: 'Success', message: 'No updates or new records to insert' });
                  }
                }
              }

            });
          } else {
            i++;

            // Check if all targets have been processed
            if (i === employees.length) {
              if (data.length > 0 || update_data.length > 0) {
                if (data.length > 0) {
                  // insert new records
                  const insertQuery = `INSERT INTO employees_moz (entryid, name, roleid, workertype, shift, product, section_id, site, date) VALUES ?`;

                  db.query(insertQuery, [data.map(item => [item.entryid, item.name, item.roleid, item.workertype, item.shift, item.product, item.section_id, item.site, item.date])], (insertError, insertResult) => {
                    if (insertError) {
                      console.error(insertError);
                      return res.status(500).json({ status: 'Error', message: 'Database Insert Error' });
                    }

                    let j = 0;

                    if (update_data.length > 0) {
                      // Assuming update_data is an array of objects containing update information
                      update_data.forEach((item) => {
                        const updateQuery = `UPDATE employees_moz
                      SET name = '${item.name}',
                          roleid = '${item.roleid}',
                          workertype = '${item.workertype}',
                          shift = '${item.shift}',
                          product = '${item.product}',
                          section_id = '${item.section_id}',
                          site = '${item.site}',
                          date = '${item.date}'
                      WHERE entryid = '${item.entryid}'`;

                        db.query(updateQuery, (updateError, updateResult) => {
                          j++;
                          if (updateError) {
                            console.error(updateError);
                            return res.status(500).json({ status: 'Error', message: 'Database Update Error' });
                          }
                          if (j === update_data.length) {
                            res.json({ status: 'Success', message: 'Data Imported Successfully!' });
                          }

                        });
                      });
                    }
                    else {
                      res.json({ status: 'Success', message: 'Data Imported Successfully!' });
                    }
                  });

                }
                else {

                  let j = 0;

                  // Assuming update_data is an array of objects containing update information
                  update_data.forEach((item) => {
                    const updateQuery = `UPDATE employees_moz
                      SET name = '${item.name}',
                          roleid = '${item.roleid}',
                          workertype = '${item.workertype}',
                          shift = '${item.shift}',
                          product = '${item.product}',
                          section_id = '${item.section_id}',
                          site = '${item.site}',
                          date = '${item.date}'
                      WHERE entryid = '${item.entryid}'`;

                    db.query(updateQuery, (updateError, updateResult) => {
                      j++;
                      if (updateError) {
                        console.error(updateError);
                        return res.status(500).json({ status: 'Error', message: 'Database Update Error' });
                      }
                      if (j === update_data.length) {
                        res.json({ status: 'Success', message: 'Data Imported Successfully!' });
                      }

                    });
                  });

                }

              }
              else {
                res.json({ status: 'Success', message: 'No updates or new records to insert' });
              }
            }
          }
        });
      });

    });

    fs.createReadStream(filePath).pipe(parser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'Error', message: 'Database Import Error! Please check your file and its content.' });
  }
});


//============================================ Worker End =====================================================

//============================================ Employe Timesheet Start =====================================================


/**
 * @swagger
 * 
  * components:
 *   schemas:
 *     WorkerTimesheet:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         product_name:
 *           type: string
 *           example: "Product Name"
 *         line:
 *           type: string
 *           example: "1"
 *         section:
 *           type: string
 *           example: "Section Name"
 *         worker:
 *           type: string
 *           example: "Worker Name"
 *         entry_id:
 *           type: string
 *           example: "unique_entry_id"
 *         shift:
 *           type: string
 *           example: "Shift Name"
 *         HOUR1:
 *           type: number
 *           format: float
 *           example: 8.5
 *         HOUR2:
 *           type: number
 *           format: float
 *           example: 7.5
 *         HOUR3:
 *           type: number
 *           format: float
 *           example: 6.5
 *         HOUR4:
 *           type: number
 *           format: float
 *           example: 8.0
 *         HOUR5:
 *           type: number
 *           format: float
 *           example: 9.0
 *         HOUR6:
 *           type: number
 *           format: float
 *           example: 7.0
 *         HOUR7:
 *           type: number
 *           format: float
 *           example: 8.5
 *         HOUR8:
 *           type: number
 *           format: float
 *           example: 6.0
 *         HOUR9:
 *           type: number
 *           format: float
 *           example: 7.5
 *         HOUR10:
 *           type: number
 *           format: float
 *           example: 8.0
 *         HOUR11:
 *           type: number
 *           format: float
 *           example: 7.0
 *         HOUR12:
 *           type: number
 *           format: float
 *           example: 6.5
 *         target:
 *           type: string
 *           example: "Target Value"
 *         remark:
 *           type: string
 *           example: "Remarks"
 *         waste:
 *           type: string
 *           example: "Waste Details"
 *         date_time:
 *           type: string
 *           example: "2024-03-01T12:00:00Z"
 *         time_stamp:
 *           type: string
 *           example: "2024-03-01T12:00:00Z"
 *         mon:
 *           type: string
 *           example: "Month"
 *         operator_id:
 *           type: string
 *           example: "Operator ID"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2024-03-01T12:00:00Z"
 *         site:
 *           type: string
 *           example: "Site Name"
 * 
 * /employee-timesheet/last-entry/{userid}/{roleid}:
 *   get:
 *     summary: Get the last timesheet entry for a specific user and role.
 *     description: |
 *       This endpoint retrieves the last timesheet entry for a specific user and role based on user ID and role ID.
 *     tags:
 *       - Employee Timesheet
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve the last timesheet entry.
 *         schema:
 *           type: integer
 *       - in: path
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve the last timesheet entry.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with the last timesheet entry.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - entry_id: 1
 *                   date_time: "2022-02-21 12:34:56"
 *                   product_name: "Product1"
 *                   section: "SectionA"
 *                   shift: "Shift1"
 *                   site: "SiteA"
 *                   item_description: "ItemDescription1"
 *                   section_name: "SectionName1"
 *               date: "2022-02-21 12:34:56"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getLastTimesheetEntry
 * @memberof module:Routes/EmployeeTimesheet
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/employee-timesheet/last-entry/:userid/:roleid', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.params.roleid;
    const userid = req.params.userid;
    //console.log('roleid:', roleid);
    //console.log('userid:', userid);

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query2 = `SELECT date_time FROM worker_timesheet ORDER BY id DESC LIMIT 1`;

    const results2 = await executeQuery(connection, query2);
    const lastDate = results2[0].date_time;

    let whereConditions = [];
    whereConditions.push(`worker_timesheet.date_time = '${lastDate}'`);
    if (roleid == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${userid}'`);
    }
    const whereClause = whereConditions.join(' AND ');
    const query = `SELECT worker_timesheet.*, item_masterr.item_description, section.section_name
                   FROM worker_timesheet
                   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
                   LEFT JOIN section ON section.id = worker_timesheet.section
                   WHERE ${whereClause}
                   GROUP BY worker_timesheet.date_time, worker_timesheet.entry_id, worker_timesheet.product_name, worker_timesheet.section, worker_timesheet.shift, worker_timesheet.site`;
    const results = await executeQuery(connection, query);

    const data = {
      timesheet: results,
      date: lastDate
    };

    res.json(data);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
});



/**
 * @swagger
 * /employee-timesheet/search:
 *   get:
 *     summary: Search for timesheet entries based on specified criteria.
 *     description: |
 *       This endpoint allows searching for timesheet entries based on criteria such as role, user, product, section, shift, site, and date range.
 *     tags:
 *       - Employee Timesheet
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to search timesheet entries.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to search timesheet entries.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: product_id
 *         description: ID of the product to filter timesheet entries.
 *         schema:
 *           type: string
 *       - in: query
 *         name: section_id
 *         description: ID of the section to filter timesheet entries.
 *         schema:
 *           type: string
 *       - in: query
 *         name: shift
 *         description: Shift name to filter timesheet entries.
 *         schema:
 *           type: string
 *       - in: query
 *         name: site
 *         description: Site name to filter timesheet entries.
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromdate
 *         required: true
 *         description: Start date for the date range (format DD/MM/YYYY).
 *         schema:
 *           type: string
 *       - in: query
 *         name: todate
 *         required: true
 *         description: End date for the date range (format DD/MM/YYYY).
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the matching timesheet entries.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - entry_id: 1
 *                   date_time: "2022-02-21 12:34:56"
 *                   product_name: "Product1"
 *                   section: "SectionA"
 *                   shift: "Shift1"
 *                   site: "SiteA"
 *                   item_description: "ItemDescription1"
 *                   section_name: "SectionName1"
 *               product: "Product1"
 *               site: "SiteA"
 *               fdate: "2022-02-21"
 *               tdate: "2022-02-28"
 *               shift: "Shift1"
 *               section: "SectionA"
 *       '400':
 *         description: Bad request, invalid date range provided.
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid date range provided"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name searchTimesheetEntries
 * @memberof module:Routes/EmployeeTimesheet
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/employee-timesheet/search', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    var product_name = req.query.product_id;
    var section = req.query.section_id;
    var shift = req.query.shift;
    var site = req.query.site;
    const fromdate = req.query.fromdate;
    const todate = req.query.todate;

    // console.log("roleid", roleid);
    // console.log("userid", userid);
    // console.log("product_name", product_name);
    // console.log("section", section);
    // console.log("shift", shift);
    // console.log("site", site);
    // console.log("fromdate", fromdate);
    // console.log("todate", todate);


    if (!fromdate || !todate) {
      res.status(400).json({ error: 'Invalid date range provided' });
      return;
    }


    const inputFormat = 'DD/MM/YYYY';
    const outputFormat = 'YYYY-MM-DD';
    const fd = dateUtils.convertDateFormat(fromdate, inputFormat, outputFormat);
    const td = dateUtils.convertDateFormat(todate, inputFormat, outputFormat);
    const newfd = dateUtils.convertToUnixTimestamp(fd);
    const newtd = dateUtils.convertToUnixTimestamp(td);


    // Log the received data
    console.log('Received data:');
    console.log('Product Name:', product_name);
    console.log('Section:', section);
    console.log('Shift:', shift);
    console.log('Site:', site);
    console.log('From Date:', fromdate);
    console.log('To Date:', todate);
    console.log('From Date fd:', fd);
    console.log('To Date td:', td);
    console.log('Converted Timestamp:', newfd);
    console.log('Converted Timestamp:', newtd);

    // Get a connection from the pool
    connection = await getPoolConnection()

    let whereConditions = [];

    if (fromdate !== '' && todate !== '' && fromdate !== undefined && todate !== undefined && fromdate != null && todate != null) {
      whereConditions.push(`worker_timesheet.time_stamp BETWEEN '${newfd}' AND '${newtd}'`);
    }
    else {
      res.status(400).json({ error: 'Invalid date range provided' });
      return;
    }


    if (product_name !== '' && product_name !== undefined && product_name != null) {
      whereConditions.push(`worker_timesheet.product_name = '${product_name}'`);
    }
    if (section !== '' && section !== undefined && section != null) {
      whereConditions.push(`worker_timesheet.section = '${section}'`);
    }
    if (shift !== '' && shift !== undefined && shift != null) {
      whereConditions.push(`worker_timesheet.shift = '${shift}'`);
    }
    if (site !== '' && site !== undefined && site != null) {
      whereConditions.push(`worker_timesheet.site = '${site}'`);
    }
    if (roleid == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${userid}'`);
    }


    const whereClause = whereConditions.join(' AND ');


    const query = `SELECT worker_timesheet.*, item_masterr.item_description, section.section_name
                   FROM worker_timesheet
                   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
                   LEFT JOIN section ON section.id = worker_timesheet.section
                   WHERE ${whereClause}
                   GROUP BY worker_timesheet.date_time, worker_timesheet.entry_id, worker_timesheet.product_name, worker_timesheet.section, worker_timesheet.shift, worker_timesheet.site`;
    //console.log(query);
    const results = await executeQuery(connection, query);
    const data = {
      timesheet: results,
      product: product_name,
      site: site,
      fdate: fd,
      tdate: td,
      shift: shift,
      section: section
    };

    res.json(data);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
});



/**
 * @swagger
 * /employee-timesheet/productions/{roleid}/{userid}:
 *   get:
 *     summary: Get production details for a specific role and user.
 *     description: |
 *       This endpoint retrieves production details for a specific role and user. The response includes information about timesheet entries, item descriptions, and summarized values.
 *     tags:
 *       - Employee Timesheet
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve production details.
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve production details.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with production details.
 *         content:
 *           application/json:
 *             example:
 *               - entry_id: 1
 *                 date_time: "2022-02-21 12:34:56"
 *                 product_name: "Product1"
 *                 item_description: "ItemDescription1"
 *                 value_sum: 50
 *                 target_sum: 100
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "An error occurred"
 *
 * @function
 * @name getProductionDetails
 * @memberof module:Routes/EmployeeTimesheet
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get("/employee-timesheet/productions/:roleid/:userid", authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleId = req.params.roleid;
    const userId = req.params.userid;

    // Get a connection from the pool
    connection = await getPoolConnection();

    let query = `
    SELECT worker_timesheet.*,item_masterr.item_description,SUM(worker_timesheet.HOUR1+worker_timesheet.HOUR2+worker_timesheet.HOUR3+worker_timesheet.HOUR4+worker_timesheet.HOUR5+worker_timesheet.HOUR6+worker_timesheet.HOUR7+worker_timesheet.HOUR8+worker_timesheet.HOUR9+worker_timesheet.HOUR10+worker_timesheet.HOUR11+worker_timesheet.HOUR12) as value_sum,SUM(worker_timesheet.target) as target_sum
    FROM worker_timesheet
    LEFT JOIN item_masterr ON worker_timesheet.product_name = item_masterr.id
    WHERE worker_timesheet.date_time=?
    GROUP BY worker_timesheet.product_name
    `;
    if (roleId == 3) {
      query = `
    SELECT worker_timesheet.*,item_masterr.item_description,SUM(worker_timesheet.HOUR1+worker_timesheet.HOUR2+worker_timesheet.HOUR3+worker_timesheet.HOUR4+worker_timesheet.HOUR5+worker_timesheet.HOUR6+worker_timesheet.HOUR7+worker_timesheet.HOUR8+worker_timesheet.HOUR9+worker_timesheet.HOUR10+worker_timesheet.HOUR11+worker_timesheet.HOUR12) as value_sum,SUM(worker_timesheet.target) as target_sum
    FROM worker_timesheet
    LEFT JOIN item_masterr ON worker_timesheet.product_name = item_masterr.id
    WHERE worker_timesheet.date_time=? AND worker_timesheet.operator_id=?
    GROUP BY worker_timesheet.product_name
    `;
    }
    const result = await executeQuery(connection, query, [currentDate, userId]);

    // Send the response to the client.
    res.send(result);

  } catch (error) {
    /**
     * Handle exceptions and send an appropriate response.
     * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
     */
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
});



/**
 * @swagger
 * /employee-timesheet/update:
 *   put:
 *     summary: Update timesheet entry field by ID.
 *     description: |
 *       This endpoint allows updating a specific field of a timesheet entry identified by its ID.
 *     tags:
 *       - Employee Timesheet
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID of the timesheet entry to be updated.
 *               field:
 *                 type: string
 *                 description: Field name to be updated (e.g., 'HOUR1', 'HOUR2', 'HOUR3').
 *               value:
 *                 type: number
 *                 description: New value for the specified field.
 *     responses:
 *       '200':
 *         description: Successful response after updating the timesheet entry.
 *         content:
 *           application/json:
 *             example:
 *               message: "Updated successfully."
 *       '500':
 *         description: Internal server error during the update process.
 *         content:
 *           application/json:
 *             example:
 *               error: "An error occurred while updating the timesheet entry."
 *
 * @function
 * @name updateTimesheetEntry
 * @memberof module:Routes/EmployeeTimesheet
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the update process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put('/employee-timesheet/update', authenticateJWT, async (req, res) => {
  let connection;
  try {
    // The JSON data sent from the client will be available in req.body
    const dataReceived = req.body;
    // Access the 'id' from the received data
    const id = dataReceived.id;
    const field = dataReceived.field;
    let value = dataReceived.value;
    if (value === '' || value === null || value === undefined) {
      value = 0;
      console.log('Value is empty, null, or undefined');
    }
    //console.log('id:', id);
    //console.log('field:', field);
    //console.log('value:', value);

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `UPDATE worker_timesheet SET ${field} = ? WHERE id = ?`;
    const params = [value, id];

    // Use the custom promise-based query method
    await executeQuery(connection, query, params);

    res.json({ message: 'Updated successfully.' });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
});


/**
 * @swagger
 * /employee-timesheet/delete/{id}:
 *   delete:
 *     summary: Delete timesheet entry by ID.
 *     description: |
 *       This endpoint allows deleting a timesheet entry based on its ID.
 *     tags:
 *       - Employee Timesheet
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the timesheet entry to be deleted.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response after deleting the timesheet entry.
 *         content:
 *           application/json:
 *             example:
 *               message: "Data deleted successfully."
 *               deleted_id: 123  # Replace with the actual ID deleted
 *       '500':
 *         description: Internal server error during the deletion process.
 *         content:
 *           application/json:
 *             example:
 *               error: "An error occurred while deleting the data."
 *
 * @function
 * @name deleteTimesheetEntry
 * @memberof module:Routes/EmployeeTimesheet
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the deletion process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.delete("/employee-timesheet/delete/:id", authenticateJWT, async (req, res) => {
  let connection;
  try {
    const id = req.params.id;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = "DELETE FROM worker_timesheet WHERE id = ?";
    const params = [id];

    // Use the custom promise-based query method
    const result = await executeQuery(connection, query, params);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Data not found.' });
    } else {
      res.json({ message: 'Data deleted successfully.', deleted_id: id });
    }
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
});



/**
 * @swagger
 * /employee-timesheet/filter:
 *   get:
 *     summary: Filter employee timesheet entries based on criteria.
 *     description: |
 *       This endpoint allows filtering employee timesheet entries based on various criteria, including product, section, shift, hour, site, and userid.
 *     tags:
 *       - Employee Timesheet
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: shift
 *         required: true
 *         description: The shift duration in hours.
 *         schema:
 *           type: number
 *       - in: query
 *         name: hour
 *         required: true
 *         description: The specified hour for filtering.
 *         schema:
 *           type: string
 *       - in: query
 *         name: product_name
 *         required: true
 *         description: The name of the product for filtering.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: section
 *         required: true
 *         description: The section for filtering.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: site
 *         required: true
 *         description: The site for filtering.
 *         schema:
 *           type: string
 *       - in: query
 *         name: userid
 *         required: true
 *         description: The user ID for filtering.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with filtered employee timesheet data.
 *         content:
 *           application/json:
 *             example:
 *               r: 5
 *               target: 8
 *               hour: "8"
 *               product: "Product Name"
 *               section: "Section Name"
 *               employees_not_asigned: false
 *               site: "Site Name"
 *               date: "2024-02-28"
 *               op_id: "user123"
 *               shiftt: 8
 *               tdate: "2024-02-28"
 *               productid: "product123"
 *               sectionid: "section123"
 *               presents: [...]
 *               absents: [...]
 *               totalResults: [...]
 *               not_working_emps: "emp1,emp2"
 *       '400':
 *         description: Bad request due to missing or invalid parameters.
 *         content:
 *           application/json:
 *             example:
 *               error: "No product provided."
 *       '500':
 *         description: Internal server error during the filtering process.
 *         content:
 *           application/json:
 *             example:
 *               error: "An error occurred during filtering."
 *
 * @function
 * @name filterEmployeeTimesheet
 * @memberof module:Routes/EmployeeTimesheet
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the filtering process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/employee-timesheet/filter', authenticateJWT, async (req, res) => {
  let connection;
  try {

    const shift = parseFloat(req.query.shift);
    const shf = Math.round(shift * 100) / 100;
    const shf1 = shift + 'HRS';
    const hour = req.query.hour;
    const product = req.query.product_name;
    const section = req.query.section;
    const site = req.query.site;
    const op_id = req.query.userid;

    // Log the received data
    console.log('Received data:');
    console.log('Product Name:', product);
    console.log('Section:', section);
    console.log('Shift:', shf);
    console.log('Hour:', hour);
    console.log('Site:', site);
    console.log('userid:', op_id);

    console.log('currentDate:', currentDate);
    if (product !== '') {
      var y_date = '';
      const data = {
        r: 0,
        target: 0,
        hour: hour,
        product: '',
        section: '',
        employees_not_asigned: true,
        site: site,
        date: '',
        op_id: op_id,
        shiftt: shift,
        tdate: '',
        productid: product,
        sectionid: section,
        presents: [],
        absents: [],
        totalResults: []
      };

      const targetColumn = shift === 9 ? 'target' : 'n_target';

      // Get a connection from the pool
      connection = await getPoolConnection();

      const query1 = `
    SELECT im.item_description as item_description, s.section_name as section_name,ism.${targetColumn} AS target 
    FROM item_section_moz  ism
    INNER JOIN item_masterr im ON ism.item_id = im.id
    INNER JOIN section s ON ism.section_id = s.id
    WHERE ism.item_id = ? AND ism.section_id = ?
`;

      // Use the custom promise-based query method
      const results1 = await executeQuery(connection, query1, [product, section]);

      if (results1.length > 0) {
        const target = results1[0].target;
        data.target = target;
      }

      const result2 = await executeQuery(connection, 'SELECT * FROM employees_moz ORDER BY id ASC LIMIT 1');
      if (result2.length > 0) {
        y_date = result2[0].yes_date;
        data.date = y_date;
        data.tdate = y_date;
      }

      let query3 = `SELECT * FROM worker_timesheet 
              WHERE product_name = ? AND section = ? AND shift = ? AND ${hour} > 0 AND date_time = ? AND site = ?`;
      const results3 = await executeQuery(connection, query3, [product, section, shift, y_date, site]);
      const r = results3.length;
      data.r = r;

      // Construct the WHERE clause based on the given conditions
      let where = `employees_moz.roleid = 1 AND employees_moz.passive_type = 'ACT' AND employees_moz.yes_date = '${y_date}'`;

      if (product !== '' && product !== undefined && product != null) {
        where += ` AND find_in_set(${product}, employees_moz.product)`;
      }
      if (section !== '' && section !== undefined && section != null) {
        where += ` AND find_in_set(${section}, employees_moz.section_id)`;
      }
      if (shift !== '' && shift !== undefined && shift != null) {
        where += ` AND employees_moz.shift = '${shf1}'`;
      }
      if (site !== '' && site !== undefined && site != null) {
        where += ` AND employees_moz.site = '${site}'`;
      }
      // Construct the main SELECT query
      const mainQuery = `SELECT name,entryid,yes_status FROM employees_moz WHERE ${where} ORDER BY name ASC`;

      const results4 = await executeQuery(connection, mainQuery);
      if (results4.length > 0) {
        data.employees_not_asigned = false;
      }

      const all_entry_ids = results4.map(row => `'${row.entryid}'`);
      //console.log("all_entry_ids :", all_entry_ids);

      const absents = results4.filter(row => row.yes_status !== 'P').map(row => row.entryid);
      const presents = results4.filter(row => row.yes_status === 'P');
      //console.log('Query 4 Results:', results4);

      // Add the query3 results to the data object
      data.totalResults = results4;
      data.absents = absents;
      data.absentEntryIds = absents;
      data.presents = presents;


      let where2 = `product_name = '${product}' AND section = '${section}' AND shift = '${shift}' AND site = '${site}' AND date_time = '${y_date}'`;

      if (all_entry_ids.length > 0) {
        const entryIdsString = all_entry_ids.join(',');
        where2 += ` AND entry_id NOT IN(${entryIdsString})`;
      }

      let fquery = `SELECT GROUP_CONCAT(DISTINCT entry_id) AS entry_ids FROM worker_timesheet WHERE ${where2}`;

      const results5 = await executeQuery(connection, fquery);

      var not_working_emps = '';
      if (results5.length > 0) {
        not_working_emps = results5[0].entry_ids != null ? results5[0].entry_ids : '';
      }

      data.not_working_emps = not_working_emps;
      res.json(data);

    }
    else {
      // No product provided
      console.log('No product provided.');
      res.status(400).json({ error: 'No product provided.' });
    }
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
});


/**
 * @swagger
 * /employee-timesheet/add:
 *   post:
 *     summary: Add employee timesheet entries.
 *     description: |
 *       This endpoint allows adding employee timesheet entries based on the provided data.
 *     tags:
 *       - Employee Timesheet
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             - worker_names: 'MJ kumar'
 *               emp_ids: 'ST234321'
 *               shifts: '9'
 *               user_id: '9'
 *               site: 'NAKURU'
 *               productid: '1'
 *               sectionid: '1'
 *               product_name: 'REGULAR PONY'
 *               section: 'YAKI'
 *               hour: 'HOUR1'
 *               target: '540'
 *               y_date: '28-02-2024'
 *               completes: '54'
 *               remarks: 'ok'
 *               wastes: '4'
 *             - worker_names: 'Manoj Kumar Jena'
 *               emp_ids: 'ST233434'
 *               shifts: '9'
 *               user_id: '9'
 *               site: 'NAKURU'
 *               productid: '1'
 *               sectionid: '1'
 *               product_name: 'REGULAR PONY'
 *               section: 'YAKI'
 *               hour: 'HOUR1'
 *               target: '540'
 *               y_date: '28-02-2024'
 *               completes: '54'
 *               remarks: 'OK'
 *               wastes: '0.4'
 *     responses:
 *       '200':
 *         description: Successful response indicating data has been updated and inserted.
 *         content:
 *           application/json:
 *             example:
 *               message: 'Data updated and inserted'
 *       '500':
 *         description: Internal server error during the data update and insertion process.
 *         content:
 *           application/json:
 *             example:
 *               error: 'An error occurred'
 *
 * @function
 * @name addEmployeeTimesheet
 * @memberof module:Routes/EmployeeTimesheet
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the data update and insertion process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post('/employee-timesheet/add', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const tableData = req.body;
    console.log("tableData:: ", tableData);
    const worker_names = tableData.map((data) => data.worker_names);
    const emp_ids = tableData.map((data) => data.emp_ids);
    const shifts = tableData.map((data) => data.shifts);
    const user_id = tableData.map((data) => data.user_id);
    const site = tableData.map((data) => data.site);
    const productid = tableData.map((data) => data.productid);
    const sectionid = tableData.map((data) => data.sectionid);
    const hour = tableData.map((data) => data.hour);
    const target = tableData.map((data) => data.target);
    const completes = tableData.map((data) => data.completes);
    const remarks = tableData.map((data) => data.remarks);
    const wastes = tableData.map((data) => data.wastes);
    const y_dates = tableData.map((data) => data.y_date);

    const y_date = y_dates[0];
    console.log("date", y_date);
    const month = dateUtils.getMonthYearFromDate(y_date);
    console.log("month", month);
    const inputFormat = 'DD-MM-YYYY';
    const outputFormat = 'YYYY-MM-DD';
    const fd = dateUtils.convertDateFormat(y_date, inputFormat, outputFormat);
    const timestamp = dateUtils.convertToUnixTimestamp(fd);
    console.log("timestamp", timestamp);

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Start a MySQL transaction
    await beginTransaction(connection);

    const rows = await executeQuery(connection,
      'SELECT * FROM worker_timesheet WHERE product_name IN (?) AND section IN (?) AND site IN (?) AND shift IN (?) AND date_time = ? AND entry_id IN (?)',
      [productid, sectionid, site, shifts[0], y_date, emp_ids]
    );

    const data = [];
    const datai = [];
    const emp_idss = [...emp_ids];

    rows.forEach((row) => {
      if (emp_ids.includes(row.entry_id)) {
        const key = emp_ids.indexOf(row.entry_id);
        const k = emp_idss.indexOf(row.entry_id);
        emp_idss.splice(k, 1);
        const hr = hour[key];
        const re = row.remark;
        const rarray = re.split(',');
        rarray.splice(hr - 1, 0, remarks[key]);
        const rmark = rarray.join(',');
        const w = row.waste;
        const warray = w.split(',');
        warray.splice(hr - 1, 0, wastes[key]);
        const wst = warray.join(',');

        data.push({
          id: row.id,
          [hr]: completes[key],
          remark: rmark,
          waste: wst,
        });
      }
    });

    // console.log(data);
    // return;

    emp_idss.forEach((val) => {
      if (emp_ids.includes(val)) {
        const key = emp_ids.indexOf(val);
        const hr = hour[key];
        const re = ',,,,,,,,,,,,';
        const rarray = re.split(',');
        rarray.splice(hr - 1, 0, remarks[key]);
        const rmark = rarray.join(',');
        const w = ',,,,,,,,,,,,';
        const warray = w.split(',');
        warray.splice(hr - 1, 0, wastes[key]);
        const wst = warray.join(',');

        datai.push({
          product_name: productid[key],
          //line: line[key],
          section: sectionid[key],
          //day_night: day_night[key],
          shift: shifts[key],
          worker: worker_names[key],
          entry_id: emp_ids[key],
          [hr]: completes[key],
          target: target[key],
          date_time: y_date,
          time_stamp: timestamp,
          mon: month,
          operator_id: user_id[key],
          remark: rmark,
          waste: wst,
          site: site[key],
        });
      }
    });

    const updatePromises = data.map(async (row) => {
      const id = row.id;
      delete row.id;
      await executeQuery(connection, 'UPDATE worker_timesheet SET ? WHERE id = ?', [row, id]);
    });

    const insertPromises = datai.map(async (row) => {
      await executeQuery(connection, 'INSERT INTO worker_timesheet SET ?', row);
    });

    await Promise.all([...updatePromises, ...insertPromises]);

    // Commit the transaction if everything is successful
    await commitTransaction(connection);

    res.send('Data updated and inserted');
  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    // If a record with the same details exists, send a duplication response
    await rollbackTransaction(connection);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
});


/**
 * @swagger
 * /employee-timesheet/data-accuracy-today:
 *   get:
 *     summary: Get employee timesheet data accuracy details for today.
 *     description: |
 *       This endpoint retrieves employee timesheet data accuracy details for the current date.
 *     tags:
 *       - Employee Timesheet
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve data accuracy details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve data accuracy details.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with employee timesheet data accuracy details for today.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - date_time: "2023-06-23"
 *                   entry_id: "123"
 *                   product_name: "ProductA"
 *                   section: "SectionA"
 *                   shift: "Morning"
 *                   site: "SiteA"
 *                   item_description: "ItemDescriptionA"
 *                   section_name: "SectionA"
 *                   value_sum: 1.75
 *               date: "2023-06-23"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getEmployeeTimesheetDataAccuracyToday
 * @memberof module:Routes/EmployeeTimesheet
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/employee-timesheet/data-accuracy-today', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    console.log('roleid:', roleid);
    console.log('userid:', userid);
    let whereConditions = [];
    //var cc = '22-01-2024';
    whereConditions.push(`worker_timesheet.date_time = '${currentDate}'`);
    if (roleid == 3) {
      //whereConditions.push(`worker_timesheet.operator_id = '${userid}'`);
    }
    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `SELECT worker_timesheet.*, item_masterr.item_description, section.section_name,((HOUR1+HOUR2+HOUR3+HOUR4+HOUR5+HOUR6+HOUR7+HOUR8+HOUR9+HOUR10+HOUR11+HOUR12) / target) AS value_sum
                   FROM worker_timesheet
                   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
                   LEFT JOIN section ON section.id = worker_timesheet.section
                   WHERE ${whereClause}
                   GROUP BY worker_timesheet.date_time, worker_timesheet.entry_id, worker_timesheet.product_name, worker_timesheet.section, worker_timesheet.shift, worker_timesheet.site HAVING (value_sum * 100) > 150`;

    const results = await executeQuery(connection, query);

    const data = {
      timesheet: results,
      date: currentDate
    };
    // console.log(data);
    res.json(data);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
});



/**
 * @swagger
 * /employee-timesheet/data-accuracy-filter:
 *   get:
 *     summary: Get employee timesheet data accuracy details with filtering options.
 *     description: |
 *       This endpoint retrieves employee timesheet data accuracy details based on filtering options.
 *     tags:
 *       - Employee Timesheet
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve data accuracy details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve data accuracy details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: product_id
 *         description: ID of the product for filtering.
 *         schema:
 *           type: string
 *       - in: query
 *         name: section_id
 *         description: ID of the section for filtering.
 *         schema:
 *           type: string
 *       - in: query
 *         name: shift
 *         description: Shift for filtering.
 *         schema:
 *           type: string
 *       - in: query
 *         name: site
 *         description: Site for filtering.
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromdate
 *         required: true
 *         description: Start date for filtering (format- DD/MM/YYYY).
 *         schema:
 *           type: string
 *       - in: query
 *         name: todate
 *         required: true
 *         description: End date for filtering (format- DD/MM/YYYY).
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with employee timesheet data accuracy details and filtering options.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - date_time: "2023-06-23"
 *                   entry_id: "123"
 *                   product_name: "ProductA"
 *                   section: "SectionA"
 *                   shift: "Morning"
 *                   site: "SiteA"
 *                   item_description: "ItemDescriptionA"
 *                   section_name: "SectionA"
 *                   value_sum: 1.75
 *               product: "ProductA"
 *               site: "SiteA"
 *               fdate: "2023-06-23"
 *               tdate: "2023-06-30"
 *               shift: "Morning"
 *               section: "SectionA"
 *       '400':
 *         description: Invalid date range provided.
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid date range provided"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getEmployeeTimesheetDataAccuracyFilter
 * @memberof module:Routes/EmployeeTimesheet
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InvalidDateRangeError} Will throw an error if an invalid date range is provided.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/employee-timesheet/data-accuracy-filter', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    var product_name = req.query.product_id;
    var section = req.query.section_id;
    var shift = req.query.shift;
    var site = req.query.site;
    const fromdate = req.query.fromdate;
    const todate = req.query.todate;

    if (!fromdate || !todate) {
      res.status(400).json({ error: 'Invalid date range provided' });
      return;
    }

    console.log('roleid:', roleid);
    console.log('userid:', userid);

    const inputFormat = 'DD/MM/YYYY';
    const outputFormat = 'YYYY-MM-DD';
    const fd = dateUtils.convertDateFormat(fromdate, inputFormat, outputFormat);
    const td = dateUtils.convertDateFormat(todate, inputFormat, outputFormat);
    const newfd = dateUtils.convertToUnixTimestamp(fd);
    const newtd = dateUtils.convertToUnixTimestamp(td);

    // Log the received data
    console.log('Received data:');
    console.log('Product Name:', product_name);
    console.log('Section:', section);
    console.log('Shift:', shift);
    console.log('site:', site);
    console.log('From Date:', fromdate);
    console.log('To Date:', todate);
    console.log('From Date fd:', fd);
    console.log('To Date td:', td);
    console.log('Converted Timestamp:', newfd);
    console.log('Converted Timestamp:', newtd);

    let whereConditions = [];

    if (fromdate !== '' && todate !== '' && fromdate !== undefined && todate !== undefined && fromdate != null && todate != null) {
      whereConditions.push(`worker_timesheet.time_stamp BETWEEN '${newfd}' AND '${newtd}'`);
    }
    else {
      res.status(400).json({ error: 'Invalid date range provided' });
      return;
    }

    if (product_name !== '' && product_name !== undefined && product_name != null) {
      whereConditions.push(`worker_timesheet.product_name = '${product_name}'`);
    }
    if (section !== '' && section !== undefined && section != null) {
      whereConditions.push(`worker_timesheet.section = '${section}'`);
    }
    if (shift !== '' && shift !== undefined && shift != null) {
      whereConditions.push(`worker_timesheet.shift = '${shift}'`);
    }
    if (site !== '' && site !== undefined && site != null) {
      whereConditions.push(`worker_timesheet.site = '${site}'`);
    }

    if (roleid == 3) {
      //whereConditions.push(`worker_timesheet.operator_id = '${userid}'`);
    }



    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `
   SELECT worker_timesheet.*, item_masterr.item_description, section.section_name,((HOUR1+HOUR2+HOUR3+HOUR4+HOUR5+HOUR6+HOUR7+HOUR8+HOUR9+HOUR10+HOUR11+HOUR12) / target) AS value_sum
                   FROM worker_timesheet
                   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
                   LEFT JOIN section ON section.id = worker_timesheet.section
                   WHERE ${whereClause}
                   GROUP BY worker_timesheet.date_time,worker_timesheet.entry_id,worker_timesheet.product_name,worker_timesheet.section,worker_timesheet.shift,worker_timesheet.site HAVING (value_sum * 100) > 150`;

    //console.log(query);

    const results = await executeQuery(connection, query);

    const data = {
      timesheet: results,
      product: product_name,
      site: site,
      fdate: fd,
      tdate: td,
      shift: shift,
      section: section
    };

    res.json(data);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
});

//============================================ Employe Timesheet End =====================================================

//============================================ FG Output Start =====================================================

/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     FgDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         product_name:
 *           type: string
 *           example: "Product Name"
 *         line:
 *           type: string
 *           example: "1"
 *         product_code:
 *           type: integer
 *           example: 12345
 *         hour:
 *           type: string
 *           example: "12:00 PM"
 *         shift:
 *           type: string
 *           example: "Shift Name"
 *         fg_output:
 *           type: string
 *           example: "Output Details"
 *         waste_weight:
 *           type: integer
 *           example: 10
 *         user:
 *           type: string
 *           example: "User Name"
 *         date_time:
 *           type: string
 *           example: "2024-03-01T12:00:00Z"
 *         time_stamp:
 *           type: string
 *           example: "2024-03-01T12:00:00Z"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2024-03-01T12:00:00Z"
 *         site:
 *           type: string
 *           example: "Site Name"
 * 
 * /fg-output/add:
 *   post:
 *     summary: Add FG output details.
 *     description: |
 *       This endpoint allows adding FG output details based on the provided data.
 *     tags:
 *       - FG Output
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             product_name: '1'
 *             color_description: '2'
 *             shift: '9'
 *             fgoutput: 100
 *             site: 'NAKURU'
 *             hour: 'HOUR1'
 *             date: '28/02/2024'
 *             roleid: '5'
 *             userid: '9'
 *     responses:
 *       '200':
 *         description: Successful response indicating the FG output details were added.
 *         content:
 *           application/json:
 *             example:
 *               status: 'Success'
 *               message: 'Insert operation successful'
 *       '400':
 *         description: Bad request due to failed insert operation.
 *         content:
 *           application/json:
 *             example:
 *               status: 'Error'
 *               message: 'Insert operation failed'
 *       '409':
 *         description: Conflict, indicating that production has not started or FG output for the given product, shift, and site already added on the specified date.
 *         content:
 *           application/json:
 *             example:
 *               status: 'Error'
 *               message: 'Production for this product, shift, and site on specified date not started or FG output already added for this Product Name on specified date'
 *       '500':
 *         description: Internal server error during the data validation and insertion process.
 *         content:
 *           application/json:
 *             example:
 *               status: 'Error'
 *               message: 'Database error'
 *
 * @function
 * @name addFGOutput
 * @memberof module:Routes/FGOutput
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the data validation and insertion process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post('/fg-output/add', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const product = req.body.product_name;
    const code = req.body.color_description;
    const shift = req.body.shift;
    const fg_output = req.body.fgoutput;
    const site = req.body.site;
    const hour = req.body.hour;
    const date = req.body.date;
    const roleid = req.body.roleid;
    const userid = req.body.userid;

    const inputFormat = 'DD/MM/YYYY';
    const outputFormat = 'YYYY-MM-DD';
    const outputFormat2 = 'DD-MM-YYYY';
    const td = dateUtils.convertDateFormat(date, inputFormat, outputFormat);
    const timestampInSeconds = dateUtils.convertToUnixTimestamp(td);
    const formattedDate = dateUtils.convertDateFormat(date, inputFormat, outputFormat2);

    console.log(product, code, shift, fg_output, site, hour, formattedDate, timestampInSeconds);

    // Get a connection from the pool
    connection = await getPoolConnection();


    const productCheckQuery = `SELECT * FROM worker_timesheet WHERE product_name = ? AND shift = ? AND date_time = ? AND site = ?`;
    const checkValues = [product, shift, formattedDate, site];

    const productResult = await executeQuery(connection, productCheckQuery, checkValues);

    if (productResult.length === 0) {
      return res.status(409).send(`Production for this product,shift and site in ${formattedDate} not started !!!`);
    }
    const selectQuery = `SELECT * FROM fg_details WHERE product_name = ? AND product_code = ? AND shift = ? AND hour = ? AND date_time = ?`;
    const values = [product, code, shift, hour, formattedDate];

    const selectResult = await executeQuery(connection, selectQuery, values);

    if (selectResult.length > 0) {
      return res.status(409).send(`Sorry, for ${formattedDate} you have already added the FG OUTPUT for this Product Name!!!`);
    }

    const insertData = {
      product_name: product,
      shift: shift,
      product_code: code,
      hour: hour,
      fg_output: fg_output,
      site: site,
      user: userid,
      date_time: formattedDate,
      time_stamp: timestampInSeconds,
    };

    const insertQuery = 'INSERT INTO fg_details SET ?';

    const insertResult = await executeQuery(connection, insertQuery, insertData);

    if (insertResult) {
      // Insert operation successful
      const successResponse = { status: 'Success', message: 'Insert operation successful' };
      return res.status(200).json(successResponse);
    } else {
      // No rows were affected (insert operation failed)
      const failureResponse = { status: 'Error', message: 'Insert operation failed' };
      return res.status(400).json(failureResponse);
    }

  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
});



/**
 * @swagger
 * /fg-output/update:
 *   put:
 *     summary: Update FG output details.
 *     description: |
 *       This endpoint allows updating FG output details based on the provided data.
 *     tags:
 *       - FG Output
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             id: 2352
 *             product_name: '1'
 *             shift: '9'
 *             code: 'RP0001'
 *             color_description: '2'
 *             hour: 'HOUR1'
 *             fgoutput: 100
 *             site: 'NAKURU'
 *             date_time: '28-02-2024'
 *     responses:
 *       '200':
 *         description: Successful response indicating the FG output details were updated.
 *         content:
 *           application/json:
 *             example:
 *               status: 'Success'
 *               message: 'FG output updated successfully'
 *       '400':
 *         description: Bad request due to failed update operation or FG output already exists for the given parameters.
 *         content:
 *           application/json:
 *             example:
 *               status: 'Error'
 *               message: 'FG data already exists for date and hour'
 *       '500':
 *         description: Internal server error during the data validation and update process.
 *         content:
 *           application/json:
 *             example:
 *               status: 'Error'
 *               message: 'Internal server error'
 *
 * @function
 * @name updateFGOutput
 * @memberof module:Routes/FGOutput
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the data validation and update process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put('/fg-output/update', authenticateJWT, async (req, res) => {
  let connection;
  try {
    // const cid = req.params.id;
    const {
      id,
      product_name,
      shift,
      code,
      color_description,
      hour,
      fgoutput,
      site,
      date_time
    } = req.body;

    //const product_code =1;

    console.log(id);
    console.log(product_name);
    console.log(shift);
    console.log(code);
    console.log(hour);
    console.log(fgoutput);
    console.log(site);
    console.log(color_description);

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Check if FG output already exists for the given parameters
    const query = `
    SELECT * 
    FROM fg_details 
    WHERE product_name = ? 
      AND product_code = ? 
      AND shift = ? 
      AND hour = ? 
      AND date_time = ?
      AND id != ?
  `;
    const values = [product_name, color_description, shift, hour, date_time, id];

    const rows = await executeQuery(connection, query, values);

    if (rows.length > 0) {
      res.status(409).send(`FG data already exists for date ${date_time} and hour ${hour}`);
    }
    // Update FG output
    const updateQuery = `
        UPDATE fg_details 
        SET product_name = ?, shift = ?, product_code = ?, hour = ?, fg_output = ? ,site = ? 
        WHERE id = ?
      `;
    const updateValues = [product_name, shift, color_description, hour, fgoutput, site, id];

    await executeQuery(connection, updateQuery, updateValues);

    // Handle success response
    res.json({ status: 'Success', message: 'FG output updated successfully' });
  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
});


/**
 * @swagger
 * /fg-output/{id}:
 *   get:
 *     summary: Get details of a specific FG output entry.
 *     description: |
 *       This endpoint allows retrieving details of a specific FG output entry based on the provided ID.
 *     tags:
 *       - FG Output
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the FG output entry to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with details of the specified FG output entry.
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               product_name: 'Product Name'
 *               shift: 'Shift Name'
 *               code: 'Color Code'
 *               color_description: 'Color Description'
 *               hour: 'HOUR1'
 *               fg_output: 100
 *               site: 'Site Name'
 *               date_time: '28-02-2024'
 *               pcode: 'Product Code'
 *       '404':
 *         description: Not Found error indicating that the specified FG output entry was not found.
 *         content:
 *           application/json:
 *             example:
 *               error: 'FG data not found'
 *       '500':
 *         description: Internal server error during the data retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               error: 'Internal server error'
 *
 * @function
 * @name getFGOutputById
 * @memberof module:Routes/FGOutput
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the data retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/fg-output/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const id = req.params.id;
    console.log(id);

    // Query the fg_details table with the provided ID
    //const query = `SELECT * FROM fg_details WHERE id = ${id}`;
    // Query the fg_details table with the provided ID and join with the item_code table
    /* const query = `
      SELECT fg_details.*, item_code.product_code, item_code.product_des
      FROM fg_details
      JOIN item_code ON fg_details.product_code = item_code.id
      WHERE fg_details.id = ${id}
    `; */

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `
  SELECT fg_details.*, item_code.product_code as pcode
  FROM fg_details
  LEFT JOIN item_code ON fg_details.product_code = item_code.id
  WHERE fg_details.id =?
`;

    const rows = await executeQuery(connection, query, [id]);


    if (rows.length === 0) {
      res.status(404).json({ error: 'FG data not found' });
    } else {
      // Send the retrieved data as the response
      res.json(rows[0]);
    }

  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /fg-output:
 *   get:
 *     summary: Get a list of FG output entries based on specified filters.
 *     description: |
 *       This endpoint allows retrieving a list of FG output entries based on specified filters, such as `roleid`, `userid`, and `type`.
 *     tags:
 *       - FG Output
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: The role ID used for filtering FG output entries.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: The user ID used for filtering FG output entries.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         required: true
 *         description: The type of filtering, either 'default' or 'search'.
 *         schema:
 *           type: string
 *           enum: [default, search]
 *       - in: query
 *         name: date
 *         description: The date(DD/MM/YYYY) used for filtering FG output entries (required when type is 'search').
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: Successful response with a list of FG output entries based on specified filters.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 product_name: 'Product Name'
 *                 product_des: 'Product Description'
 *                 product_code: 'Product Code'
 *                 hour: 'HOUR1'
 *                 shift: 'Shift Name'
 *                 site: 'Site Name'
 *                 fg_output: 100
 *                 user: 'User Name'
 *                 date_time: '28-02-2024'
 *               - id: 2
 *                 product_name: 'Another Product'
 *                 product_des: 'Another Description'
 *                 product_code: 'Another Code'
 *                 hour: 'HOUR2'
 *                 shift: 'Night Shift'
 *                 site: 'Another Site'
 *                 fg_output: 150
 *                 user: 'Another User'
 *                 date_time: '28-02-2024'
 *       '400':
 *         description: Bad Request error indicating missing or invalid parameters.
 *         content:
 *           application/json:
 *             example:
 *               error: 'Invalid request'
 *       '500':
 *         description: Internal server error during the data retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               error: 'An error occurred'
 *
 * @function
 * @name getFGOutputList
 * @memberof module:Routes/FGOutput
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the data retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/fg-output', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    const type = req.query.type;

    console.log("roleid", roleid);
    console.log("userid", userid);
    console.log("currentDate", currentDate);

    let whereConditions = [];
    if (type === "default") {
      whereConditions.push(`fg_details.date_time = '${currentDate}'`);
    }
    else if (type === "search") {
      const date = req.query.date;
      console.log(date);
      if (!date) {
        return res.status(400).json({ error: 'Date value is missing' });
      }
      const inputFormat = 'DD/MM/YYYY';
      const outputFormat = 'DD-MM-YYYY';
      const formattedDate = dateUtils.convertDateFormat(date, inputFormat, outputFormat);
      console.log(formattedDate);
      whereConditions.push(`fg_details.date_time = '${formattedDate}'`);
    }
    else {
      return res.status(400).json({ error: 'Invalid request' });
    }

    if (roleid == 3) {
      whereConditions.push(`fg_details.user = '${userid}'`);
    }
    const whereClause = whereConditions.join(' AND ');
    //console.log("whereClause", whereClause);

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `SELECT fg_details.*, item_masterr.item_description, item_code.product_code, item_code.product_des, geopos_users.name AS user_name
    FROM fg_details 
    LEFT JOIN item_masterr ON fg_details.product_name = item_masterr.id
    LEFT JOIN item_code ON fg_details.product_code = item_code.id
    LEFT JOIN geopos_users ON fg_details.user = geopos_users.id
    WHERE ${whereClause}`;

    const results = await executeQuery(connection, query);

    // Process the query results
    const fgDetails = results.map((row) => ({
      id: row.id,
      product_name: row.item_description,
      product_des: row.product_des,
      product_code: row.product_code,
      hour: row.hour,
      shift: row.shift,
      site: row.site,
      fg_output: row.fg_output,
      user: row.user_name,
      date_time: row.date_time,

    }));

    //console.log(fgDetails);

    // Return the response
    res.json(fgDetails);

  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /fg-output/delete/{id}:
 *   delete:
 *     summary: Delete an FG output entry by ID.
 *     description: |
 *       This endpoint allows deleting an FG output entry based on its ID.
 *     tags:
 *       - FG Output
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the FG output entry to be deleted.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response indicating the deletion of the FG output entry.
 *         content:
 *           application/json:
 *             example:
 *               message: 'Item deleted successfully.'
 *       '500':
 *         description: Internal server error during the deletion process.
 *         content:
 *           application/json:
 *             example:
 *               error: 'An error occurred while deleting the item.'
 *
 * @function
 * @name deleteFGOutputById
 * @memberof module:Routes/FGOutput
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the deletion process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.delete("/fg-output/delete/:id", authenticateJWT, async (req, res) => {
  let connection;
  try {
    const id = req.params.id;
    //console.log("id:", id);

    // Get a connection from the pool
    connection = await getPoolConnection();

    const result = await executeQuery(connection, "DELETE FROM fg_details WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Record not found' });
    } else {
      console.log(result);
      res.json({ message: 'Item deleted successfully.' });
    }

  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});




//============================================ FG Output End =====================================================

//============================================ Report Start =====================================================

/**
 * @swagger
 * /report/employee-timesheet-today:
 *   get:
 *     summary: Get timesheet entries for the current date.
 *     description: |
 *       This endpoint retrieves timesheet entries for the current date based on the user's role and ID.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve timesheet entries.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve timesheet entries.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with the timesheet entries for the current date.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - entry_id: 1
 *                   date_time: "2022-02-28 08:30:00"
 *                   product_name: "Product1"
 *                   section: "SectionA"
 *                   shift: "Shift1"
 *                   operator_name: "John Doe"
 *               date: "2022-02-28"
 *               operatorname: "John Doe"
 *       '400':
 *         description: Bad request, invalid role or user ID.
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid role or user ID"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getEmployeeTimesheetToday
 * @memberof module:Routes/EmployeeTimesheet
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/employee-timesheet-today', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    let whereConditions = [];
    whereConditions.push(`worker_timesheet.date_time = '${currentDate}'`);
    if (roleid == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${userid}'`);
    }
    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `
   SELECT
   worker_timesheet.*,
   Concat(worker_timesheet.worker,'[',worker_timesheet.entry_id,']') as col1,
   item_masterr.item_description,
   section.section_name,
   geopos_users.name AS operator_name
 FROM
   worker_timesheet
   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
   LEFT JOIN section ON section.id = worker_timesheet.section
   LEFT JOIN geopos_users ON geopos_users.id = worker_timesheet.operator_id
 WHERE
   ${whereClause}
 GROUP BY
   worker_timesheet.date_time,
   worker_timesheet.entry_id,
   worker_timesheet.product_name,
   worker_timesheet.section,
   worker_timesheet.shift
   `;
    const results = await executeQuery(connection, query);

    const data = {
      timesheet: results,
      date: currentDate,
      operatorname: results.length > 0 ? results[0].operator_name : null
    };

    res.json(data);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});

/**
 * @swagger
 * /report/employee-timesheet-filter:
 *   get:
 *     summary: Filter timesheet entries based on specified criteria.
 *     description: |
 *       This endpoint allows filtering timesheet entries based on criteria such as role, user, product, section, shift, and date range.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to filter timesheet entries.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to filter timesheet entries.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: product_id
 *         description: ID of the product to filter timesheet entries.
 *         schema:
 *           type: string
 *       - in: query
 *         name: section_id
 *         description: ID of the section to filter timesheet entries.
 *         schema:
 *           type: string
 *       - in: query
 *         name: shift
 *         description: Shift name to filter timesheet entries.
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromdate
 *         required: true
 *         description: Start date for the date range (format DD/MM/YYYY).
 *         schema:
 *           type: string
 *       - in: query
 *         name: todate
 *         required: true
 *         description: End date for the date range (format DD/MM/YYYY).
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the filtered timesheet entries.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - entry_id: 1
 *                   date_time: "2022-02-28 08:30:00"
 *                   product_name: "Product1"
 *                   section: "SectionA"
 *                   shift: "Shift1"
 *                   operator_name: "John Doe"
 *               product: "Product1"
 *               fdate: "2022-02-28"
 *               tdate: "2022-03-05"
 *               section: "SectionA"
 *               operatorname: "John Doe"
 *       '400':
 *         description: Bad request, invalid date range provided.
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid date range provided"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name searchEmployeeTimesheet
 * @memberof module:Routes/EmployeeTimesheet
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/employee-timesheet-filter', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    var product_name = req.query.product_id;
    var section = req.query.section_id;
    var shift = req.query.shift;
    const fromdate = req.query.fromdate;
    const todate = req.query.todate;

    if (!fromdate || !todate) {
      res.status(400).json({ error: 'Invalid date range provided' });
      return;
    }

    const inputFormat = 'DD/MM/YYYY';
    const outputFormat = 'YYYY-MM-DD';
    const fd = dateUtils.convertDateFormat(fromdate, inputFormat, outputFormat);
    const td = dateUtils.convertDateFormat(todate, inputFormat, outputFormat);
    const newfd = dateUtils.convertToUnixTimestamp(fd);
    const newtd = dateUtils.convertToUnixTimestamp(td);

    // Log the received data
    console.log('Received data:');
    console.log('Product Name:', product_name);
    //console.log('Line No:', line_no);
    console.log('Section:', section);
    console.log('Shift:', shift);
    console.log('From Date:', fd);
    console.log('To Date:', td);
    console.log('Converted Timestamp:', newfd);
    console.log('Converted Timestamp:', newtd);

    let whereConditions = [];

    if (product_name !== '' && product_name !== undefined && product_name != null) {
      whereConditions.push(`worker_timesheet.product_name = '${product_name}'`);
    }

    if (section !== '' && section !== undefined && section != null) {
      whereConditions.push(`worker_timesheet.section = '${section}'`);
    }
    if (shift !== '' && shift !== undefined && shift != null) {
      whereConditions.push(`worker_timesheet.shift = '${shift}'`);
    }
    if (roleid == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${userid}'`);
    }
    whereConditions.push(`worker_timesheet.time_stamp BETWEEN '${newfd}' AND '${newtd}'`);
    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `
   SELECT
   worker_timesheet.*,
   Concat(worker_timesheet.worker,'[',worker_timesheet.entry_id,']') as col1,
   item_masterr.item_description,
   section.section_name,
   geopos_users.name AS operator_name
 FROM
   worker_timesheet
   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
   LEFT JOIN section ON section.id = worker_timesheet.section
   LEFT JOIN geopos_users ON geopos_users.id = worker_timesheet.operator_id
 WHERE
   ${whereClause}
 GROUP BY
   worker_timesheet.date_time,
   worker_timesheet.entry_id,
   worker_timesheet.product_name,
   worker_timesheet.section,
   worker_timesheet.shift
   `;

    const results = await executeQuery(connection, query);

    const data = {
      timesheet: results,
      product: product_name,
      fdate: fd,
      tdate: td,
      section: section,
      operatorname: results.length > 0 ? results[0].operator_name : null
    };

    res.json(data);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /report/fg-output-this-month:
 *   get:
 *     summary: Get FG output for the current month.
 *     description: |
 *       This endpoint retrieves FG output for the current month based on the date and product details.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response with FG output details for the current month.
 *         content:
 *           application/json:
 *             example:
 *               cmonthYear: "MM/YYYY"
 *               results:
 *                 - product_name: "Product1"
 *                   date_time: "2022-03-01 08:30:00"
 *                   tar: 500
 *                   item_description: "ItemDescription1"
 *                   avg: 10
 *                 - product_name: "Product2"
 *                   date_time: "2022-03-01 10:00:00"
 *                   tar: 300
 *                   item_description: "ItemDescription2"
 *                   avg: 8
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getFGOutputThisMonth
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/fg-output-this-month', authenticateJWT, async (req, res) => {
  let connection;
  try {
    var cmonthYear = currentMonthYear;
    const whereConditions = [];
    whereConditions.push(`SUBSTR(fg_details.date_time, 4) = '${currentMonthYear}'`);
    const whereClause = whereConditions.join(' AND ');
    const query = `
    SELECT fg_details.product_name, fg_details.date_time, SUM(fg_details.fg_output) AS tar, item_masterr.item_description
    FROM fg_details
    LEFT JOIN item_masterr ON item_masterr.id = fg_details.product_name
    WHERE  ${whereClause}
    GROUP BY fg_details.product_name`;


    // Get a connection from the pool
    connection = await getPoolConnection();

    const results = await executeQuery(connection, query);

    // Array to store promises for fetching additional data
    const promises = [];
    results.forEach((result, index) => {

      const query2 = `
      SELECT worker_timesheet.*
      FROM worker_timesheet
      LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
      WHERE
        worker_timesheet.mon = ?
        AND worker_timesheet.product_name = ?
      GROUP BY worker_timesheet.entry_id, worker_timesheet.product_name, worker_timesheet.mon
    `;
      const query2Params = [currentMonthYear, result.product_name];

      // Add promise to the promises array for each query
      promises.push(executeQuery(connection, query2, query2Params));

    });

    // Wait for all promises to resolve
    const results2 = await Promise.all(promises);

    // Update the initial results with the additional data
    results.forEach((result, index) => {
      const avg = results2[index].length;
      result.avg = avg;
    });

    res.send({ cmonthYear, results });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /report/fg-output-today:
 *   get:
 *     summary: Get FG output for today.
 *     description: |
 *       This endpoint retrieves FG output for today based on the date and user details.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve FG output.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve FG output.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with FG output details for today.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - product_name: "Product1"
 *                   date_time: "2022-03-01 08:30:00"
 *                   item_product_name: "ItemDescription1"
 *                   item_groups: "GroupA"
 *                   item_group_product_des: "GroupA Description"
 *                   tar: 500
 *               tar: 500
 *               cdate: "2022-03-01"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getFGOutputToday
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/fg-output-today', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    var cdate = '';
    let whereConditions = [];
    cdate = currentDate;
    whereConditions.push(`fg.date_time = '${currentDate}'`);
    if (roleid == 3) {
      whereConditions.push(`fg.user = '${userid}'`);
    }
    const whereClause = whereConditions.join(' AND ');
    const query = `SELECT fg.*, im.item_description AS item_product_name, ic.product_code AS item_groups, ic.product_des AS item_group_product_des, SUM(fg.fg_output) AS tar
               FROM fg_details AS fg
               LEFT JOIN item_masterr AS im ON fg.product_name = im.id
               LEFT JOIN item_code AS ic ON fg.product_code = ic.id
               WHERE ${whereClause}
               GROUP BY fg.product_name, fg.date_time,fg.product_code`;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const results = await executeQuery(connection, query);

    // Calculate the total fg_output value
    const tar = results.reduce((total, currentRow) => total + parseInt(currentRow.tar), 0);

    // Append the tar value to the results object
    const response = {
      timesheet: results,
      tar: tar,
      cdate: cdate,
    };

    // Return the response object
    res.send(response);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /report/fg-output-filter:
 *   get:
 *     summary: Filter FG output entries based on specified criteria.
 *     description: |
 *       This endpoint allows filtering for FG output based on criteria such as role, user, product, date range, and search type.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to filter FG output.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to filter FG output.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: product_id
 *         description: ID of the product to filter FG output.
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         required: true
 *         description: Type of search (4 for date range, 5 for today).
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromdate
 *         description: Start date for the date range (format DD/MM/YYYY).
 *         schema:
 *           type: string
 *       - in: query
 *         name: todate
 *         description: End date for the date range (format DD/MM/YYYY).
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the matching FG output.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - product_name: "Product1"
 *                   date_time: "2022-03-01 08:30:00"
 *                   item_product_name: "ItemDescription1"
 *                   item_groups: "GroupA"
 *                   item_group_product_des: "GroupA Description"
 *                   tar: 500
 *               tar: 500
 *               fdate: "2022-03-01"
 *               tdate: "2022-03-05"
 *               cdate: "2022-03-01"
 *       '400':
 *         description: Bad request, invalid date range provided.
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid date range provided"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name filterFGOutput
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/fg-output-filter', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    const product1 = req.query.product_id;
    const search = req.query.search;

    const fromdate = req.query.fromdate;
    const todate = req.query.todate;

    const inputFormat = 'DD/MM/YYYY';
    const outputFormat = 'YYYY-MM-DD';
    const fd = dateUtils.convertDateFormat(fromdate, inputFormat, outputFormat);
    const td = dateUtils.convertDateFormat(todate, inputFormat, outputFormat);
    const newfd = dateUtils.convertToUnixTimestamp(fd);
    const newtd = dateUtils.convertToUnixTimestamp(td);

    // Log the received data
    console.log('Received data:');
    console.log('Product Name:', product1);
    console.log('From Date:', fd);
    console.log('To Date:', td);
    console.log('Converted Timestamp:', newfd);
    console.log('Converted Timestamp:', newtd);

    //dates to be passed
    var fdate1 = '';
    var tdate1 = '';
    var cdate = '';

    let whereConditions = [];


    if (search === '5') {
      cdate = currentDate;
      whereConditions.push(`fg.date_time = '${currentDate}'`);
    } else if (search === '4') {
      fdate1 = fd;
      tdate1 = td;
      whereConditions.push(`fg.time_stamp BETWEEN '${newfd}' AND '${newtd}'`);
    }

    if (product1 !== '' && product1 !== undefined && product1 != null) {
      whereConditions.push(`fg.product_name = '${product1}'`);
    }
    if (roleid == 3) {
      whereConditions.push(`fg.user = '${userid}'`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `SELECT fg.*, im.item_description AS item_product_name, ic.product_code AS item_groups, ic.product_des AS item_group_product_des, SUM(fg.fg_output) AS tar
               FROM fg_details AS fg
               LEFT JOIN item_masterr AS im ON fg.product_name = im.id
               LEFT JOIN item_code AS ic ON fg.product_code = ic.id
               WHERE ${whereClause}
               GROUP BY fg.product_name, fg.date_time`;

    const results = await executeQuery(connection, query);

    // Calculate the total fg_output value
    const tar = results.reduce((total, currentRow) => total + parseInt(currentRow.tar), 0);

    // Append the tar value to the results object
    const response = {
      timesheet: results,
      tar: tar,
      fdate: fdate1,
      tdate: tdate1,
      cdate: cdate,
    };

    // Return the response object
    res.send(response);
    //console.log(response);


  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /report/hour-loss-today:
 *   get:
 *     summary: Get hour loss details for today.
 *     description: |
 *       This endpoint retrieves hour loss details for today based on the date and user details.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve hour loss details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve hour loss details.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with hour loss details for today.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - entry_id: 1
 *                   date_time: "2022-03-01 08:30:00"
 *                   product_name: "Product1"
 *                   item_description: "ItemDescription1"
 *                   section_name: "SectionA"
 *                   dttm: "2022-03-01 08:30:00"
 *               cdate: "2022-03-01"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getHourLossToday
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/hour-loss-today', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    const whereConditions = [];
    whereConditions.push(`worker_timesheet.date_time = '${currentDate}'`);
    if (roleid == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${userid}'`);
    }
    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `SELECT worker_timesheet.*, item_masterr.item_description , section.section_name,worker_timesheet.date_time as dttm
             FROM worker_timesheet
             LEFT JOIN item_masterr  ON worker_timesheet.product_name = item_masterr.id
             LEFT JOIN section ON worker_timesheet.section = section.id
             WHERE ${whereClause}
             GROUP BY worker_timesheet.date_time,worker_timesheet.entry_id,worker_timesheet.product_name,worker_timesheet.section`;

    const results = await executeQuery(connection, query);

    // Append the tar value to the results object
    const response = {
      timesheet: results,
      cdate: currentDate,
    };
    // Return the response object
    res.send(response);
    //console.log(response);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});



/**
 * @swagger
 * /report/hour-loss-filter:
 *   get:
 *     summary: Get hour loss details based on specified criteria.
 *     description: |
 *       This endpoint retrieves hour loss details based on criteria such as role, user, product, and date range.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve hour loss details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve hour loss details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: product_id
 *         description: ID of the product to filter hour loss details.
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromdate
 *         required: true
 *         description: Start date for the date range (format DD/MM/YYYY).
 *         schema:
 *           type: string
 *       - in: query
 *         name: todate
 *         required: true
 *         description: End date for the date range (format DD/MM/YYYY).
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with hour loss details.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - entry_id: 1
 *                   date_time: "2022-03-01 08:30:00"
 *                   product_name: "Product1"
 *                   item_description: "ItemDescription1"
 *                   section_name: "SectionA"
 *                   dttm: "2022-03-01 08:30:00"
 *               tar: 500
 *       '400':
 *         description: Bad request, invalid date range provided.
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid date range provided"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getHourLossDetails
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/hour-loss-filter', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    const product1 = req.query.product_id;
    const fromdate = req.query.fromdate;
    const todate = req.query.todate;


    if (!fromdate || !todate) {
      res.status(400).json({ error: 'Invalid date range provided' });
      return;
    }

    const inputFormat = 'DD/MM/YYYY';
    const outputFormat = 'YYYY-MM-DD';
    const fd = dateUtils.convertDateFormat(fromdate, inputFormat, outputFormat);
    const td = dateUtils.convertDateFormat(todate, inputFormat, outputFormat);
    const newfd = dateUtils.convertToUnixTimestamp(fd);
    const newtd = dateUtils.convertToUnixTimestamp(td);

    // Log the received data
    console.log('Received data:');
    console.log('Product Name:', product1);
    console.log('From Date:', fd);
    console.log('To Date:', td);
    console.log('Converted Timestamp:', newfd);
    console.log('Converted Timestamp:', newtd);

    let whereConditions = [
      `worker_timesheet.time_stamp BETWEEN '${newfd}' AND '${newtd}'`
    ];

    if (product1 !== '' && product1 !== undefined && product1 != null) {
      whereConditions.push(`worker_timesheet.product_name = '${product1}'`);
    }
    if (roleid == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${userid}'`);
    }
    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `SELECT worker_timesheet.*, item_masterr.item_description , section.section_name,worker_timesheet.date_time as dttm
               FROM worker_timesheet
               LEFT JOIN item_masterr  ON worker_timesheet.product_name = item_masterr.id
               LEFT JOIN section ON worker_timesheet.section = section.id
               WHERE ${whereClause}
               GROUP BY worker_timesheet.date_time,worker_timesheet.entry_id,worker_timesheet.product_name,worker_timesheet.section`;

    const results = await executeQuery(connection, query);

    // Append the tar value to the results object
    const response = {
      timesheet: results,
    };

    // Return the response object
    res.send(response);
    //console.log(response);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});



/**
 * @swagger
 * /report/performance-overview-today:
 *   get:
 *     summary: Get performance overview details for today based on specified criteria.
 *     description: |
 *       This endpoint retrieves performance overview details for today based on criteria such as role, user, and date.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve performance overview details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve performance overview details.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with performance overview details.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - entry_id: 1
 *                   date_time: "2022-03-01 08:30:00"
 *                   product_name: "Product1"
 *                   item_description: "ItemDescription1"
 *                   section_name: "SectionA"
 *                   dttm: "2022-03-01 08:30:00"
 *               currentDate: "2022-03-01"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getPerformanceOverviewToday
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/performance-overview-today', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    const whereConditions = [];
    whereConditions.push(`worker_timesheet.date_time = '${currentDate}'`);
    if (roleid == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${userid}'`);
    }
    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `SELECT worker_timesheet.*, item_masterr.item_description , section.section_name,worker_timesheet.date_time as dttm
             FROM worker_timesheet
             LEFT JOIN item_masterr  ON worker_timesheet.product_name = item_masterr.id
             LEFT JOIN section ON worker_timesheet.section = section.id
             WHERE ${whereClause}
             GROUP BY worker_timesheet.date_time,worker_timesheet.entry_id,worker_timesheet.product_name,worker_timesheet.section`;

    const results = await executeQuery(connection, query);

    // Append the tar value to the results object
    const response = {
      timesheet: results,
      currentDate: currentDate,
    };
    // Return the response object
    res.send(response);
    //console.log(response);


  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /report/performance-overview-filter:
 *   get:
 *     summary: Get filtered performance overview details based on specified criteria.
 *     description: |
 *       This endpoint retrieves filtered performance overview details based on criteria such as role, user, and date range.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve filtered performance overview details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve filtered performance overview details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fromdate
 *         required: true
 *         description: Start date of the range for performance overview details (DD/MM/YYYY).
 *         schema:
 *           type: string
 *       - in: query
 *         name: todate
 *         required: true
 *         description: End date of the range for performance overview details (DD/MM/YYYY).
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with filtered performance overview details.
 *         content:
 *           application/json:
 *             example:
 *               processedResult:
 *                 - worker: "John Doe"
 *                   entry_id: 1
 *                   shift: "Day"
 *                   item_description: "ItemDescription1"
 *                   section_name: "SectionA"
 *                   target: 8
 *                   day1: 5
 *                   day2: 6
 *                   day3: 7
 *                   indexcolumn: [1, 2, 3]
 *               newfromdate1: "23-06-2023"
 *               newtodate1: "25-06-2023"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getPerformanceOverviewFilter
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/performance-overview-filter', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    const { fromdate, todate } = req.query;

    const inputFormat = 'DD/MM/YYYY';
    const outputFormat = 'YYYY-MM-DD';
    const outputFormat2 = 'DD-MM-YYYY';
    const fd = dateUtils.convertDateFormat(fromdate, inputFormat, outputFormat);
    const td = dateUtils.convertDateFormat(todate, inputFormat, outputFormat);
    const newfromdate1 = dateUtils.convertDateFormat(fromdate, inputFormat, outputFormat2);
    const newtodate1 = dateUtils.convertDateFormat(todate, inputFormat, outputFormat2);
    const newfd = dateUtils.convertToUnixTimestamp(fd);
    const newtd = dateUtils.convertToUnixTimestamp(td);

    console.log('fd:', fd);
    console.log('td:', td);
    console.log('Converted Timestamp fd:', newfd);
    console.log('Converted Timestamp td:', newtd);
    console.log("newfromdate1", newfromdate1);
    console.log("newtodate1", newtodate1);

    if (!fromdate || !todate) {
      res.status(400).json({ error: 'Invalid date range provided' });
      return;
    }
    const whereConditions = [];
    const queryParams = [newfd, newtd];
    whereConditions.push(
      `worker_timesheet.time_stamp BETWEEN ? AND ?`
    );
    if (roleid == 3) {
      whereConditions.push(`worker_timesheet.operator_id = ?`);
      queryParams.push(userid);
    }
    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `SELECT worker_timesheet.*, item_masterr.item_description, section.section_name, worker_timesheet.date_time as dttm, employees_moz.joindate
                 FROM worker_timesheet
                 LEFT JOIN employees_moz ON worker_timesheet.entry_id = employees_moz.entryid
                 LEFT JOIN item_masterr ON worker_timesheet.product_name = item_masterr.id
                 LEFT JOIN section ON worker_timesheet.section = section.id
                 WHERE ${whereClause}
                 GROUP BY worker_timesheet.entry_id, worker_timesheet.product_name, worker_timesheet.section`;

    const query2 = `SELECT worker_timesheet.*, item_masterr.item_description, section.section_name, worker_timesheet.date_time as dttm
                 FROM worker_timesheet
                 LEFT JOIN item_masterr ON worker_timesheet.product_name = item_masterr.id
                 LEFT JOIN section ON worker_timesheet.section = section.id
                 WHERE ${whereClause}
                 GROUP BY worker_timesheet.date_time, worker_timesheet.entry_id, worker_timesheet.product_name, worker_timesheet.section`;

    const results = await executeQuery(connection, query, queryParams);
    const results2 = await executeQuery(connection, query2, queryParams);

    const processedResult = results.map((result) => {
      const ard = [];
      const arr = [];

      results2.forEach((itemk) => {
        const valueSum1 =
          itemk['HOUR1'] +
          itemk['HOUR2'] +
          itemk['HOUR3'] +
          itemk['HOUR4'] +
          itemk['HOUR5'] +
          itemk['HOUR6'] +
          itemk['HOUR7'] +
          itemk['HOUR8'] +
          itemk['HOUR9'] +
          itemk['HOUR10'] +
          itemk['HOUR11'] +
          itemk['HOUR12'];
        const dent = `${itemk['date_time']}-${itemk['entry_id']}-${itemk['product_name']}-${itemk['section']}`;
        //23-06-2023-ST3640-87-11
        ard.push(dent);
        arr.push(valueSum1);
      });

      const processedRow = {
        worker: result.worker,
        entry_id: result.entry_id,
        shift: result.shift,
        item_description: result.item_description,
        section_name: result.section_name,
        target: result.target,
      };

      const inputFormat = 'YYYY-MM-DD';
      const outputFormat = 'DD-MM-YYYY';
      const datesBetween = dateUtils.getDatesBetween(fd, td, inputFormat, outputFormat);

      // Loop each date
      // let i = 0;
      // while (i < datesBetween.length) {
      //   console.log("dates", datesBetween[i]);
      //   i++;
      // }

      let index = 0;
      const indexcolumn = [];
      datesBetween.forEach(date => {
        const ky = ard.indexOf(`${date}-${result.entry_id}-${result.product_name}-${result.section}`);
        processedRow[`day${index + 1}`] = ky !== -1 ? arr[ky] : '-';
        index++;
        indexcolumn.push(index);
      });
      return { processedRow, indexcolumn };
    });

    //console.log(processedResult.map((row) => row.indexcolumn));

    const response = {
      processedResult: processedResult.map((row) => row.processedRow),
      indexcolumn: processedResult.map((row) => row.indexcolumn),
      //processedResult:processedResult,
      newfromdate1: newfromdate1,
      newtodate1: newtodate1,
    };

    // Return the response object
    res.json(response);


  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /report/section-wise-efficiency-today:
 *   get:
 *     summary: Get section-wise efficiency details for today.
 *     description: |
 *       This endpoint retrieves section-wise efficiency details for the current date.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve section-wise efficiency details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve section-wise efficiency details.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with section-wise efficiency details.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - product_name: "ProductA"
 *                   date_time: "2023-06-23"
 *                   item_description: "ItemDescriptionA"
 *                   section_name: "SectionA"
 *                   category_name: "CategoryA"
 *                   comp: 30
 *                   tt: 5
 *               operatorname: "John Doe"
 *               date: "2023-06-23"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getSectionWiseEfficiencyToday
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/section-wise-efficiency-today', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    let whereConditions = [];
    whereConditions.push(`worker_timesheet.date_time = '${currentDate}'`);
    if (roleid == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${userid}'`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `
   SELECT
   worker_timesheet.*,
   item_masterr.item_description,
   section.section_name,
   item_category.category_name,
   SUM(worker_timesheet.HOUR1+worker_timesheet.HOUR2+worker_timesheet.HOUR3+worker_timesheet.HOUR4+worker_timesheet.HOUR5+worker_timesheet.HOUR6+worker_timesheet.HOUR7+worker_timesheet.HOUR8+worker_timesheet.HOUR9+worker_timesheet.HOUR10+worker_timesheet.HOUR11+worker_timesheet.HOUR12) as comp,
   count(*) as tt
 FROM
   worker_timesheet
   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
   LEFT JOIN section ON section.id = worker_timesheet.section
   LEFT JOIN item_category ON item_category.id = item_masterr.category_id
 WHERE
   ${whereClause}
 GROUP BY
   worker_timesheet.product_name,
   worker_timesheet.section,
    worker_timesheet.date_time
   `;

    const results = await executeQuery(connection, query);

    const data = {
      timesheet: results,
      date: currentDate,
      operatorname: results.length > 0 ? results[0].operator_name : null
    };

    res.json(data);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});



/**
 * @swagger
 * /report/section-wise-efficiency-filter:
 *   get:
 *     summary: Get section-wise efficiency details with filtering options.
 *     description: |
 *       This endpoint retrieves section-wise efficiency details based on the specified filters.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve section-wise efficiency details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve section-wise efficiency details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: product_id
 *         description: ID of the product to filter.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: section_id
 *         description: ID of the section to filter.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         description: ID of the category to filter.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         required: true
 *         description: Filter option (1 - Weekly, 2 - Monthly, 5 - Today).
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fromdate
 *         description: Start date for the filter range (DD/MM/YYYY).
 *         schema:
 *           type: string
 *       - in: query
 *         name: todate
 *         description: End date for the filter range (DD/MM/YYYY).
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with filtered section-wise efficiency details.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - product_name: "ProductA"
 *                   date_time: "2023-06-23"
 *                   item_description: "ItemDescriptionA"
 *                   section_name: "SectionA"
 *                   category_name: "CategoryA"
 *                   comp: 30
 *                   tt: 5
 *               operatorname: "John Doe"
 *               fdate: "2023-06-23"
 *               tdate: "2023-06-30"
 *               cdate: "2023-06-23"
 *               cmonthYear: "06-2023"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getSectionWiseEfficiencyFilter
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/section-wise-efficiency-filter', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    const product = req.query.product_id;
    const section = req.query.section_id;
    const category = req.query.category;
    const search = req.query.search;
    const fromdate = req.query.fromdate;
    const todate = req.query.todate;

    const inputFormat = 'DD/MM/YYYY';
    const outputFormat = 'YYYY-MM-DD';
    const fd = dateUtils.convertDateFormat(fromdate, inputFormat, outputFormat);
    const td = dateUtils.convertDateFormat(todate, inputFormat, outputFormat);
    const newfd = dateUtils.convertToUnixTimestamp(fd);
    const newtd = dateUtils.convertToUnixTimestamp(td);

    // Log the received data
    console.log('Received data:');
    console.log('Product Name:', product);
    console.log('Section:', section);
    console.log('From Date:', fd);
    console.log('To Date:', td);
    console.log('Converted Timestamp:', newfd);
    console.log('Converted Timestamp:', newtd);

    console.log("currentDate", currentDate);
    console.log("currentMonth:", currentMonth);
    console.log("currentYear:", currentYear);
    console.log("currentMonthYear:", currentMonthYear);

    //dates to be passed
    var fdate1 = '';
    var tdate1 = '';
    var cdate = '';
    var cmonthYear = '';

    let whereConditions = [];


    if (search === '5') {
      cdate = currentDate;
      whereConditions.push(`worker_timesheet.date_time = '${currentDate}'`);
    }
    else if (search === '1') {

      const weekDates = dateUtils.getThisWeekStartDateAndEndDate();
      const timestampfromdate = dateUtils.convertToUnixTimestamp(weekDates.startDate);
      const timestamptodate = dateUtils.convertToUnixTimestamp(weekDates.endDate);

      const inputFormat = 'YYYY-MM-DD';
      const outputFormat = 'DD/MM/YYYY';
      fdate1 = dateUtils.convertDateFormat(weekDates.startDate, inputFormat, outputFormat);
      tdate1 = dateUtils.convertDateFormat(weekDates.endDate, inputFormat, outputFormat);

      console.log('Start Date:', weekDates.startDate);
      console.log('End Date:', weekDates.endDate);
      console.log('timestampfromdate:', timestampfromdate);
      console.log('timestamptodate:', timestamptodate);
      console.log('fdate1:', fdate1);
      console.log('tdate1:', tdate1);

      whereConditions.push(`worker_timesheet.time_stamp BETWEEN '${timestampfromdate}' AND '${timestamptodate}'`);
    }
    else if (search === '2') {
      cmonthYear = currentMonthYear;
      whereConditions.push(`worker_timesheet.mon = '${currentMonthYear}'`);
    }
    else if (fromdate && todate !== undefined) {
      fdate1 = fd;
      tdate1 = td;
      whereConditions.push(`worker_timesheet.time_stamp BETWEEN '${newfd}' AND '${newtd}'`);
    }




    if (product !== undefined && product !== '') {
      whereConditions.push(`worker_timesheet.product_name = '${product}'`);
    }
    if (section !== undefined && section !== '') {
      whereConditions.push(`worker_timesheet.section = '${section}'`);
    }
    if (category !== undefined && category !== '') {
      whereConditions.push(`item_masterr.category_id = '${category}'`);
    }
    if (roleid == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${userid}'`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `
   SELECT
   worker_timesheet.*,
   item_masterr.item_description,
   section.section_name,
   item_category.category_name,
   SUM(worker_timesheet.HOUR1+worker_timesheet.HOUR2+worker_timesheet.HOUR3+worker_timesheet.HOUR4+worker_timesheet.HOUR5+worker_timesheet.HOUR6+worker_timesheet.HOUR7+worker_timesheet.HOUR8+worker_timesheet.HOUR9+worker_timesheet.HOUR10+worker_timesheet.HOUR11+worker_timesheet.HOUR12) as comp,
   count(*) as tt
 FROM
   worker_timesheet
   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
   LEFT JOIN section ON section.id = worker_timesheet.section
   LEFT JOIN item_category ON item_category.id = item_masterr.category_id
 WHERE
   ${whereClause}
 GROUP BY
   worker_timesheet.product_name,
   worker_timesheet.section,
    worker_timesheet.date_time
   `;


    const results = await executeQuery(connection, query);

    const data = {
      timesheet: results,
      fdate: fdate1,
      tdate: tdate1,
      cdate: cdate,
      cmonthYear: cmonthYear,
      operatorname: results.length > 0 ? results[0].operator_name : null
    };

    res.json(data);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});



/**
 * @swagger
 * /report/supervisor-wise-efficiency-today:
 *   get:
 *     summary: Get supervisor-wise efficiency details for today.
 *     description: |
 *       This endpoint retrieves supervisor-wise efficiency details for the current date.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve supervisor-wise efficiency details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve supervisor-wise efficiency details.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with supervisor-wise efficiency details for today.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - date_time: "2023-06-23"
 *                   line: "LineA"
 *                   product_name: "ProductA"
 *                   section: "SectionA"
 *                   shift: "Morning"
 *                   item_description: "ItemDescriptionA"
 *                   section_name: "SectionA"
 *                   operator_name: "John Doe"
 *                   entryid: "123"
 *                   col1: "John Doe[123](SiteA)"
 *                   comp: 30
 *                   tt: 5
 *               operatorname: "John Doe"
 *               date: "2023-06-23"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getSupervisorWiseEfficiencyToday
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/supervisor-wise-efficiency-today', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    let whereConditions = [];

    whereConditions.push(`worker_timesheet.date_time = '${currentDate}'`);
    if (roleid == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${userid}'`);
    }
    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `
   SELECT
   worker_timesheet.*,
   item_masterr.item_description,
   section.section_name,
   geopos_users.name AS operator_name,
   geopos_users.entryid,
   Concat(geopos_users.name,"[",geopos_users.entryid,"]","(",worker_timesheet.site,")") as col1,
   SUM(worker_timesheet.HOUR1+worker_timesheet.HOUR2+worker_timesheet.HOUR3+worker_timesheet.HOUR4+worker_timesheet.HOUR5+worker_timesheet.HOUR6+worker_timesheet.HOUR7+worker_timesheet.HOUR8+worker_timesheet.HOUR9+worker_timesheet.HOUR10+worker_timesheet.HOUR11+worker_timesheet.HOUR12) as comp,
   count(*) as tt
 FROM
   worker_timesheet
   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
   LEFT JOIN section ON section.id = worker_timesheet.section
   LEFT JOIN geopos_users ON geopos_users.id = worker_timesheet.operator_id
 WHERE
   ${whereClause}
 GROUP BY
   worker_timesheet.date_time,
   worker_timesheet.line,
   worker_timesheet.product_name,
   worker_timesheet.section,
   worker_timesheet.shift
   `;

    const results = await executeQuery(connection, query);

    const data = {
      timesheet: results,
      date: currentDate,
      operatorname: results.length > 0 ? results[0].operator_name : null
    };
    res.json(data);
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /report/supervisor-wise-efficiency-filter:
 *   get:
 *     summary: Get supervisor-wise efficiency details with filtering options.
 *     description: |
 *       This endpoint retrieves supervisor-wise efficiency details based on filtering options.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve supervisor-wise efficiency details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve supervisor-wise efficiency details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: product_id
 *         description: ID of the product for filtering.
 *         schema:
 *           type: string
 *       - in: query
 *         name: section_id
 *         description: ID of the section for filtering.
 *         schema:
 *           type: string
 *       - in: query
 *         name: shift
 *         description: Shift for filtering.
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         required: true
 *         description: Type of search (1- Weekly, 2- Monthly, 4- Custom Date Range, 5- Today).
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromdate
 *         description: Start date for custom date range search (format- DD/MM/YYYY).
 *         schema:
 *           type: string
 *       - in: query
 *         name: todate
 *         description: End date for custom date range search (format- DD/MM/YYYY).
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with supervisor-wise efficiency details and filtering options.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - date_time: "2023-06-23"
 *                   line: "LineA"
 *                   product_name: "ProductA"
 *                   section: "SectionA"
 *                   shift: "Morning"
 *                   item_description: "ItemDescriptionA"
 *                   section_name: "SectionA"
 *                   operator_name: "John Doe"
 *                   entryid: "123"
 *                   col1: "John Doe[123](SiteA)"
 *                   comp: 30
 *                   tt: 5
 *               fdate: "2023-06-23"
 *               tdate: "2023-06-30"
 *               cdate: "2023-06-23"
 *               cmonthYear: "2023-06"
 *               operatorname: "John Doe"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getSupervisorWiseEfficiencyFilter
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/supervisor-wise-efficiency-filter', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    const product = req.query.product_id;
    const section = req.query.section_id;
    const shift = req.query.shift;
    const search = req.query.search;
    const fromdate = req.query.fromdate;
    const todate = req.query.todate;

    const inputFormat = 'DD/MM/YYYY';
    const outputFormat = 'YYYY-MM-DD';
    const fd = dateUtils.convertDateFormat(fromdate, inputFormat, outputFormat);
    const td = dateUtils.convertDateFormat(todate, inputFormat, outputFormat);
    const newfd = dateUtils.convertToUnixTimestamp(fd);
    const newtd = dateUtils.convertToUnixTimestamp(td);

    // Log the received data
    console.log('Received data:');
    console.log('Product Name:', product);
    console.log('Section:', section);
    console.log('Shift:', shift);
    console.log('From Date:', fd);
    console.log('To Date:', td);
    console.log('Converted Timestamp:', newfd);
    console.log('Converted Timestamp:', newtd);


    console.log("currentDate", currentDate);
    console.log("currentMonth:", currentMonth);
    console.log("currentYear:", currentYear);
    console.log("currentMonthYear:", currentMonthYear);

    //dates to be passed
    var fdate1 = '';
    var tdate1 = '';
    var cdate = '';
    var cmonthYear = '';

    let whereConditions = [];
    if (search === '5') {
      cdate = currentDate;
      whereConditions.push(`worker_timesheet.date_time = '${currentDate}'`);
    }
    else if (search === '1') {
      const weekDates = dateUtils.getThisWeekStartDateAndEndDate();
      const timestampfromdate = dateUtils.convertToUnixTimestamp(weekDates.startDate);
      const timestamptodate = dateUtils.convertToUnixTimestamp(weekDates.endDate);

      const inputFormat = 'YYYY-MM-DD';
      const outputFormat = 'DD/MM/YYYY';
      fdate1 = dateUtils.convertDateFormat(weekDates.startDate, inputFormat, outputFormat);
      tdate1 = dateUtils.convertDateFormat(weekDates.endDate, inputFormat, outputFormat);

      console.log('Start Date:', weekDates.startDate);
      console.log('End Date:', weekDates.endDate);
      console.log('timestampfromdate:', timestampfromdate);
      console.log('timestamptodate:', timestamptodate);
      console.log('fdate1:', fdate1);
      console.log('tdate1:', tdate1);

      whereConditions.push(`worker_timesheet.time_stamp BETWEEN '${timestampfromdate}' AND '${timestamptodate}'`);
    }
    else if (search === '2') {
      cmonthYear = currentMonthYear;
      whereConditions.push(`worker_timesheet.mon = '${currentMonthYear}'`);
    }
    else if (search === '4') {
      fdate1 = fd;
      tdate1 = td;
      whereConditions.push(`worker_timesheet.time_stamp BETWEEN '${newfd}' AND '${newtd}'`);
    }


    if (product !== undefined && product !== '' && product != null) {
      whereConditions.push(`worker_timesheet.product_name = '${product}'`);
    }
    if (section !== undefined && section !== '' && section != null) {
      whereConditions.push(`worker_timesheet.section = '${section}'`);
    }
    if (shift !== undefined && shift !== '' && shift != null) {
      whereConditions.push(`worker_timesheet.shift = '${shift}'`);
    }
    if (roleid == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${userid}'`);
    }



    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `
   SELECT
   worker_timesheet.*,
   item_masterr.item_description,
   section.section_name,
   geopos_users.name AS operator_name,
   geopos_users.entryid,
   Concat(geopos_users.name,"[",geopos_users.entryid,"]","(",worker_timesheet.site,")") as col1,
   SUM(worker_timesheet.HOUR1+worker_timesheet.HOUR2+worker_timesheet.HOUR3+worker_timesheet.HOUR4+worker_timesheet.HOUR5+worker_timesheet.HOUR6+worker_timesheet.HOUR7+worker_timesheet.HOUR8+worker_timesheet.HOUR9+worker_timesheet.HOUR10+worker_timesheet.HOUR11+worker_timesheet.HOUR12) as comp,
   count(*) as tt
 FROM
   worker_timesheet
   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
   LEFT JOIN section ON section.id = worker_timesheet.section
   LEFT JOIN geopos_users ON geopos_users.id = worker_timesheet.operator_id
 WHERE
   ${whereClause}
 GROUP BY
   worker_timesheet.date_time,
   worker_timesheet.line,
   worker_timesheet.product_name,
   worker_timesheet.section,
   worker_timesheet.shift
   `;

    const results = await executeQuery(connection, query);


    const data = {
      timesheet: results,
      fdate: fdate1,
      tdate: tdate1,
      cdate: cdate,
      cmonthYear: cmonthYear,
      operatorname: results.length > 0 ? results[0].operator_name : null
    };

    res.json(data);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /report/worker-efficiency-today:
 *   get:
 *     summary: Get worker efficiency details for today.
 *     description: |
 *       This endpoint retrieves worker efficiency details for the current date.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve worker efficiency details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve worker efficiency details.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with worker efficiency details for today.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - date_time: "2023-06-23"
 *                   entry_id: "123"
 *                   product_name: "ProductA"
 *                   section: "SectionA"
 *                   operator_name: "John Doe"
 *               date: "2023-06-23"
 *               operatorname: "John Doe"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getWorkerEfficiencyToday
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/worker-efficiency-today', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    let whereConditions = [];
    whereConditions.push(`worker_timesheet.date_time = '${currentDate}'`);
    if (roleid == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${userid}'`);
    }
    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `
   SELECT
   worker_timesheet.*,
   item_masterr.item_description,
   section.section_name,
   geopos_users.name AS operator_name
 FROM
   worker_timesheet
   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
   LEFT JOIN section ON section.id = worker_timesheet.section
   LEFT JOIN geopos_users ON geopos_users.id = worker_timesheet.operator_id
 WHERE
   ${whereClause}
 GROUP BY
   worker_timesheet.date_time,
   worker_timesheet.entry_id,
   worker_timesheet.product_name,
   worker_timesheet.section
   `;

    const results = await executeQuery(connection, query);

    const data = {
      timesheet: results,
      date: currentDate,
      operatorname: results.length > 0 ? results[0].operator_name : null
    };

    res.json(data);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /report/worker-efficiency-filter:
 *   get:
 *     summary: Get worker efficiency details with filtering options.
 *     description: |
 *       This endpoint retrieves worker efficiency details based on filtering options.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve worker efficiency details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve worker efficiency details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: product_id
 *         description: ID of the product for filtering.
 *         schema:
 *           type: string
 *       - in: query
 *         name: section_id
 *         description: ID of the section for filtering.
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromdate
 *         required: true
 *         description: Start date for filtering (format- DD/MM/YYYY).
 *         schema:
 *           type: string
 *       - in: query
 *         name: todate
 *         required: true
 *         description: End date for filtering (format- DD/MM/YYYY).
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with worker efficiency details and filtering options.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - date_time: "2023-06-23"
 *                   entry_id: "123"
 *                   product_name: "ProductA"
 *                   section: "SectionA"
 *                   operator_name: "John Doe"
 *               fdate: "2023-06-23"
 *               tdate: "2023-06-30"
 *               operatorname: "John Doe"
 *       '400':
 *         description: Invalid date range provided.
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid date range provided"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getWorkerEfficiencyFilter
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InvalidDateRangeError} Will throw an error if an invalid date range is provided.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/worker-efficiency-filter', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    const product = req.query.product_id;
    const section = req.query.section_id;
    const fromdate = req.query.fromdate;
    const todate = req.query.todate;


    if (!fromdate || !todate) {
      res.status(400).json({ error: 'Invalid date range provided' });
      return;
    }

    const inputFormat = 'DD/MM/YYYY';
    const outputFormat = 'YYYY-MM-DD';
    const fd = dateUtils.convertDateFormat(fromdate, inputFormat, outputFormat);
    const td = dateUtils.convertDateFormat(todate, inputFormat, outputFormat);
    const newfd = dateUtils.convertToUnixTimestamp(fd);
    const newtd = dateUtils.convertToUnixTimestamp(td);

    // Log the received data
    console.log('Received data:');
    console.log('Product Name:', product);
    console.log('Section:', section);
    console.log('From Date:', fd);
    console.log('To Date:', td);
    console.log('Converted Timestamp:', newfd);
    console.log('Converted Timestamp:', newtd);

    let whereConditions = [];

    whereConditions.push(`worker_timesheet.time_stamp BETWEEN '${newfd}' AND '${newtd}'`);

    if (product !== undefined && product !== '') {
      whereConditions.push(`worker_timesheet.product_name = '${product}'`);
    }
    if (section !== undefined && section !== '') {
      whereConditions.push(`worker_timesheet.section = '${section}'`);
    }
    if (roleid == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${userid}'`);
    }
    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `
   SELECT
   worker_timesheet.*,
   item_masterr.item_description,
   section.section_name,
   geopos_users.name AS operator_name
 FROM
   worker_timesheet
   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
   LEFT JOIN section ON section.id = worker_timesheet.section
   LEFT JOIN geopos_users ON geopos_users.id = worker_timesheet.operator_id
 WHERE
   ${whereClause}
 GROUP BY
   worker_timesheet.date_time,
   worker_timesheet.entry_id,
   worker_timesheet.product_name,
   worker_timesheet.section
   `;

    const results = await executeQuery(connection, query);

    const data = {
      timesheet: results,
      fdate: fd,
      tdate: td,
      operatorname: results.length > 0 ? results[0].operator_name : null
    };

    res.json(data);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /report/ppp-today:
 *   get:
 *     summary: Get PPP (Production, Performance, Productivity) details for today.
 *     description: |
 *       This endpoint retrieves PPP details for the current date, including worker_timesheet data, fg_details data,
 *       and additional calculated values such as sum and average.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve PPP details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve PPP details.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with PPP details for today.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - date_time: "2023-06-23"
 *                   entry_id: "123"
 *                   product_name: "ProductA"
 *                   shift: "Morning"
 *                   line: "LineA"
 *                   item_description: "ItemDescriptionA"
 *                   section_name: "SectionA"
 *                   sum: 500
 *                   avg: 10
 *               cdate: "2023-06-23"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getPPPDetailsToday
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/ppp-today', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;

    let whereConditions = [`worker_timesheet.date_time = ?`];
    const queryParams = [currentDate];

    if (roleid == 3) {
      whereConditions.push(`worker_timesheet.operator_id = ?`);
      queryParams.push(userid);
    }
    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `
  SELECT
    worker_timesheet.*,
    item_masterr.item_description,
    section.section_name
  FROM
    worker_timesheet
    LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
    LEFT JOIN section ON section.id = worker_timesheet.section
  WHERE
    ${whereClause}
  GROUP BY 
    worker_timesheet.product_name,
    worker_timesheet.shift,
    worker_timesheet.date_time
`;

    // Execute the main query
    const results = await executeQuery(connection, query, queryParams);

    // Loop through the results and execute another query for each row
    const promises = results.map(async (row) => {

      let whereConditions1 = [];
      whereConditions1.push(`fg_details.date_time = '${currentDate}'`);
      whereConditions1.push(`fg_details.product_name = '${row.product_name}'`);
      whereConditions1.push(`fg_details.shift = '${row.shift}'`);
      whereConditions1.push(`fg_details.line = '${row.line}'`);
      if (roleid == 3) {
        whereConditions1.push(`fg_details.user = '${userid}'`);
      }
      const whereClause1 = whereConditions1.join(' AND ');

      let whereConditions2 = [];
      whereConditions2.push(`w.date_time = '${currentDate}'`);
      whereConditions2.push(`w.product_name = '${row.product_name}'`);
      whereConditions2.push(`w.shift = '${row.shift}'`);
      whereConditions2.push(`w.line = '${row.line}'`);
      if (roleid == 3) {
        whereConditions2.push(`w.operator_id = '${userid}'`);
      }
      const whereClause2 = whereConditions2.join(' AND ');

      // Combined Query: Calculate SUM and AVG in a single query
      const combinedQuery = `
      SELECT 
        (SELECT SUM(fg_output) FROM fg_details WHERE ${whereClause1} GROUP BY product_name, date_time, shift, line LIMIT 1) AS sum,
        COUNT(DISTINCT w.entry_id) AS avg
      FROM 
        worker_timesheet AS w
        JOIN item_masterr AS f ON w.product_name = f.id
      WHERE 
        ${whereClause2}
      GROUP BY  
        w.product_name, w.date_time, w.shift, w.line
    `;

      // Execute the combined query
      const additionalResults = await executeQuery(connection, combinedQuery);

      // Extract sum and avg from additionalResults
      const sum = additionalResults[0]?.sum || 0;
      const avg = additionalResults[0]?.avg || 0;

      // Assign sum and avg to the row object
      row.sum = sum;
      row.avg = avg;
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    // Construct the response
    const data = {
      timesheet: results,
      cdate: currentDate
    };

    // Send the response
    res.json(data);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});



/**
 * @swagger
 * /report/ppp-filter:
 *   get:
 *     summary: Get PPP (Production, Performance, Productivity) details with filters.
 *     description: |
 *       This endpoint retrieves PPP details based on provided filters, including worker_timesheet data,
 *       fg_details data, and additional calculated values such as sum and average.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: roleid
 *         required: true
 *         description: ID of the role for which to retrieve PPP details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userid
 *         required: true
 *         description: ID of the user for whom to retrieve PPP details.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: product_id
 *         description: ID of the product for which to filter PPP details.
 *         schema:
 *           type: string
 *       - in: query
 *         name: shift
 *         description: Shift for which to filter PPP details.
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromdate
 *         required: true
 *         description: Start date for the date range.
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: todate
 *         required: true
 *         description: End date for the date range.
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: Successful response with filtered PPP details.
 *         content:
 *           application/json:
 *             example:
 *               timesheet:
 *                 - date_time: "2023-06-23"
 *                   entry_id: "123"
 *                   product_name: "ProductA"
 *                   shift: "Morning"
 *                   line: "LineA"
 *                   item_description: "ItemDescriptionA"
 *                   section_name: "SectionA"
 *                   sum: 500
 *                   avg: 10
 *               product: "ProductA"
 *               shift: "Morning"
 *               fromdatetimestamp: 1624377600
 *               todatetimestamp: 1624463999
 *               fromdate1: "23-06-2023"
 *               todate1: "24-06-2023"
 *       '400':
 *         description: Invalid date range provided.
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid date range provided"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getPPPDetailsWithFilters
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InvalidDateRangeError} Will throw an error if an invalid date range is provided.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/ppp-filter', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const roleid = req.query.roleid;
    const userid = req.query.userid;
    var product_name = req.query.product_id;
    var shift = req.query.shift;
    const fromdate = req.query.fromdate;
    const todate = req.query.todate;


    if (!fromdate || !todate) {
      res.status(400).json({ error: 'Invalid date range provided' });
      return;
    }

    const inputFormat = 'DD/MM/YYYY';
    const outputFormat = 'YYYY-MM-DD';
    const outputFormat2 = 'DD-MM-YYYY';
    const fd = dateUtils.convertDateFormat(fromdate, inputFormat, outputFormat);
    const td = dateUtils.convertDateFormat(todate, inputFormat, outputFormat);
    const newfd = dateUtils.convertToUnixTimestamp(fd);
    const newtd = dateUtils.convertToUnixTimestamp(td);
    const fd2 = dateUtils.convertDateFormat(fromdate, inputFormat, outputFormat2);
    const td2 = dateUtils.convertDateFormat(todate, inputFormat, outputFormat2);

    // Log the received data
    console.log('Received data:');
    console.log('Product Name:', product_name);
    console.log('Shift:', shift);
    console.log('From Date:', fd);
    console.log('To Date:', td);
    console.log('Converted Timestamp1:', newfd);
    console.log('Converted Timestamp:', newtd);

    // Construct where conditions for the main query
    const whereConditions = [`worker_timesheet.time_stamp BETWEEN ? AND ?`];
    const queryParams = [newfd, newtd];


    if (product_name !== '' && product_name !== undefined && product_name != null) {
      whereConditions.push(`worker_timesheet.product_name = ?`);
      queryParams.push(product_name);
    }
    if (shift !== '' && shift !== undefined && shift != null) {
      whereConditions.push(`worker_timesheet.shift = ?`);
      queryParams.push(shift);
    }
    if (roleid == 3) {
      whereConditions.push(`worker_timesheet.operator_id = ?`);
      queryParams.push(userid);
    }
    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `
  SELECT
    worker_timesheet.*,
    item_masterr.item_description,
    section.section_name
  FROM
    worker_timesheet
    LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
    LEFT JOIN section ON section.id = worker_timesheet.section
  WHERE
    ${whereClause}
  GROUP BY 
    worker_timesheet.product_name,
    worker_timesheet.shift,
    worker_timesheet.date_time,
    worker_timesheet.line
`;

    // Execute the main query
    const results = await executeQuery(connection, query, queryParams);

    // Loop through the results and execute another query for each row
    const promises = results.map(async (row) => {

      let whereConditions1 = [
        `fg_details.time_stamp BETWEEN '${newfd}' AND '${newtd}'`
      ];
      whereConditions1.push(`fg_details.product_name = '${row.product_name}'`);
      whereConditions1.push(`fg_details.shift = '${row.shift}'`);
      whereConditions1.push(`fg_details.line = '${row.line}'`);
      if (roleid == 3) {
        whereConditions1.push(`fg_details.user = '${userid}'`);
      }
      const whereClause1 = whereConditions1.join(' AND ');


      let whereConditions2 = [
        `w.time_stamp BETWEEN '${newfd}' AND '${newtd}'`
      ];
      whereConditions2.push(`w.product_name = '${row.product_name}'`);
      whereConditions2.push(`w.shift = '${row.shift}'`);
      whereConditions2.push(`w.line = '${row.line}'`);
      if (roleid == 3) {
        whereConditions2.push(`w.operator_id = '${userid}'`);
      }
      const whereClause2 = whereConditions2.join(' AND ');


      // Combined Query: Calculate SUM and AVG in a single query
      const combinedQuery = `
      SELECT 
        (SELECT SUM(fg_output) FROM fg_details WHERE ${whereClause1} GROUP BY product_name, time_stamp, shift, line LIMIT 1) AS sum,
        COUNT(DISTINCT w.entry_id) AS avg
      FROM 
        worker_timesheet AS w
      WHERE 
        ${whereClause2}
      GROUP BY  
        w.product_name, w.date_time, w.shift, w.line
    `;

      // Execute the combined query
      const additionalResults = await executeQuery(connection, combinedQuery);

      // Extract sum and avg from additionalResults
      const sum = additionalResults[0]?.sum || 0;
      const avg = additionalResults[0]?.avg || 0;

      // Assign sum and avg to the row object
      row.sum = sum;
      row.avg = avg;

    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    const data = {
      timesheet: results,
      product: product_name,
      shift: shift,
      fromdatetimestamp: newfd,
      todatetimestamp: newtd,
      fromdate1: fd2,
      todate1: td2,
    };
    //console.log("datadata1: ", data);
    res.json(data);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});



/**
 * @swagger
 * /report/hr:
 *   get:
 *     summary: Get HR report for the current date.
 *     description: |
 *       This endpoint retrieves HR report details for the current date, including active employees and their sections.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response with HR report details.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "Employee A"
 *                 date: "2024-02-29"
 *                 section_name: "Section A"
 *               - id: 2
 *                 name: "Employee B"
 *                 date: "2024-02-29"
 *                 section_name: "Section B"
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getHRReport
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/hr', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const whereConditions = [];
    whereConditions.push(`employees_moz.date = ?`);
    whereConditions.push(`employees_moz.passive_type = 'ACT'`);
    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `SELECT employees_moz.*,section.section_name
             FROM employees_moz
             LEFT JOIN section  ON employees_moz.section_id = section.id
             WHERE ${whereClause}
             ORDER BY employees_moz.id`;

    const results = await executeQuery(connection, query, [currentDate]);

    // Append the tar value to the results object
    const response = {
      timesheet: results,
      date: currentDate,
    };
    // Return the response object
    res.send(response);
    //console.log(response);


  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /report/financial:
 *   get:
 *     summary: Get financial report for the current date.
 *     description: |
 *       This endpoint retrieves financial report details for the current date, including worker timesheet information.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response with financial report details.
 *         content:
 *           application/json:
 *             example:
 *               - entry_id: 1
 *                 date_time: "2024-02-29 08:00:00"
 *                 product_name: "Product A"
 *                 section: "Section A"
 *                 operator_id: 123
 *               - entry_id: 2
 *                 date_time: "2024-02-29 09:00:00"
 *                 product_name: "Product B"
 *                 section: "Section B"
 *                 operator_id: 456
 *       '500':
 *         description: Internal server error during data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 *
 * @function
 * @name getFinancialReport
 * @memberof module:Routes/Report
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during data retrieval.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/report/financial', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const whereConditions = [];
    whereConditions.push(`worker_timesheet.date_time = ?`);
    const whereClause = whereConditions.join(' AND ');

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `SELECT worker_timesheet.*
             FROM worker_timesheet
             WHERE ${whereClause}`;


    const results = await executeQuery(connection, query, [currentDate]);

    // Append the tar value to the results object
    const response = {
      timesheet: results,
      date_time: currentDate,
    };
    // Return the response object
    res.send(response);
    //console.log(response);
  }
  catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});

//============================================ Report End =====================================================


//============================================ Company Start =====================================================

/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     System:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         cname:
 *           type: string
 *           example: "Company Name"
 *         address:
 *           type: string
 *           example: "Company Address"
 *         city:
 *           type: string
 *           example: "City Name"
 *         region:
 *           type: string
 *           example: "Region Name"
 *         country:
 *           type: string
 *           example: "Country Name"
 *         postbox:
 *           type: string
 *           example: "12345"
 *         phone:
 *           type: string
 *           example: "123-456-7890"
 *         email:
 *           type: string
 *           example: "company@example.com"
 *         taxid:
 *           type: string
 *           example: "TAX12345"
 *         tax:
 *           type: integer
 *           example: 10
 *         currency:
 *           type: string
 *           example: "USD"
 *         currency_format:
 *           type: integer
 *           example: 1
 *         prefix:
 *           type: string
 *           example: "Prefix"
 *         dformat:
 *           type: integer
 *           example: 1
 *         zone:
 *           type: string
 *           example: "Time Zone"
 *         logo:
 *           type: string
 *           example: "logo.png"
 *         lang:
 *           type: string
 *           example: "english"
 *         foundation:
 *           type: string
 *           format: date
 *           example: "2024-03-01"
 * 
 * /company/update:
 *   put:
 *     summary: Update company details.
 *     description: |
 *       This endpoint updates the details of the company in the system.
 *     tags:
 *       - Company
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: Company details to be updated.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cname:
 *                 type: string
 *                 description: The name of the company.
 *               phone:
 *                 type: string
 *                 description: The phone number of the company.
 *               email:
 *                 type: string
 *                 description: The email address of the company.
 *               address:
 *                 type: string
 *                 description: The address of the company.
 *               city:
 *                 type: string
 *                 description: The city where the company is located.
 *               region:
 *                 type: string
 *                 description: The region where the company is located.
 *               country:
 *                 type: string
 *                 description: The country where the company is located.
 *               postbox:
 *                 type: string
 *                 description: The postbox number of the company.
 *               taxid:
 *                 type: string
 *                 description: The tax identification number of the company.
 *               foundation:
 *                 type: string
 *                 description: The foundation date of the company in the format 'YYYY-MM-DD'.
 *             required:
 *               - cname
 *               - phone
 *               - email
 *               - address
 *               - city
 *               - region
 *               - country
 *               - postbox
 *               - taxid
 *               - foundation
 *     responses:
 *       '200':
 *         description: Successful response indicating the company details have been updated.
 *         content:
 *           application/json:
 *             example:
 *               message: "Record Updated successfully"
 *       '404':
 *         description: The specified company record was not found.
 *         content:
 *           application/json:
 *             example:
 *               message: "Record not Updated"
 *       '500':
 *         description: Internal server error during the update process.
 *         content:
 *           application/json:
 *             example:
 *               message: "Error update record"
 *
 * @function
 * @name updateCompanyDetails
 * @memberof module:Routes/Company
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {NotFoundError} Will throw an error if the specified company record is not found.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the update process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put('/company/update', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const cname = req.body.cname;
    const phone = req.body.phone;
    const email = req.body.email;
    const address = req.body.address;
    const city = req.body.city;
    const region = req.body.region;
    const country = req.body.country;
    const postbox = req.body.postbox;
    const taxid = req.body.taxid;
    const foundation = req.body.foundation;
    //foundation = "2020-11-25";

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = 'UPDATE geopos_system SET cname=?,phone=?,email=?,address=?,city=?,region=?,country=?,postbox=?,taxid=?,foundation=?  WHERE id = ?';

    const result = await executeQuery(connection, query, [cname, phone, email, address, city, region, country, postbox, taxid, foundation, 1]);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Record not Updated' })
    } else {
      res.status(200).json({ message: 'Record Updated successfully' })
    }

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /company/{id}:
 *   get:
 *     summary: Get company details by ID.
 *     description: |
 *       This endpoint retrieves details of the company by its ID.
 *     tags:
 *       - Company
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the company to retrieve details for.
 *     responses:
 *       '200':
 *         description: Successful response with the details of the specified company.
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               cname: "Company Name"
 *               phone: "+1234567890"
 *               email: "company@example.com"
 *               address: "Company Address"
 *               city: "City"
 *               region: "Region"
 *               country: "Country"
 *               postbox: "12345"
 *               taxid: "ABCDE12345"
 *               foundation: "2020-01-01"
 *       '404':
 *         description: The specified company record was not found.
 *         content:
 *           application/json:
 *             example:
 *               message: "Company not found"
 *       '500':
 *         description: Internal server error during the retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               message: "Error retrieving company details"
 *
 * @function
 * @name getCompanyById
 * @memberof module:Routes/Company
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {NotFoundError} Will throw an error if the specified company record is not found.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/company/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const id = req.params.id;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const result = await executeQuery(connection, 'SELECT * FROM geopos_system WHERE id=?', [id]);

    res.send(result[0]);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /company/logo/{id}:
 *   get:
 *     summary: Get company logo by ID.
 *     description: |
 *       This endpoint retrieves the logo of the company by its ID.
 *     tags:
 *       - Company
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the company to retrieve the logo for.
 *     responses:
 *       '200':
 *         description: Successful response with the logo of the specified company.
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *               example: <Buffer ...> (Binary data representing the image)
 *       '404':
 *         description: The specified company record or logo was not found.
 *         content:
 *           application/json:
 *             example:
 *               message: "Company or logo not found"
 *       '500':
 *         description: Internal server error during the retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               message: "Error retrieving company logo"
 *
 * @function
 * @name getCompanyLogoById
 * @memberof module:Routes/Company
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {NotFoundError} Will throw an error if the specified company record or logo is not found.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/company/logo/:id', async (req, res) => {
  let connection;
  try {
    const id = req.params.id;
    // Get a connection from the pool
    connection = await getPoolConnection();
    const result = await executeQuery(connection, 'SELECT logo FROM geopos_system WHERE id=?', [id]);
    res.send(result[0]);
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


// Configure Multer to specify where to store uploaded files
const logo_storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${config.storage.company}`); // Destination folder for uploads
  },
  filename: (req, file, cb) => {
    // Generate a random number between 10000 and 99999 (5-digit number)
    const randomNumber = Math.floor(Math.random() * 90000) + 10000;
    // Get the file extension
    const fileExtension = file.originalname.split('.').pop();
    // Combine the random number, a timestamp, and the original filename
    const uniqueFilename = `${randomNumber}.${fileExtension}`;
    cb(null, uniqueFilename);

    // cb(null, file.originalname); // Use the original file name
  },
});

// Configure multer to use the logo_storage configuration
const upload_logo = multer({ storage: logo_storage });

/**
 * @swagger
 * /company/upload-logo:
 *   post:
 *     summary: Upload company logo.
 *     description: |
 *       This endpoint allows the upload of the company logo. The logo is associated with the company record identified by ID 1.
 *     tags:
 *       - Company
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Successful response indicating the successful upload and update of the company logo.
 *         content:
 *           application/json:
 *             example:
 *               message: "File uploaded and filename saved successfully"
 *       '500':
 *         description: Internal server error during the upload and update process.
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 *
 * @function
 * @name uploadCompanyLogo
 * @memberof module:Routes/Company
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the upload and update process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post('/company/upload-logo', authenticateJWT, upload_logo.single('image'), async (req, res) => {
  let connection;
  try {
    var id = 1;
    // Get the uploaded filename
    const uploadedFilename = req.file.filename;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Update the 'logo' column in the 'geopos_system' table with id 1
    const query = `UPDATE geopos_system SET logo = ? WHERE id = ?`;

    const result = await executeQuery(connection, query, [uploadedFilename, id]);

    console.log("File uploaded successfully");
    res.json({ message: 'File uploaded and filename saved successfully' });
  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


//============================================ Company End =====================================================


//============================================ TV-Display Start =====================================================


/**
 * @swagger
 * /tv-display/employee-present/{site}:
 *   get:
 *     summary: Get the count of present employees for a specific site for TV display.
 *     description: |
 *       This endpoint retrieves the count of present employees for a specific site, intended for TV display. The count is based on the latest date recorded in the `worker_timesheet` table.
 *     tags:
 *       - TV Display
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: site
 *         schema:
 *           type: string
 *         required: true
 *         description: The site for which the count of present employees is requested.
 *     responses:
 *       '200':
 *         description: Successful response containing the count of present employees.
 *         content:
 *           application/json:
 *             example:
 *               p_emp: 10  # Replace with the actual count of present employees
 *       '500':
 *         description: Internal server error during the retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getEmployeePresentCount
 * @memberof module:Routes/TVDisplay
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/tv-display/employee-present/:site', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const site = req.params.site;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const date_query = `SELECT date_time FROM worker_timesheet order by id desc limit 1`;

    const dateresult = await executeQuery(connection, date_query);

    var lastDate = dateresult[0].date_time;
    // const query = `SELECT COUNT(id) AS total_emp FROM employees_ota WHERE passive_type='ACT' AND status='P' AND date='${lastDate}'`;
    const query = `SELECT * FROM attendance WHERE date= ? and site= ?`;

    const result = await executeQuery(connection, query, [lastDate, site]);

    var total_emp = 0;
    if (result.length > 0) {
      total_emp = result[0].permanent;
    }
    const response = {
      p_emp: total_emp, // Use "totalItem" as the key instead of "rowCount"
    };
    res.send(response);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /tv-display/employee-active/{site}:
 *   get:
 *     summary: Get the count of active employees for a specific site for TV display.
 *     description: |
 *       This endpoint retrieves the count of active employees for a specific site, based on the latest date recorded in the `worker_timesheet` table. Active employees are determined by unique `entry_id` values for the specified date and site.
 *     tags:
 *       - TV Display
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: site
 *         schema:
 *           type: string
 *         required: true
 *         description: The site for which the count of active employees is requested.
 *     responses:
 *       '200':
 *         description: Successful response containing the count of active employees.
 *         content:
 *           application/json:
 *             example:
 *               actemp: 8  # Replace with the actual count of active employees
 *       '500':
 *         description: Internal server error during the retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getActiveEmployeeCount
 * @memberof module:Routes/TVDisplay
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/tv-display/employee-active/:site', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const site = req.params.site;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const date_query = `SELECT date_time FROM worker_timesheet order by id desc limit 1`;

    const dateresult = await executeQuery(connection, date_query);

    var lastDate = dateresult[0].date_time;
    const query = `SELECT COUNT(*) AS noOfEmp FROM worker_timesheet WHERE date_time = ? AND site= ? group by date_time,entry_id`;

    const result = await executeQuery(connection, query, [lastDate, site]);

    const actemp = result.length; // Use the length of results to get the count
    const response = {
      actemp: actemp,
    };
    res.send(response);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});

/**
 * @swagger
 * /tv-display/mtd-avg-output/{site}:
 *   get:
 *     summary: Get the total FG output for the current month (Month-To-Date) for TV display.
 *     description: |
 *       This endpoint retrieves the total finished goods (FG) output for the current month (Month-To-Date) for a specific site. The output is obtained from the `fg_details` table based on the substring of the `date_time` field, and the result is presented in kilograms (K).
 *     tags:
 *       - TV Display
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: site
 *         schema:
 *           type: string
 *         required: true
 *         description: The site for which the total FG output is requested.
 *     responses:
 *       '200':
 *         description: Successful response containing the total FG output for the current month.
 *         content:
 *           application/json:
 *             example:
 *               total_fg_outputK: 1200  # Replace with the actual total FG output for the current month in kilograms
 *       '500':
 *         description: Internal server error during the retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getMTDAvgOutput
 * @memberof module:Routes/TVDisplay
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/tv-display/mtd-avg-output/:site', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const site = req.params.site;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `SELECT SUM(fg_output) AS tar FROM fg_details WHERE SUBSTRING(date_time, 4) = ? and site=?`;

    const results = await executeQuery(connection, query, [currentMonth, site]);

    const total_fg_outputK = results[0].tar || 0; // Use results[0].tar or provide a default value (0) if tar is undefined
    const response = {
      total_fg_outputK: total_fg_outputK,
    };
    res.send(response);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /tv-display/total-fg-output/{site}:
 *   get:
 *     summary: Get the total finished goods (FG) output for the specified site for TV display.
 *     description: |
 *       This endpoint retrieves the total finished goods (FG) output for a specific site on the latest recorded date in the `worker_timesheet` table. The result is obtained by joining the `worker_timesheet` table with the `item_masterr` table and calculating the sum of the FG output from the `fg_details` table based on the product name and site.
 *     tags:
 *       - TV Display
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: site
 *         schema:
 *           type: string
 *         required: true
 *         description: The site for which the total FG output is requested.
 *     responses:
 *       '200':
 *         description: Successful response containing the total FG output for the specified site.
 *         content:
 *           application/json:
 *             example:
 *               total_fg_outputf: 1200  # Replace with the actual total FG output for the specified site
 *       '500':
 *         description: Internal server error during the retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalFGOutput
 * @memberof module:Routes/TVDisplay
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/tv-display/total-fg-output/:site', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const site = req.params.site;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const date_query = `SELECT date_time FROM worker_timesheet order by id desc limit 1`;

    const dateresult = await executeQuery(connection, date_query);

    var lastDate = dateresult[0].date_time;


    const query = `SELECT * FROM worker_timesheet AS w JOIN item_masterr AS f ON w.product_name = f.id WHERE w.date_time = ? and w.site= ? GROUP BY w.product_name, w.date_time`;

    const results = await executeQuery(connection, query, [lastDate, site]);

    let total_fg_outputf = 0;

    const promises = results.map(async (row) => {

      const subQuery = `SELECT *, SUM(fg_output) AS tar FROM fg_details WHERE date_time = ? AND product_name = ? and site= ? GROUP BY product_name, date_time`;
      const result = await executeQuery(connection, subQuery, [lastDate, row.product_name, site]);
      const sum = result.length > 0 ? result[0].tar : 0;
      total_fg_outputf += sum;

    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    const response = {
      total_fg_outputf: total_fg_outputf,
    };
    res.send(response);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /tv-display/mtd-ppp/{site}:
 *   get:
 *     summary: Get the month-to-date (MTD) PPP (Production per Person) for the specified site for TV display.
 *     description: |
 *       This endpoint calculates the month-to-date (MTD) PPP (Production per Person) for a specific site based on the count of distinct employees recorded in the `worker_timesheet` table for the given month. The result is obtained by dividing the total finished goods (FG) output (`total_fg_outputK`) for the specified site by the count of distinct employees (`noOfEmp`) recorded in the `worker_timesheet` table.
 *     tags:
 *       - TV Display
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: site
 *         schema:
 *           type: string
 *         required: true
 *         description: The site for which the month-to-date PPP is calculated.
 *     responses:
 *       '200':
 *         description: Successful response containing the month-to-date PPP for the specified site.
 *         content:
 *           application/json:
 *             example:
 *               resk: 3.45  # Replace with the actual month-to-date PPP for the specified site
 *       '500':
 *         description: Internal server error during the calculation process.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getMTDPPP
 * @memberof module:Routes/TVDisplay
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the calculation process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/tv-display/mtd-ppp/:site', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const site = req.params.site;

    // Get a connection from the pool
    connection = await getPoolConnection();

    // Query to calculate the sum of noOfEmp for the given monthK
    const query = `
    SELECT SUM(a.noOfEmp) as res
    FROM (SELECT COUNT(*) AS noOfEmp
          FROM worker_timesheet
          WHERE mon = ? and site=?
          GROUP BY entry_id, date_time) a
  `;

    const result = await executeQuery(connection, query, [currentMonth, site]);

    const ros1K = result[0]; // Assuming you have a single result row
    const resk = ros1K.res; // Assuming you have a single result row
    //console.log(resk);
    //const total_fg_outputK = 12345; // Replace with your actual total_fg_outputK value
    //const ppK = total_fg_outputK / ros1K.res;
    //const total_pppK = ppK.toFixed(2); // Format the result to two decimal places
    res.json({ resk });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /tv-display/fg-output-slide/{site}:
 *   get:
 *     summary: Get the finished goods (FG) output details for the specified site for TV display.
 *     description: |
 *       This endpoint retrieves the details of finished goods (FG) output for the specified site based on the most recent date recorded in the `worker_timesheet` table. The result includes the FG output (`tar`), item description (`item_description`), and other details for each product in the specified site.
 *     tags:
 *       - TV Display
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: site
 *         schema:
 *           type: string
 *         required: true
 *         description: The site for which FG output details are retrieved.
 *     responses:
 *       '200':
 *         description: Successful response containing the details of FG output for the specified site.
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - item_description: "Product A"
 *                   shift: "Day"
 *                   tar: 1500
 *                 - item_description: "Product B"
 *                   shift: "Night"
 *                   tar: 2000
 *               date: "2024-03-01T12:30:45Z"  # Replace with the actual most recent date
 *       '500':
 *         description: Internal server error during the retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getFGOutputSlide
 * @memberof module:Routes/TVDisplay
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/tv-display/fg-output-slide/:site', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const site = req.params.site;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const date_query = `SELECT date_time FROM worker_timesheet order by id desc limit 1`;

    const dateresult = await executeQuery(connection, date_query);

    var lastDate = dateresult[0].date_time;

    const query = `
  SELECT fg_details.*, SUM(fg_details.fg_output) as tar, item_masterr.item_description
  FROM fg_details
  JOIN item_masterr ON fg_details.product_name = item_masterr.id
  WHERE fg_details.date_time = ? and site=?
  GROUP BY fg_details.product_name
`;

    const results = await executeQuery(connection, query, [lastDate, site]);

    if (results.length === 0) {
      const data = { data: results, date: lastDate };
      res.json(data);
    }
    else {
      const data = { data: results, date: lastDate };
      res.json(data); // Wrap the response in a data object
    }

    // const data = results.map((row) => ({
    //   item_description: row.item_description,
    //   shift: row.shift,
    //   tar: row.tar,
    // }));

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /tv-display/itemwise-ppp-slide/{site}:
 *   get:
 *     summary: Get item-wise production per person (PPP) details for the specified site for TV display.
 *     description: |
 *       This endpoint retrieves item-wise production per person (PPP) details for the specified site based on the most recent date recorded in the `worker_timesheet` table. The result includes the item description (`itemDescription`), finished goods (FG) output (`fgOutput`), total PPP (`tppp`), and calculated PPP (`rew`) for each product in the specified site.
 *     tags:
 *       - TV Display
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: site
 *         schema:
 *           type: string
 *         required: true
 *         description: The site for which item-wise PPP details are retrieved.
 *     responses:
 *       '200':
 *         description: Successful response containing item-wise PPP details for the specified site.
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - itemDescription: "Product A"
 *                   fgOutput: 1500
 *                   tppp: 5  # Assuming total PPP for the product
 *                   rew: 300  # Calculated PPP for the product
 *                 - itemDescription: "Product B"
 *                   fgOutput: 2000
 *                   tppp: 4  # Assuming total PPP for the product
 *                   rew: 500  # Calculated PPP for the product
 *               date: "2024-03-01T12:30:45Z"  # Replace with the actual most recent date
 *       '500':
 *         description: Internal server error during the retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getItemwisePPP
 * @memberof module:Routes/TVDisplay
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/tv-display/itemwise-ppp-slide/:site', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const site = req.params.site;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const date_query = `SELECT date_time FROM worker_timesheet order by id desc limit 1`;

    const dateresult = await executeQuery(connection, date_query);

    var lastDate = dateresult[0].date_time;

    const query1 = `
    SELECT w.*, f.item_description
    FROM worker_timesheet w
    JOIN item_masterr f ON w.product_name = f.id
    WHERE w.date_time = ? and  w.site= ?
    GROUP BY w.product_name, w.date_time
  `;

    const result = await executeQuery(connection, query1, [lastDate, site]);

    let totalFgOutput = 0;
    let totalPpp = 0;

    const responseData = [];
    if (result.length == 0) {
      res.json({ data: responseData, date: lastDate });
      return;
    }

    // Loop through the results and execute another query for each row
    const promises = result.map(async (row) => {
      const productName = row.product_name;

      const query2 = `
        SELECT *, SUM(fg_output) as tar
        FROM fg_details
        WHERE date_time = ? AND product_name = ? and  site=?
        GROUP BY product_name, date_time
      `;

      const result2 = await executeQuery(connection, query2, [lastDate, productName, site]);

      const row2 = result2[0];
      const sum = row2 ? row2.tar : 0;
      const tppp = row.tppp;

      const query3 = `
            SELECT COUNT(*) AS res
            FROM worker_timesheet
            WHERE date_time = ? AND product_name = ? and site=?
          `;
      const result3 = await executeQuery(connection, query3, [lastDate, productName, site]);

      const res1 = result3[0];
      const resCount = res1.res;

      let rew = sum / resCount;
      if (rew === Infinity) {
        rew = 0;
      }

      totalFgOutput += sum;
      totalPpp += rew;

      const itemData = {
        itemDescription: row.item_description,
        fgOutput: sum,
        tppp,
        rew: rew.toFixed(2),
      };

      responseData.push(itemData);
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    res.json({ data: responseData, date: lastDate });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});



/**
 * @swagger
 * /tv-display/mtd-ppp-slide/{site}:
 *   get:
 *     summary: Get month-to-date (MTD) production per person (PPP) details for the specified site for TV display.
 *     description: |
 *       This endpoint retrieves month-to-date (MTD) production per person (PPP) details for the specified site based on the current month and the most recent date recorded in the `worker_timesheet` table. The result includes the item description (`itemDescription`), total PPP (`tppp`), total finished goods (FG) output (`sumk`), and calculated PPP (`rew`) for each product in the specified site.
 *     tags:
 *       - TV Display
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: site
 *         schema:
 *           type: string
 *         required: true
 *         description: The site for which MTD production per person (PPP) details are retrieved.
 *     responses:
 *       '200':
 *         description: Successful response containing MTD PPP details for the specified site.
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - itemDescription: "Product A"
 *                   tppp: 5  # Assuming total PPP for the product
 *                   sumk: 1500  # Total FG output for the product
 *                   rew: 300  # Calculated PPP for the product
 *                 - itemDescription: "Product B"
 *                   tppp: 4  # Assuming total PPP for the product
 *                   sumk: 2000  # Total FG output for the product
 *                   rew: 500  # Calculated PPP for the product
 *               month: "2024-03"  # Replace with the actual current month
 *       '500':
 *         description: Internal server error during the retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getMTDPPP
 * @memberof module:Routes/TVDisplay
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/tv-display/mtd-ppp-slide/:site', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const site = req.params.site;


    // Get a connection from the pool
    connection = await getPoolConnection();

    const query1 = `
    SELECT w.*, f.item_description
    FROM worker_timesheet w
    JOIN item_masterr f ON w.product_name = f.id
    WHERE w.mon = ? and w.site= ?
    GROUP BY w.product_name, w.mon
  `;
    const result = await executeQuery(connection, query1, [currentMonth, site]);


    const responseData = [];

    const promises = result.map(async (row) => {

      const productName = row.product_name;

      const query2 = `
        SELECT *, SUM(fg_output) as tar
        FROM fg_details
        WHERE substr(date_time, 4) = ? AND product_name = ? and site='${site}'
        GROUP BY product_name
      `;
      const result2 = await executeQuery(connection, query2, [currentMonth, productName, site]);

      const row2 = result2[0];
      const sumk = row2 ? row2.tar : 0;
      const tppp = row.tppp;

      const query3 = `
            SELECT COUNT(*) AS res
            FROM worker_timesheet
            WHERE mon = ? AND product_name = ? and site=?
          `;

      const result3 = await executeQuery(connection, query3, [currentMonth, productName, site]);

      const res1 = result3[0];
      const resCount = res1.res;

      let rew = sumk / resCount;
      if (rew === Infinity) {
        rew = 0;
      }

      const itemData = {
        itemDescription: row.item_description,
        tppp,
        sumk,
        rew: rew.toFixed(2),
      };

      responseData.push(itemData);

    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    res.json({ data: responseData, month: currentMonth });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});




/**
 * @swagger
 * /tv-display/top10-workers-slide/{site}:
 *   get:
 *     summary: Get the top 10 workers based on productivity for TV display.
 *     description: |
 *       This endpoint retrieves information about the top 10 workers based on productivity for the specified site. The productivity is calculated as the sum of hours worked divided by the target for each worker. The result includes the entry ID (`entryId`), worker name (`worker`), section name (`sectionName`), and calculated productivity value (`valueSum`).
 *     tags:
 *       - TV Display
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: site
 *         schema:
 *           type: string
 *         required: true
 *         description: The site for which top 10 workers are retrieved based on productivity.
 *     responses:
 *       '200':
 *         description: Successful response containing information about the top 10 workers based on productivity.
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - entryId: 123
 *                   worker: "John Doe"
 *                   sectionName: "Section A"
 *                   valueSum: "75.00%"
 *                 - entryId: 124
 *                   worker: "Jane Smith"
 *                   sectionName: "Section B"
 *                   valueSum: "60.50%"
 *               date: "2024-03-01T12:30:45Z"  # Replace with the actual most recent date
 *       '500':
 *         description: Internal server error during the retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTop10Workers
 * @memberof module:Routes/TVDisplay
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/tv-display/top10-workers-slide/:site', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const site = req.params.site;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const date_query = `SELECT date_time FROM worker_timesheet order by id desc limit 1`;

    const dateresult = await executeQuery(connection, date_query);

    var lastDate = dateresult[0].date_time;
    const query = `
    SELECT worker_timesheet.*, (worker_timesheet.HOUR1 + worker_timesheet.HOUR2 + worker_timesheet.HOUR3 + worker_timesheet.HOUR4 + worker_timesheet.HOUR5 + worker_timesheet.HOUR6 + worker_timesheet.HOUR7 + worker_timesheet.HOUR8 + worker_timesheet.HOUR9 + worker_timesheet.HOUR10 + worker_timesheet.HOUR11 + worker_timesheet.HOUR12) / worker_timesheet.target AS value_sum,section.section_name
    FROM worker_timesheet
    LEFT JOIN section ON worker_timesheet.section = section.id
    WHERE worker_timesheet.date_time = ? AND worker_timesheet.target > 0 AND worker_timesheet.site=?
    GROUP BY worker_timesheet.entry_id, worker_timesheet.product_name, worker_timesheet.line, worker_timesheet.section, worker_timesheet.date_time
    ORDER BY value_sum DESC
    LIMIT 10
  `;

    const result = await executeQuery(connection, query, [lastDate, site]);

    const responseData = result.map(row => ({
      entryId: row.entry_id,
      worker: row.worker,
      sectionName: row.section_name,
      valueSum: `${(row.value_sum * 100).toFixed(2)}%`,
    }));

    // Send the response
    res.json({ data: responseData, date: lastDate });


  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});



/**
 * @swagger
 * /tv-display/top10-workers-mtd-slide/{site}:
 *   get:
 *     summary: Get the top 10 workers based on month-to-date productivity for TV display.
 *     description: |
 *       This endpoint retrieves information about the top 10 workers based on month-to-date productivity for the specified site. The month-to-date productivity is calculated as the average value of hours worked divided by the target for each worker within the current month. The result includes the entry ID (`entryId`), worker name (`worker`), section name (`sectionName`), and calculated month-to-date productivity value (`avv`).
 *     tags:
 *       - TV Display
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: site
 *         schema:
 *           type: string
 *         required: true
 *         description: The site for which top 10 workers are retrieved based on month-to-date productivity.
 *     responses:
 *       '200':
 *         description: Successful response containing information about the top 10 workers based on month-to-date productivity.
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - entryId: 123
 *                   worker: "John Doe"
 *                   sectionName: "Section A"
 *                   avv: "75.00%"
 *                 - entryId: 124
 *                   worker: "Jane Smith"
 *                   sectionName: "Section B"
 *                   avv: "60.50%"
 *               month: "2024-03"  # Replace with the actual current month
 *       '500':
 *         description: Internal server error during the retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTop10WorkersMTDSlide
 * @memberof module:Routes/TVDisplay
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/tv-display/top10-workers-mtd-slide/:site', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const site = req.params.site;

    // Get a connection from the pool
    connection = await getPoolConnection();

    const query = `
    SELECT *, (a.value_sum / a.cnt) as avv
    FROM (
      SELECT w.*, SUM((w.HOUR1 + w.HOUR2 + w.HOUR3 + w.HOUR4 + w.HOUR5 + w.HOUR6 + w.HOUR7 + w.HOUR8 + w.HOUR9 + w.HOUR10 + w.HOUR11 + w.HOUR12) / w.target) AS value_sum, count(w.entry_id) as cnt,s.section_name
      FROM worker_timesheet w
      LEFT JOIN section s ON w.section = s.id
      WHERE w.mon = ? AND w.target > 0 and w.site=?
      GROUP BY w.entry_id, w.product_name, w.line, w.section, w.mon
      ORDER BY value_sum DESC
    ) a
    GROUP BY a.entry_id
    ORDER BY avv DESC
    LIMIT 10
  `;
    const result = await executeQuery(connection, query, [currentMonth, site]);


    const responseData = result.map(row => ({
      entryId: row.entry_id,
      worker: row.worker,
      sectionName: row.section_name,
      avv: `${(row.avv * 100).toFixed(2)}%`,
    }));

    const data = { data: responseData, month: currentMonth };
    res.json(data);
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /tv-display/crosstab:
 *   get:
 *     summary: Get crosstab data for TV display.
 *     description: |
 *       This endpoint retrieves crosstab data for TV display. It includes information about worker timesheets, sections, and their respective summaries. The response provides details for a specific date, along with the day of the week and sections available on that date. The crosstab data includes details about worker timesheets, such as shift (`shift`), target (`target`), and the sum of hours worked (`summ`) for each section (`section`). The result also includes the date (`date`), day of the week (`day`), and an array of sections with their corresponding IDs and names (`sections`).
 *     tags:
 *       - TV Display
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing crosstab data for TV display.
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - entry_id: 123
 *                   product_name: "Product A"
 *                   section: 1
 *                   date_time: "2024-03-01 08:00:00"
 *                   shift: 1
 *                   target: 100
 *                   HOUR1: 10
 *                   HOUR2: 12
 *                   HOUR3: 8
 *                   HOUR4: 10
 *                   HOUR5: 9
 *                   HOUR6: 11
 *                   HOUR7: 10
 *                   HOUR8: 8
 *                   HOUR9: 9
 *                   HOUR10: 12
 *                   HOUR11: 11
 *                   HOUR12: 10
 *                   secdata:
 *                     - section: 1
 *                       sht: 100
 *                       tar: 120
 *                       summ: 112
 *                 - entry_id: 124
 *                   product_name: "Product B"
 *                   section: 2
 *                   date_time: "2024-03-01 08:00:00"
 *                   shift: 2
 *                   target: 150
 *                   HOUR1: 15
 *                   HOUR2: 14
 *                   HOUR3: 12
 *                   HOUR4: 13
 *                   HOUR5: 11
 *                   HOUR6: 14
 *                   HOUR7: 15
 *                   HOUR8: 12
 *                   HOUR9: 13
 *                   HOUR10: 14
 *                   HOUR11: 13
 *                   HOUR12: 15
 *                   secdata:
 *                     - section: 2
 *                       sht: 150
 *                       tar: 160
 *                       summ: 158
 *               sections:
 *                 - id: 1
 *                   section_name: "Section A"
 *                 - id: 2
 *                   section_name: "Section B"
 *               date: "2024-03-01"
 *               day: "Tuesday"
 *       '500':
 *         description: Internal server error during the retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getCrosstabData
 * @memberof module:Routes/TVDisplay
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/tv-display/crosstab', authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await getPoolConnection();

    const date_query = `SELECT date_time FROM worker_timesheet order by id desc limit 1`;
    const dateresult = await executeQuery(connection, date_query);

    var lastDate = dateresult[0].date_time;
    //lastDate = '01-08-2023';
    const dayOfWeek = dateUtils.getDayOfWeek(lastDate)
    //console.log("lastDate", lastDate);
    //console.log("dayOfWeek", dayOfWeek);
    const section_list_query = `SELECT s.id,s.section_name
      FROM worker_timesheet wt
      JOIN section s ON wt.section = s.id
      WHERE wt.date_time = ?
      GROUP BY wt.section`;
    const secresults = await executeQuery(connection, section_list_query, [lastDate]);

    const query = `SELECT * FROM worker_timesheet WHERE  date_time = ?
      GROUP BY date_time`;

    const results = await executeQuery(connection, query, [lastDate]);

    const responseData = [];
    const promises = results.map(async (row) => {

      const query2 = `SELECT section,
      SUM(shift) AS sht,
      SUM(target) AS tar,
      SUM(HOUR1 + HOUR2 + HOUR3 + HOUR4 + HOUR5 + HOUR6 + HOUR7 + HOUR8 + HOUR9 + HOUR10 + HOUR11 + HOUR12) AS summ
    FROM worker_timesheet
    WHERE date_time = ?
    GROUP BY section`;

      // Execute the combined query
      const results2 = await executeQuery(connection, query2, [row.date_time]);
      row.secdata = results2;
      responseData.push(row);
    });

    // Wait for all promises to resolve
    await Promise.all(promises);
    res.json({ data: responseData, sections: secresults, date: lastDate, day: dayOfWeek });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});


/**
 * @swagger
 * /tv-display/crosstab-filter:
 *   get:
 *     summary: Get filtered crosstab data for TV display.
 *     description: |
 *       This endpoint retrieves filtered crosstab data for TV display based on the provided site, fromdate, and todate. It includes information about worker timesheets, sections, and their respective summaries for the specified date range. The response provides details for each date in the range, including the corresponding sections with their IDs and names (`sections`). The crosstab data includes details about worker timesheets, such as shift (`shift`), target (`target`), and the sum of hours worked (`summ`) for each section (`section`).
 *     tags:
 *       - TV Display
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: site
 *         required: true
 *         description: The site for which crosstab data is requested.
 *         schema:
 *           type: string
 *           example: "NAKURU"
 *       - in: query
 *         name: fromdate
 *         required: true
 *         description: The start date of the date range in "YYYY-MM-DD" format.
 *         schema:
 *           type: string
 *           example: "2024-03-01"
 *       - in: query
 *         name: todate
 *         required: true
 *         description: The end date of the date range in "YYYY-MM-DD" format.
 *         schema:
 *           type: string
 *           example: "2024-03-10"
 *     responses:
 *       '200':
 *         description: Successful response containing filtered crosstab data for TV display.
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - entry_id: 123
 *                   product_name: "Product A"
 *                   section: 1
 *                   date_time: "2024-03-01 08:00:00"
 *                   shift: 1
 *                   target: 100
 *                   HOUR1: 10
 *                   HOUR2: 12
 *                   HOUR3: 8
 *                   HOUR4: 10
 *                   HOUR5: 9
 *                   HOUR6: 11
 *                   HOUR7: 10
 *                   HOUR8: 8
 *                   HOUR9: 9
 *                   HOUR10: 12
 *                   HOUR11: 11
 *                   HOUR12: 10
 *                   secdata:
 *                     - section: 1
 *                       sht: 100
 *                       tar: 120
 *                       summ: 112
 *               sections:
 *                 - id: 1
 *                   section_name: "Section A"
 *                 - id: 2
 *                   section_name: "Section B"
 *       '400':
 *         description: Bad request due to invalid date range.
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid date range provided"
 *       '500':
 *         description: Internal server error during the retrieval process.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getFilteredCrosstabData
 * @memberof module:Routes/TVDisplay
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {BadRequestError} Will throw a bad request error if the date range is invalid.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the retrieval process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/tv-display/crosstab-filter', authenticateJWT, async (req, res) => {
  let connection;
  try {
    const site = req.query.site;
    const fromdate = req.query.fromdate;
    const todate = req.query.todate;
    //console.log("site", site);
    //console.log("fromdate", fromdate);
    //console.log("todate", todate);
    if (!fromdate || !todate) {
      res.status(400).json({ error: 'Invalid date range provided' });
      return;
    }
    const newfd = dateUtils.convertToUnixTimestamp(fromdate);
    const newtd = dateUtils.convertToUnixTimestamp(todate);

    //console.log(fromdate);
    //console.log(todate);
    //console.log(newfd);
    //console.log(newtd);

    // Get a connection from the pool
    connection = await getPoolConnection();

    const section_list_query = ` SELECT s.id,s.section_name
      FROM worker_timesheet wt
      JOIN section s ON wt.section = s.id
      WHERE wt.site = ? AND (wt.time_stamp between ${newfd} and ${newtd}) GROUP BY wt.section`;

    const secresults = await executeQuery(connection, section_list_query, [site]);

    //console.log(secresults);
    const query = `SELECT * FROM worker_timesheet WHERE site = ? AND (time_stamp between ${newfd} and ${newtd}) GROUP BY date_time`;

    const results = await executeQuery(connection, query, [site]);

    //console.log(results);
    const responseData = [];
    const promises = results.map(async (row) => {

      const query2 = `SELECT section,
      SUM(shift) AS sht,
      SUM(target) AS tar,
      SUM(HOUR1 + HOUR2 + HOUR3 + HOUR4 + HOUR5 + HOUR6 + HOUR7 + HOUR8 + HOUR9 + HOUR10 + HOUR11 + HOUR12) AS summ
    FROM worker_timesheet
    WHERE site = ? AND date_time = ? GROUP BY section`;

      const results2 = await executeQuery(connection, query2, [site, row.date_time]);

      // Create an array to store the sections in the desired order
      const orderedSections = secresults.map(section => {
        const sectionData = results2.find(result => result.section === String(section.id)) || {
          section: String(section.id),
          sht: '-',
          tar: '-',
          summ: '-'
        };
        return {
          section: sectionData.section,
          sht: sectionData.sht,
          tar: sectionData.tar,
          summ: sectionData.summ
        };
      });
      row.secdata = orderedSections;
      responseData.push(row);

    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    res.json({ data: responseData, sections: secresults });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log('Connection released');
    }
  }
});

//============================================ TV-Display End =====================================================


app.listen(config.server.port);
console.log("Server Started :", config.server.host, ":", config.server.port);

/* const server = app.listen(4000, '0.0.0.0', () => {
  console.log('Server running on port 4000');
}); */