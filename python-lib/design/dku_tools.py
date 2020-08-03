import dataiku
from dataiku.customrecipe import get_input_names_for_role, get_output_names_for_role


def get_input_output():
    if len(get_input_names_for_role("user_list")) == 0:
        raise ValueError("No input dataset.")
    if len(get_output_names_for_role("groups")) == 0:
        raise ValueError("No output dataset.")

    input_name = get_input_names_for_role('user_list')[0]
    input_dataset = dataiku.Dataset(input_name)
    folder_ref = get_input_names_for_role('folder')

    output_name = get_output_names_for_role('groups')[0]
    output_dataset = dataiku.Dataset(output_name)
    A_output = get_output_names_for_role("A_group")
    B_output = get_output_names_for_role("B_group")
    if A_output:
        A_dataset = dataiku.Dataset(A_output[0])
    else:
        A_dataset = None
    if B_output:
        B_dataset = dataiku.Dataset(B_output[0])
    else:
        B_dataset = None
    return input_dataset, folder_ref, output_dataset, A_dataset, B_dataset


def get_parameters(config, folder_ref):
    reference_column = config.get("user_reference", None)
    size_definition = config.get("sample_size_definition", None)
    attribution_method = config.get("attribution_method", "leftover_to_A")
    if not reference_column:
        raise ValueError("Reference column is missing")
    if not size_definition:
        raise ValueError("Size definition is missing")

    filename = config.get("parameters", None)
    size_A = config.get("n_A", None)
    size_B = config.get("n_B", None)
    if size_definition == "manual" and size_A and size_B:
        if size_A < 0 or size_B < 0:
            raise ValueError("Sample sizes need to be positive")
    elif folder_ref:
        folder_name = folder_ref[0]
        folder = dataiku.Folder(folder_name)
        paths = folder.list_paths_in_partition()
        if len(paths) == 0:
            raise ValueError("The input folder is empty")
        else:
            if filename:
                if filename in paths:
                    tracking = folder.read_json(filename)
                    size_A = int(tracking["n_A"])
                    size_B = int(tracking["n_B"])
                else:
                    raise ValueError("The parameter's file is not in the managed folder")
            else:
                raise ValueError("The parameters' filename is missing")
    else:
        raise ValueError("The input folder is missing")
    return reference_column, size_definition, attribution_method, size_A, size_B
