/**
 * Created by coakley on 3/3/17.
 */

var imagesService = require('../src/ImagesService');

function emitError(socket, err) {
    socket.emit('app.error', {
        'error': err
    });
}

function sendImagesTo(socket) {
    imagesService.getImages()
        .then(function(images) {
            socket.emit('app.images', images);
        })
        .catch(function(err) {
            emitError(socket, err);
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
        socket.on('app.addImage', function(imageUrl) {
            imagesService.addToImagesFile(imageUrl)
                .then(function() {
                    sendImagesTo(socket);
                })
                .catch(function(err) {
                    emitError(socket, err);
                });
        })
    });

    return io;
};
