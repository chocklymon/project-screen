/**
 * Handles Images
 */
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var thumb = require('node-thumbnail').thumb;
var forEach = require('lodash/forEach');

var IMAGES_DIR = __dirname + '/../public/images';
var THUMBS_DIR = __dirname + '/../public/thumbs';
var imagesFileName = __dirname + '/../linkedImages.json';

function getExtension(file) {
    var lastDot = file.lastIndexOf('.');
    if (lastDot > 0) {
        return file.substring(lastDot);
    }
    return null;
}

function removeExtension(file) {
    var lastDot = file.lastIndexOf('.');
    if (lastDot > 0) {
        return file.substring(0, lastDot);
    }
    return file;
}

function getImagesInDir(dir) {
    function validExtension(file) {
        switch (getExtension(file)) {
            case '.jpg':
            case '.jpeg':
            case '.png':
                return true;
        }
        return false;
    }

    return fs.readdirAsync(dir)
        .then(function(files) {
            var filteredFiles = [];
            for (var i = 0; i < files.length; i++) {
                // Ignore files that start with a dot, or that don't have a valid extension.
                if (files[i][0] != '.' && validExtension(files[i])) {
                    filteredFiles.push(files[i]);
                }
            }
            return filteredFiles.sort();
        });
}

function getImagesDirectoryList() {
    return Promise.all([
            getImagesInDir(IMAGES_DIR),
            getImagesInDir(THUMBS_DIR)
        ])
        .then(function(directorylists) {
            // Handle the list of files we just read
            var images = directorylists[0];
            var thumbs = directorylists[1];
            var imageThumbs = {};
            var thumbsQueue = [];
            var i, l;

            // Add a thumbnails to an object with information about the thumbnail
            for (i = 0, l = thumbs.length; i < l; i++) {
                imageThumbs[thumbs[i]] = {
                    hasImage: false
                };
            }

            // Go through each image and check if it has a thumbnail and adjust the image's path
            for (i = 0, l = images.length; i < l; i++) {
                if (imageThumbs[images[i]]) {
                    // The image has a thumbnail
                    imageThumbs[images[i]].hasImage = true;
                } else {
                    // Need to generate a thumbnail
                    thumbsQueue.push(
                        thumb({
                            source: IMAGES_DIR + '/' + images[i],
                            destination: THUMBS_DIR,
                            suffix: '',
                            width: 200
                        })
                    );
                }
            }

            // Find any thumbnails that don't have images
            forEach(imageThumbs, function(info, thumb) {
                if (!info.hasImage) {
                    // Thumbnail has no image, remove it
                    fs.unlinkAsync(THUMBS_DIR + '/' + thumb)
                        .catch(function(err) {
                            console.warn('Failed to delete file:', thumb, 'Error:', err);
                        });
                }
            });

            // Return the list of images once the thumbnail generation has completed.
            return Promise.all(thumbsQueue)
                .then(function() {
                    return images;
                })
                .catch(function(err) {
                    console.warn('Thumbnail Generation Error:', err);
                    return images;
                });
        });
}

var ImagesService = {

    getImages: function getImages() {
        return getImagesDirectoryList()
            .then(function(imagesList) {
                return ImagesService.readImagesFile()
                    .then(function(imagesFile) {
                        // Convert the list of images in the public/images directory into image objects
                        var images = [];
                        forEach(imagesList, function(img) {
                            images.push({
                                src: 'images/' + img,
                                thumb: 'thumbs/' + img
                            });
                        });
                        forEach(imagesFile, function(img) {
                            images.push({
                                src: img,
                                thumb: img
                            });
                        });
                        return images;
                    });
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
        return fs.writeFileAsync(imagesFileName, JSON.stringify(fileContents, null, 2), 'UTF-8');
    },

    addToImagesFile: function addToImagesFile(addMe) {
        // Get the current images list
        return ImagesService.readImagesFile()
            .then(function(file) {
                // Add the URL
                for (var i = 0; i < file.length; i++) {
                    if (file[i] == addMe) {
                        return Promise.reject('Image already added');
                    }
                }
                file.push(addMe);

                // Save back to disk
                return ImagesService.writeImagesFile(file);
            });
    }
};

module.exports = ImagesService;
