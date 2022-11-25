const express = require('express');
const cors = require('cors');
const port =  process.env.PORT || 5000;

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// load products
const products = require('./Products.json');
app.get('/products', (req, res) => {
    res.send(products)
})
app.get('/products/:id', (req, res) => {
    const id = req.params.id;
    const seletedProduct= products.find(n => n.id === id)
    res.send(seletedProduct);
})

app.get('/', async (req, res) => {
    res.send('Clothing sparks server running on server')
})
app.listen(port , () => {
    console.log("Clothing Spark running on port ", port);
})