const { response } = require('express');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser')
const { MongoClient, Int32} = require("mongodb");
const { default: mongoose } = require('mongoose');
require('dotenv').config();

const session = require('express-session');
const flash = require('connect-flash');

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

let data


http.listen(3000,()=> {

  console.log('port 3000 running')

})

app.set('view engine', 'ejs');


// MongoDB connection URI
const MONGODB_URI = (process.env.MONGODB_CONNECTION_STRING); // Update with your database name
const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);

// Connecting to MongoDB

MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    const db = client.db('usm');
    const collection = db.collection('acdm'); // Update with your collection name

    const db2 = client.db('data');
    const collection2 = db2.collection('grfths');
    const collection3 = db2.collection('notamths');
    const collection4 = db2.collection('flightths');
    const collection5 = db2.collection('user');
    const collection6 = db2.collection('wtths');

    const flightschema = {
        airlines: String,
        EOBT: String,
        FlightNumber: Number,
        STD: String


        
    }

    const flights = mongoose.model('ACDM',flightschema)
    // Define a route to fetch data from MongoDB

    
    // Set up session
    app.use(session({
      secret: 'yourSecretKey',
      resave: false,
      saveUninitialized: true,
      //cookie: { maxAge: 30000 },
      //cookie: { secure: false } // Change to true if using HTTPS
    }));

    // Set up flash messages
    app.use(flash());

    // Middleware for parsing form data
    //app.use(express.urlencoded({ extended: true }));

    // Middleware to check if user is authenticated
    function checkAuthenticated(req, res, next) {
      if (req.session.user) {
        return next();
      }
      res.redirect('/login');
    }

      
    // Middleware to check if user has one of the specified roles
    function checkRoles(roles) {
      return (req, res, next) => {
        if (req.session.user && roles.includes(req.session.user.role)) {
          return next();
        }
        res.redirect('/error'); // Redirect to an error page if the role is not allowed
      };
    }

    // Routes
    app.get('/login', async (req, res) => {
      try {
        
        data5 = await collection5.find().toArray();


        res.render(__dirname + '/views/login.ejs', {  });

      } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
      }
    });


    app.post('/loging', urlencodedParser, async (req, res) => {

      users = await collection5.find().toArray();

      const { username, password } = req.body;

      const user = users.find(u => u.username === username);

      //console.log(user)

      if (user && (password === user.password)) {
        req.session.user = { id: user.id, username: user.username, role: user.role, envi: user.envi};
        console.log(req.session.user)
        return res.redirect('/');
      } else {
        req.flash('error', 'Invalid username or password');
        res.redirect('/login');
      }

      
    });

    app.get('/logout', (req, res) => {
      req.session.destroy(err => {
        if (err) {
          return res.redirect('/');
        }
        res.redirect('/login');
      });
    });
    







  

    
    app.get('/acdm', async (req, res) => {
      try {
        
        data = await collection.find().toArray(); // Retrieve all documents


        //Sort data by Date and SOBT
        data.sort((a, b) => a.date_.toLowerCase().localeCompare(b.date_.toLowerCase()) || a.SOBT - b.SOBT);

        //const data = await flights.find({});
        //console.log(data)
        
        res.render(__dirname + '/views/index.ejs', { data });

      } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
      }
    });

    //Dashboard
    app.get('/',checkAuthenticated, async (req, res) => {
      try {
        
        data2 = await collection2.find().toArray(); // Retrieve all documents Flight
        data3 = await collection3.find().toArray(); // Retrieve all documents GRF
        data4 = await collection4.find().toArray(); // Retrieve all documents NOTAM
        data6 = await collection6.find().toArray(); // Retrieve all documents Weather


        //Sort data by createdAt
        //data2.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        data2.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        data6.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        //data2.sort((a, b) => a.createdAt.toLowerCase().localeCompare(b.createdAt.toLowerCase()) );

        //const data2 = await rcr.find({});
        //console.log(data2)
        //console.log(req.session.user.role)

        data6THS = data6.filter(data6_ => data6_.origin === "THS");
        data6TDX = data6.filter(data6_ => data6_.origin === "TDX");
        //console.log(data6THS);


        res.render(__dirname + '/views/dashboard.ejs', { user: req.session.user });

      } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
      }
    });



    app.get('/edit/:thisid', async (req, res) => {
      try {

        var ObjectId = require('mongodb').ObjectId; 
        var id = req.params.thisid;       
        var o_id = new ObjectId(id);
        
        myId = req.params.thisid

        dataEdit = await collection.find( {_id:o_id}  ).toArray(); // Retrieve data by id


        //console.log(" dataEdit : ",dataEdit)
        
        res.render(__dirname + '/views/edit.ejs', { dataEdit });

      } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
      }
    });

    app.get('/edit_atc/:thisid', async (req, res) => {
      try {

        var ObjectId = require('mongodb').ObjectId; 
        var id = req.params.thisid;       
        var o_id = new ObjectId(id);
        
        myId = req.params.thisid

        dataEdit = await collection.find( {_id:o_id}  ).toArray(); // Retrieve data by id


        //console.log(" dataEdit : ",dataEdit)
        
        res.render(__dirname + '/views/edit_atc.ejs', { dataEdit });

      } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
      }
    });

    app.get('/edit_flight/:thisid',checkAuthenticated, async (req, res) => {
      try {
        
        var ObjectId = require('mongodb').ObjectId; 
        var id = req.params.thisid;       
        var o_id = new ObjectId(id);

        console.log(" o_id : ",o_id)
        
        myId = req.params.thisid

        dataEdit = await collection4.find( {_id:o_id}  ).toArray(); // Retrieve data by id


        console.log(" dataEdit : ",dataEdit)
        
        res.render(__dirname + '/views/edit_flight.ejs', { dataEdit, user: req.session.user });

      } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
      }
    });


    app.get('/delete/:thisid', async (req, res, next) => {
      try{

        var ObjectId = require('mongodb').ObjectId; 
        var id = req.params.thisid;       
        var o_id = new ObjectId(id);

        console.log(o_id)
        dataDelete = await collection.findOneAndDelete(
          {_id : o_id}


        )

        res.redirect('/');


      }catch (err) {
        console.error('Error Delete data:', err);
        res.status(500).send('Error Delete data');
      }
      
    });

    app.get('/deleteFlight/:thisid',checkAuthenticated, async (req, res, next) => {
      try{

        var ObjectId = require('mongodb').ObjectId; 
        var id = req.params.thisid;       
        var o_id = new ObjectId(id);

        console.log(o_id)
        dataDelete = await collection4.findOneAndDelete(
          {_id : o_id}


        )

        res.redirect('/');


      }catch (err) {
        console.error('Error Delete data:', err);
        res.status(500).send('Error Delete data');
      }
      
    });

    app.get('/deleteNOTAM/:thisid',checkAuthenticated, async (req, res, next) => {
      try{

        var ObjectId = require('mongodb').ObjectId; 
        var id = req.params.thisid;       
        var o_id = new ObjectId(id);

        console.log(o_id)
        dataDelete = await collection3.findOneAndDelete(
          {_id : o_id}

        )

        res.redirect('/');


      }catch (err) {
        console.error('Error Delete data:', err);
        res.status(500).send('Error Delete data');
      }
      
    });

    app.get('/inputnew',async(req,res)=>{

      try {
        
        data = await collection.find().toArray(); // Retrieve all documents

        //const data = await flights.find({});
        //console.log(data)
        
        res.render(__dirname + '/views/inputnew.ejs', { data });

      } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
      }

    })

    app.get('/grf',checkAuthenticated, checkRoles(['admin','airside']),async(req,res)=>{

      try {
        
        data2 = await collection2.find().toArray(); // Retrieve all documents

        //const data = await flights.find({});
        //console.log(data)
        
        res.render(__dirname + '/views/input_grf.ejs', { data2, user: req.session.user });

      } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
      }

    })

    app.get('/notam',checkAuthenticated, checkRoles(['admin','airside']),async(req,res)=>{

      try {
        
        data3 = await collection3.find().toArray(); // Retrieve all documents

        //const data = await flights.find({});
        
        
        res.render(__dirname + '/views/input_notam.ejs', { data3, user: req.session.user });

      } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
      }

    })

    app.get('/flight',checkAuthenticated, checkRoles(['admin','airside']),async(req,res)=>{

      try {
        
        data4 = await collection4.find().toArray(); // Retrieve all documents

        //const data = await flights.find({});
        //console.log(data)
        
        res.render(__dirname + '/views/input_flight.ejs', { data4 , user: req.session.user });

      } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
      }

    })

    app.get('/wt',checkAuthenticated, checkRoles(['admin','met']),async(req,res)=>{

      try {
        
        data6 = await collection6.find().toArray(); // Retrieve all documents

        //const data = await flights.find({});
        //console.log(data)
        
        res.render(__dirname + '/views/input_weather.ejs', { data6 , user: req.session.user });

      } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
      }

    })

    

    app.post('/insert', urlencodedParser, async (req, res) => {
      try {

        var body = req.body;       


       insertoneACDM = await collection.insertOne({
          FlightNumber: body.FlightNumber,
          Airlines: body.Airlines,
          Dest: body.Dest,
          date_: req.body.date_,
          SOBT: body.SOBT,
          AOBT: "",
          createdAt: new Date()
          
        
      
        })


        dataNew = {

          flight: req.body.FlightNumber,
          sobt: req.body.SOBT

        }
        
        //console.log(dataNew)

        res.redirect('/');

      } catch (error) {
        console.error('Error insert data:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.post('/insertgrf', urlencodedParser,checkAuthenticated, async (req, res) => {
      try {

        var body2 = req.body;       


       insertoneRCR = await collection2.insertOne({
          gdate: body2.gdate,
          origin: body2.origin,
          utc: body2.utc,
          rcr: body2.rcr,
          createdAt: new Date()      
      
        })

        res.redirect('/');

      } catch (error) {
        console.error('Error insert data:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.post('/insertwt', urlencodedParser,checkAuthenticated, async (req, res) => {
      try {

        var body6 = req.body;       


       insertonewt = await collection6.insertOne({
          origin: body6.origin,
          hm: body6.hm,
          lvp: body6.lvp,
          winfo: body6.winfo,
          createdAt: new Date()      
      
        })

        res.redirect('/');

      } catch (error) {
        console.error('Error insert data:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.post('/insertnotam', urlencodedParser,checkAuthenticated, async (req, res) => {
      try {

        var body3 = req.body;       

       insertonenotam = await collection3.insertOne({
          notamno: body3.notamno,
          origin: body3.origin,
          notam: body3.notam,
          rm: body3.rm,
          eff: new Date(body3.eff),
          end: new Date(body3.end),
          createdAt: new Date()      
      
        })

        res.redirect('/');

      } catch (error) {
        console.error('Error insert data:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.post('/insertflight', urlencodedParser,checkAuthenticated, async (req, res) => {
      try {

        var body4 = req.body;       

       insertoneflight = await collection4.insertOne({
          flightdate: body4.fdate,
          flight: body4.flight,
          dir: body4.dir,
          origin: body4.origin,
          stop: body4.stop,
          actype: body4.actype,
          reg: body4.reg,
          bay: body4.bay,
          st: body4.st,
          et: body4.et,
          at: body4.at,
          rm: body4.rm,
          createdAt: new Date()      
      
        })

        res.redirect('/');

      } catch (error) {
        console.error('Error insert data:', error);
        res.status(500).send('Internal Server Error');
      }
    });


    
    app.post('/update', urlencodedParser, async (req, res) => {
      try {

        //const formData = req.body.Flight; // Access form data from the request body
        //console.log('Form Data:', formData);

        var ObjectId = require('mongodb').ObjectId; 
        var id = req.body.update_id;       
        var o_id = new ObjectId(id);

        //const { FlightNumber } = req.body;

        //const update_id = req.body.update_id

        const checkTOBT = await collection.updateOne(
          { 
            _id: new ObjectId(req.body.update_id),
            $and: [ 
                { TOBT: { $ne: req.body.TOBT }}
            ]
          },
          {
            $set: {
              TSAT: ""
            }}
          )

          console.log(req.body.TOBT)
          //console.log($ne)




        const updatedACDM = await collection.findOneAndUpdate(
          { _id: new ObjectId(req.body.update_id)}, // Filter based on _id
          { $set: { "FlightNumber": req.body.FlightNumber,"EOBT": req.body.EOBT,"TOBT": req.body.TOBT,"ESBT": req.body.ESBT,"ASBT": req.body.ASBT,"AOBT": req.body.AOBT} }, // Update fields
          //{ returnDocument: 'after' } // Return the modified document
        );


        res.redirect('/');


        //const { FlightNumber } = req.body;
        //console.log(req.body);
    
        /*
        const updatedPerson = await Person.findOneAndUpdate(
          { _id: req.params.id },
          { $set: { FlightNumber } },
          { new: true }
        );*/

        //res.redirect('/');
      } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.post('/update_atc', urlencodedParser, async (req, res) => {
      try {

        //const formData = req.body.Flight; // Access form data from the request body
        //console.log('Form Data:', formData);

        var ObjectId = require('mongodb').ObjectId; 
        var id = req.body.update_id;       
        var o_id = new ObjectId(id);

        //const { FlightNumber } = req.body;

        //const update_id = req.body.update_id


        const updatedACDM = await collection.findOneAndUpdate(
          { _id: new ObjectId(req.body.update_id)}, // Filter based on _id
          { $set: { "TSAT": req.body.TSAT,"CTOT": req.body.CTOT} }, // Update fields
          //{ returnDocument: 'after' } // Return the modified document
        );


        res.redirect('/');


        //const { FlightNumber } = req.body;
        //console.log(req.body);
    
        /*
        const updatedPerson = await Person.findOneAndUpdate(
          { _id: req.params.id },
          { $set: { FlightNumber } },
          { new: true }
        );*/

        //res.redirect('/');
      } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.post('/updateflight', urlencodedParser,checkAuthenticated, async (req, res) => {
      try {


        var ObjectId = require('mongodb').ObjectId; 
        var id = req.body.update_id;       
        var o_id = new ObjectId(id);

        const updatedACDM = await collection4.findOneAndUpdate(
          { _id: new ObjectId(req.body.update_id)}, // Filter based on _id
          { $set: { "et": req.body.et,"at": req.body.at,"bay": req.body.bay,"rm": req.body.rm} }, // Update fields
          //{ returnDocument: 'after' } // Return the modified document
        );

        res.redirect('/');

      } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    

  })
  .catch(err => console.error('Error connecting to MongoDB:', err));




  async function run() {


    try {
  
      await client.connect();
      //const database = client.db2('data');
      //const messages = database.collection('flightths');



      const database = client.db('data');

      const message1 = database.collection('flightths');
      const message2 = database.collection('grfths');
      const message3 = database.collection('notamths');
      const message4 = database.collection('wtths');



      console.log('Socket')

      changest(message1)
      changest(message2)
      changest(message3)
      changest(message4)
  


  
    } catch {

      console.log('No Socket')
  
      // Ensures that the client will close when you error
      await client.close();
    }
  }

  function changest (messages){

           // open a Change Stream on the "messages" collection
           changeStream = messages.watch();

           // set up a listener when change events are emitted
           changeStream.on("change", next => {
    
            
               // process any change event
               switch (next.operationType) {
                   case 'insert':
                       //console.log(next.fullDocument);
                       console.log('inserted')
    
                       
                       var updated = 'Data is updated.Please refresh.'
    
                       io.emit('dataio',updated)
          
    
    
                       break;
                   case 'update':
                       //console.log(next.updateDescription.updatedFields);
                       console.log('updated')
    
                       var updated = 'Data is updated.Please refresh.'
    
                       io.emit('dataio',updated)
    
                       break;
    
                       //const jsonString = JSON.stringify(next._id);
    
                       //io.emit('acdmData',jsonString)
                       //console.log('Data Updated')
                       //console.log(next._id)
                    case 'delete':
                      var updated = 'Data is updated.Please refresh.'
    
                      io.emit('dataio',updated)
    
                       
    
               }
           });







  }
  
  run().catch(console.dir);







