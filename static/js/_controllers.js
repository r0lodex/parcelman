parcelMan.run(function($rootScope, $location, $modal, Parcel, Student, Notification) {
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
    $rootScope.parcels = Parcel.query();

    if (sessionStorage.uid) {
        $rootScope.students = Student.query();
    };

    $rootScope.$on('parcel:added', function() {
        Notification.success('Parcel successfully added to the record.');
        $rootScope.parcels = Parcel.query();
    })
    $rootScope.$on('parcel:deleted', function() {
        Notification.success('Parcel has been deleted.');
        $rootScope.students = Student.query();
    })
    $rootScope.$on('parcel:claimed', function() {
        Notification.warning('Parcel has been claimed.');
        $rootScope.students = Student.query();
    })

    $rootScope.$on('student:added', function() {
        Notification.success('Student successfully added to the record.');
        $rootScope.students = Student.query();
    })
    $rootScope.$on('student:updated', function() {
        Notification.warning('Student has been updated.');
        $rootScope.students = Student.query();
    })
    $rootScope.$on('student:deleted', function() {
        Notification.success('Student has been deleted.');
        $rootScope.students = Student.query();
    })
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
    Parcel.show({arg_a: 'report'}, function(res) {
        $scope.options = {
            bezierCurve: false,
            maintainAspectRatio: true,
            responsive: true,
            scaleShowVerticalLines: false,
            datasetFill : true,
        };
        $scope.labels = res.label;
        $scope.data = [ res.received, res.claimed ];
    })

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
    };

    $scope.showStudentForm = function(student_id) {
        $modal.open({
            templateUrl: 'templates/student-form.html',
            size: 'md',
            controller: 'studentCRUDCtrl',
            resolve: {
                student_id: function() {
                    return student_id;
                }
            }
        })
    }
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
                $scope.parceldetails.date_out = res.date_out;
                $scope.parceldetails.recipient_id = res.recipient_id;
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
                            $scope.$emit('parcel:updated', $scope.parceldetails);
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
        var a = confirm('Are you sure you want to delete this parcel?')
        if (a) {
            Parcel.delete({ arg_a:parcel_id }, function(res) {
                $scope.$emit('parcel:deleted')
                $modalInstance.dismiss('cancel')
            }, ERRORS)
        };
    };

    $scope.closeModal = function() {
        $modalInstance.dismiss('cancel');
    }

})
parcelMan.controller('studentCRUDCtrl', function($scope, $modalInstance, Student, student_id, ERRORS) {
    // Default field values
    $scope.studentdetails = new Student({
        fullname: '',
        ic_no: '',
        matrix_no: '',
    });

    $scope.exist = (student_id) ? true:false;

    if (student_id) {
        Student.show({ arg_a: student_id }, function(res) {
            console.log(res)
            Object.keys($scope.studentdetails).forEach(function(v) {
                $scope.studentdetails[v] = res[v]
            })
        },ERRORS)
    }

    $scope.studentcrud = function(form) {
        if (form.$invalid) {
            $scope.$broadcast('field:invalid');
        } else {
            if (!$scope.exist) {
                // Create New Parcel
                Student.add($scope.studentdetails, function(response){
                    $scope.$emit('student:added', $scope.studentdetails); // Notify parent of this event.
                    // Default field values
                    $scope.studentdetails = new Student({
                        fullname: '',
                        ic_no: '',
                        matrix_no: '',
                    });
                    $modalInstance.dismiss('cancel');
                }, ERRORS);
            } else {
                Student.update({ arg_a:student_id }, $scope.studentdetails, function(response) {
                    $modalInstance.dismiss('cancel');
                    $scope.$emit('student:updated', $scope.studentdetails);
                }, ERRORS)
            }
        }
    }

    $scope.deleteStudent = function() {
        var a = confirm('Are you sure you want to delete this student?')
        if (a) {
            Student.delete({ arg_a:student_id }, function(res) {
                $scope.$emit('student:deleted')
                $modalInstance.dismiss('cancel')
            }, ERRORS)
        }
    };

    $scope.closeModal = function() {
        $modalInstance.dismiss('cancel');
    }
})