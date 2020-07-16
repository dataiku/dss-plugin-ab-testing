import dataiku
from dataiku.customrecipe import get_input_names_for_role, get_output_names_for_role, get_recipe_config

from design.ab_split import check_sample_size, split_into_groups, set_tracking_values
from design.split_format import add_group_column, group_to_df, format_tracking

# ==============================================================================
# SETUP
# ==============================================================================
input_name = get_input_names_for_role('user_list')[0]
input_dataset = dataiku.Dataset(input_name)
input_df = input_dataset.get_dataframe()

groups_name = get_output_names_for_role('groups')[0]
groups_dataset = dataiku.Dataset(groups_name)

tracking_name = get_output_names_for_role('tracking')[0]
tracking_dataset = dataiku.Dataset(tracking_name)

A_output = get_output_names_for_role("A_group")
B_output = get_output_names_for_role("B_group")

if A_output:
    A_output_name = A_output[0]
    A_group_dataset = dataiku.Dataset(A_output_name)

if B_output:
    B_output_name = B_output[0]
    B_group_dataset = dataiku.Dataset(B_output_name)

config = get_recipe_config()
reference_column = config.get("user_reference")

size_definition = config.get("sample_size_definition")
if size_definition == "web_app":
    variables = dataiku.get_custom_variables()
    tracking = set_tracking_values(variables)
    n_A = int(tracking["n_A"])
    n_B = int(tracking["n_B"])
elif size_definition == "manual":
    n_A = config.get("n_A")
    n_B = config.get("n_B")
    if n_A <= 0 or n_B <= 0:
        raise ValueError("Sample sizes need to be positive")
    tracking = {"n_A": n_A, "n_B": n_B}

attribution_method = config.get("attribution_method")


# ==============================================================================
# RUN
# ==============================================================================
experiment_population = input_df[[reference_column]].drop_duplicates().values
check_sample_size(experiment_population, n_A, n_B)

A_group, B_group = split_into_groups(experiment_population, n_A, n_B, attribution_method)
groups_df = add_group_column(input_df, A_group, B_group, reference_column, attribution_method)
tracking_df = format_tracking(tracking)

# ===============================================================================
# WRITE
# ===============================================================================
groups_dataset.write_with_schema(groups_df)
tracking_dataset.write_with_schema(tracking_df)

if A_output:
    A_df = group_to_df(A_group, reference_column)
    A_group_dataset.write_with_schema(A_df)
if B_output:
    B_df = group_to_df(B_group, reference_column)
    B_group_dataset.write_with_schema(B_df)
