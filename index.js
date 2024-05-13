
const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;
app.use(
  cors({
    origin: [
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ykgi9mv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {

    
    const userCollection = client.db('assainment11').collection("users");
    app.get('/users', async (req, res) => {
      const cursor = userCollection.find()
      const result = await cursor.toArray();
      res.send(result)
    });
    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log('new user ', user)
      const result = await userCollection.insertOne(user);
      res.send(result)
    });

    app.get('/users/:id', async (req, res) => {
      const id = req.params.id;
      const quary = { _id: ObjectId.createFromHexString(id) }
      const user = await userCollection.findOne(quary)
      res.send(user)
    });

    app.get('/user/last', async (req, res) => {
      const cursor = userCollection.find().sort({ _id: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });



    const newCollection = client.db('assainment11').collection("new");
    app.get('/new', async (req, res) => {
      const cursor = newCollection.find()
      const result = await cursor.toArray();
      res.send(result)
    });
    app.post('/new', async (req, res) => {
      const user = req.body;
      console.log('new user ', user)
      const result = await newCollection.insertOne(user);
      res.send(result)
    })
    app.delete("/new/:id", async (req, res) => {
      const id = req.params.id;
      const quary = { _id: ObjectId.createFromHexString(id) };
      const result = await newCollection.deleteOne(quary);
      res.send(result)

    })
    app.get('/new/:id', async (req, res) => {
      const id = req.params.id;
      const quary = { _id: ObjectId.createFromHexString(id) }
      const user = await newCollection.findOne(quary)
      res.send(user)
    });
    app.put('/user/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId.createFromHexString(id) }
      const options = { upsert: true }
      const UpdateCycle = req.body
      const Cycle = {
        $set: {
          product_name: UpdateCycle.product_name,
          brand_name: UpdateCycle.brand_name,
          query_title: UpdateCycle.query_title
        }
      }
      const result = await newCollection.updateOne(filter, Cycle, options)
      res.send(result)
    });


    const RecommendedCollection = client.db('assainment11').collection("Recommended");
    
    app.get('/recommended', async (req, res) => {
      const cursor = RecommendedCollection.find()
      const result = await cursor.toArray();
      res.send(result)
    });
    app.post('/recommended', async (req, res) => {
      const user = req.body;
      console.log('new user ', user)
      const result = await RecommendedCollection.insertOne(user);
      res.send(result)
    })


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})