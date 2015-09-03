// Available Factories:
// 1 - Auth (login)
// 2 - Parcel (list, add, update, claim)

parcelMan.controller('mainController', function($scope, Parcel) {
    // List parcels.
    $scope.parcels = Parcel.list();
});

parcelMan.controller('parcelController', function($scope, $modalInstance) {
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.viewParcel = function(parcel_id) {
        console.log(parcel_id);
    }
});