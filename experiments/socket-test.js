const express = require('express');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
var mongoose = require('mongoose');
require('mongoose-double')(mongoose);

mongoose.connect('mongodb://localhost:27017/edge-net-dashboard', { useNewUrlParser: true, useCreateIndex: true }).then(function () {
    console.log("Connected to MongoDB");
})

var SchemaTypes = mongoose.Schema.Types;

var nodeDataSchema = new mongoose.Schema({
    nodeID:  Number,
    TEMPERATURE:  SchemaTypes.Double,
    HUMIDITY:  SchemaTypes.Double,
    PRESSURE:  SchemaTypes.Double,
    time:  Date
});

var nodeData = mongoose.model('nodeData', nodeDataSchema);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use(cors({ origin: '*' }));
app.use(bodyParser);

const server = app.listen(3006, () => {
    console.log('Started in 3006');
});

const io = socket(server);

io.sockets.on('connection', (socket) => {
    console.log(`new connection id: ${socket.id}`);
    callData();
    sendData(socket);
    socket.on('disconnect', (socket) => {
        console.log(`connection id: ${socket.id} disconnected`);
    })
})

var sendList = [];

function callData() {
    
    var nodeData = mongoose.model('nodeData','1', nodeDataSchema);
    nodeData.findOne({}).sort({time: -1}).exec( function (err, docs) {
        console.log(docs);
        sendList.push(docs)
    });
    console.log(sendList);
}

function sendData(socket) {

    var nodeData = mongoose.model('nodeData','1', nodeDataSchema);
    nodeData.findOne({}).sort({time: -1}).exec( function (err, docs) {
        console.log(docs);
        sendList.push(docs)
    });
    console.log(sendList);

    socket.emit('data1', sendList);
    sendList=[];
    setTimeout(() => {
        sendData(socket);
    }, 10000);
}