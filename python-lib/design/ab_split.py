import dataiku
import numpy as np


def split_into_groups(population, n_A, n_B, attribution_method):
    np.random.shuffle(population)
    if attribution_method == "leftover_to_A":
        B_group = population[:n_B]
        A_group = population[n_B:]
    elif attribution_method == "leftover_to_B":
        A_group = population[:n_A]
        B_group = population[n_A:]
    elif attribution_method == "leftover_blank":
        B_group = population[:n_B]
        A_group = population[n_B:n_A+n_B]
    return A_group, B_group


def check_sample_size(experiment_subjects, n_A, n_B):
    if n_A+n_B > experiment_subjects.shape[0]:
        raise ValueError(
            "Not enough user ids or emails to run the current AB testing.")


def set_size_variables(form):
    project_handle = dataiku.api_client().get_project(dataiku.default_project_key())
    variables = project_handle.get_variables()
    variables["standard"] = form
    project_handle.set_variables(variables)


def set_tracking_values(variables):
    fields = [u'ratio', u'power', u'mde', u'tail', u'traffic', u'n_B', u'sig_level', u'n_A', u'bcr']
    tracking = {key: variables[key] for key in variables if key in fields}
    tracking["session"] = 1
    return tracking
