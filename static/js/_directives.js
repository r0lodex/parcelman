// Directive ialah salah satu feature Angularjs
// yang membolehkan kita membina komponen-komponen
// supaya dapat digunakan semula (reusable)

parcelMan.directive('formgroup', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/form_field.html',
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