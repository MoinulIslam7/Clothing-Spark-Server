const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middlewares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0tydy0p.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const productsCollection = client.db("clothingSpark").collection("productsCategory");
        const usersCollection = client.db("clothingSpark").collection("users");

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