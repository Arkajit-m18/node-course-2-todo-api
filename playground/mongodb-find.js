//MongoDB module v3
//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (error, client) => {
    if (error) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');

    // db.collection('Todos').find({
    //     _id: new ObjectID('5bafd3663f19fa30f48fd2a6')
    // }).toArray().then((docs) => {
    //     console.log('Todos:');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (err) => {
    //     console.log('Unable to fetch todos ', err);
    // });

    // db.collection('Todos').find().count().then((count) => {
    //     console.log(`Todos count: ${count}`);
    // }, (err) => {
    //     console.log('Unable to fetch todos ', err);
    // });
    
    var name = 'Jen';
    
    db.collection('Users').find({name}).toArray().then((docs) => {
        console.log('Users List:');
        console.log(JSON.stringify(docs, undefined, 2));
        return db.collection('Users').find({name}).count();
    }, (err) => {
        console.log('Unable to fetch users ', err);
    })
    .then(count => {
        console.log(`Users count: ${count}`);
    }, (err) => {
        console.log('Unable to fetch users ', err);
    });

    //client.close();
});

// Loading database server: C:\Program Files\MongoDB\Server\4.0\bin>mongod.exe --dbpath /Users/arkaj/mongo-data