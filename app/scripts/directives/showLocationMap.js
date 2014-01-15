'use strict';

angular.module('CACMobile')
  .directive('showLocationMap', function () {
    return {
      template: '<div></div>',
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
         var myLatLng = new google.maps.LatLng(scope.location.latitude,scope.location.longitude);
         var mapOptions = {zoom: 13, streetViewControl: false, zoomControl: true, center: myLatLng, mapTypeId: google.maps.MapTypeId.TERRAIN};
         var map = new google.maps.Map(element[0], mapOptions);

        //This loads the google map 'Terms of Use' link in an external window
        $(element[0]).on('click', 'a', function(e){
          e.preventDefault();
          window.open($(this).attr('href'),'_system','location=no');
        });

         console.log(map)
         var marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            title:"Observation Location"
         });
      }
    };
  });