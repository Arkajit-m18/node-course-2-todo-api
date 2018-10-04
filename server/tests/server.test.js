const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it ('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((response) => {
                expect(response.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                })
                .catch((e) => done(e));
            });
    });

    it ('should not create todo with invalid data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(error);
                }
                Todo.find().then((todos) => {
                   expect(todos.length).toBe(2);
                   done();
                })
                .catch((e) => done(e));
            });
    });
});

describe('GET /todos', () => {
    
    it ('should list all the todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((response) => {
                expect(response.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {

    it ('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((response) => {
                expect(response.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it ('should return 404 if todo not found', (done) => {
        var id = new ObjectID();
        request(app)
            .get(`/todos/${id.toHexString()}`)
            .expect(404)
            .end(done);
    });
    
    it ('should return 404 for non-object ids', (done) => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {

    it ('should delete a todo', (done) => {
        var hexId = todos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((response) => {
                expect(response.body.todo._id).toBe(hexId);
                expect(response.body.todo.text).toBe(todos[0].text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                expect(Todo.findById(hexId)).toMatchObject({});
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(1);
                    done();
                })
                .catch((e) => done(e));
            });
    });

    it ('should return 404 if todo not found', (done) => {
        var id = new ObjectID();
        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .end(done);
    });

    it ('should return 404 for non-object ids', (done) => {
        var id = '123'
        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {

    it ('should update the todo', (done) => {
        var hexId = todos[0]._id.toHexString();
        var text = 'Updated first todo'
        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                text,
                completed: true
            })
            .expect(200)
            .expect((response) => {
                expect(response.body.todo.text).toBe(text);
                expect(response.body.todo.text).not.toBe(todos[0].text);
                expect(response.body.todo.completed).toBe(true);
                expect(typeof response.body.todo.completedAt).toBe('number');
            })
            .end(done);
    });

    it ('should clear completedAt when todo is not completed', (done) => {
        var hexId = todos[1]._id.toHexString();
        var text = 'Updated second test todo';
        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                text,
                completed: false
            })
            .expect(200)
            .expect((response) => {
                expect(response.body.todo.text).toBe(text);
                expect(response.body.todo.text).not.toBe(todos[1].text);
                expect(response.body.todo.completed).toBe(false);
                expect(response.body.todo.completedAt).toBeNull();
            })
            .end(done);
    });

    it ('should return 404 if id not found', (done) => {
        var id = new ObjectID();
        request(app)
            .patch(`/todos/${id}`)
            .expect(404)
            .end(done);
    });

    it ('should return 404 for non-object ids', (done) => {
        request(app)
            .patch('/todos/123')
            .expect(404)
            .end(done);
    });
});

describe('GET /users/me', () => {

    it ('should returnuser if authenticated' ,(done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((response) => {
                expect(response.body._id).toBe(users[0]._id.toHexString())
                expect(response.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it ('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            //.set('x-auth', 'abc')
            .expect(401)
            .expect((response) => {
                expect(response.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {

    it ('should create a user', (done) => {
        var email = 'example@example.com';
        var password = '123mnb!';
        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((response) => {
                expect(response.headers['x-auth']).toBeTruthy();
                expect(response.body._id).toBeTruthy();
                expect(response.body.email).toBe(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }
                User.findOne({email}).then((user) => {
                    expect(user).toBeTruthy();
                    expect(user.password).not.toBe(password);
                    done();
                })
                .catch((e => done(e)));
            });
    });

    it ('should return validation errors if request inavalid', (done) => {
        var email = 'abc';
        var password = '123';
        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });

    it ('should create any user if email is already in use', (done) => {
        var email = users[1].email;
        var password = users[1].password;
        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {

    it ('should login user and return auth token', (done) => {
        var email = users[1].email;
        var password = users[1].password;
        request(app)
            .post('/users/login')
            .send({email, password})
            .expect(200)
            .expect((response) => {
                expect(response.headers['x-auth']).toBeTruthy();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[0]).toMatchObject({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                })
                .catch((e) => done(e));
            });
    });

    it ('should reject invalid login', (done) => {
        var email = 'abc';
        var password = '123';
        request(app)
            .post('/users/login')
            .send({email, password})
            .expect(400)
            .expect((response) => {
                expect(response.headers['x-auth']).not.toBeTruthy();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                })
                .catch((e) => done(e));
            });
    });
});

describe('DELETE /users/me/token', () => {

    it ('should remove auth token on logout', (done) => {
        var token = users[0].tokens[0].token;
        request(app)
            .delete('/users/me/token')
            .set('x-auth', token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                })
                .catch((e) => done(e));
            });
    });

    it ('should not delete a token if invalid auth', (done) => {
        var token = '123';
        request(app)
            .delete('/users/me/token')
            .set('x-auth', token)
            .expect(401)
            .end(done);
    });
});
