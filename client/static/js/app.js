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
        .when('/users/:id?', {
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

// SERVICES
// ========================
pman.factory('AuthService', function(){
    return service = {
        login: function(id, token) {
            var authdata = { uid: id, token: token }
            sessionStorage.user = JSON.stringify(authdata);
        },
        logout: function() {
            sessionStorage.clear();
        }
    }
});

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
var error_handler = function(response) {
    console.log(response.data.msg);
}


pman.controller('root', ['$scope', 'Auth', 'AuthService', function($scope, Auth, AuthService) {
    $scope.loggedIn = (sessionStorage.user) ? true:false;
    if (!$scope.loggedIn) {
        $scope.auth = new Auth({
            username: '',
            password: ''
        })
        $scope.login = function(form) {
            if (form.$invalid) {
                $scope.$broadcast('field:invalid')
            } else {
                // $scope.loggedIn = true;
                // AuthService.login('id', 'token')

                $scope.auth.$login(function(res) {
                    if (res.id) {
                        $scope.loggedIn = true;
                        AuthService.login(res.id, res.token)
                    } else {
                        console.log('Error')
                    }
                })
            }
        }

        $scope.credentials = {
            uid: sessionStorage.uid,
            token: sessionStorage.token
        }
    }

    $scope.logout = function() {
        AuthService.logout();
        window.location.reload();
    }

}])
pman.controller('home', ['$scope', 'Parcels', function($scope, Parcels) {
    $scope.parcel_type = [
        { name: 'Letter', id: 1 },
        { name: 'Package', id: 2 }
    ]

    $scope.parcel = new Parcels({
        student_name: '',
        parcel_type: 1,
        parcel: ''
    })

    $scope.addParcel = function(form) {
        if (form.$invalid) {
            $scope.$broadcast('field:invalid')
        } else {
            var a = JSON.parse(sessionStorage.user)
            $scope.parcel.$create(a);
        }
    }

}])

pman.controller('user', ['$scope', '$location', 'Users', function($scope, $location, Users) {
    if (!sessionStorage.user) {
        $location.path('/')
    }
}])