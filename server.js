var express = require('express');
var socket  = require('socket.io');

var requirejs = require('requirejs');

requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});


const PORT = 9000; 
var currentAlarmLevel;

//App
var app = express();
var server = app.listen(PORT,() => {console.log(`Server running on port ${PORT}`);})

//Static files
app.use(express.static('public'));

// POST method route
app.post('/movieRating', function (req, res) {
    res.send(req);
    console.log(req.body);
});

// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);
    
    // Handle chat event
    socket.on('chat', function(data){
        // console.log(data);
        io.sockets.emit('chat', data);
        console.log(data);
    });

    // Handle typing event
    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data);
        console.log(data);
    });

    socket.on('disconnect', (socket)  => {
        console.log('socket disconnected:', socket.id);
    });
    
    socket.on('alarm', function(data){

        const {id, level, type} = data;

        // If the same alarm is requested twice in a row, it will be cancelled
        if(level == 'holdup'){
            //Send a custom package to the client, that will stop the current playing alarm(sound) 
            io.sockets.emit('alarm', {
                id: id,
                type: 'alarm_stop',
                level: level
            });
            console.log('Stopped:');         
            currentAlarmLevel = -1;        
        }
        // Emit Normal alarm
        else{ 
            io.sockets.emit('alarm', data);
            console.log(data);
            currentAlarmLevel = level;
        } 

    }); 
});
