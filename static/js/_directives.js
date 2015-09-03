// Directive ialah salah satu feature Angularjs
// yang membolehkan kita membina komponen-komponen
// supaya dapat digunakan semula (reusable)

parcelMan.directive('navigation', function($location, $modal) {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: 'static/templates/navigation.html',
        link: function(scope, elem, attr) {
            scope.showAddParcelForm = function() {
                $modal.open({
                    templateUrl: 'static/templates/addparcel.html',
                    size: 'md',
                    controller: 'parcelController'
                })
            };
        }
    }
});