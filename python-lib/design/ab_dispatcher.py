import numpy as np
import pandas as pd
import logging

logger = logging.getLogger()
logging.basicConfig(level=logging.INFO, format="AB testing plugin %(levelname)s - %(message)s")


class AbDispatcher(object):

    def __init__(self, size_A: int, size_B: int, reference_column: str):
        self.size_A = size_A
        self.size_B = size_B
        self.reference_column = reference_column

    def dispatch(self, experiment_population: np.array, attribution_method: str, input_df: pd.DataFrame) -> tuple:
        self.check_sample_size(experiment_population)
        A_group, B_group = self.split_into_groups(experiment_population, attribution_method)
        group_df = self.add_group_column(input_df, A_group, B_group)
        logger.info("Dispatching experiment population: done")
        return group_df, A_group, B_group

    def check_sample_size(self, experiment_population: np.array):
        population_size = experiment_population.shape[0]

        logger.info("Dispatching experiment population ...")
        logger.info("Dispatching experiment population: checking the sample sizes")
        logger.info("Sample size of the A group:" + str(self.size_A))
        logger.info("Sample size of the B group:" + str(self.size_B))
        logger.info("Size of the experiment population: " + str(population_size))

        if self.size_A + self.size_B > population_size:
            raise ValueError("Not enough user ids or emails to run the current AB testing.")

    def split_into_groups(self, experiment_population: np.array, attribution_method: str) -> tuple:
        logger.info("Dispatching experiment population: shuffle")
        np.random.permutation(experiment_population)
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

    def add_group_column(self, input_df: pd.DataFrame, A_group: np.array, B_group: np.array) -> pd.DataFrame:
        input_df["AB_group"] = input_df[self.reference_column].apply(lambda x: retrieve_group(x, A_group, B_group))
        return input_df

    def group_to_df(self, group: np.array) -> pd.DataFrame:
        columns = [self.reference_column]
        df = pd.DataFrame(data=group, index=range(group.shape[0]), columns=columns)
        return df


def retrieve_group(reference: str, A_group: np.array, B_group: np.array) -> str:
    if reference in A_group:
        return "A"
    elif reference in B_group:
        return "B"
