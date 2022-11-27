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

// verify jwt 
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('Unauthorized Access');
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'forbidden access' })
    }
    req.decoded = decoded;
    next();
  })
}


async function run() {
  try {
    const productsCollection = client.db("clothingSpark").collection("productsCategory");
    const usersCollection = client.db("clothingSpark").collection("users");
    const bookingsCollection = client.db("clothingSpark").collection("bookings");
    const wishListCollection = client.db("clothingSpark").collection("wishlist");
    const sellerProductsCollection = client.db("clothingSpark").collection("SellerProduct");

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
        productName: booking.productName,
        resalePrice: booking.resalePrice,
        location: booking.location,
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

    //   jwt
    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '7d' })
        return res.send({ accessToken: token })
      }
      res.status(403).send({ accessToken: '' })

    })

    // check a user is a admin or not
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.status === 'admin' });
  })
     // save product
     app.post("/addproduct", async (req, res) => {
      const product = req.body;
      const result = await sellerProductsCollection.insertOne(product);
      res.send(result);
    });

    // get my products api
    app.get("/my-products/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email };
      const result = await productsCollection.find(filter).toArray();
      res.send(result);
    });



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