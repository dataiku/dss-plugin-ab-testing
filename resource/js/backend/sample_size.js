
// Compute the sample sizes and display them in the app

function manage_size_computation(event, svg, height, width, hide_duration) {
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
                        update_canvas(svg, height, width);
                        hide_duration = manage_duration(hide_duration);
                    })
            }).catch(function (error) {
                console.log('There was an issue with the fetch operation ' + error.message);
            });
    };
    event.preventDefault();
}


// check if input values are present
function missing_values() {
    const bcr = $("#bcr").val();
    const mde = $("#mde").val();
    const sig_level = $("#sig_level").val();
    const power = $("#power").val();
    const ratio = $("#ratio").val();
    return (bcr === "" || mde === "" || sig_level === "" || power === "" || ratio === "");
}

function alert_sample_size(display_message, log_message) {
    $("#alert_size").html(display_message);
    $("#sample_size_A").html("");
    $("#sample_size_B").html("");
    console.log("value error: " + log_message);
}

function compute_size() {
    let formData = new FormData(document.getElementById('form_data'));
    const data = new URLSearchParams(formData);
    let headers = new Headers();
    let init = {
        method: 'POST',
        headers: headers,
        body: data
    };
    const url = getWebAppBackendUrl('/sample_size');
    let promise = fetch(url, init);
    return promise;
}


function update_sample_size(response) {
    const size_A = parseInt(response.n_A);
    const size_B = parseInt(response.n_B);
    $("#sample_size_A").html(size_A);
    $("#sample_size_B").html(size_B);
    $("#alert_size").html("");
}
