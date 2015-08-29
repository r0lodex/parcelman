// @codekit-prepend "../../lib/angular/angular.min.js";
// @codekit-prepend "../../lib/angular-resource/angular-resource.min.js";
// @codekit-prepend "../../lib/angular-route/angular-route.min.js";

// @codekit-append "../../lib/jquery/dist/jquery.min.js";
// @codekit-append "../../lib/bootstrap/dist/js/bootstrap.min.js";

var pman = angular.module('pman', ['ngResource', 'ngRoute']);

// SETTINGS ETC
// ========================
pman.factory('sessionInjector', ['$q', '$rootScope', function($q, $rootScope) {
    var numLoadings = 0;
    var sessionInjector = {
        request: function(config) {
            numLoadings++;
            $rootScope.$broadcast('loader_show');
            return config || $q.when(config);
        },
        response: function(response) {
            if ((--numLoadings) == 0) {
                $rootScope.$broadcast('loader_hide');
            };

            return response || $q.when(response);
        },
        responseError: function(response) {
            if ((--numLoadings) == 0) {
                $rootScope.$broadcast('loader_hide');
            };
            return $q.reject(response);
        }
    };
    return sessionInjector;
}]);


pman.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            controller: 'home',
            templateUrl: 'static/templates/home.html'
        })
        .when('/parcel/:id?', {
            controller: 'parcel',
            templateUrl: 'static/templates/parcel.html'
        })
        .when('/users', {
            controller: 'user',
            templateUrl: 'static/templates/user.html'
        })
        .otherwise({
            redirectTo: '/'
        }
    );
}]);

// FACTORIES
// ========================
pman.factory('Auth', ['$resource', function($resource) {
    return $resource('/server/api/login', {}, {
        login: { method: 'POST', isArray: false }
    })
}]);

pman.factory('Users', ['$resource', function($resource) {
    return $resource('/server/api/user/:id', { id: '@id' }, {
        query: { method: 'GET', isArray: true },
        create: { method: 'POST', isArray: false },
        update: { method: 'PUT', isArray: false },
        remove: { method: 'DELETE', isArray: false },
    })
}]);

pman.factory('Parcels', ['$resource', function($resource) {
    return $resource('/server/api/parcel/:id', { id: '@id' }, {
        query: { method: 'GET', isArray: true },
        create: { method: 'POST', isArray: false },
        update: { method: 'PUT', isArray: false },
        remove: { method: 'DELETE', isArray: false },
    })
}]);


// DIRECTIVES
// ========================
pman.directive('formField', function(){
    return {
        restrict: 'E',
        templateUrl: 'static/templates/directives/form-fields.html',
        replace: true,
        scope: {
            object: '=',
            list: '=',
            field: '@',
            required: '@',
            placeholder:'@',
            fieldtype: '@',
        },
        link: function($scope, elem, attr) {
            $scope.$on('field:invalid', function() {
                $scope[$scope.field].$setDirty();
            });
        }
    };
})

// CONTROLLERS
// ========================

// Helper functions
var success_handler = function(response) {
    console.log(response);
}
var error_handler = function(response) {
    console.log(response.data.msg);
}


pman.controller('root', ['$scope', 'Auth', function($scope, Auth) {
    $scope.login = function(form) {
        if (form.$invalid) {
            $scope.$broadcast('field:invalid')
        } else {
            console.log(form.username, form.password)
        }
    }

    $scope.credentials = {
        uid: sessionStorage.uid,
        token: sessionStorage.token
    }

}])
pman.controller('home', ['$scope', 'Users', function($scope, Users) {}])
pman.controller('parcel', ['$scope', 'Parcels', function($scope) {}])
pman.controller('user', ['$scope', 'User', function($scope) {}])