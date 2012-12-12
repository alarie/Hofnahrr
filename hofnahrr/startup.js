// startup.js
var deployd = require('deployd'),
    server, 
    hofnahrr;

server = deployd({
    port: process.env.PORT || 5000,
    env: 'staging',
    db: {
        host: 'localhost',
        port: 27017,
        name: 'hofnahrr',
        credentials: {
            username: 'test',
            password: 'secret'
        }
    }
});

// remove all data in the 'todos' collection
hofnahrr = server.createStore('hofnahrr');

hofnahrr.remove(function () {
    // all todos removed
    server.listen();
});

server.on('error', function (err) {
    console.error(err);
    process.nextTick(function () { // Give the server a chance to return an error
        process.exit();
    });
});
