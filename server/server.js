const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { Note } = require('./model/note');
const { Query } = require('mongoose');
const { ObjectID } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.use(allowCrossDomain);

app.set('view engine', 'hbs');

function parseDate(data) {
    const datesData = data.split('-');
    // return array [month, date, year]
    let [month, date, year] = datesData.map(val => parseInt(val));
    month--;
    return [month, date, year];
}
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('home.hbs', {
        pageAuthor: 'Huy Cam',
        pageTitle: 'Calendar Api'
    });
});

app.post('/notes', (req, res) => {
    let [month, date, year] = parseDate(req.body.date);
    const newNote = new Note({
        date: new Date(year, month, date).toDateString(),
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
        date: new Date(year, month, date).toDateString()
    }).then(doc => {
        if (doc.length === 0) {
            res.status(404).send('Not Found' + `${example}`);
        } else {
            res.send(doc);
        }
    }, e => {
        console.log('Finding result cause error', e);
    });
});

app.patch('/notes/:id', async (req, res) => {

    try {
        const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true});

        if (!note) {
            res.status(404).send();
        }
        res.send(note);
    } catch(e) {
        res.status(400).send();
    }
    
})

app.delete('/notes/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        res.status(404).send('Invalid Id');
    }

    Note.findByIdAndRemove(id).then((doc) => {
        if (!doc) {
            res.status(404).send('Id not found');
        }

        res.send(doc);
    }, (err) => {
        res.status(404).send(err);
    });
});

app.listen(port, () => {
    console.log('Server is up at ' + port);
})