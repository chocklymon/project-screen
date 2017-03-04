/**
 * Created by coakley on 3/3/17.
 */
'use strict';

var imageShareModule = angular.module('imageShare', ['ngAnimate']);

imageShareModule.factory('io', ['$log', '$rootScope', function($log, $rootScope) {
    var socket = null;

    function errorHandler(err) {
        $log.warn('App Error: ', err);
        // TODO
    }

    var socketWrapper = {
        on: function(event, callback) {
            socket.on(event, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };

    function SocketFactory(url, options) {
        socket = io(url, options);
        socketWrapper.on('app.error', errorHandler);
        socketWrapper.on('disconnect', function(reason) {
           $log.debug('Disconnected from server:', reason);
           // errorHandler({msg: 'Disconnected from server', type: 'warning'});
        });
        return socketWrapper;
    }
    SocketFactory.getSocket = function() {
        return socketWrapper;
    };
    SocketFactory.getRawSocket = function() {
        return socket;
    };

    return SocketFactory;
}]);

imageShareModule.directive('imageLoad', ['$rootScope', function($rootScope) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            element.bind('load', function(e) {
                var img = new Image();
                img.src = e.target.src;
                $rootScope.$broadcast('imageLoadSuccess', img);
            });
            element.bind('error', function(err) {
                $rootScope.$broadcast('imageLoadError', err);
            });
        }
    };
}]);

imageShareModule.filter('fileName', [function() {
    return function(text, stripExtension) {
        var loc = text.lastIndexOf('/');
        if (loc >= 0) {
            text = text.substring(loc + 1);
        }
        if (stripExtension && (loc = text.lastIndexOf('.')) > 0) {
            text = text.substring(0, loc);
        }
        return text;
    }
}]);

imageShareModule.controller('Main', ['$location', '$log', '$rootScope', '$window', 'io', function ($location, $log, $rootScope, $window, io) {
    var vm = this;
    var socket = io('/');

    vm.mode = null;
    vm.pageHeight = getPageHeight();
    vm.bgColor = '#030303';

    // Routing
    vm.setSelectMode = function () {
        $location.path('/');
    };
    vm.setDisplayMode = function () {
        $location.path('/display');
    };
    vm.setControlMode = function () {
        $location.path('/control');
    };

    // Image handling
    vm.addImage = function() {
        if (vm.imageUrl) {
            socket.emit('app.addImage', vm.imageUrl);
            vm.imageUrl = '';
        }
    };
    vm.clearImage = function() {
        socket.emit('app.changeImage', '');
    };
    vm.clearBackgroundImage = function() {
        socket.emit('app.changeBgImage', '');
    };
    vm.getImages = getImages;
    vm.selectImage = function (image) {
        socket.emit('app.changeImage', image);
    };
    vm.selectBackgroundImage = function (image) {
        socket.emit('app.changeBgImage', image);
    };

    vm.setBgColor = function() {
        socket.emit('app.changeBgColor', vm.bgColor);
    };

    // Socket events
    socket.on('connect', function () {
        $log.debug('WebSocket connected');
    });
    socket.on('app.images', function (images) {
        $log.debug('List of images received from server:', images);
        vm.images = images;
    });
    socket.on('app.imageChange', function (image) {
        // Received image change, change the currently displayed image
        $log.debug('Changing image to:', image);
        vm.image = image;
    });
    socket.on('app.bgImageChange', function (image) {
        // Received image change, change the currently displayed image
        $log.debug('Changing background image to:', image);
        vm.backgroundImage = image;
    });
    socket.on('app.bgColorChange', function(color) {
        $log.debug('Changing background color to: ', color);
        vm.bgColor = color;
    });

    // Adjust the page's height as the window resizes
    angular.element($window).bind('resize', _.debounce(function() {
        $rootScope.$apply(function () {
            vm.pageHeight = getPageHeight();
        });
    }, 200));

    // Handle route changes
    $rootScope.$on('$locationChangeSuccess', function () {
        var path = $location.path();
        if (path == '/display') {
            vm.mode = 'display';
        } else if (path == '/control') {
            vm.mode = 'control';
            getImages();
        } else {
            vm.mode = null;
        }
    });
    $rootScope.$on('imageLoadSuccess', function(event, img) {
        $rootScope.$apply(function() {
            if (img.height >= $window.innerHeight) {
                vm.imageTop = '0';
            } else {
                // Center the image
                vm.imageTop = (($window.innerHeight - img.height) / 2)
                    + 'px';
            }
        });
    });
    $rootScope.$on('imageLoadError', function(err) {
        // TODO
        $log.warn('Image Load Error', err);
    });

    // Functions
    function getImages() {
        socket.emit('app.getImages');
    }

    function getPageHeight() {
        return $window.innerHeight + 'px';
    }
}]);