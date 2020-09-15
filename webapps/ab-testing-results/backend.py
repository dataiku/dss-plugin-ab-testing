from flask import request
import dataiku
from distutils.util import strtobool
import json
from global_constants import Columns, Group
from results.ab_calculator import compute_Z_score, compute_p_value


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
    dataset_name = "AB_statistics"
    dataset = dataiku.Dataset(dataset_name)
    df = dataset.get_dataframe()
    A_df = df[df[Columns.AB_GROUP] == Group.A.value]
    size_A = A_df["sample_size"].values[0]
    success_rate_A = A_df["success_rate"].values[0]
    B_df = df[df[Columns.AB_GROUP] == Group.B.value]
    size_B = B_df["sample_size"].values[0]
    success_rate_B = B_df["success_rate"].values[0]
    return json.dumps({"size_A": size_A, "size_B": size_B, "success_rate_A": success_rate_A, "success_rate_B": success_rate_B})
