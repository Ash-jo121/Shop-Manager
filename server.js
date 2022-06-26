const express = require('express');
const multer = require('multer');
const path = require('path');
let base64ToImage = require('base64-to-image');
let fs = require('fs');
const GridFsStorage = require('multer-gridfs-storage');
let finalString='';

const bodyParser = require('body-parser');
const port = 3000;
const MongoClient = require('mongodb').MongoClient;
const dbUrl =
'mongodb+srv://ashjo:Ashucet123%23@cluster0.mcyt8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const app = express();

/* --------------------------------
 *    APP CONFIG
 * -------------------------------- */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('views'));

async function findOneListingByImageName(client,imageName){
    //const url = "mongodb+srv://ashjo:Ashucet123%23@cluster0.mcyt8.mongodb.net/?retryWrites=true&w=majority";
    //let finalString ="";
    const db = client.db("node-demo");
    const collection = db.collection('fs.files');    
    const collectionChunks = db.collection('fs.chunks');
    const result1 = await collection.findOne({filename:imageName});
    //console.log(result1);
    let id = result1._id;
    //console.log(string1);
    //console.log(typeof(string1));
    //console.log(string2);
    const result2 = await collectionChunks.find({files_id : result1._id});
    const chunks1 = result2.sort({n:1});
    //console.log("Chunks",chunks1);
    let chunks = await chunks1.toArray();
    console.log(chunks);
    let fileData = [];
    for(let i=0;i<chunks.length;i++){
        fileData.push(chunks[i].data.toString('base64'));
    }
    let finalFile = fileData.join('');
    //console.log(finalFile);
    return finalFile;
}

async function findOneListingByDeptId(client,deptIdOfListing){
    const result = await client.db("node-demo").collection("shop_schema").findOne({Department:deptIdOfListing});
    if(result){
        //console.log(`Found a listing in the collection with the department '${deptIdOfListing}':`);
        //console.log(result);
        imageFile = result.ImageName;
        //console.log(typeof(imageFile));
        console.log("1",imageFile);
        return imageFile;
    }else{
        console.log(`No Listing found for the particular department`);
    }
}

async function main(dept_id){
    const uri = "mongodb+srv://ashjo:Ashucet123%23@cluster0.mcyt8.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);
    try{
        await client.connect();
        //await listDatabases(client);
        let imageFile = await findOneListingByDeptId(client,dept_id);
        console.log("2",imageFile);
        //console.log("At main:",finalString);
        //let binString = await findOneListingByImageName(imageFile);
        //console.log("Main",binString);
        //console.log("At first function:",finalString);
        let finalFile = await findOneListingByImageName(client,imageFile);
        console.log("Main:",finalFile);
        
        var img = "data:image/png;base64,"+finalFile;
    // strip off the data: url prefix to get just the base64-encoded bytes
    var data = img.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer.from(data, 'base64');
    if (fs.existsSync('views/image.png')){
      fs.unlink('views/image.png',(err)=>{
        if(err){
          throw err;
        }
        console.log("File is deleted");
      });
    }
    fs.writeFile('views/image.png', buf, err => {
        if (err) throw err;
        console.log('Saved!');
    });
        

    }catch(err){
        console.log(err);
    }finally {
        await client.close();
    }

}

/* --------------------------------
 *    ROUTES
 * -------------------------------- */
app.get('/', (req, res) => {
  MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
    if (err) return console.error(err);
    const db = client.db('node-demo');
    const collection = db.collection('users');
    collection
      .find()
      .toArray()
      .then((results) => {
        res.render('index.ejs', { users: results });
      })
      .catch((error) => {
        res.redirect('/');
      });
  });
});

app.get('/download/:version',function (req,res) {
  let s_dept_id = req.params.version;
  let dept_id = Number(s_dept_id);
  console.log(typeof(dept_id));
  main(dept_id);
  //res.send("Success!!!!")
  //console.log(__dirname);

  res.sendFile(path.join(__dirname, '/public/image.html'));
  //location.assign(__dirname + '/public/image.html');
  console.log("Successful!!!");
});

app.post('/users', (req, res) => {
  MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
    if (err) return console.error(err);
    const db = client.db('node-demo');
    const collection = db.collection('users');
    collection
      .insertOne(req.body)
      .then(() => {
        res.redirect('/');
      })
      .catch(() => {
        res.redirect('/');
      });
  });
});

app.delete('/users', (req, res) => {
  MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
    if (err) return console.error(err);
    const db = client.db('node-demo');
    const collection = db.collection('users');
    collection
      .deleteOne(req.body)
      .then(() => {
        res.json(`Deleted user`);
      })
      .catch(() => {
        res.redirect('/');
      });
  });
});

app.put('/users', (req, res) => {
  MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
    if (err) return console.error(err);
    const db = client.db('node-demo');
    const collection = db.collection('users');
    collection
      .findOneAndUpdate(
        { fname: req.body.oldFname, lname: req.body.oldLname },
        {
          $set: {
            fname: req.body.fname,
            lname: req.body.lname,
          },
        },
        {
          upsert: true,
        }
      )
      .then(() => {
        res.json('Success');
      })
      .catch(() => {
        res.redirect('/');
      });
  });
});

/* --------------------------------
 *    START SERVER
 * -------------------------------- */
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
