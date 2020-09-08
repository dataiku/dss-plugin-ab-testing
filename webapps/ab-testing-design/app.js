$(function () {   
    $('[data-toggle="popover"]').popover() 
  });

// show / hide optional parameters 
let hide_parameters = true;
const advancedButton = document.getElementById('more');
advancedButton.addEventListener('click', function (event) {
    hide_parameters = display(hide_parameters, "more", "optional_fields", true, "Advanced parameters", "Fewer parameters");
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

app.controller("SizeController", function ($scope, $http) {
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
                }).catch(function (error) {
                    alert_sample_size("Issue with the fetch operation. Please, check back end and back end logs. ", "There was an issue with the fetch operation " + error.message)
                });
        }
    };
});