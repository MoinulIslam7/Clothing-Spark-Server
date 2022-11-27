const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// jwt
const jwt = require('jsonwebtoken');


// middlewares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0tydy0p.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        const productsCollection = client.db("clothingSpark").collection("productsCategory");
        const usersCollection = client.db("clothingSpark").collection("users");
        const bookingsCollection = client.db("clothingSpark").collection("bookings");
        const wishListCollection = client.db("clothingSpark").collection("wishlist");

        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productsCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
        })
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const categoryProduct = await productsCollection.findOne(query);
            res.send(categoryProduct);
        })

        // set user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });
        // get users
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        // bookings from users
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const query = {
                BuyerName: booking.name,
                email: booking.email,
                phone: booking.phone,
                proudctName: booking.productName,
                resalePrice: booking.resalePrice,
                locaiton: booking.location,
            }
            const Booked = await bookingsCollection.find(query).toArray();
            if (Booked.length) {
              const message = `You Already buy this ${booking.productName}`
              return res.send({ acknowledge: false, message });
            }
            const result = await bookingsCollection.insertOne(booking);
            res.send(result)
          });
          app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            // const decodeEmail = req.decoded.email;
            // if (email !== decodeEmail) {
            //   return res.status(403).send({ message: 'forbidden access' });
            // }
      
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
          })

        //   wish list
        app.post('/wishlist', async (req, res) => {
            const wishlist = req.body;
            const query = {
                name: wishlist.name,
                email: wishlist.email,
                productName: wishlist.productName,
                resalePrice: wishlist.resalePrice,
                originalPrice: wishlist.originalPrice
            }
            const result = await wishListCollection.insertOne(query);
            res.send(result)
          });
          app.get('/wishlist', async (req, res) => {
            const email = req.query.email;
            // const decodeEmail = req.decoded.email;
            // if (email !== decodeEmail) {
            //   return res.status(403).send({ message: 'forbidden access' });
            // }
      
            const query = { email: email };
            const wishlist = await wishListCollection.find(query).toArray();
            res.send(wishlist);
          })

    }
    finally {

    }
}
run().catch(console.log);


app.get('/', async (req, res) => {
    res.send('Clothing sparks server running on server')
})
app.listen(port, () => {
    console.log("Clothing Spark running on port ", port);
})