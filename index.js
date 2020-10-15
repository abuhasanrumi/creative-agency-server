const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs-extra')
const fileUpload = require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zubrj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('serviceIcon'))
app.use(fileUpload())

const port = 5000

app.get('/', (req, res) => {
  res.send('API Working!')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("creative-agency").collection("service");
  const reviewCollection = client.db("creative-agency").collection("review");
  const adminCollection = client.db("creative-agency").collection("admin");
  const orderCollection = client.db("creative-agency").collection("order");


  app.post('/addService', (req, res) => {
    const icon = req.files.icon;
    const title = req.body.title;
    const description = req.body.description;
    const filePath = `${__dirname}/serviceIcon/${icon.name}`
    icon.mv(filePath, err => {
      if (err) {
        console.log(err)
        res.status(500).send({ msg: 'failed to upload image' })
      }
    const newImg = req.files.icon.data
    const encImg = newImg.toString('base64')
    var image = {
      contentType: req.files.icon.mimetype,
      size: req.files.icon.size,
      img: Buffer.from(encImg, 'base64')
    }

    serviceCollection.insertOne({ title, description, icon })
      .then(result => {
        fs.remove(filePath, error => {
          if (error) {
            console.log(error)
            res.status(500).send({ msg: 'failed to upload image' })
          }
        res.send(result.insertedCount > 0)
        })

      })
    })
  })

  
  app.get('/services', (req, res) => {
    serviceCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
  });


  app.post('/reviews', (req, res) => {
    const newReview = req.body;
    
    reviewCollection.insertOne(newReview)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

  app.get('/reviews', (req, res) => {
    reviewCollection.find({}).limit(6)
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

  app.post('/admins', (req, res) => {
    const newAdmin = req.body;
    
    adminCollection.insertOne(newAdmin)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

  app.get('/admins', (req, res) => {
    adminCollection.find({})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })


  app.post('/orders', (req, res) => {
    const newOrder = req.body;
    
    orderCollection.insertOne(newOrder)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

  app.get('/orders', (req, res) => {
    orderCollection.find({})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })



});


app.listen(process.env.PORT || port)