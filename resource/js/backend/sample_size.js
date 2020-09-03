
// Compute the sample sizes and display them in the app

function manage_size_computation(event, hide_duration) {
    if (missing_values()) {
        alert_sample_size("A field is empty, please fill all of them", "missing value");
    } else if (invalid_form(0, 100)) {
        alert_sample_size("Invalid input, please check the values defined above", "invalid input");
    } else {
        compute_size()
            .then(function (response) {
                manage_response(response)
                    .then(function (json) {
                        update_sample_size(json);
                        hide_duration = manage_duration(hide_duration);
                    })
            }).catch(function (error) {
                console.log('There was an issue with the fetch operation ' + error.message);
            });
    };
    event.preventDefault();
}

