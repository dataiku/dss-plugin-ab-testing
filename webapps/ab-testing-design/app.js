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

// save parameters in the managed folder
let hide_attribution = true;
const attribution = document.getElementById('attribution_button');
attribution.addEventListener("click", function (event) {
    store_parameters()
        .then(function (response) {
            manage_response(response);
        }).catch(function (error) {
            console.log('There was an issue with the fetch operation ' + error.message);
            $("#attribution_alert").addClass("d-none");
            $("#error_save_button").removeClass("d-none");
        });
    display(hide_attribution, "attribution_button", "attribution_alert", false)
    event.preventDefault();
})


// compute size
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

    $scope.computeSize = function () {
        $("#alert_size").addClass('d-none');
        check_form_inputs($scope);
        if (missing_values($scope)) {
            alert_sample_size($scope, "A mandatory field is empty, please fill all of them", "missing value");
            erase_chart($scope);
        } else if (invalid_form($scope, 0, 100)) {
            alert_sample_size($scope, "Invalid input, please check the values defined above", "invalid input");
            erase_chart($scope);
        } else {
            let formData = { bcr: $scope.bcr, mde: $scope.mde, sig_level: $scope.sig_level, power: $scope.power, ratio: $scope.ratio, reach: $scope.reach, tail: $scope.tail }
            $http.post(getWebAppBackendUrl("sample_size"), formData)
                .then(function (response) {
                    let response_data = response.data
                    $scope.sample_size_A = response_data.sample_size_A;
                    $scope.sample_size_B = response_data.sample_size_B;
                    update_chart($scope);
                    manage_duration($scope);
                    hide_field("attribution_alert");
                }, function(e) {
                    $scope.createModal.error(e.data);
                });
        }
    };
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
        templateUrl: "/plugins/ab-testing/resource/templates/modal.html",
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
