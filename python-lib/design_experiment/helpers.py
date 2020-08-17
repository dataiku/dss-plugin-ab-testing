from io import StringIO
from dataiku.core.dkujson import dumps
import time
from design_experiment.constants import Parameters


def save_parameters(variables, folder):
    fields = [Parameters.SIZE_A.value, Parameters.SIZE_B.value, Parameters.RATIO.value, Parameters.POWER.value,
              Parameters.MDE.value, Parameters.TAIL.value, Parameters.TRAFFIC.value, Parameters.SIG_LEVEL.value, Parameters.BCR.value]
    tracking = {key: variables[key] for key in variables if key in fields}
    filename = str(time.time())[:5] + ".json"
    parameters = StringIO()
    parameters.write(dumps(tracking))
    parameters.seek(0)
    folder.upload_stream(filename, parameters)
