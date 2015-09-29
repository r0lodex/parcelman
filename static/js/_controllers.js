// Available Factories:
// 1 - Auth (login)
// 2 - Parcel (list, show, add, update, claim)
parcelMan.run(function($rootScope, Parcel, Notification) {
    $rootScope.parcels = Parcel.list();
    $rootScope.status = ''; // Current status filter
    $rootScope.$on('parcel:added', function(evt, args) {
        var message = 'Parcel has been added';
        if (args.id) {
            message = 'Parcel for '+ args.recipient_name + ' has been updated.'
        }
        Notification.success(message);

        // Reload parcel listing
        $rootScope.parcels = Parcel.list();
    })
});

parcelMan.controller('mainController', function($scope, $modal, $location, Parcel, ERRORS) {
    if (!sessionStorage.uid) {
        $location.path('/public')
    } else {
        $scope.loggedIn = true;
         // View Parcel Details
        $scope.viewParcelDetails = function(parcel_id) {
            $modal.open({
                templateUrl: 'static/templates/parcel_editor.html',
                size: 'md',
                controller: 'parcelController',
                resolve: {
                    objectid: function() {
                        return parcel_id;
                    }
                }
            })
        };
        // Define jenis parcel yang ada
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

        // Add Parcel Processing
        $scope.parcelcrud = function(form) {
            if (form.$invalid) {
                $scope.$broadcast('field:invalid');
            } else {
                // Set the type not to be an array because the backend doesn't support this
                $scope.parceldetails.parcel_type = $scope.parceldetails.parcel_type.id;
                // Create New Parcel
                Parcel.add($scope.parceldetails, function(response){
                    $scope.$emit('parcel:added', $scope.parceldetails); // Notify parent of this event.
                    // Default field values
                    $scope.parceldetails = new Parcel({
                        recipient_name: '',
                        recipient_phone: '',
                        tracking_no: '',
                        parcel_type: $scope.parcel_types[0]
                    });
                    form.$setPristine()
                }, ERRORS);
            }
        };
    }
});

parcelMan.service('objectid', function() { return null }) // Hack for empty injection. Lame!!
parcelMan.controller('parcelController', function($scope, $injector, $modalInstance, objectid, Parcel, ERRORS) {

    // Define jenis parcel yang ada
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

    $scope.exist = false;
    $scope.editable = true;
    $scope.authorized = (sessionStorage.token) ? true:false;

    // Sekiranya ID terdapat dalam injection,
    // cari parcel berdasarkan ID
    if (typeof objectid === 'string') { // This method is a hack. Lame
        Parcel.show({ arg_a: objectid }, function(response) {
            $scope.exist = true;
            $scope.editable = (!response.date_out) ? true: false;
            Object.keys(response).forEach(function(k) {
                if (k != 'parcel_type') {
                    $scope.parceldetails[k] = response[k]
                }
            });
            // Select Package Type properly
            $scope.parcel_types.forEach(function(k,v) {
                if (response.parcel_type == k.id) {
                    $scope.parceldetails.parcel_type = $scope.parcel_types[v]
                }
            })
        }, ERRORS)
    }

    console.log($scope.exist)

    // Add Parcel Processing
    $scope.parcelcrud = function(form) {
        if (form.$invalid) {
            $scope.$broadcast('field:invalid');
        } else {
            // Set the type not to be an array because the backend doesn't support this
            $scope.parceldetails.parcel_type = $scope.parceldetails.parcel_type.id;
            if ($scope.parceldetails.id) {
                // Update Existing Parcel
                Parcel.update({arg_a: $scope.parceldetails.id}, $scope.parceldetails, function(response) {
                    $scope.$emit('parcel:added', $scope.parceldetails);
                }, ERRORS);
            } else {
                // Create New Parcel
                $scope.parceldetails.$add(function(response){
                    $modalInstance.dismiss('cancel'); // Closes modal
                    $scope.$emit('parcel:added', $scope.parceldetails); // Notify parent of this event.
                }, ERRORS);
            }
        }
    };

    $scope.claimParcel = function(parcel_id) {
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
                Parcel.update({ arg_a:parcel_id }, obj, function(response) {
                    $modalInstance.dismiss('cancel');
                    $scope.$emit('parcel:added', $scope.parceldetails);
                }, ERRORS)
            } else {
                alert('Student ID is required to claim parcels.');
            }
        } else {
            alert('Student ID is required to claim parcels.');
        }
    };

    $scope.deleteParcel = function(parcel_id) {
        var a = confirm('Are you sure you want to delete this parcel?')
        if (a) {
            console.log('Delete parcel is not ready')
        }
    }

    // Close Add Parcel modal popup
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
});

parcelMan.controller('publicController', function($scope, $location) {
    if (sessionStorage.uid) {
        $location.path('/')
    }
})

parcelMan.controller('reportController', function($scope, $location, Parcel) {
    if (!sessionStorage.uid) {
        $location.path('/public')
    } else {
        var days = [
            { day: 'Sunday', count: 0 },
            { day: 'Monday', count: 0},
            { day: 'Tuesday', count: 0},
            { day: 'Wednesday', count: 0},
            { day: 'Thursday', count: 0},
            { day: 'Fridat', count: 0},
            { day: 'Saturday', count: 0}
        ]

        var parcels = Parcel.query(function(res) {
            res.forEach(function(v) {
                var d = new Date(v.date_in*1000);
                var w = d.getDay();
                days[w].count++;
            })
            $scope.labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
            $scope.data = [
                [days[1].count, days[2].count, days[3].count, days[4].count, days[5].count]
            ];
        })
    }
})

parcelMan.controller('loginController', function($location, $rootScope, $scope, Auth, ERRORS, $modalInstance, Notification) {
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
                Notification.success('You are now logged in.');
                $location.path('/')
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