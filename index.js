var express=require('express');
var app=express();

let server = require('./server.js');
let middleware = require('./middleware.js');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

// DB Connnection
const MongoClient=require('mongodb').MongoClient;
const url='mongodb://127.0.0.1:27017';
const dbName='hospitalInventory';
let db
MongoClient.connect(url, (err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
});

// Get Hospital Details
app.get('/gethospitaldetails',middleware.checkToken,function(req,res)
{
    db.collection('hospitalInfo').find().toArray().then(result=>(res.json(result)));
});

// Get vent details

app.get('/getventilatordetails',middleware.checkToken,function(req,res)
{
    db.collection('ventilatorInfo').find().toArray().then(result=>(res.json(result)));
});

// Search Vetilators by status and hosp name
app.get('/searchvent',middleware.checkToken,function(req,res)
{
    var name=req.query.name;
    var status=req.query.status;
    db.collection('ventilatorInfo').find({"status":status,"name":name}).toArray().then(result=>(res.json(result)));
});



// Search hospital by name
app.get('/searchhospname',middleware.checkToken,function(req,res)
{
    var name=req.query.name;

    db.collection('hospitalInfo').find({"name":name}).toArray().then(result=>(res.json(result)));
});

// update ventialor status by ventilaor id
app.put('/updatevent',middleware.checkToken,function(req,res)
{
    var status=req.query.status;
    var id=req.query.vid;

    db.collection('ventilatorInfo').update({"vid":id},{$set: {"status":status}}).then(result=>(res.send(`Status of ${req.query.vid} ventialtor updated to ${req.query.status}`)));
});

//add vetilator
app.put('/addvent',middleware.checkToken,function(req,res)
{
    var hid=req.query.hid;
    var vid=req.query.vid;
    var status=req.query.status;
    var name=req.query.name;

    var item= {
        "hid":hid,
        "vid":vid,
        "status":status,
        "name":name
    }

    db.collection('ventilatorInfo').insert(item).then(result=>(res.send(` ${req.query.vid} ventialtor added to ${req.query.name}`)));
});

//delete ventilaor by ventilator id

app.delete('/deletevent',middleware.checkToken,function(req,res)
{
    var vid=req.query.vid;
    
    db.collection('ventilatorInfo').deleteOne({"vid":vid}, function(err, resp){
        if(err) throw err;

        res.send(` ${req.query.vid} ventialtor deleted`);
    });
});



app.get('/', function(req, res){
    res.send("Hello!");
});

app.listen(3000);