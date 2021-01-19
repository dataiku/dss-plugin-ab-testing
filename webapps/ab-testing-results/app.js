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

/*
// explanation fields
explain("size");
explain("success_rate");
explain("tail");
explain("sig_level");

// explanation fields
explain("size");
explain("success_rate");
explain("tail");
explain("sig_level");
*/




var app = angular.module("resultApp", []);

app.controller("ResultController", function ($scope, $http, ModalService) {

    $scope.modal = {};
    $scope.removeModal = function(event) {
        if (ModalService.remove($scope.modal)(event)) {
            angular.element(".template").focus();
        }
    };
    $scope.createModal = ModalService.create($scope.modal);

    $scope.sig_level = 95;
    $scope.tail = "false";
    $scope.uplift = null;
    $scope.z_score = null;
    $scope.p_value = null;
    $scope.distribution = Random_normal_Dist(0, 1);

    $scope.getResults = function (validForm) {
        if (validForm){
            let formData = { size_A: $scope.size_A, size_B: $scope.size_B, success_rate_A: $scope.success_rate_A, success_rate_B: $scope.success_rate_B, tail: $scope.tail, sig_level: $scope.sig_level };
            $http.post(getWebAppBackendUrl("ab_calculator"), formData)
                .then(function (response) {
                    let response_data = response.data;
                    $scope.z_score = response_data.Z_score;
                    $scope.p_value = response_data.p_value;
                    $scope.uplift = Math.round(Math.abs($scope.success_rate_A - $scope.success_rate_B));
                    $scope.test_is_significant = test_outcome($scope);
                    $scope.chart.config.data.datasets = get_results_datasets($scope);
                    $scope.chart.update(0);
                }, function(e) {
                    $scope.createModal.error(e.data);
                });
            };
    };

    get_inputs($scope, $http);
    plot_results_chart($scope);

    $scope.saveResults = function () {
        let results = { size_A: $scope.size_A, size_B: $scope.size_B, success_rate_A: $scope.success_rate_A, success_rate_B: $scope.success_rate_B, tail: $scope.tail, sig_level: $scope.sig_level, z_score: $scope.z_score, p_value: $scope.p_value, uplift: $scope.uplift };
        $http.post(getWebAppBackendUrl("write_parameters"), results)
        .then(function(){
            console.log('All good')
        }, function(e){
            $scope.createModal.error(e.data);
        });
        $("#save-caption").removeClass("d-none");
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
