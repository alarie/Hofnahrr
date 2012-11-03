define([], function () {
    var WebWorker = {
        create : function (implementation, onMessage) {
            var b, worker,
                URL = window.URL || window.webkitURL,
                Blob = window.Blob;

            implementation = implementation.toString().replace(/(^function\s*\(\)\s*\{)|(\}$)/g, '');
           
            b = new Blob([implementation], {type : 'text/javascript'});

            worker = new Worker(URL.createObjectURL(b));

            if (onMessage) {
                worker.onmessage = onMessage;
            }

            return worker;
        }
    };

    return WebWorker;
});
