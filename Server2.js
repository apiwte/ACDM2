const { response } = require('express');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser')
const { MongoClient, Int32} = require("mongodb");
const { default: mongoose } = require('mongoose');
require('dotenv').config();

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

    const flightschema = {
        airlines: String,
        EOBT: String,
        FlightNumber: Number,
        STD: String


        
    }

    const flights = mongoose.model('ACDM',flightschema)

    // Define a route to fetch data from MongoDB

    
    app.get('/acdm', async (req, res) => {
      try {
        
        data = await collection.find().toArray(); // Retrieve all documents


        //Sort data by Date and SOBT
        data.sort((a, b) => a.date_.toLowerCase().localeCompare(b.date_.toLowerCase()) || a.SOBT - b.SOBT);

        //const data = await flights.find({});
        console.log(data)
        
        res.render(__dirname + '/views/index.ejs', { data });

      } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
      }
    });

    app.get('/', async (req, res) => {
      try {
        
        data2 = await collection2.find().toArray(); // Retrieve all documents
        data3 = await collection3.find().toArray();
        data4 = await collection4.find().toArray();


        //Sort data by createdAt
        //data2.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        data2.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        //data2.sort((a, b) => a.createdAt.toLowerCase().localeCompare(b.createdAt.toLowerCase()) );

        //const data2 = await rcr.find({});
        console.log(data2)
        
        res.render(__dirname + '/views/dashboard.ejs', {  });

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

    app.get('/grf',async(req,res)=>{

      try {
        
        data2 = await collection2.find().toArray(); // Retrieve all documents

        //const data = await flights.find({});
        //console.log(data)
        
        res.render(__dirname + '/views/input_grf.ejs', { data2 });

      } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
      }

    })

    app.get('/notam',async(req,res)=>{

      try {
        
        data3 = await collection3.find().toArray(); // Retrieve all documents

        //const data = await flights.find({});
        //console.log(data)
        
        res.render(__dirname + '/views/input_notam.ejs', { data3 });

      } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send('Error retrieving data');
      }

    })

    app.get('/flight',async(req,res)=>{

      try {
        
        data4 = await collection4.find().toArray(); // Retrieve all documents

        //const data = await flights.find({});
        //console.log(data)
        
        res.render(__dirname + '/views/input_flight.ejs', { data4 });

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
        
        console.log(dataNew)

        res.redirect('/');

      } catch (error) {
        console.error('Error insert data:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.post('/insertgrf', urlencodedParser, async (req, res) => {
      try {

        var body2 = req.body;       

       insertoneRCR = await collection2.insertOne({
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

    app.post('/insertnotam', urlencodedParser, async (req, res) => {
      try {

        var body3 = req.body;       

       insertonenotam = await collection3.insertOne({
          notamno: body3.notamno,
          notam: body3.notam,
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

    app.post('/insertflight', urlencodedParser, async (req, res) => {
      try {

        var body4 = req.body;       

       insertoneflight = await collection4.insertOne({
          flight: body4.flight,
          dir: body4.dir,
          stop: body4.stop,
          st: body4.st,
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

    

  })
  .catch(err => console.error('Error connecting to MongoDB:', err));




  async function run() {


    try {
  
      await client.connect();
      const database = client.db('usm');
      const messages = database.collection('acdm');




       // open a Change Stream on the "messages" collection
       changeStream = messages.watch();

       // set up a listener when change events are emitted
       changeStream.on("change", next => {

        
           // process any change event
           switch (next.operationType) {
               case 'insert':
                   //console.log(next.fullDocument);
                   //console.log('inserted')

                   
                   var updated = 'Data is updated.Please refresh.'

                   io.emit('acdmData',updated)
      


                   break;
               case 'update':
                   //console.log(next.updateDescription.updatedFields);
                   //console.log('updated')

                   var updated = 'Data is updated.Please refresh.'

                   io.emit('acdmData',updated)

                   break;

                   //const jsonString = JSON.stringify(next._id);

                   //io.emit('acdmData',jsonString)
                   //console.log('Data Updated')
                   //console.log(next._id)
                case 'delete':
                  var updated = 'Data is updated.Please refresh.'

                  io.emit('acdmData',updated)

                   

           }
       });
  
    } catch {
  
      // Ensures that the client will close when you error
      await client.close();
    }
  }
  
  run().catch(console.dir);







