import pandas as pd
import logging

from constants import Group, Columns

logger = logging.getLogger()
logging.basicConfig(level=logging.INFO, format="AB testing plugin %(levelname)s - %(message)s")


class AbStatistics(object):
    def __init__(self, user_reference_column: str, group_column: str, conversion_column: str):
        self.user_reference_column = user_reference_column
        self.group_column = group_column
        self.conversion_column = conversion_column

    def compute(self, results):
        results_df = self.filter_results_df(results)
        self.check_results_df(results_df)
        aggregation = self.aggregate_by_group(results_df)
        statistics_df = self.format_statistics(aggregation)
        return statistics_df

    def filter_results_df(self, df):
        valid_rows = df[[self.user_reference_column, self.group_column, self.conversion_column]].dropna()
        return valid_rows

    def check_results_df(self, valid_rows):
        not_empty_rows_nb = valid_rows.shape[0]
        logger.info("{} rows are used to compute the results of the experiment.".format(not_empty_rows_nb))
        if not valid_rows[self.user_reference_column].is_unique:
            raise ValueError("There should be only one row per user in the input dataset")
        if not_empty_rows_nb < 2:
            raise ValueError("The input dataset should contain at least 2 users with conversion and group references")
        invalid_groups = valid_rows[(valid_rows[self.group_column] != Group.A.value) & (valid_rows[self.group_column] != Group.B.value)]
        if not invalid_groups.empty:
            raise ValueError("The group indicator should be either 'A' or 'B'")
        invalid_conversion = valid_rows[(valid_rows[self.conversion_column] != 0) & (valid_rows[self.conversion_column] != 1)]
        if not invalid_conversion.empty:
            raise ValueError("The success indicator should be either 0 or 1")

    def aggregate_by_group(self, result_df):
        aggregation = result_df.groupby([self.group_column]).agg({self.user_reference_column: "nunique", self.conversion_column: "sum"})
        return aggregation

    def format_statistics(self, aggregation):
        groups = [Group.A.value, Group.B.value]
        rows = []
        for group in groups:
            rows.append(self.statistic_per_group(group, aggregation))
        statistics_df = pd.DataFrame(rows)
        return statistics_df

    def statistic_per_group(self, group, aggregation):
        group_aggregation = aggregation.loc[group]
        size = group_aggregation[self.user_reference_column]
        row = {Columns.AB_GROUP: group, Columns.SUCCESS_RATE: self.conversion_rate(group_aggregation, size), Columns.SIZE: size}
        return row

    def conversion_rate(self, group_aggregation, size):
        return float(group_aggregation[self.conversion_column]) / size*100
