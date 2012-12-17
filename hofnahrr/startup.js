// startup.js
var deployd = require('deployd'),
    server, 
    hofnahrr, 
    port = process.env.PORT || 8080,
    dbport = 27017;

console.log('Creating deployd server...');
server = deployd({
    port: port,
    env: 'staging',
    db: {
        host: 'localhost',
        port: dbport,
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
    console.log('...starting to listen on ' + port);
    server.listen();
});

server.on('error', function (err) {
    console.error(err);
    process.nextTick(function () { // Give the server a chance to return an error
        process.exit();
    });
});
