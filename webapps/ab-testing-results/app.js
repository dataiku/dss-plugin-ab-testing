// explanation fields
explain("size");
explain("CR");
explain("tail");

// default values
document.getElementById("size_A").defaultValue = "1000";
document.getElementById("size_B").defaultValue = "1000";
document.getElementById("CR_A").defaultValue = "10";
document.getElementById("CR_B").defaultValue = "15";

// check size input
let size_A_form = document.getElementById("size_A");
size_A_form.addEventListener("change", function () { alert_value_too_small("size_A", size_A_form.value); });
let size_B_form = document.getElementById("size_B");
size_B_form.addEventListener("change", function () { alert_value_too_small("size_B", size_B_form.value); });

//submit form
function analyse_results() {
    let formData = new FormData(document.getElementById('form_data'));
    const data = new URLSearchParams(formData);
    let headers = new Headers();
    let init = {
        method: 'POST',
        headers: headers,
        body: data
    };
    const url = getWebAppBackendUrl('/ab_calculator');
    let promise = fetch(url, init);
    console.log(promise);
    return promise;
}

//analyse results
const formButton = document.getElementById('submit');
formButton.addEventListener("click", function (event) {
    analyse_results().then(function (response) {
        manage_response(response)
            .then(function (json) {
                console.log(json);
            })
    }).catch(function (error) {
        console.log('There was an issue with the fetch operation ' + error.message);
    });
    event.preventDefault();
}
)
