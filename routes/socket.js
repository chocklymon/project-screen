/**
 * Created by coakley on 3/3/17.
 */

var fs = require('fs');

function emitError(socket, err) {
    socket.emit('app.error', {
        'error': err
    });
}

function sendImagesTo(socket) {
    fs.readdir(__dirname + '/../public/images', function(err, items) {
        if (err) {
            emitError(socket, err);
            return;
        }

        var images = [];
        for (var i = 0; i < items.length; i++) {
            images.push('images/' + items[i]);
        }
        socket.emit('app.images', images);
    });
}

module.exports = function(server) {
    var io = require('socket.io')(server);

    io.on('connect', function(socket) {
        console.log('Socket connected');

        socket.on('app.getImages', function() {
            console.log('Get Images');
            sendImagesTo(socket);
        });

        socket.on('app.changeImage', function(image) {
            io.emit('app.imageChange', image);
        });
        socket.on('app.changeBgImage', function(image) {
            io.emit('app.bgImageChange', image);
        });
        socket.on('app.changeBgColor', function(image) {
            io.emit('app.bgColorChange', image);
        });
    });

    return io;
};
