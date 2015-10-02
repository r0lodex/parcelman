'use strict';

var parcelMan = angular.module('parcelMan', [
    'ngRoute',         // Routing Module
    'ngResource',      // API Resource Module
    'ui-notification', // Notification Popup Module
    'ui.bootstrap',    // Bootstrap Helpers
    'angularMoment',   // Time display
    'chart.js'         // Chart JS
]);

// ==================================================
// APP ROUTING
// ==================================================
// Bahagian ini menentukan URL apa yang boleh diakses
// oleh pengguna.
// Contoh URL: localhost/parcelman/#/parcel

    parcelMan.config(function($routeProvider) {
        // View untuk admin
        $routeProvider.when('/', {
            controller: 'landingCtrl',
            templateUrl: 'templates/landing.html',
        });
        // View untuk students
        $routeProvider.when('/search/:query?', {
            controller: 'searchCtrl',
            templateUrl: 'templates/search.html',
        });
        // View untuk report
        $routeProvider.when('/dashboard', {
            controller: 'dashboardCtrl',
            templateUrl: 'templates/dashboard.html',
        });
        $routeProvider.otherwise({ redirectTo: '/' });
    });

// ==================================================
// FACTORIES
// ==================================================
// Factory adalah tempat dimana resource data diambil
// menggunakan API Endpoint yang disediakan oleh
// server. Melalui cara ini, data yang diambil lebih
// tersusun

    // Login Factory
    parcelMan.factory('Auth', function($resource) {
        return $resource('server/api/login', {}, {
            login: { method: 'POST', isArray: false }
        })
    });

    // Parcel Factory
    parcelMan.factory('Parcel', function($resource) {
        return $resource('server/api/parcel/:arg_a/:arg_b', { arg_a: '@arg_a', arg_b: '@arg_b' }, {
            list: { method: 'GET', isArray: true },
            show: { method: 'GET', isArray: false },
            add: { method: 'POST', isArray: false },
            claim: { method: 'PUT', isArray: false },
            delete: { method: 'DELETE' }
        })
    });


// ==================================================
// APP SETTINGS
// ==================================================
// Bahagian ini adalah untuk menentukan bagaimana
// setiap HTTP Request itu dibuat dan cara untuk
// mengesahkan id pengguna.

    // Time processing settings (Using UNIX Timestamp)
    parcelMan.constant('angularMomentConfig', { preprocess: 'unix' });

    parcelMan.config(function($httpProvider, NotificationProvider) {
        // Pushing AuthData to every HTTP Request
        $httpProvider.interceptors.push('authinjector');

        // Notification Settings
        // Ref: https://github.com/alexcrack/angular-ui-notification
        NotificationProvider.setOptions({
            positionX: 'left',
            positionY: 'bottom',
        })
    });

    // Setting Authentication Data
    // Di sini kita set HTTP Request Header dengan credentials
    // yang telah disahkan oleh server. Perhatikan authinjector.request()
    parcelMan.factory('authinjector', function($q) {
        var authinjector = {
            request: function(config) {
                config.headers['x-parcelman-uid'] = (sessionStorage.token) ? sessionStorage.uid : 'anon';
                config.headers['x-parcelman-token'] = (sessionStorage.token) ? sessionStorage.token : 'no-token';
                return config || $q.when(config);
            },
            response: function(response) {
                return response || $q.when(response);
            },
            responseError: function(response) {
                return $q.reject(response);
            }
        }
        return authinjector;
    });

    // Error Handler Service
    parcelMan.service('ERRORS', function(Notification) {
        return function(response) {
            if (response.status == 400) {
                Notification.error({ message: response.data })
            } else if (response.status != 404) {
                Notification.error({ message: response.data.msg })
            }
        };
    })