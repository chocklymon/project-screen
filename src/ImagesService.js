
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

var imagesFileName = __dirname + '/../linkedImages.json';

var ImagesService = {

    getImages: function getImages() {
        return ImagesService.listImageFiles()
            .then(function(images) {
                return ImagesService.readImagesFile()
                    .then(function(imagesFile) {
                        // Combine the two arrays
                        images.push.apply(images, imagesFile);
                        return images;
                    });
            });
    },

    listImageFiles: function listImageFile() {
        return fs.readdirAsync(__dirname + '/../public/images')
            .then(function(items) {
                var images = [];
                for (var i = 0; i < items.length; i++) {
                    // Ignore items that start with a dot
                    if (items[i][0] != '.') {
                        images.push('images/' + items[i]);
                    }
                }
                return images;
            });
    },

    readImagesFile: function readImagesFile() {
        return fs.readFileAsync(imagesFileName, 'UTF-8')
            .then(function(file) {
                return JSON.parse(file);
            })
            .catch(function(err) {
                if (err.code == "ENOENT") {
                    return [];
                } else {
                    return Promise.reject(err);
                }
            });
    },

    writeImagesFile: function writeImagesFile(fileContents) {
        return fs.writeFileAsync(imagesFileName, JSON.stringify(fileContents), 'UTF-8');
    },

    addToImagesFile: function addToImagesFile(addMe) {
        // Get the current images list
        return ImagesService.readImagesFile()
            .then(function(file) {
                // Add the URL
                file.push(addMe);

                // Save back to disk
                return ImagesService.writeImagesFile(file);
            });
    }
};

module.exports = ImagesService;
