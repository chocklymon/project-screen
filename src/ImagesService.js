/**
 * Handles Images
 */
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var thumb = require('node-thumbnail').thumb;
var forEach = require('lodash/forEach');

var IMAGES_DIR = __dirname + '/../public/images';
var THUMBS_DIR = __dirname + '/../public/thumbs';
var IMAGES_FILE = __dirname + '/../linkedImages.json';
var FILE_VERSION = 3;

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
    // TODO add caching?
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

function fileName(text) {
    var loc = text.lastIndexOf('/');
    if (loc >= 0) {
        text = text.substring(loc + 1);
    }
    if ((loc = text.lastIndexOf('.')) > 0) {
        text = text.substring(0, loc);
    }
    return text;
}

function createImagesData(directoryList, data) {
    // Convert the list of images in the public/images directory into image objects
    var images = {};
    var updateData = false;
    var imageObj;
    forEach(directoryList, function(img) {
        imageObj = {
            src: 'images/' + img,
            thumb: 'thumbs/' + img,
            external: false
        };
        if (data[img]) {
            // Existing image
            imageObj.name = data[img].name;
            imageObj.tags = data[img].tags;
            data[img].touched = true;
        } else {
            // New image
            updateData = true;
            imageObj.name = fileName(img);
            imageObj.tags = [];
        }
        images[img] = imageObj;
    });

    // Add linked images data, and cleanup old image data
    forEach(data, function(img, id) {
        if (img.src) {
            images[id] = img;
        } else if (!img.external && !img.touched) {
            // Existing image removed
            updateData = true;
            delete data[id];
        }
    });

    if (updateData) {
        // The data has been modified, save back to disk
        var file = {
            '__version': FILE_VERSION, // Since this function is called after the migration it will be the latest version
            'images': images
        };
        return writeImagesFile(file)
            .then(function() {
                return images;
            });
    }

    return Promise.resolve(images);
}



function migrateFile(file, persistIfMigrated) {
    var migrated = false;
    if (Array.isArray(file) || file['__version'] < 2) {
        // Convert to version 2
        var newFile = {
            '__version': 2,
            'images': {}
        };
        forEach(file, function(imgSrc) {
            newFile.images[imgSrc] = {
                src: imgSrc,
                thumb: imgSrc,
                name: fileName(imgSrc),
                tags: []
            };
        });
        file = newFile;
        migrated = true;
    }

    if (file['__version'] === 2) {
        // Migrate to version 3
        forEach(file.images, function(img) {
            img.external = true;
        });
        file['__version'] = 3;
        migrated = true;
    }

    if (migrated && persistIfMigrated) {
        console.log('File migration performed, saving...');
        return writeImagesFile(file)
            .then(function() {
                return file;
            });
    }
    return Promise.resolve(file);
}

function readImagesData() {
    // TODO provide caching?
    return fs.readFileAsync(IMAGES_FILE, 'UTF-8')
        .then(function(contents) {
            var file = JSON.parse(contents);
            return migrateFile(file, true);
        })
        .catch(function(err) {
            if (err.code == "ENOENT") {
                return {
                    '__version': FILE_VERSION,
                    'images': {}
                };
            } else {
                return Promise.reject(err);
            }
        });
}

function writeImagesFile(fileContents) {
    fileContents.__lastModified = new Date();
    return fs.writeFileAsync(IMAGES_FILE, JSON.stringify(fileContents, null, 2), 'UTF-8');
}

function getImages() {
    return getImagesDirectoryList()
        .then(function(imagesList) {
            return readImagesData()
                .then(function(imagesFile) {
                    return createImagesData(imagesList, imagesFile.images);
                });
        });
}

var ImagesService = {

    getImages: getImages,

    readImagesFile: readImagesData,

    writeImagesFile: function (fileContents) {
        fileContents = migrateFile(fileContents, false);
        return writeImagesFile(fileContents);
    },

    addImageByUrl: function addImageByUrl(url) {
        // Get the current images list
        return readImagesData()
            .then(function(file) {
                // Add the URL
                file.images[url] = {
                    src: url,
                    thumb: url,
                    name: fileName(url),
                    tags: [],
                    external: true
                };

                // Save back to disk
                return ImagesService.writeImagesFile(file);
            });
    }
};

module.exports = ImagesService;
