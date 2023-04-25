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













