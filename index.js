const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000

const app = express()

app.use(cors({
      origin:['http://localhost:5173'],
      credentials:true,
      optionsSuccessStatus:200
    }));
    app.use(express.json());
    app.use(cookieParser());
    

//Restaurantly
//u3trB7szPVwlvkVr
    
const uri = "mongodb+srv://Restaurantly:u3trB7szPVwlvkVr@cluster0.y8iiotm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//middlewares 
const logger = (req,res,next) =>{
  console.log(req.method, req.url)
  next()
}

const verifyToken=(req,res,next)=>{
  const token = req.cookies?.token;
  console.log(token)
  next()
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

   const bookingCollection = client.db('bookingDB').collection('booking')

  //  '1c2b656bca57e4596c65ad39ac16a375dc42965d51e7ef8d5f5517b61e902e176d98da1b4da99f8065dc01f877e29fb4eff04ae65e119a71629bca15ece84764'


   //  auth related api
  app.post('/jwt',logger,async(req,res)=>{
      const user = req.body;
      console.log('user' , user)
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
      res.cookie('token',token,{
        httpOnly:true,
        secure:true,
        sameSite:'none'
      })
      .send({success:true})
    })





    app.post('/jwt', async (req, res) => {
      try {
          const user = req.body
          const token = jwt.sign(user, jwtSecret, {
              expiresIn: '1d',
          })
          res
              .cookie('token', token, {
                  httpOnly: true,
                  secure: process.env.ACCESS_TOKEN_SECRET === 'production',
                  sameSite: process.env.ACCESS_TOKEN_SECRET === 'production' ? 'none' : 'strict',
              })
              .send({
                  status: true,
              })
      } catch (error) {
          res.send({
              status: true,
              error: error.message,
          })
      }
  })
  






    

  app.post('/logOut',async(req,res)=>{
    const user = req.body;
    console.log(user)
    res.clearCookie('token',{maxAge:0}).send({success:true})
  })





   app.get('/booking', logger ,verifyToken ,async(req,res)=>{
    console.log(req.query.email);
    const cursor = bookingCollection.find();
    const result = await cursor.toArray();
    let query = {};
    if(req.query?.email){
      query={email:req.query.email}
    }
    res.send(result)
   })


   app.get('/bookings/:id',async(req,res)=>{
    const id = req.params.id 
    const query = {_id: new ObjectId(id)}
    const result = await bookingCollection.findOne(query)
    console.log(result)
    res.send(result)
   })

//   upadate section

app.put('/bookings/:id',async(req,res)=>{
    const id = req.params.id 
    const filter = {_id: new ObjectId(id)}
    const options = {upsert:true};
    const updated = req.body;
    const update = {
        $set: {
            name:updated.name ,
            email:updated.email ,
            phone:updated.phone ,
            time:updated.time ,
            date:updated.date ,
            people:updated.people ,
            photo:updated.photo ,
            pdf:updated.pdf ,
            description:updated.description 
        }
    }
    const result = await bookingCollection.updateOne(filter,update,options)
    res.send(result)
   })

  


   app.post('/booking',async(req,res)=>{
    const newBooking = req.body;
    console.log(newBooking);
    const result = await bookingCollection.insertOne(newBooking);
    res.send(result)
   })

   app.delete('/bookings/:id',async(req,res)=>{
    const id = req.params.id;
    const query = { _id: new ObjectId(id)}
    const result = await bookingCollection.deleteOne(query);
    res.send(result);
   })

    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






    app.get('/',(req,res) => {
        res.send('Restaurantly is running')
    })


    app.listen(port , ()=>{
        console.log(`Serve running port ${port}`)
    })