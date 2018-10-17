require('./config/config');

const _ = require('lodash');
const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, async (request, response) => {
    let todo = new Todo({
        text: request.body.text,
        _creator: request.user._id
    });
    try {
        const doc = await todo.save();
        response.send(doc);
    } catch (error) {
        response.status(400).send(error);
    }

    // todo.save().then((doc) => {
    //     response.send(doc);
    // }, (error) => {
    //     response.status(400).send(error);
    // });
});

app.get('/todos', authenticate, async (request, response) => {
    try {
        const todos = await Todo.find({_creator: request.user._id});
        response.send({todos});
    } catch (e) {
        response.status(400).send(e);
    }

    // Todo.find({_creator: request.user._id}).then((todos) => {
    //     response.send({todos});
    // }, (err) => {
    //     response.status(400).send(err);
    // });
});

app.get('/todos/:id', authenticate, async (request, response) => {
    const id = request.params.id;
    if (!ObjectID.isValid(id)) {
        return response.status(404).send();
    }
    try {
        const todo = await Todo.findOne({
            _id: id,
            _creator: request.user._id
        });
        if (!todo) {
            return response.status(404).send();
        }
        response.send({todo});
    } catch (e) {
        response.status(400).send();
    }

    // Todo.findOne({
    //     _id: id,
    //     _creator: request.user._id
    // }).then((todo) => {
    //     if (!todo) {
    //         return response.status(404).send();
    //     }
    //     response.send({todo});
    // })
    // .catch((error) => response.status(400).send());
});

app.delete('/todos/:id', authenticate, async (request, response) => {
    const id = request.params.id;
    if (!ObjectID.isValid(id)) {
        return response.status(404).send();
    }
    try {
        const todo = await Todo.findOneAndRemove({
            _id: id,
            _creator: request.user._id
        });
        if (!todo) {
            return response.status(404).send();
        }
        response.send({todo});
    } catch (e) {
        response.status(400).send();
    }
    
    // Todo.findOneAndRemove({
    //     _id: id,
    //     _creator: request.user._id
    // }).then((todo) => {
    //     if (!todo) {
    //         return response.status(404).send();
    //     }
    //     response.send({todo});
    // })
    // .catch((error) => response.status(400).send());
});

app.patch('/todos/:id', authenticate, async (request, response) => {
    const id = request.params.id;
    const body = _.pick(request.body, ['text', 'completed']);
    
    if (!ObjectID.isValid(id)) {
        return response.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    try {
        const todo = await Todo.findOneAndUpdate({_id: id, _creator: request.user._id}, {$set: body}, {new: true});
        if (!todo) {
            return response.status(404).send();
        }
        response.send({todo});
    } catch (e) {
        response.status(400).send();
    }

    // Todo.findOneAndUpdate({_id: id, _creator: request.user._id}, {$set: body}, {new: true}).then((todo) => {
    //     if (!todo) {
    //         return response.status(404).send();
    //     }
    //     response.send({todo});
    // })
    // .catch((error) => response.status(400).send());
});

app.post('/users', async (request, response) => {
    const body = _.pick(request.body, ['email', 'password']);
    const user = new User(body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        response.header('x-auth', token).send(user);
    } catch (e) {
        response.status(400).send(e);
    }

    // user.save().then(() => {
    //     return user.generateAuthToken();
    // })
    // .then((token) => {
    //     response.header('x-auth', token).send(user);
    // })
    // .catch((error) =>
    //     response.status(400).send(error));
});

app.get('/users/me', authenticate, (request, response) => {
    response.send(request.user);
});

// app.post('/users/login', (request, response) => {
//     var email = request.body.email;
//     var password = request.body.password;
//     User.findOne({email}).then((user) => {
//         var hashedPassword = user.password;
//         bcrypt.compare(password, hashedPassword, (error, result) => {
//             if(result) {
//                 response.send(user);
//             } else {
//                 response.status(400).send();
//             }
//         });
//     })
//     .catch((error) => response.status(400).send());
// });

app.post('/users/login', async (request, response) => {
    try { 
        const body = _.pick(request.body, ['email', 'password']);
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        response.header('x-auth', token).send(user);
    } catch (e) {
        response.status(400).send();
    }

    // User.findByCredentials(body.email, body.password)
    // .then((user) => {
    //     return user.generateAuthToken().then((token) => {
    //         response.header('x-auth', token).send(user);
    //     });
    // })
    // .catch((error) => {
    //     response.status(400).send();
    // });
});

app.delete('/users/me/token', authenticate, async (request, response) => {
    try {
        await request.user.removeToken(request.token);
        response.status(200).send();
    } catch (e) {
        response.status(400).send();
    }
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {
    app
};