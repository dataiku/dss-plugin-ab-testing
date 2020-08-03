import numpy as np
import pandas as pd


class AbDispatcher(object):

    def __init__(self, size_A, size_B, reference_column):
        self.size_A = size_A
        self.size_B = size_B
        self.reference_column = reference_column

    def dispatch(self, experiment_population, attribution_method, input_df):
        self.check_sample_size(experiment_population)
        A_group, B_group = self.split_into_groups(experiment_population, attribution_method)
        group_df = self.add_group_column(input_df, A_group, B_group)
        return group_df, A_group, B_group

    def check_sample_size(self, experiment_population):
        if self.size_A + self.size_B > experiment_population.shape[0]:
            raise ValueError("Not enough user ids or emails to run the current AB testing.")

    def split_into_groups(self, experiment_population, attribution_method):
        np.random.shuffle(experiment_population)
        if attribution_method == "leftover_to_A":
            B_group = experiment_population[:self.size_B]
            A_group = experiment_population[self.size_B:]
        elif attribution_method == "leftover_to_B":
            A_group = experiment_population[:self.size_A]
            B_group = experiment_population[self.size_A:]
        elif attribution_method == "leftover_blank":
            B_group = experiment_population[:self.size_B]
            A_group = experiment_population[self.size_B:self.size_A+self.size_B]
        return A_group, B_group

    def add_group_column(self, input_df, A_group, B_group):
        input_df["AB_group"] = input_df[self.reference_column].apply(lambda x: retrieve_group(x, A_group, B_group))
        return input_df

    def group_to_df(self, group):
        columns = [self.reference_column]
        df = pd.DataFrame(data=group, index=range(group.shape[0]), columns=columns)
        return df


def retrieve_group(reference, A_group, B_group):
    if reference in A_group:
        return "A"
    elif reference in B_group:
        return "B"
