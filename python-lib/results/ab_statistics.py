import pandas as pd

from design.constants import Group


class AbStatistics(object):
    def __init__(self, user_reference_column: str, group_column: str, conversion_column: str):
        self.user_reference_column = user_reference_column
        self.group_column = group_column
        self.conversion_column = conversion_column

    def compute(self, results_df):
        self.check_results_df(results_df)
        aggregation = self.aggregate_by_group(results_df)
        statistics_df = self.format_statistics(aggregation)
        return statistics_df

    def check_results_df(self, result_df):
        print("WIP")

    def aggregate_by_group(self, result_df):
        aggregation = result_df.groupby([self.group_column]).agg({self.user_reference_column: "nunique", self.conversion_column: "sum"})
        return aggregation

    def format_statistics(self, aggregation):
        groups = [Group.A, Group.B]
        rows = []
        for group in groups:
            rows.append(self.statistic_per_group(group, aggregation))
        statistics_df = pd.DataFrame(rows)
        return statistics_df

    def statistic_per_group(self, group, aggregation):
        group_aggregation = aggregation.loc[group]
        size = group_aggregation[self.user_reference_column]
        row = {"group": group, "conversion_rate": self.conversion_rate(group_aggregation, size), "size": size}
        return row

    def conversion_rate(self, group_aggregation, size):
        return float(group_aggregation[self.conversion_column]) / size*100
