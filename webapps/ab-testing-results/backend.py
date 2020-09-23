from flask import request
import dataiku
from distutils.util import strtobool
import json
from dataiku.customwebapp import get_webapp_config

from results.ab_calculator import compute_Z_score, compute_p_value
from results.statistics_helper import read_statistics
from dku_tools import get_output_folder
from helpers import save_parameters

config = get_webapp_config()
project_key = dataiku.default_project_key()
client = dataiku.api_client()

output_folder = get_output_folder(config, client, project_key)


@app.route('/ab_calculator', methods=['POST'])
def analyse_results():
    form_data = json.loads(request.data)
    size_A = form_data.get("size_A")
    size_B = form_data.get("size_B")
    CR_A = form_data.get("success_rate_A")/100
    CR_B = form_data.get("success_rate_B")/100
    two_tailed = strtobool(form_data.get("tail"))
    Z_score = round(compute_Z_score(size_A, size_B, CR_A, CR_B), 3)
    p_value = round(compute_p_value(Z_score, two_tailed), 3)
    return json.dumps({"Z_score": Z_score, "p_value": p_value})


@app.route("/statistics", methods=["POST"])
def get_statistics():
    dataset_name = json.loads(request.data).get("name")
    response = read_statistics(dataset_name)
    return response


@app.route('/write_parameters', methods=['POST'])
def save():
    data = request.form
    fields_to_save = ["size_A", "size_B", "success_rate_A", "success_rate_B", "uplift", "p_value", "z_score"]
    save_parameters(data, output_folder, fields_to_save)
    return json.dumps({"status": "Parameters saved"})
