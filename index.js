const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


//connection database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ayosb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//jwt
function verifyJWT(req, res, next) {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) {
        return res.status(401).send({ message: 'UnAuthorize access' });

    }
    const token = authHeaders.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {

        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}



async function run() {
    try {
        await client.connect();
        const restaurantsCollection = client.db('food_delivery').collection('restaurants');
        const reviewCollection = client.db('food_delivery').collection('reviews');
        const orderCollection = client.db('food_delivery').collection('order');
        const allFoodsCollection = client.db('food_delivery').collection('allfoods');
        const userCollection = client.db('food_delivery').collection('user');
        const paymentCollection = client.db('food_delivery').collection('payments');


        const birthdayCollection = client.db('food_delivery').collection('birthday');
        const giftCollection = client.db('food_delivery').collection('gift');
        const partyCollection = client.db('food_delivery').collection('party');
        const nightDrinkCollection = client.db('food_delivery').collection('nightDrink');


        const breakfastCollection = client.db('food_delivery').collection('breakfast');
        const lunchCollection = client.db('food_delivery').collection('lunch');
        const dinnerCollection = client.db('food_delivery').collection('dinner');
        const morningCoffeeCollection = client.db('food_delivery').collection('morningcoffee');


        // npm install --save stripe

        app.post('/create-payment-intent', verifyJWT, async (req, res) => {
            const order = req.body;
            const price = order.totalPrice;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });
            res.send({ clientSecret: paymentIntent.client_secret })
        });

        //............
        //01. token 
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body
            const filter = { email: email };
            const option = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, option);
            //token
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            res.send({ result, token });

        })
        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                }
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);

            }
            else {
                res.status(403).send({ message: 'forbidden' })
            }
        })

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })

        })

        //get user for load dashboard
        app.get('/user', async (req, res) => {
            const user = await userCollection.find().toArray();
            res.send(user)
        })
        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })

        //.............


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



        //celebration food
        app.get('/birthday', async (req, res) => {
            const query = {};
            const cursor = birthdayCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/gift', async (req, res) => {
            const query = {};
            const cursor = giftCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/party', async (req, res) => {
            const query = {};
            const cursor = partyCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/nightdrink', async (req, res) => {
            const query = {};
            const cursor = nightDrinkCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })


        //menu food
        app.get('/breakfast', async (req, res) => {
            const query = {};
            const cursor = breakfastCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/lunch', async (req, res) => {
            const query = {};
            const cursor = lunchCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/dinner', async (req, res) => {
            const query = {};
            const cursor = dinnerCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/morningcoffee', async (req, res) => {
            const query = {};
            const cursor = morningCoffeeCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })





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
            res.send(order);
        });

        // GET ORDER BY ID
        app.get('/myorder/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const order = await orderCollection.findOne(query);
            res.send(order);
        })


        app.patch('/myorder/:id', verifyJWT, async(req, res)=>{
            const id = req.params.id;
            const payment = req.body;
            const filter = {_id: new ObjectId(id)};
            const updatedDoc ={
                $set:{
                    paid: true,
                    transactionId: payment.transactionId,
                }
            }
            const result  = await paymentCollection.insertOne(payment);
            const updatedOrder = await orderCollection.updateOne(filter, updatedDoc);
            res.send(updatedDoc);
        })


        // CREATE FOOD
        app.post('/addfood', async (req, res) => {
            const review = req.body;
            const result = await allFoodsCollection.insertOne(review)
            res.send(result)
        });




        // GET All food
        app.get('/allfood', async (req, res) => {
            const query = {};
            const cursor = allFoodsCollection.find(query);
            const allfood = await cursor.toArray();
            res.send(allfood);
        });


        app.delete('/allfood/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await allFoodsCollection.deleteOne(query)
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













