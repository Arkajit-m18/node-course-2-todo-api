//MongoDB module v3
//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (error, client) => {
    if (error) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');

    // db.collection('Todos').findOneAndUpdate({
    //     _id: new ObjectID('5bb07a2adacf5178da8a957c')
    // }, {
    //     $set: {
    //         completed: true
    //     }
    // }, {
    //     returnOriginal: false
    // }).then((result) => {
    //     console.log(result);
    // });

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('5bb07203dacf5178da8a934f')
    }, {
        $set: {
            name: 'Arkajit'
        },
        $inc: {
            age: -4
        }
    }, {
        returnOriginal: false
    }).then((result) => {
        console.log(result);
    });

    //client.close();
});

// Loading database server: C:\Program Files\MongoDB\Server\4.0\bin>mongod.exe --dbpath /Users/arkaj/mongo-data