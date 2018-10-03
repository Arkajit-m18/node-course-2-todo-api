const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
}, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333
}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    })
    .then(() => done());
});

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
