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
        console.log('Socket connected. Id:', socket.id);

        // The socket is requesting to join a room
        socket.on('join', function(managerId) {
            console.log('Join:', managerId);
            socket.managerId = managerId;
            socket.join(managerId);
        });
        // The socket is requesting to leave a room
        socket.on('leave', function(managerId) {
            console.log('Leave:', managerId);
            socket.managerId = null;
            socket.leave(managerId);
        });

        // Add and get images
        socket.on('app.addImage', function(imageUrl) {
            imagesService.addToImagesFile(imageUrl)
                .then(function() {
                    sendImagesTo(socket);
                })
                .catch(function(err) {
                    emitError(socket, err);
                });
        });
        socket.on('app.getImages', function() {
            // console.log('Get Images');
            sendImagesTo(socket);
        });

        // Image change events. Take an image change and then broadcast it to the room.
        socket.on('app.changeImage', function(image) {
            if (socket.managerId) {
                socket.to(socket.managerId).emit('app.imageChange', image);
            }
        });
        socket.on('app.changeBgImage', function(image) {
            if (socket.managerId) {
                socket.to(socket.managerId).emit('app.bgImageChange', image);
            }
        });
        socket.on('app.changeBgColor', function(image) {
            if (socket.managerId) {
                socket.to(socket.managerId).emit('app.bgColorChange', image);
            }
        });
    });

    return io;
};
