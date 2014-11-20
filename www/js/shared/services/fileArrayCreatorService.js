angular.module('acMobile.services')
    .service('fileArrayCreator', function($cordovaFile, $q) {
    this.processImage = function(imagePath) {
        return $cordovaFile.readFileMetadataAbsolute(imagePath)
            .then(createBlob);
        };

    function createBlob(file) {
        var deferred = $q.defer();
        var reader = new FileReader();
        reader.onloadend = readSuccess(deferred, file);
        reader.onerror = readError(deferred);
        reader.readAsArrayBuffer(file);
        return deferred.promise;
    }

    function readSuccess(deferred, file) {
        console.log(file);
        return function(event) {
            var newBlob = new Blob([event.target.result], {
                "type": file.type
            });
            deferred.resolve(newBlob);
        };
    }

    function readError(deferred) {
        return function(error) {
            deferred.reject(error);
        };
    }
});
