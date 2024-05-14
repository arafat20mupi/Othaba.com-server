const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:5173",
  ],
  credentials: true,
}));
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
    await client.connect();
    const QuariesCollection = client.db('assainment11').collection("users");
    const RecommendedCollection = client.db('assainment11').collection("Recommended");

    // auth api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log('user token', user);
      const token = jwt.sign(user, process.env.ACCESS_TOKON_SECRET, { expiresIn: '1h' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      })
        .send({ success: true });
    })
    app.post('logout', async (req, res) => {
      const user = req.body;
      console.log('Log out user', user);
      res.clearCookie('token', { maxAge: 0 }).send({ success: true });
    })


    // Routes for Quaries Collection
    app.get('/users', async (req, res) => {
      const cursor = QuariesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await QuariesCollection.insertOne(user);
      res.send(result);
    });

    app.get('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId.createFromHexString(id) };
      const user = await QuariesCollection.findOne(query);
      res.send(user);
    });

    app.get('/user/last', async (req, res) => {
      const cursor = QuariesCollection.find().sort({ _id: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/new', async (req, res) => {
      const cursor = QuariesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/new/:email', async (req, res) => {
      const email = req.params.email;
      const data = await QuariesCollection.find({ email: email }).toArray();
      res.send(data);
    });

    app.post('/new', async (req, res) => {
      const user = req.body;
      const result = await QuariesCollection.insertOne(user);
      res.send(result);
    });

    app.delete("/new/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId.createFromHexString(id) };
      const result = await QuariesCollection.deleteOne(query);
      res.send(result);
    });

    app.get('/new/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId.createFromHexString(id) };
      const user = await QuariesCollection.findOne(query);
      res.send(user);
    });

    app.put('/user/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId.createFromHexString(id) };
      const options = { upsert: true };
      const UpdateCycle = req.body;
      const Cycle = {
        $set: {
          product_name: UpdateCycle.product_name,
          brand_name: UpdateCycle.brand_name,
          query_title: UpdateCycle.query_title
        }
      };
      const result = await QuariesCollection.updateOne(filter, Cycle, options);
      res.send(result);
    });



    // Routes for Recommended Collection
    app.get('/recommended', async (req, res) => {
      const cursor = RecommendedCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post('/recommended', async (req, res) => {
      const recommendation = req.body;

      try {
        const result = await RecommendedCollection.insertOne(recommendation);
        const queryId = recommendation.quaryId;
        await QuariesCollection.updateOne(
          { _id: ObjectId.createFromHexString(queryId) },
          { $inc: { recommendation_count: 1 } }
        );

        res.send(result);
      } catch (error) {
        console.error('Error adding recommendation:', error);
        res.status(500).send("Internal Server Error");
      }
    });
    app.delete("/recommended/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: ObjectId.createFromHexString(id) };
        const recommendation = await RecommendedCollection.findOne(query);
        const queryId = recommendation.quaryId;
        const result = await RecommendedCollection.deleteOne(query);
        await QuariesCollection.updateOne(
          { _id: ObjectId.createFromHexString(queryId) },
          { $inc: { recommendation_count: -1 } }
        );
        res.send(result);
      } catch (error) {
        console.error('Error deleting recommendation:', error);
        res.status(500).send("Internal Server Error");
      }
    });
    app.delete("/recommended/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId.createFromHexString(id) };
      const result = await RecommendedCollection.deleteOne(query);
      res.send(result);
    });

    app.get('/recommended/:queryId', async (req, res) => {
      try {
        const queryId = req.params.queryId;
        const cursor = RecommendedCollection.find({ quaryId: queryId });
        const recommendations = await cursor.toArray();
        res.send(recommendations);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get('/recommendations/:email', async (req, res) => {
      const email = req.params.email;
      const data = await RecommendedCollection.find({ Recommender_Email: email }).toArray();
      res.send(data);
    });

    app.get('/recommendationMe/:email', async (req, res) => {
      const email = req.params.email;
      const data = await RecommendedCollection.find({ userEmail: email }).toArray();
      res.send(data);
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('server is running');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
