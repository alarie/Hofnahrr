var jam = {
    "packages": [
        {
            "name": "events",
            "location": "test/jam/events",
            "main": "events.js"
        },
        {
            "name": "backbone",
            "location": "test/jam/backbone",
            "main": "backbone.js"
        },
        {
            "name": "jquery",
            "location": "test/jam/jquery",
            "main": "jquery.js"
        },
        {
            "name": "underscore",
            "location": "test/jam/underscore",
            "main": "underscore.js"
        }
    ],
    "version": "0.1.4",
    "shim": {}
};

if (typeof require !== "undefined" && require.config) {
    require.config({packages: jam.packages, shim: jam.shim});
}
else {
    var require = {packages: jam.packages, shim: jam.shim};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
};
