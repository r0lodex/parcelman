// Available Factories:
// 1 - Auth (login)
// 2 - Parcel (list, add, update, claim)
parcelMan.run(function($rootScope, Parcel, Notification) {
    $rootScope.parcels = Parcel.list();
    $rootScope.$on('parcel:added', function() {
        Notification.success('Parcel has been added');
        $rootScope.parcels = Parcel.list();
    })
});

parcelMan.controller('mainController', function($scope, Parcel, Notification) {});

parcelMan.controller('parcelController', function($scope, $modalInstance, Parcel, ERRORS) {
    $scope.parcel_types = [
        { name: 'Package', id: 1 },
        { name: 'Letter', id: 2 },
        { name: 'Others', id: 3 },
    ];

    $scope.parceldetails = new Parcel({
        recipient_name: '',
        recipient_phone: '',
        tracking_id: '',
        parcel_type: $scope.parcel_types[0]
    });

    // Add Parcel Processing
    $scope.addParcel = function(form) {
        if (form.$invalid) {
            $scope.$broadcast('field:invalid');
        } else {
            // Set the type not to be an array
            $scope.parceldetails.parcel_type = $scope.parceldetails.parcel_type.id;
            $scope.parceldetails.$add(function(response){
                $modalInstance.dismiss('cancel'); // Closes modal
                $scope.$emit('parcel:added', response); // Notify parent of this event.
            }, ERRORS);
        }
    };

    // Close Add Parcel modal popup
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    // View Parcel Details
    $scope.viewParcel = function(parcel_id) {
        console.log(parcel_id);
    };
});

parcelMan.controller('loginController', function($rootScope, $scope, Auth, ERRORS, $modalInstance) {
    $scope.loginitem = { username: '', password: '' };
    $scope.login = function(form) {
        if (form.$invalid) {
            $scope.$broadcast('field:invalid');
        } else {
            Auth.login($scope.loginitem, function(response) {
                // Set the session storage.
                sessionStorage.authenticated = true;
                sessionStorage.uid = response.id;
                sessionStorage.token = response.token;

                // Events to execute upon successful login
                $modalInstance.dismiss('cancel');
                $rootScope.$broadcast('loggedIn', response);
            }, ERRORS)
        }
    };
})