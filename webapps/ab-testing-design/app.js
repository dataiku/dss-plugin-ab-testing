$(function () {
    $('[data-toggle="popover"]').popover()
});

$('body').on('click', function (e) {
    $('[data-toggle=popover]').each(function () {
        // hide any open popovers when the anywhere else in the body is clicked
        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
            $(this).popover('hide');
        }
    });
});

// show / hide optional parameters 
let hide_parameters = true;
const advancedButton = document.getElementById('more');
advancedButton.addEventListener('click', function (event) {
    hide_parameters = display(hide_parameters, "more", "optional_fields", true, "<span>&#9660</span> Advanced parameters", "<span>&#9650</span> Fewer parameters");
    event.preventDefault();
});

// show/ hide maths derivations
let hide_derivation = true;
const computation = document.getElementById('size_derivation');
computation.addEventListener('click', function (event) {
    hide_derivation = display(hide_derivation, "size_derivation", "derivation_text", true, "<div class='extra'> How is the sample size computed? </div>", "<div class='extra'> Hide </div>");
    event.preventDefault();
});

var app = angular.module("abApp", []);

app.controller("SizeController", function ($scope, $http, ModalService) {

    $scope.modal = {};
    $scope.removeModal = function(event) {
        if (ModalService.remove($scope.modal)(event)) {
            angular.element(".template").focus();
        }
    };
    $scope.createModal = ModalService.create($scope.modal);

    $scope.bcr = 30;
    $scope.mde = 5;
    $scope.sig_level = 95;
    $scope.power = 80;
    $scope.ratio = 100;
    $scope.reach = 100;
    $scope.sample_size_A = 1085;
    $scope.sample_size_B = 1085;
    $scope.tail = "false";
    $scope.hide_duration = true;

    $scope.std = Math.sqrt($scope.bcr / 100 * (1 - $scope.bcr / 100) * (1 / $scope.sample_size_A + 1 / $scope.sample_size_B) * 100 / $scope.reach);
    $scope.distribution_A = Random_normal_Dist(0, $scope.std);
    $scope.distribution_B = Random_normal_Dist($scope.mde / 100, $scope.std);
    $scope.chart = plot_chart($scope);

    $scope.computeSize = function (validForm) {
    if (validForm){
        let formData = { bcr: $scope.bcr, mde: $scope.mde, sig_level: $scope.sig_level, power: $scope.power, ratio: $scope.ratio, reach: $scope.reach, tail: $scope.tail }
        $http.post(getWebAppBackendUrl("sample_size"), formData)
            .then(function (response) {
                let response_data = response.data
                $scope.sample_size_A = response_data.sample_size_A;
                $scope.sample_size_B = response_data.sample_size_B;
                update_chart($scope);
                manage_duration($scope.sample_size_A, $scope.sample_size_B, $scope.traffic);
                $("#attribution_alert").addClass("d-none");
            }, function(e) {
                $scope.createModal.error(e.data);
            });
        }
    }

    $scope.saveResults = function () {
        let parameters =  { bcr: $scope.bcr, mde: $scope.mde, sig_level: $scope.sig_level, power: $scope.power, ratio: $scope.ratio, reach: $scope.reach, tail: $scope.tail, size_A: $scope.sample_size_A, size_B: $scope.sample_size_B};
        $http.post(getWebAppBackendUrl("write_parameters"), parameters)
        .then(function(){
            console.log('All good')
            $("#attribution_alert").removeClass("d-none");
        }, function(e){
            $scope.invalid_folder = true;
            if (e.status === 405) {
                $scope.createModal.error(e.data);
            } else {
                $scope.createModal.error(e.data);
            };
        });
    }
});


app.service("ModalService", function() {
    const remove = function(config) {
        return function(event) {
            if (event && !event.target.className.includes("dku-modal-background")) return false;
            for (const key in config) {
                delete config[key];
            }
            return true;
        }
    };
    return {
        create: function(config) {
            return {
                confirm: function(msg, title, confirmAction) {
                    Object.assign(config, {
                        type: "confirm",
                        msg: msg,
                        title: title,
                        confirmAction: confirmAction
                    });
                },
                error: function(msg) {
                    Object.assign(config, {
                        type: "error",
                        msg: msg,
                        title: "Backend error"
                    });
                },
                alert: function(msg, title) {
                    Object.assign(config, {
                        type: "alert",
                        msg: msg,
                        title: title
                    });
                },
                prompt: function(inputLabel, confirmAction, res, title, msg, attrs) {
                    Object.assign(config, {
                        type: "prompt",
                        inputLabel: inputLabel,
                        promptResult: res,
                        title: title,
                        msg: msg,
                        conditions: attrs,
                        confirmAction: function() {
                            confirmAction(config.promptResult);
                        }
                    });
                }
            };
        },
        remove: remove
    }
});

app.directive("modalBackground", function($compile) {
    return {
        scope: true,
        restrict: "C",
        templateUrl: "/plugins/ab-test-calculator/resource/templates/modal.html",
        link: function(scope, element) {
            if (scope.modal.conditions) {
                const inputField = element.find("input");
                for (const attr in scope.modal.conditions) {
                    inputField.attr(attr, scope.modal.conditions[attr]);
                }
                $compile(inputField)(scope);
            }
        }
    }
});
