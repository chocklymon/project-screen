/* globals angular:false */
'use strict';

var imageShareModule = angular.module('imageShare', ['ngAnimate', 'ngRoute', 'ui.bootstrap']);

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

imageShareModule.factory('levenshtein', [function() {
    // START Licensed Code
    // Modified from https://gist.github.com/andrei-m/982927#gistcomment-1888863
    /*
     Copyright (c) 2011 Andrei Mackenzie & Milot Mirdita
     Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
     The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
     */
    return function(a, b) {
        if (a.length === 0) {
            return b.length;
        }
        if (b.length === 0) {
            return a.length;
        }
        var tmp, i, j, prev, val, row;
        // swap to save some memory O(min(a,b)) instead of O(a)
        if (a.length > b.length) {
            tmp = a;
            a = b;
            b = tmp;
        }

        row = new Array(a.length + 1);
        // init the row
        for (i = 0; i <= a.length; i++) {
            row[i] = i
        }

        // fill in the rest
        for (i = 1; i <= b.length; i++) {
            prev = i;
            for (j = 1; j <= a.length; j++) {
                if (b[i - 1] === a[j - 1]) {
                    val = row[j - 1]; // match
                } else {
                    val = Math.min(
                        row[j - 1] + 1, // substitution
                        Math.min(
                            prev + 1,   // insertion
                            row[j] + 1  // deletion
                        )
                    );
                }
                row[j - 1] = prev;
                prev = val;
            }
            row[a.length] = prev;
        }
        return row[a.length];
    }
    // END Licensed Code
}]);

imageShareModule.factory('Images', ['$log', 'rootSocket', function($log, rootSocket) {
    // - Global Variables -
    var refreshTags = true,
        tags = {},
        images = [],
        socket = null,
        listeners = [];

    // - Utility Functions -
    function getSocket() {
        if (socket === null) {
            // Initialize the socket an listen for incoming images
            socket = rootSocket.get();

            socket.on('app.images', function (imgs) {
                $log.debug('List of images received from server:', imgs);
                refreshTags = true;
                images = imgs;

                angular.forEach(listeners, function (cb) {
                    cb(images);
                });
            });
        }
        return socket;
    }

    function getTags() {
        if (refreshTags) {
            tags = {};
            var i, l, tag;
            angular.forEach(images, function (img, id) {
                for (i = 0, l = img.tags.length; i < l; i++) {
                    tag = img.tags[i];
                    if (tag in tags) {
                        tags[tag].count++;
                    } else {
                        tags[tag] = {count: 1, images: {}};
                    }
                    tags[tag].images[id] = img;
                }
            });
            refreshTags = false;
        }
        return tags;
    }

    // - Image IO -
    function addImage(url) {
        if (url) {
            getSocket().emit('app.addImage', url);
        }
    }

    function updateImage(image) {
        getSocket().emit('app.patchImage', image);
    }

    function getImages() {
        getSocket().emit('app.getImages');
    }

    function registerOnChangeListener(func) {
        listeners.push(func);
    }

    return {
        add: addImage,
        update: updateImage,
        getTags: getTags,
        onChange: registerOnChangeListener,
        triggerGetImages: getImages
    };
}]);

imageShareModule.filter('image', ['levenshtein', 'Images', function(levenshtein, Images) {
    function myExtend(src) {
        var destinations = Array.prototype.slice.call(arguments, 1);
        angular.forEach(destinations, function(dst) {
            angular.forEach(dst, function(value, index) {
                if (!(index in src)) {
                    src[index] = value;
                }
            });
        });
        return src;
    }

    function search(needle, imagesHaystack) {
        if (!needle) {
            // Blank search term
            return imagesHaystack;
        }
        var searchFor = needle.toLowerCase();
        var distance, closestDistance = 3; // Start with a levenshtein distance of 3
        var substringMatches = {};
        var tagMatches = {};
        var nearMatches = {};
        angular.forEach(imagesHaystack, function (img, id) {
            // Search for substring matches, near matches, and tag matches
            var lowerCaseName = img.name.toLowerCase();
            if (lowerCaseName.indexOf(searchFor) >= 0) {
                // Exact substring
                substringMatches[id] = img;
            } else if (lowerCaseName.length - searchFor.length <= closestDistance) {
                // Check the edit distance
                // Since levenshtein runs in O(nm) only run when the edit distance can be less than the closest distance
                distance = levenshtein(searchFor, lowerCaseName);
                if (distance <= closestDistance) {
                    // Found a close edit
                    if (distance < closestDistance) {
                        // Closer, remove further away matches
                        closestDistance = distance;
                        nearMatches = {};
                    }
                    nearMatches[id] = img;
                }
            }
            if (_.sortedIndexOf(img.tags, searchFor) !== -1) {
                // Tag match
                tagMatches[id] = img;
            }
        });
        return myExtend(substringMatches, tagMatches, nearMatches);
    }

    function getTagMatches(tag) {
        var t = Images.getTags();
        if (tag in t) {
            return t[tag].images;
        } else {
            return {};
        }
    }

    function imageFilter(input, needle, tag) {
        if (tag) {
            input = getTagMatches(tag.toLowerCase());
        }
        return search(needle, input);
    }

    return imageFilter;
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

imageShareModule.factory('rootSocket', ['io', function(io) {
    var rootSocket = false;
    function getRootSocket() {
        if (rootSocket === false) {
            rootSocket = io('/');
        }
        return rootSocket
    }
    return {
        get: getRootSocket
    }
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

imageShareModule.controller('DisplayController', ['$log', '$rootScope', '$routeParams', '$window', 'rootSocket', function($log, $rootScope, $routeParams, $window, rootSocket) {
    var vm = this;
    var socket = rootSocket.get();

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

imageShareModule.controller('ManageController', [
    '$log', '$uibModal', 'rootSocket', 'CodeName', 'Images', 'SessionStorage',
    function(
        $log, $uibModal, rootSocket, CodeName, Images, SessionStorage
    ) {
    var vm = this;
    var socket = rootSocket.get();

    // Get the current images, or the defaults if there are none
    vm.current = SessionStorage.get('currentImg', {
        image: '',
        background: '',
        bgColor: '#030303'
    });

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
            Images.add(vm.imageUrl);
            vm.imageUrl = '';
        }
    };
    vm.clearImage = function() {
        changeImage('');
    };
    vm.clearBackgroundImage = function() {
        changeBgImage('');
    };
    vm.editImage = function(id, image) {
        var modal = $uibModal.open({
            templateUrl: 'EditImageTemplate.html',
            controller: 'EditImageController',
            controllerAs: 'vm',
            resolve: {
                image: function() {
                    return {
                        id: id,
                        name: image.name,
                        src: image.src,
                        tags: image.tags
                    };
                }
            }
        });

        modal.result
            .then(function(img) {
                $log.debug('Saving image', img);
                Images.update(img);
            })
            .catch(function(e) {
                $log.debug('Modal closed. Reason:', e);
            });
    };
    vm.getImages = getImages;
    vm.selectImage = function(id) {
        changeImage(id, true);
    };
    vm.selectBackgroundImage = function(id) {
        changeBgImage(id, true);
    };
    vm.setBgColor = changeBgColor;

    // Socket events
    socket.on('connect', function() {
        socket.emit('join', vm.managerId);
    });
    socket.on('app.patchImage', function(r) {
        $log.log('Image patched', r);
        // TODO display save

        // Refresh the images
        getImages();
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
    Images.onChange(function(images) {
        vm.images = images;
        vm.tags = getTags();
    });
    getImages();

    // Functions
    function getImages() {
        Images.triggerGetImages();
    }

    function getTags() {
        var tags = [],
            rawTags = Images.getTags();
        angular.forEach(rawTags, function(info, tag) {
            tags.push({
                tag: tag,
                count: info.count
            });
        });
        return tags;
    }

    function changeImage(id, toggleOffAllowed) {
        if (toggleOffAllowed && id === vm.current.image) {
            // Same id selected as before, toggle off
            id = '';
        }

        var imgSrc = (vm.images[id]) ? vm.images[id].src : '';
        vm.current.image = id;
        socket.emit('app.changeImage', imgSrc);
        saveCurrent();
    }
    function changeBgImage(id, toggleOffAllowed) {
        if (toggleOffAllowed && id === vm.current.background) {
            // Same id selected as before, toggle off
            id = '';
        }

        var imgSrc = (vm.images[id]) ? vm.images[id].src : '';
        vm.current.background = id;
        socket.emit('app.changeBgImage', imgSrc);
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

imageShareModule.controller('EditImageController', ['$log', '$uibModalInstance', 'image', function($log, $uibModalInstance, image) {
    var vm = this;

    vm.ifEnter = function($event, call) {
        if ($event.keyCode === 13) {
            call();
        }
    };
    vm.close = function() {
        $uibModalInstance.dismiss('cancel');
    };
    vm.save = function() {
        if (vm.newTags) {
            // There are tags in the input box, add them
            vm.addTags();
        }
        $uibModalInstance.close(vm.image);
    };
    vm.addTags = function() {
        if (vm.newTags) {
            var newTags = vm.newTags.split(','), i, tag;
            for (i = 0; i < newTags.length; i++) {
                tag = newTags[i].trim();
                if (tag) {
                    vm.image.tags.push(tag.toLowerCase());
                }
            }
            vm.image.tags.sort();

            // Check for and remove duplicates
            for (i = 1; i < vm.image.tags.length; i++) {
                if (vm.image.tags[i - 1] === vm.image.tags[i]) {
                    vm.image.tags.splice(i, 1);
                    i--;
                }
            }

            vm.newTags = '';
        }
    };
    vm.removeTag = function($index) {
        if ($index >= 0 && $index < vm.image.tags.length) {
            vm.image.tags.splice($index, 1);
        }
    };

    vm.image = image;
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
