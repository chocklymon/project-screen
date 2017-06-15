/**
 * Created by coakley on 3/3/17.
 */
'use strict';

var imageShareModule = angular.module('imageShare', ['ngAnimate', 'ngRoute']);

imageShareModule.factory('CodeName', [function() {
    // Just adjectives
    var adjectives = [
        "abundant","adorable","aggressive","agreeable","alert","alive","amused","ancient","angry","annoyed","annoying",
        "anxious","arrogant","ashamed","attractive","awful","bad","beautiful","better","bewildered","big","bitter",
        "black","blue","boiling","bored","brainy","brave","breakable","breezy","brief","broad","broken","bumpy","busy",
        "calm","careful","cautious","charming","cheerful","chilly","chubby","clean","clever","clumsy","cold","colorful",
        "colossal","combative","comfortable","concerned","condemned","confused","cooing","cool","cooperative",
        "courageous","crazy","creepy","crooked","cruel","cuddly","curious","curly","curved","cute","damaged","damp",
        "dangerous","dark","dead","deafening","deep","defeated","defiant","delicious","delightful","depressed",
        "determined","different","difficult","dirty","disgusted","distinct","disturbed","dizzy","doubtful","drab","dry",
        "dull","dusty","eager","easy","elated","elegant","embarrassed","empty","enchanting","encouraging","energetic",
        "enthusiastic","envious","evil","excited","expensive","exuberant","faint","fair","faithful","famous","fancy",
        "fantastic","fast","fat","few","fierce","filthy","fine","flaky","flat","fluffy","fluttering","foolish",
        "fragile","frail","frantic","freezing","fresh","friendly","frightened","funny","fuzzy","gentle","gifted",
        "gigantic","glamorous","gleaming","glorious","good","gorgeous","graceful","greasy","great","grieving",
        "grotesque","grubby","grumpy","handsome","happy","hard","harsh","healthy","heavy","helpful","helpless","high",
        "hilarious","hissing","hollow","homeless","homely","horrible","hungry","icy","ill","immense","important",
        "impossible","inexpensive","innocent","inquisitive","itchy","jealous","jittery","jolly","joyous","juicy","kind",
        "large","late","lazy","light","little","lively","lonely","long","loose","loud","lovely","low","lucky",
        "magnificent","mammoth","many","massive","melodic","melted","miniature","misty","moaning","modern","motionless",
        "muddy","mushy","mute","mysterious","narrow","nasty","naughty","nervous","nice","noisy","numerous","nutritious",
        "nutty","obedient","obnoxious","odd","old","open","outrageous","outstanding","panicky","perfect","petite",
        "plain","plastic","pleasant","poised","poor","powerful","precious","prickly","proud","puny","purring","puzzled",
        "quaint","quick","quiet","rainy","rapid","raspy","real","relieved","repulsive","resonant","rich","ripe",
        "rotten","rough","round","salty","scary","scattered","scrawny","screeching","selfish","shaggy","shaky",
        "shallow","sharp","shiny","shivering","short","shrill","shy", "silent","silky","silly","skinny","sleepy",
        "slimy","slippery","slow","small","smiling","smooth","soft","solid","sore","sour","sparkling","spicy",
        "splendid","square","squealing","stale","steady","steep","stormy","straight","strange","strong","stupid",
        "substantial","successful","super","sweet","swift","talented","tall","tame","tense","terrible","thankful",
        "thirsty","thoughtful","thoughtless","thundering","tiny","tired","tough","troubled","uneven","uninterested",
        "unusual","victorious","vivacious","wandering","weak","weary","whispering","wicked","wild","witty","wonderful",
        "worried","young","yummy","zany","zealous"
    ];

    // Nouns and Adjectives
    var attributes = [
        "desert", "tundra", "mountain", "space", "field", "urban", "tropical",
        "hidden", "covert", "uncanny", "scheming", "decisive",
        "rowdy", "dangerous", "explosive", "threatening", "warring",
        "bad", "unnecessary", "unknown", "unexpected", "waning", "atomic", "electric",
        "amber", "bone", "coral", "ivory", "jet", "nacre", "pearl", "obsidian", "glass",
        "agate", "beryl", "diamond", "opal", "ruby", "onyx", "sapphire", "emerald", "jade",
        "red", "orange", "yellow", "green", "blue", "violet", "gold", "silver"
    ];

    // Nouns
    var objects = [
        // Animals
        "panther", "wildcat", "tiger", "lion", "cheetah", "cougar", "leopard",
        "viper", "cottonmouth", "python", "boa", "sidewinder", "cobra", "boar", "wolf",
        "grizzly", "jackal", "falcon", "squirrel", "rabbit", "parrot", "dove", "wasp", "butterfly", "beaver",
        "wildabeast", "gazelle", "zebra", "elk", "moose", "deer", "stag", "pony", "bison",
        "horse", "stallion", "foal", "colt", "mare", "yearling", "filly", "gelding",
        "octopus", "lobster", "crab", "barnacle", "hammerhead", "orca", "piranha", "penguin",
        // Occupations
        "nomad", "wizard", "cleric", "pilot", "hermit",
        // Technology
        "mainframe", "device", "motherboard", "network", "transistor", "packet", "robot", "android", "cyborg",
        // Weather
        "storm", "thunder", "lightning", "rain", "hail", "sun", "drought", "snow",
        // Other
        "warning", "presence", "weapon"
    ];

    // Roughly 15,803,060 possible combinations.
    // n = adjectives.length + attributes.length + objects.length # Total number of choices
    // c = 3 # number of choices for the set
    // combinations = (n!)/(c! * (n - c)!)

    function createCodename()
    {
        var a = adjectives[Math.floor(Math.random() * adjectives.length)];
        var f = attributes[Math.floor(Math.random() * attributes.length)];
        var l = objects[Math.floor(Math.random() * objects.length)];
        return a + "-" + f + "-" + l;
    }

    return {
        generate: createCodename
    };
}]);

imageShareModule.factory('SessionStorage', ['$window', function($window) {
    var
        /** The key used to retrieve and set data from the local storage object. */
        storageKey = "chockly-ps",
        data,
        storage = $window.sessionStorage;

    function clear(key) {
        if (!key) {
            storage.removeItem(storageKey);
            data = null;
        } else {
            retrieve();
            if (!data) {
                // Do nothing if there is no data
                return;
            }
            delete data[key];
            persist();
        }
    }

    function get(key, defaultValue, forceRefresh) {
        retrieve(forceRefresh);
        if (!key) {
            return data;
        } else if (!data || !data[key]) {
            return defaultValue;
        } else {
            return data[key];
        }
    }

    function persist() {
        storage.setItem(storageKey, angular.toJson(data));
    }

    function retrieve(forceRefresh) {
        if (!data || forceRefresh) {
            data = JSON.parse(storage.getItem(storageKey));
            if (!data) {
                data = {};
            }
        }
    }

    function set(key, value) {
        retrieve();
        data[key] = value;
        persist();
    }

    return {
        /**
         * Clears a value from session storage.
         * @param {string} key Optional, deletes the key and it's value from local
         */
        clear: clear,

        /**
         * Gets a piece of data from session storage.
         * @param {string} key The key for the data. If not provided then this returns
         * all stored data.
         * @param {mixed} defaultValue The value to return if the key has no value.
         * @param {boolean} forceRefresh Force the data to be reloaded from the data store.
         * @returns {mixed}
         */
        get: get,

        /**
         * Sets a value to session storage.
         * @param {string} key The key for the value.
         * @param {mixed} value The data to store.
         */
        set: set
    };
}]);

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
        socketWrapper.on('connect', function() {
            $log.debug('WebSocket connected. Id:', socket.id);
            socketWrapper.id = socket.id;
        });
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

imageShareModule.directive('shareLink', ['$location', function($location) {
    return {
        restrict: 'A',
        template: '<a href="{{link}}" target="_blank">{{link}}</a>',
        link: function(scope, element, attrs) {
            var urlBase = attrs.shareLink;
            var currentUrl = $location.absUrl();
            scope.link = currentUrl.substring(0, currentUrl.indexOf('#')) + urlBase;
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

imageShareModule.controller('DisplayController', ['$log', '$rootScope', '$routeParams', '$window', 'io', function($log, $rootScope, $routeParams, $window, io) {
    var vm = this;
    var socket = io('/');

    vm.pageHeight = $window.innerHeight + 'px';
    vm.bgColor = '#030303';

    // Socket events
    socket.on('connect', function() {
        socket.emit('join', $routeParams.managerId);
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

imageShareModule.controller('ManageController', ['$log', 'io', 'CodeName', 'SessionStorage', function($log, io, CodeName, SessionStorage) {
    var vm = this;
    var socket = io('/');

    // Get the current images, or the defaults if there are none
    vm.current = SessionStorage.get('currentImg', {
        image: '',
        background: '',
        bgColor: '#030303'
    });
    console.log(vm.current);

    // Get or generate a manager ID
    vm.managerId = SessionStorage.get('managerId');
    if (!vm.managerId) {
        generateManagerId();
    }

    vm.newRoom = function() {
        socket.emit('leave', vm.managerId);
        generateManagerId();
        socket.emit('join', vm.managerId);
    };

    // Image handling
    vm.addImage = function() {
        if (vm.imageUrl) {
            socket.emit('app.addImage', vm.imageUrl);
            vm.imageUrl = '';
        }
    };
    vm.clearImage = function() {
        changeImage();
    };
    vm.clearBackgroundImage = function() {
        changeBgImage();
    };
    vm.getImages = getImages;
    vm.selectImage = changeImage;
    vm.selectBackgroundImage = changeBgImage;
    vm.setBgColor = changeBgColor;

    // Socket events
    socket.on('connect', function() {
        socket.emit('join', vm.managerId);
    });
    socket.on('app.images', function(images) {
        $log.debug('List of images received from server:', images);
        vm.images = images;
    });
    socket.on('join', function(joinedBy) {
        if (joinedBy.id !== socket.id) {
            // Someone joined that isn't us, send the current image and background
            changeImage(vm.current.image);
            changeBgImage(vm.current.background);
            changeBgColor(vm.current.color);
        }
    });

    // Initialize by getting the images
    getImages();

    // Functions
    function getImages() {
        socket.emit('app.getImages');
    }

    function changeImage(image) {
        var img = image ? image.src : '';
        vm.current.image = image || '';
        socket.emit('app.changeImage', img);
        saveCurrent();
    }
    function changeBgImage(image) {
        var img = image ? image.src : '';
        vm.current.background = image || '';
        socket.emit('app.changeBgImage', img);
        saveCurrent();
    }
    function changeBgColor(color) {
        var bg = color ? color : '#030303';
        vm.current.bgColor = bg;
        socket.emit('app.changeBgColor', bg);
        saveCurrent();
    }

    function saveCurrent() {
        SessionStorage.set('currentImg', vm.current);
    }

    function generateManagerId() {
        vm.managerId = CodeName.generate();
        SessionStorage.set('managerId', vm.managerId);
    }
}]);

imageShareModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/display/:managerId', {
            templateUrl: 'DisplayTemplate.html',
            controller: 'DisplayController',
            controllerAs: 'vm'
        })
        .when('/', {
            templateUrl: 'ManageTemplate.html',
            controller: 'ManageController',
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
