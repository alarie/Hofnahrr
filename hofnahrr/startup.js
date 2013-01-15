// startup.js
var deployd = require('deployd'),
    dpd, 
    hofnahrr, 
    port = process.env.PORT || 8080,
    dbport = 27017;

console.log('Creating deployd server...');
dpd = deployd({
    port: port,
    env: 'staging',
    db: {
        host: 'localhost',
        port: dbport,
        name: 'hofnahrr',
        credentials: {
            username: '',
            password: ''
        }
    }
});

// remove all data in the 'todos' collection
//hofnahrr = dpd.createStore('hofnahrr');

//hofnahrr.remove(function () {
    // all todos removed
    

// Start right away, don't flush the store before
console.log('...starting to listen on ' + port);
dpd.listen();


//});

dpd.on('error', function (err) {
    console.error(err);
    process.nextTick(function () { // Give the server a chance to return an error
        process.exit();
    });
});
