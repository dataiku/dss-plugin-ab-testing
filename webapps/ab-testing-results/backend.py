from flask import request
from distutils.util import strtobool
import json

from results.ab_calculator import compute_Z_score, compute_p_value


@app.route('/ab_calculator', methods=['POST'])
def analyse_results():
    size_A = float(request.form.get("size_A"))
    size_B = float(request.form.get("size_B"))
    CR_A = float(request.form.get("success_rate_A"))/100
    CR_B = float(request.form.get("success_rate_B"))/100
    two_tailed = strtobool(request.form.get("tail"))
    Z_score = round(compute_Z_score(size_A, size_B, CR_A, CR_B), 3)
    p_value = round(compute_p_value(Z_score, two_tailed), 3)
    return json.dumps({"Z_score": Z_score, "p_value": p_value})
