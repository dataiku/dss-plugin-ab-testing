check_form_inputs();

// show / hide optional parameters 
let hide_parameters = true;
const advancedButton = document.getElementById('more');
advancedButton.addEventListener('click', function (event) {
    hide_parameters = display(hide_parameters, "more", "optional_fields", true, "Advanced parameters", "Less parameters");
    event.preventDefault();
});

// show / hide explanations of the different fields
explain_form_fields();

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
        let formData = { bcr: $scope.bcr, mde: $scope.mde, sig_level: $scope.sig_level, power: $scope.power, ratio: $scope.ratio, reach: $scope.reach, tail: $scope.tail }
        $http.post(getWebAppBackendUrl("sample_size"), formData)
            .then(function (response) {
                let response_data = response.data
                $scope.sample_size_A = response_data.sample_size_A;
                $scope.sample_size_B = response_data.sample_size_B;
                update_chart($scope);
                $scope.hide_duration = manage_duration($scope.hide_duration);
            });
    };

    // viz
    $scope.updatePlot = function () {
        update_chart($scope);
    }
});
