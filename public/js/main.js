/**
 * Created by coakley on 3/3/17.
 */
'use strict';

var imageShareModule = angular.module('imageShare', ['ngAnimate', 'ngRoute']);

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

imageShareModule.controller('DisplayController', ['$log', '$rootScope', '$window', 'io', function($log, $rootScope, $window, io) {
    var vm = this;
    var socket = io('/');

    vm.pageHeight = $window.innerHeight + 'px';
    vm.bgColor = '#030303';

    // Socket events
    socket.on('connect', function () {
        $log.debug('WebSocket connected');
    });
    socket.on('app.imageChange', function (image) {
        // Received image change, change the currently displayed image
        $log.debug('Changing image to:', image);
        vm.image = image;
    });
    socket.on('app.bgImageChange', function (image) {
        // Received background image change, change the currently displayed image
        $log.debug('Changing background image to:', image);
        vm.backgroundImage = image;
    });
    socket.on('app.bgColorChange', function(color) {
        $log.debug('Changing background color to: ', color);
        vm.bgColor = color;
    });

    // Listen for image loaded events
    $rootScope.$on('imageLoadSuccess', function(event, img) {
        $rootScope.$apply(function() {
            if (img.height >= $window.innerHeight) {
                vm.imageTop = '0';
            } else {
                // Center the image
                vm.imageTop = (($window.innerHeight - img.height) / 2) + 'px';
            }
        });
    });
    $rootScope.$on('imageLoadError', function(err) {
        // TODO
        $log.warn('Image Load Error', err);
    });

    // Adjust the page's height as the window resizes
    $rootScope.$on('windowResize', function(event, dimensions) {
        $rootScope.$apply(function() {
            vm.pageHeight = dimensions.height + 'px';
        });
    });
}]);

imageShareModule.controller('ManageController', ['$log', 'io', function($log, io) {
    var vm = this;
    var socket = io('/');

    vm.bgColor = '#030303';

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
    vm.selectImage = function(image) {
        socket.emit('app.changeImage', image);
    };
    vm.selectBackgroundImage = function(image) {
        socket.emit('app.changeBgImage', image);
    };
    vm.setBgColor = function() {
        socket.emit('app.changeBgColor', vm.bgColor);
    };

    // Socket events
    socket.on('connect', function() {
        $log.debug('WebSocket connected');
    });
    socket.on('app.images', function(images) {
        $log.debug('List of images received from server:', images);
        vm.images = images;
    });

    // Initialize by getting the images
    getImages();

    // Functions
    function getImages() {
        socket.emit('app.getImages');
    }
}]);

imageShareModule.controller('SelectController', ['$location', function($location) {
    var vm = this;

    vm.setDisplayMode = function () {
        $location.path('/display');
    };
    vm.setControlMode = function () {
        $location.path('/control');
    };
}]);

imageShareModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/display', {
            templateUrl: 'DisplayTemplate.html',
            controller: 'DisplayController',
            controllerAs: 'vm'
        })
        .when('/control', {
            templateUrl: 'ManageTemplate.html',
            controller: 'ManageController',
            controllerAs: 'vm'
        })
        .when('/', {
            templateUrl: 'SelectTemplate.html',
            controller: 'SelectController',
            controllerAs: 'vm'
        })
        .otherwise('/');
}]);

imageShareModule.run(['$rootScope', '$window', function($rootScope, $window) {
    // Add a listener to window resize events
    angular.element($window).bind('resize', _.debounce(broadcastWindowSize, 200));

    function broadcastWindowSize() {
        $rootScope.$broadcast('windowResize', {
            height: $window.innerHeight,
            width: $window.innerWidth
        });
    }
}]);
