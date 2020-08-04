import dataiku
from dataiku.customrecipe import get_input_names_for_role, get_output_names_for_role


def get_input_output() -> tuple:
    """Returns input and output datasets after sanity check

    :raises: :class:`ValueError`: Missing input or output dataset(s)

    :returns: input and output datasets
    :rtype: tuple
    """
    input_name = get_input_names_for_role("results")[0]
    output_name = get_output_names_for_role('groups')[0]
    if len(get_input_names_for_role("results")) == 0:
        raise ValueError("No input dataset.")
    if len(get_output_names_for_role("statistics")) == 0:
        raise ValueError("No output dataset.")

    input_dataset = dataiku.Dataset(input_name)
    output_dataset = dataiku.Dataset(output_name)
    return input_dataset, output_dataset
