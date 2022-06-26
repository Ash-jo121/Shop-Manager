const MongoClient = require('mongodb').MongoClient;
const multer = require('multer');
let base64ToImage = require('base64-to-image');
let fs = require('fs');
const GridFsStorage = require('multer-gridfs-storage');
let finalString='';

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
    let db1 = databasesList.databases[0];
    console.log(db1);
    // databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

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
    console.log("Type of dept_id",typeof(deptIdOfListing));
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

async function main(){
    const uri = "mongodb+srv://ashjo:Ashucet123%23@cluster0.mcyt8.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);
    try{
        await client.connect();
        //await listDatabases(client);
        let imageFile = await findOneListingByDeptId(client,1);
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
    fs.writeFile('image.png', buf, err => {
        if (err) throw err;
        console.log('Saved!');
    });
        

    }catch(err){
        console.log(err);
    }finally {
        await client.close();
    }

}

main().catch(console.error);
