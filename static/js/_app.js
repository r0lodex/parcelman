var parcelMan = angular.module('parcelMan', [
    'ngRoute',
    'ngResource',
]);

// APP ROUTING
// Bahagian ini menentukan URL apa yang boleh diakses
// oleh pengguna.
// ==================================================

parcelMan.config(function($routeProvider) {
    $routeProvider.when('/', {
        controller: 'mainController',
        templateUrl: 'static/templates/main.html',
    });
})

// ==================================================


// FACTORIES
// Factory adalah tempat dimana resource data diambil
// menggunakan API Endpoint yang disediakan oleh
// server. Melalui cara ini, data yang diambil lebih
// tersusun
// ==================================================

// Login Factory
    parcelMan.factory('Auth', function($resource) {
        return $resource('server/api/login', {}, {
            login: { method: 'POST', isArray: false }
        })
    })

// Parcel Factory
    parcelMan.factory('Parcel', function($resource) {
        return $resource('server/api/parcel/:args_a/:args_b', { args_a: '@args_a', args_b: '@args_b' }, {
            list: { method: 'GET', isArray: true },
            add: { method: 'POST', isArray: false },
            update: { method: 'PUT', isArray: false },
            claim: { method: 'DELETE', isArray: false }
        })
    })

// ==================================================



// APP SETTINGS
// ==================================================
// ==================================================