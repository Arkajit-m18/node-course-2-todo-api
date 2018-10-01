const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// var id = '5bb1d11d25703b2f500311db';

// if (!ObjectID.isValid(id)) {
//     console.log('ID not valid');
// }

// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos:', todos);
// });

// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     console.log('Todo:', todo);
// });

// Todo.findById(id).then((todo) => {
//     if (!todo) {
//         return console.log('ID not found');
//     }
//     console.log('Todo:', todo);
// }).catch((e) => console.log(e));

var userId = '5bb0d9f60f3ae22ac0b4eecb';

if (!ObjectID.isValid(userId)) {
    console.log('User ID not valid.');
}

User.findById(userId).then((user) => {
    if (!user) {
        return console.log('User ID not found');
    }
    console.log('User:', user);
})
.catch((err) => console.log(err));