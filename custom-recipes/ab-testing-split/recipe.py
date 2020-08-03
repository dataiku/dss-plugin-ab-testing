from dataiku.customrecipe import get_recipe_config

from design.dku_tools import get_input_output, get_parameters
from design.ab_dispatcher import AbDispatcher

# ==============================================================================
# SETUP
# ==============================================================================

input_dataset, folder_ref, output_dataset, A_dataset, B_dataset = get_input_output()
input_df = input_dataset.get_dataframe()
config = get_recipe_config()
reference_column, size_definition, attribution_method, size_A, size_B = get_parameters(config, folder_ref)

# ==============================================================================
# RUN
# ==============================================================================
experiment_population = input_df[[reference_column]].drop_duplicates().values
ab_dispatcher = AbDispatcher(size_A, size_B, reference_column)
groups_df, A_group, B_group = ab_dispatcher.dispatch(experiment_population, attribution_method, input_df)

# ===============================================================================
# WRITE
# ===============================================================================
output_dataset.write_with_schema(groups_df)

if A_dataset:
    A_df = ab_dispatcher.group_to_df(A_group)
    A_dataset.write_with_schema(A_df)
if B_dataset:
    B_df = ab_dispatcher.group_to_df(B_group)
    B_dataset.write_with_schema(B_df)
