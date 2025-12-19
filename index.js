const express = require('express')
const cors= require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 9000

// middlewire
app.use(express.json());
app.use(cors());

// const verifyJWT = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send({ message: 'unauthorized access' });
//   }

//   const token = authHeader.split(' ')[1];

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({ message: 'unauthorized access' });
//     }
//     req.decoded = decoded;
//     next();
//   });
// };

const verifyFBToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.decoded = decoded; // decoded.email
    next();
  } catch (err) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
};











const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mkelkx7.mongodb.net/?appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
const db= client.db('E-ConnectBD_db');
const usersCollection = db.collection('users');
const tutionsCollection= db.collection('tutions');

//user related api
app.get('/users',async(req,res)=>{
try{
  const result= await usersCollection.find();
  res.send(result);

}
catch(error){
  res.status(500).send({message:'faled to get user'});
}

});


    app.post('/users', async (req, res) => {
            const user = req.body;
            user.role = 'user';
            user.createdAt = new Date();
            const email = user.email;
            const userExists = await usersCollection.findOne({ email })

            if (userExists) {
                return res.send({ message: 'user exists' })
            }

            const result = await usersCollection.insertOne(user);
            res.send(result);
        })


//tution related Api


app.get('/tutions', async (req, res) => {
  try {
    const result = await tutionsCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: 'failed to get tutions' });
    console.log('tutionsCollection:', tutionsCollection);
  }
});

//jwt use kore private route set
// app.get('/tutions/:email',verifyJWT,async(req,res)=>{
//   const email= req.params.email;
//   if(email!== req.decoded.email){
//     return res.status(403).send({message:'forbidden access'});
//   }
// const result= await tutionsCollection.find({email}).toArray();
// res.send(result);
// console.log(email);
// })

app.get('/tutions/:email', verifyFBToken, async (req, res) => {
  if (req.params.email !== req.decoded.email) {
    return res.status(403).send({ message: 'forbidden access' });
  }

  const result = await tutionsCollection.find({ email: req.params.email }).toArray();
  res.send(result);
});






app.post('/tutions', async (req, res) => {
  try {
    const tutions = req.body;
    tutions.createdAt = new Date();

    const result = await tutionsCollection.insertOne(tutions);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: 'failed to create tution' });
  }
  console.log('BODY :',req.body);
});

app.delete('/tutions/:id',async(req,res)=>{
  const id= req.params.id;
  const query= {_id:new ObjectId(id)}
  const result= await tutionsCollection.deleteOne(query);
  res.send(result);
})





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('E-TutionBD is Running!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})