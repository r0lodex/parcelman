// Directive ialah salah satu feature Angularjs
// yang membolehkan kita membina komponen-komponen
// supaya dapat digunakan semula (reusable)

parcelMan.directive('navigation', function($modal) {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: 'static/templates/navigation.html',
        link: function(scope, elem, attr) {
            scope.showAddParcelForm = function() {
                $modal.open({
                    templateUrl: 'static/templates/parcel_editor.html',
                    size: 'md',
                    controller: 'parcelController'
                })
            };
            scope.showLoginForm = function() {
                $modal.open({
                    templateUrl: 'static/templates/loginform.html',
                    size: 'sm',
                    controller: 'loginController'
                })
            };
            scope.logout = function() {
                scope.loggedIn = false;
                sessionStorage.clear();
            };
            scope.loggedIn = (sessionStorage.token) ? true:false;
            scope.username = (sessionStorage.username) ? sessionStorage.username: '';
            scope.$on('loggedIn', function() {
                scope.loggedIn = true;
            });
            scope.$on('loggedOut', function() { scope.loggedIn = false; });
        }
    }
});

parcelMan.directive('formgroup', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'static/templates/comp/form_field.html',
        scope: {
            object: '=',
            array: '=',
            field: '@',
            required: '@',
            placeholder: '@',
            icon: '@',
            type: '@',
            inputgroup: '@',
        },
        link: function(scope, elem, attr) {
            scope.$on('field:invalid', function() {
                scope[scope.field].$setDirty();
            });
        }
    }
});