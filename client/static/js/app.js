// @codekit-prepend "../../lib/angular/angular.min.js";
// @codekit-prepend "../../lib/angular-resource/angular-resource.min.js";
// @codekit-prepend "../../lib/angular-route/angular-route.min.js";
// @codekit-prepend "../../lib/angular-ui-notification/dist/angular-ui-notification.min.js";
// @codekit-prepend "../../lib/moment/min/moment.min.js";
// @codekit-prepend "../../lib/angular-moment/angular-moment.min.js";
// @codekit-prepend "../../lib/angular-bootstrap/ui-bootstrap-tpls.min.js";

// @codekit-append "../../lib/jquery/dist/jquery.min.js";
// @codekit-append "../../lib/bootstrap/dist/js/bootstrap.min.js";

var pman = angular.module('pman', ['ngResource', 'ngRoute', 'ui-notification', 'angularMoment', 'ui.bootstrap']);

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


pman.config(['$routeProvider', '$locationProvider', 'NotificationProvider', function($routeProvider, $locationProvider, NotificationProvider) {
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
    NotificationProvider.setOptions({
        positionX: 'left',
        positionY: 'bottom'
    });
}]);

// FACTORIES
// ========================
pman.factory('Auth', ['$resource', function($resource) {
    return $resource('../server/api/login', {}, {
        login: { method: 'POST', isArray: false }
    })
}]);

pman.factory('Users', ['$resource', function($resource) {
    return $resource('../server/api/user/:id', { id: '@id' }, {
        query: { method: 'GET', isArray: true },
        create: { method: 'POST', isArray: false },
        update: { method: 'PUT', isArray: false },
        remove: { method: 'DELETE', isArray: false },
    })
}]);

pman.factory('Parcels', ['$resource', function($resource) {
    return $resource('../server/api/parcel/:id', { id: '@id' }, {
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


pman.controller('root', ['$scope', 'Auth', 'AuthService', 'Notification', function($scope, Auth, AuthService, Notification) {
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
                        Notification.error({ message: 'Fuck you' })
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

    $scope.$on('parcel:added', function() {
        Notification.success({ message: 'Parcel Added' })
    })
}])
pman.controller('home', ['$scope', 'Parcels', '$modal', function($scope, Parcels, $modal) {
    $scope.parcel_type = [
        { name: 'Letter', id: 1 },
        { name: 'Package', id: 2 }
    ]

    $scope.parcel = new Parcels({
        student_name: '',
        parcel_type: $scope.parcel_type[0],
        parcel_id: '',
        parcel: ''
    })
    var udata = (sessionStorage.user) ? JSON.parse(sessionStorage.user) : undefined;
    $scope.parcels = Parcels.query(udata);

    $scope.addParcel = function(form) {
        if (form.$invalid) {
            $scope.$broadcast('field:invalid')
        } else {
            $scope.parcel.parcel_type = $scope.parcel.parcel_type.id;
            $scope.parcel.$create(udata, function(res) {
                $scope.parcels = Parcels.query(udata);
                form.$setPristine();
                $scope.parcel = new Parcels({
                    student_name: '',
                    parcel_type: $scope.parcel_type[0],
                    parcel_id: '',
                    parcel: ''
                })
                $scope.$emit('parcel:added');
            }, error_handler);
        }
    }

    $scope.claim = function(parcel_id) {
        var modalInstance = $modal.open({
            animation: true,
            size: 'sm',
            templateUrl: 'static/templates/claim.html',
            controller: 'claim',
            resolve: {
                parcel_data: function() {
                    return parcel_id;
                }
            }
        });
    }

}])

pman.controller('claim', ['$scope', '$modalInstance', 'parcel_data', 'Parcels', 'Notification', function($scope, $modalInstance, parcel_data, Parcels, Notification) {
    var udata = (sessionStorage.user) ? JSON.parse(sessionStorage.user) : undefined;
    console.log(parcel_data);
    $scope.ok = function() {
        $scope.claim = new Parcels({
            id: parcel_data,
            student_id: $scope.student_id
        });

        $scope.claim.$update(udata, function(res) {
            $modalInstance.dismiss('cancel');
            Notification.success({ message: 'Parcel Claimed!' })
        }, error_handler);
    }
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}])

pman.controller('user', ['$scope', '$location', 'Users', function($scope, $location, Users) {
    if (!sessionStorage.user) {
        $location.path('/')
    }
}])