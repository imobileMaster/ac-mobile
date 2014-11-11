angular.module('acMobile.controllers')
    .filter('trimLocation', function() {
        return function(string, maxlength) {
            return string.substr(0, maxlength);
        };
    })
    .controller('QuickReportCtrl', function($scope, $timeout, $ionicPlatform, $ionicActionSheet, $ionicModal, $cordovaGeolocation, $cordovaCamera, MAPBOX_ACCESS_TOKEN, MAPBOX_MAP_ID) {
        //Cordova setup
        var Camera = navigator.camera;

        $scope.tempLocation = {
            lat: "",
            lng: ""
        };
        var map;
        var marker;
        var popup;

        $scope.report = {
            title: "",
            date: "",
            time: "",
            location: {
                lat: "",
                lng: ""
            },
            images: [],
            ridingInfo: "",
            avalancheCondtions: {
                'slab': false,
                'sound': false,
                'snow': false,
                'temp': false
            },
            comments: ""
        };

        $scope.checkData = function() {
            console.log($scope.report);
        };

        $scope.showLocationSheet = function() {
            var hideSheet = $ionicActionSheet.show({
                buttons: [{
                    text: "Use my location"
                }, {
                    text: "Pick position on map"
                }],
                titleText: "Report Location",
                cancelText: "Cancel",
                buttonClicked: function(index) {
                    if (index === 0) {
                        getLocation()
                            .then(function() {
                                    hideSheet();
                                },
                                function(error) {
                                    //TODO remove alerts
                                    alert("There was an error getting your location");
                                });
                    } else if (index === 1) {
                        hideSheet();
                        $scope.showLocationModal();
                    }
                }
            });
        };

        function getLocation() {
            return $ionicPlatform.ready()
                .then($cordovaGeolocation.getCurrentPosition)
                .then(function(position) {
                    $scope.report.location.lat = position.coords.latitude;
                    $scope.report.location.lng = position.coords.longitude;
                })
                .catch(function(error) {
                    console.error("GeoLocation Error" + error);
                    return $q.reject(error);
                });
        }

        $ionicModal.fromTemplateUrl('templates/location-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.locationModal = modal;
        });

        $scope.showLocationModal = function() {
            $scope.locationModal.show()
                .then(function() {
                    if (!map) {
                        L.mapbox.accessToken = MAPBOX_ACCESS_TOKEN;
                        map = L.mapbox.map('map', MAPBOX_MAP_ID, {
                            attributionControl: false
                        });
                        map.on('click', onMapClick);
                    }
                });
        };

        function onMapClick(e) {
            if (!marker) {
                $scope.$apply(function() {
                    $scope.tempLocation.lat = e.latlng.lat;
                    $scope.tempLocation.lng = e.latlng.lng;
                });
                var latlng = new L.LatLng(e.latlng.lat, e.latlng.lng);

                marker = L.marker(latlng, {
                    icon: L.mapbox.marker.icon({
                        'marker-color': 'f79118'
                    }),
                    draggable: true
                });

                marker
                    .bindPopup("Position: " + e.latlng.toString().substr(6))
                    .addTo(map)
                    .openPopup();

                marker.on('dragend', function(e) {
                    var position = marker.getLatLng();
                    $scope.$apply(function() {
                        $scope.tempLocation.lat = position.lat;
                        $scope.tempLocation.lng = position.lng;
                    });
                    marker.setPopupContent("Position: " + position.toString().substr(6));
                    marker.openPopup();
                });
            }
        }
        $scope.cancelLocationModal = function() {
            $scope.locationModal.hide();
        };

        $scope.confirmLocation = function() {
            if ($scope.tempLocation.lat) {
                $scope.report.location.lat = $scope.tempLocation.lat;
                $scope.report.location.lng = $scope.tempLocation.lng;
                $scope.locationModal.hide();
            } else {
                //TODO remove alerts
                alert("You haven't tapped the map to set the location yet");
            }
            //emit  event to mark a position
        };

        function takePicture(options) {
            return $ionicPlatform.ready()
                .then(function() {
                    return $cordovaCamera.getPicture(options);
                })
                .then(function(imageURI) {
                    console.log("Success Image Capture");
                    console.log(imageURI);
                    $scope.report.images.push(imageURI);
                    console.log($scope.report.images);
                }, function(err) {
                    console.log("camera error: " + err);
                    // An error occured. Show a message to the user
                });
        }

        $scope.showPictureSheet = function() {
            var options = {};
            var hidePictureSheet = $ionicActionSheet.show({
                buttons: [{
                    text: "Take picture"
                }, {
                    text: "Attach existing picture"
                }],
                titleText: "Add a picture",
                cancelText: "Cancel",
                buttonClicked: function(index) {
                    if (index === 0) {
                        console.log("picked 0");
                        hidePictureSheet();
                        options = {
                            quality: 75,
                            destinationType: Camera.DestinationType.FILE_URI,
                            sourceType: Camera.PictureSourceType.CAMERA,
                            allowEdit: false,
                            encodingType: Camera.EncodingType.JPEG,
                            targetWidth: 640,
                            targetHeight: 480,
                            saveToPhotoAlbum: true
                        };
                        takePicture(options);

                    } else if (index === 1) {
                        hidePictureSheet();
                        options = {
                            quality: 75,
                            destinationType: Camera.DestinationType.FILE_URI,
                            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                            allowEdit: true,
                            encodingType: Camera.EncodingType.JPEG,
                            targetWidth: 640,
                            targetHeight: 480,
                            saveToPhotoAlbum: true
                        };
                        takePicture(options);
                    }
                }
            });


        };

        //clean up
        $scope.$on('$destroy', function() {
            $scope.locationModal.remove();
        });

    });
