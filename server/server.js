const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { Note } = require('./model/note');
const { Query } = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

function parseDate(data) {
    const datesData = data.split('-');
    // return array [month, date, year]
    let [month, date, year] = datesData.map(val => parseInt(val));
    month--;
    return [month, date, year];
}
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Calendar API App');
});

app.post('/notes', (req, res) => {
    let [month, date, year] = parseDate(req.body.date);
    const newNote = new Note({
        date: new Date(year, month, date),
        title: req.body.title,
        body: req.body.body
    });

    newNote.save().then((doc) => {
        res.status(200).send(newNote);
    }, (e) => {
        res.status(400).send(e);
    });
    
});

app.get('/notes', (req, res) => {
    Note.find().then((doc) => {
        res.send({
            doc,
            status: 'OK'
        });
    }, (e) => console.log('Can not connect to server', e));
});

// get a specific date
app.get('/notes/:date', (req, res) => {
    const [month, date, year] = parseDate(req.params.date);

    Note.find({
        date: new Date(year, month, date)
    }).then(doc => {
        if (doc.length === 0) {
            res.status(404).send('Not Found');
        } else {
            res.send(doc);
        }
    }, e => {
        console.log('Finding result cause error', e);
    })
});

app.listen(port, () => {
    console.log('Server is up at ' + port);
})