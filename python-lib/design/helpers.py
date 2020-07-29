from io import StringIO
from dataiku.core.dkujson import dumps
import time


def save_parameters(variables, folder):
    fields = [u'ratio', u'power', u'mde', u'tail', u'traffic', u'n_B', u'sig_level', u'n_A', u'bcr']
    tracking = {key: variables[key] for key in variables if key in fields}
    filename = str(time.time())[:5] + ".json"
    parameters = StringIO()
    parameters.write(dumps(tracking))
    parameters.seek(0)
    folder.upload_stream(filename, parameters)
