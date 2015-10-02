parcelMan.run(function($rootScope, $location, $modal) {
    $rootScope.loggedIn = (sessionStorage.uid) ? true : false;
    $rootScope.showLoginForm = function() {
        $modal.open({
            templateUrl: 'templates/loginform.html',
            size: 'sm',
            controller: 'authCtrl'
        })
    }
    $rootScope.logout = function() {
        sessionStorage.clear();
        $location.path('/');
        $rootScope.loggedIn = false;
    }
})


parcelMan.controller('authCtrl', function($rootScope, $scope, $modalInstance, $location, Auth, ERRORS, Notification) {
    $scope.loginitem = { username: '', password: '' };
    $scope.forgotitem = { icno: '' };

    $scope.login = function(form) {
        if (form.$invalid) {
            $scope.$broadcast('field:invalid');
        } else {
            Auth.login($scope.loginitem, function(response) {
                // Set the session storage.
                sessionStorage.uid = response.id;
                sessionStorage.token = response.token;
                sessionStorage.username = $scope.loginitem.username;

                // Events to execute upon successful login
                $modalInstance.dismiss('cancel');
                $rootScope.$broadcast('loggedIn', response);
                $rootScope.loggedIn = true;
                Notification.success('You are now logged in.');
                $location.path('/dashboard')
            }, ERRORS)
        }
    };

    $scope.forgot = function(form) {
        if (form.$invalid) {
            $scope.$broadcast('field:invalid');
        } else {
            // API Endpoint to reset password using validated IC No.
            console.log($scope.forgotitem.icno);
        }
    }
})

parcelMan.controller('landingCtrl', function($scope, $location){
    $scope.search = function(form) {
        $location.path('/search/' + $scope.query)
    }
});

parcelMan.controller('searchCtrl', function($scope, $routeParams, Parcel){
    $scope.search_query = $routeParams.query || '';
    $scope.parcels = Parcel.query();
})

parcelMan.controller('dashboardCtrl', function($scope,  $modal, Parcel, ERRORS){
    var days = [
        { day: 'Sunday', received: 0, claimed: 0 },
        { day: 'Monday', received: 0, claimed: 0},
        { day: 'Tuesday', received: 0, claimed: 0},
        { day: 'Wednesday', received: 0, claimed: 0},
        { day: 'Thursday', received: 0, claimed: 0},
        { day: 'Friday', received: 0, claimed: 0},
        { day: 'Saturday', received: 0, claimed: 0}
    ]

    days[0]['Sunday']

    function getParcels() {
        $scope.parcels = Parcel.query(function(response) {
            response.forEach(function(v) {
                // Get count of received parcels
                var date_in = new Date(v.date_in*1000);
                var r_day = date_in.getDay();
                days[r_day].received++

                // Get count of claimed parcels
                var date_out = (v.date_out) ? new Date(v.date_out*1000) : false;
                if (date_out) {
                    var c_day = date_out.getDay();
                    days[c_day].claimed++
                }
            });

            // Generate Charts
            // ====================
                $scope.options = {
                    bezierCurve: false,
                    maintainAspectRatio: true,
                    responsive: true,
                    scaleShowVerticalLines: false,
                    datasetFill : false,
                }

                var _in = [], _out = []

                days.forEach(function(v,i) {
                    _in.push(v.received);
                    _out.push(v.claimed);
                })

                $scope.labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                $scope.data = [ _in, _out ]
            // ====================
        }, ERRORS);
    }

    getParcels();

    $scope.showParcelForm = function(parcel_id) {
        $modal.open({
            templateUrl: 'templates/parcel-form.html',
            size: 'md',
            controller: 'parcelCRUDCtrl',
            resolve: {
                parcel_id: function() {
                    return parcel_id;
                }
            }
        })
    }

    $scope.showStudentForm = function() {
        $modal.open({
            templateUrl: 'templates/student-form.html',
            size: 'md',
            controller: 'studentCRUDCtrl',
        })
    }

    $scope.students = []

    $scope.$on('parcel:added', function(a) {
        getParcels();
    });
});

parcelMan.controller('parcelCRUDCtrl', function($scope, $modalInstance, Parcel, parcel_id, ERRORS) {
    $scope.parcel_types = [
        { name: 'Package', id: 1 },
        { name: 'Letter', id: 2 },
        { name: 'Others', id: 3 },
    ];
    // Default field values
    $scope.parceldetails = new Parcel({
        recipient_name: '',
        recipient_phone: '',
        tracking_no: '',
        parcel_type: $scope.parcel_types[0]
    });

    $scope.exist = (parcel_id) ? true:false;

    if (parcel_id) {
        Parcel.show({ arg_a: parcel_id }, function(res) {
            Object.keys($scope.parceldetails).forEach(function(v) {
                if (v == 'parcel_type') {
                    console.log(res[v])
                    $scope.parceldetails[v] = $scope.parcel_types[res[v]-1]
                } else {
                    $scope.parceldetails[v] = res[v]
                }
                $scope.parceldetails.status = res.status;
            })
        },ERRORS)
    }

    $scope.parcelcrud = function(form) {
        if (form.$invalid) {
            $scope.$broadcast('field:invalid');
        } else {
            // Set the type not to be an array because the backend doesn't support this
            $scope.parceldetails.parcel_type = $scope.parceldetails.parcel_type.id;
            if (!$scope.exist) {
                // Create New Parcel
                Parcel.add($scope.parceldetails, function(response){
                    $scope.$broadcast('parcel:added', $scope.parceldetails); // Notify parent of this event.
                    // Default field values
                    $scope.parceldetails = new Parcel({
                        recipient_name: '',
                        recipient_phone: '',
                        tracking_no: '',
                        parcel_type: $scope.parcel_types[0]
                    });
                    form.$setPristine()
                }, ERRORS);
            } else {
                var a = prompt('Please insert student\'s ID');
                if (a) {
                    var b = a.trim() // Trim whitespaces
                    if (b.length) {
                        $scope.parceldetails.recipient_id = b;
                        var obj = {
                            recipient_id: $scope.parceldetails.recipient_id,
                            status: "2",
                            date_out: Math.round((new Date()) / 1000)
                        }
                        Parcel.claim({ arg_a:parcel_id }, obj, function(response) {
                            $modalInstance.dismiss('cancel');
                            $scope.$emit('parcel:added', $scope.parceldetails);
                        }, ERRORS)
                    } else {
                        alert('Student ID is required to claim parcels.');
                    }
                } else {
                    alert('Student ID is required to claim parcels.');
                }
            }
        }
    }

    $scope.deleteParcel = function() {
        Parcel.delete({ arg_a:parcel_id }, function(res) {
            if (res.status == 202) {
                Notification.success('Parcel Deleted.');
                $modalInstance.dismiss('cancel')
            }
        }, ERRORS)
    };

    $scope.closeModal = function() {
        $modalInstance.dismiss('cancel');
    }

})
parcelMan.controller('studentCRUDCtrl', function($scope, $modalInstance) {})