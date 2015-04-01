angular.module('acMobile.services', ['ngCordova']);
angular.module('acMobile.directives', ['acComponents']);
angular.module('acMobile.controllers', ['acComponents']);
angular.module('acComponents').constant('AC_API_ROOT_URL', 'http://www.avalanche.ca');
angular.module('acMobile', ['ionic', 'ngCordova', 'auth0','angular-storage', 'angular-jwt', 'acMobile.services', 'acMobile.controllers', 'acMobile.directives', 'acComponents'])

    .constant('GA_ID', 'UA-56758486-2')
    //.constant('AC_API_ROOT_URL', 'http://www.avalanche.ca')
    .constant('AC_API_ROOT_URL', 'http://avalanche-canada-qa.elasticbeanstalk.com')
    .constant('MAPBOX_ACCESS_TOKEN', 'pk.eyJ1IjoiYXZhbGFuY2hlY2FuYWRhIiwiYSI6Im52VjFlWW8ifQ.-jbec6Q_pA7uRgvVDkXxsA')
    .constant('MAPBOX_MAP_ID', 'avalanchecanada.k8o347c9')
    .run(function($ionicPlatform) {
        //JPB-AUTH
        //auth.hookEvents();

        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })
    .run(function($rootScope, $timeout, $http, $state, $window, $document, store, jwtHelper, acTerms, $cordovaNetwork, $cordovaGoogleAnalytics, $ionicLoading, $ionicPlatform, $ionicPopup, $templateCache, GA_ID, acUser) {

        $ionicPlatform.ready().then(function() {
            $ionicPlatform.registerBackButtonAction(function() {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Exit Avalanche Canada?',
                    template: '',
                    cancelType: "button-outline button-energized",
                    okType: "button-energized"
                });
                confirmPopup.then(function(res) {
                    if (res) {
                        navigator.app.exitApp();
                    } else {

                    }
                });
            }, 100);


            if ($window.analytics) {
                $cordovaGoogleAnalytics.startTrackerWithId(GA_ID).then(function() {
                    console.log("initialized analytics");
                });
            }

            $ionicPlatform.on('resume', function(e) {
                console.log("app resumed from background");
                if ($state.current.name !== 'app.min') {
                    $state.transitionTo($state.current, $state.current.params, {
                        reload: true,
                        inherit: true,
                        notify: true
                    });
                }
            }, false);
        });

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            if (toState.name != 'app.terms' && !acTerms.termsAccepted()) {
                console.log("Terms not accepted - re-routing to terms");
                event.preventDefault();
                $state.go('app.terms');
            }
        });

        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            event.preventDefault();
            $state.go('app.offline');
        });

        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            var track = toState.name;
            if (toParams.id) {
                track += ":" + toParams.id;
            }
            if ($window.analytics) {
                $cordovaGoogleAnalytics.trackView(track);
            }
        });


        // $timeout(function() {
        //     $http.get('templates/min-report-form.html')
        //         .success(function(result) {
        //             $templateCache.put("min-report-form.html", result);
        //         })
        //         .error(function(error) {
        //             //console.log(error);
        //         });
        // }, 250);
    });
