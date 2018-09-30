//MongoDB module v3
//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

// var obj = new ObjectID();
// console.log(obj);

//---Object destructuring---
// var user = {name: 'Arkajit', age: 23};
// var {name} = user;
// console.log(name);

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (error, client) => {
    if (error) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');

    // db.collection('Todos').insertOne({
    //     text: 'Something to do',
    //     completed: false
    // }, (error, result) => {
    //     if (error) {
    //         return console.log('Unable to inser to do', error);
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });

    // db.collection('Users').insertOne({
    //     name: 'Andrew',
    //     age: 25,
    //     location: 'Philadelphia'
    // }, (error, result) => {
    //     if (error) {
    //         return console.log('Unable to insert user ', error);
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    //     console.log(result.ops[0]._id);
    //     console.log(result.ops[0]._id.getTimestamp());
    // });

    client.close();
});

// Loading database server: C:\Program Files\MongoDB\Server\4.0\bin>mongod.exe --dbpath /Users/arkaj/mongo-data