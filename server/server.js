const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'srijan', 
    database: 'eventplanner'
});

db.connect(err => {
    if (err) {
        console.log('Error connecting to MySQL:', err);
        return;
    }
    console.log('MySQL connected...');
});



app.post('/add-event', (req, res) => {
    const { name, date, type } = req.body;
    const query = `INSERT INTO events (name, date, type) VALUES (?, ?, ?)`;
    db.query(query, [name, date, type], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send('Event added successfully!');
    });
});


app.get('/events', (req, res) => {
    const query = 'SELECT * FROM events';
    db.query(query, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});


app.put('/update-event/:id', (req, res) => {
    const { id } = req.params;
    const { name, date, type } = req.body;
    const query = 'UPDATE events SET name = ?, date = ?, type = ? WHERE id = ?';
    db.query(query, [name, date, type, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send('Event updated successfully!');
    });
});


app.delete('/delete-event/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM events WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send('Event deleted successfully!');
    });
});


app.post('/add-task', (req, res) => {
    const { eventId, description } = req.body;
    const query = 'INSERT INTO tasks (event_id, task_description) VALUES (?, ?)';
    db.query(query, [eventId, description], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send('Task added successfully!');
    });
});

app.get('/tasks/:eventId', (req, res) => {
    const { eventId } = req.params;
    const query = 'SELECT * FROM tasks WHERE event_id = ?';
    db.query(query, [eventId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});


app.put('/update-task-completion/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body; 
    const query = 'UPDATE tasks SET completed = ? WHERE id = ?';
    db.query(query, [completed, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send('Task completion status updated successfully!');
    });
});

app.put('/update-task-description/:id', (req, res) => {
    const { id } = req.params;
    const { description } = req.body; 
    const query = 'UPDATE tasks SET task_description = ? WHERE id = ?';
    db.query(query, [description, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send('Task description updated successfully!');
    });
});



app.delete('/delete-task/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM tasks WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send('Task deleted successfully!');
    });
});


app.listen(3001, () => {
    console.log('Server running on port 3001');
});
