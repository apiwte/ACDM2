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

    const flightschema = {
        airlines: String,
        EOBT: String,
        FlightNumber: Number,
        STD: String


        
    }

    const flights = mongoose.model('ACDM',flightschema)

    // Define a route to fetch data from MongoDB

    
    app.get('/', async (req, res) => {
      try {
        
        data = await collection.find().toArray(); // Retrieve all documents

        //const data = await flights.find({});
        //console.log(data)
        
        res.render(__dirname + '/views/index.ejs', { data });

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

    app.post('/insert', urlencodedParser, async (req, res) => {
      try {

        var body = req.body;       


       insertoneACDM = await collection.insertOne({
          FlightNumber: body.FlightNumber,
          Airlines: body.Airlines,
          Dest: body.Dest,
          date_: req.body.date_,
          SOBT: body.SOBT
        
      
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


    
    app.post('/update', urlencodedParser, async (req, res) => {
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
          { $set: { "FlightNumber": req.body.FlightNumber,"EOBT": req.body.EOBT,"TOBT": req.body.TOBT,"TSAT": req.body.TSAT,"date_": req.body.date_ } }, // Update fields
          //{ returnDocument: 'after' } // Return the modified document
        );


        dataNew = {

          _id:updatedACDM._id,
          flight: req.body.FlightNumber,
          eobt: req.body.EOBT

        }
        
        console.log(dataNew)

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
                   console.log(next.fullDocument);
                   console.log('inserted')
      


                   break;
               case 'update':
                   //console.log(next.updateDescription.updatedFields);
                   //console.log('updated')

                   var updated = 'Data is updated.Please refresh.'

                   io.emit('acdmData',updated)

                   //const jsonString = JSON.stringify(next._id);

                   //io.emit('acdmData',jsonString)
                   //console.log('Data Updated')
                   //console.log(next._id)
                   

           }
       });
  
    } catch {
  
      // Ensures that the client will close when you error
      await client.close();
    }
  }
  
  run().catch(console.dir);







