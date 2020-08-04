from dataiku.customrecipe import get_recipe_config

from results.dku_tools import get_input_output, get_parameters
from results.ab_statistics import AbStatistics

results_dataset, statistics_dataset = get_input_output()
user_reference_column, group_column, conversion_column = get_parameters(get_recipe_config())

results_df = results_dataset.get_dataframe()
ab_statistics = AbStatistics(user_reference_column, group_column, conversion_column)
statistics_df = ab_statistics.compute(results_df)

statistics_dataset.write_with_schema(statistics_df)
