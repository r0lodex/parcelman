'use strict';

var parcelMan = angular.module('parcelMan', [
    'ngRoute',         // Routing Module
    'ngResource',      // API Resource Module
    'ui-notification', // Notification Popup Module
    'ui.bootstrap',    // Bootstrap Helpers
    'angularMoment'    // Time display
]);

// ==================================================
// APP ROUTING
// ==================================================
// Bahagian ini menentukan URL apa yang boleh diakses
// oleh pengguna.
// Contoh URL: localhost/parcelman/#/parcel

    parcelMan.config(function($routeProvider) {
        $routeProvider.when('/', {
            controller: 'mainController',
            templateUrl: 'static/templates/main.html',
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
            add: { method: 'POST', isArray: false },
            update: { method: 'PUT', isArray: false },
            claim: { method: 'DELETE', isArray: false }
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

        // Notification Settings — Ubah mengikut
        // citarasa anda. Uncomment yang mana suka.
        // Ref: https://github.com/alexcrack/angular-ui-notification
        NotificationProvider.setOptions({
            // delay: 10000,
            // startTop: 20,
            // startRight: 10,
            // verticalSpacing: 20,
            // horizontalSpacing: 20,
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
                config.headers['x-parcelman-uid'] = (sessionStorage.authenticated) ? sessionStorage.uid : 'anon';
                config.headers['x-parcelman-token'] = (sessionStorage.authenticated) ? sessionStorage.token : 'no-token';
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
            Notification.error({ message: response.data.msg })
        };
    })