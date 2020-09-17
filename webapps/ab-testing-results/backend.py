from flask import request
import dataiku
from distutils.util import strtobool
import json
from global_constants import Columns, Group
from results.ab_calculator import compute_Z_score, compute_p_value
from results.statistics_helper import read_statistics


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
    print(response)
    return response
