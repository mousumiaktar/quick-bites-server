const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


//connection database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ayosb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        await client.connect();
        const restaurantsCollection = client.db('food_delivery').collection('restaurants');
        const reviewCollection = client.db('food_delivery').collection('reviews');
        const orderCollection = client.db('food_delivery').collection('order');
        const allfoodCollection = client.db('food_delivery').collection('allfood');

        // Get All RESTAURANTS
        app.get('/restaurants', async (req, res) => {
            const query = {};
            const cursor = restaurantsCollection.find(query);
            const restaurants = await cursor.toArray();
            res.send(restaurants);
        });


        // GET SINGLE RESTAURANT BY ID
        app.get('/restaurants/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const restaurants = await restaurantsCollection.findOne(query);
            res.send(restaurants);
        });


        // GET REVIEW
        app.get('/reviews', async (req, res) => {
            const review = await reviewCollection.find().toArray()
            res.send(review)
        })

        // CREATE REVIEW
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        });

        // CREATE ORDER
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            res.send(result);
        })


        // GET ORDER
        app.get('/myorder', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const order = await orderCollection.find(query).toArray();
            res.send(order)
        });


        // CREATE FOOD
        app.post('/addfood', async (req, res) => {
            const review = req.body;
            const result = await allFoodsCollection.insertOne(review)
            res.send(result)
        });




        // GET All food
        app.get('/allfood', async (req, res) => {
            const query = {};
            const cursor = allfoodCollection.find(query);
            const allfood = await cursor.toArray();
            res.send(allfood);
        });


        app.delete('/allfood/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await allfoodCollection.deleteOne(query)
            res.send(result)
        })




    }

    finally {

    }


} run().catch(console.dir);




//check server
app.get('/', (req, res) => {
    res.send('running server ')
});



//check port
app.listen(port, () => {
    console.log("I AM FIRST OPERATION Ridima", port)

})













