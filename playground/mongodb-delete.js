//MongoDB module v3
//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true}, (error, client) => {
    if (error) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');

    //deleteMany
    
    // db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((result) => {
    //     console.log(result);
    // });
    
    //deleteOne

    // db.collection('Todos').deleteOne({text: 'Something to do'}).then((result) => {
    //     console.log(result);
    // });

    //findOneAndDelete

    // db.collection('Todos').findOneAndDelete({completed: false}).then((doc) => {
    //     console.log(doc);
    // });

    // db.collection('Users').deleteMany({name: 'Arkajit'}).then((result) => {
    //     console.log(result);
    // });

    db.collection('Users').findOneAndDelete({_id: new ObjectID('5bb06b3e1380501a181fa70b')}).then((result) => {
        console.log(result);
    });
    //client.close();
});

// Loading database server: C:\Program Files\MongoDB\Server\4.0\bin>mongod.exe --dbpath /Users/arkaj/mongo-data