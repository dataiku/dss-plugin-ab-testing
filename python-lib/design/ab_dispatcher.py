import numpy as np
import pandas as pd
import logging

from design.constants import AttributionMethod, Group

logger = logging.getLogger()
logging.basicConfig(level=logging.INFO, format="AB testing plugin %(levelname)s - %(message)s")


class AbDispatcher(object):

    def __init__(self, size_A: int, size_B: int, reference_column: str):
        self.size_A = size_A
        self.size_B = size_B
        self.reference_column = reference_column

    def dispatch(self, experiment_population: np.array, attribution: AttributionMethod, input_df: pd.DataFrame) -> tuple:
        """Dispatch the experiment population into two groups

        :param np.array experiment_population: array containing references to the experiment population
        :param AttributionMethod attribution: defines how to deal with the leftover users.
        :raises: :class:`ValueError`: Not enough users to run the experiment

        :returns: Experiment dataset and two arrays containing the contacts for each group
        :rtype: tuple
        """
        self.check_sample_size(experiment_population)
        A_group, B_group = self.split_into_groups(experiment_population, attribution)
        group_df = self.add_group_column(input_df, A_group, B_group)
        logger.info("Dispatching experiment population: done")
        return group_df, A_group, B_group

    def check_sample_size(self, experiment_population: np.array):
        """Check if the size of the population is large enough to run the experiment.

        :raises: :class:`ValueError`: Not enough users to run the experiment
        """
        population_size = experiment_population.shape[0]

        logger.info("Dispatching experiment population ...")
        logger.info("Dispatching experiment population: checking the sample sizes")
        logger.info("Sample size of the A group:" + str(self.size_A))
        logger.info("Sample size of the B group:" + str(self.size_B))
        logger.info("Size of the experiment population: " + str(population_size))

        if self.size_A + self.size_B > population_size:
            raise ValueError("Not enough user ids or emails to run the current AB testing.")

    def split_into_groups(self, experiment_population: np.array, attribution_method: str) -> tuple:
        """Shuffle the population and splits it into groups

        :returns: Two arrays containing the contacts for each group
        :rtype: tuple
        """
        logger.info("Dispatching experiment population: shuffle")
        np.random.permutation(experiment_population)
        if attribution_method == AttributionMethod.LEFTOVER_TO_A:
            B_group = experiment_population[:self.size_B]
            A_group = experiment_population[self.size_B:]
        elif attribution_method == AttributionMethod.LEFTOVER_TO_B:
            A_group = experiment_population[:self.size_A]
            B_group = experiment_population[self.size_A:]
        elif attribution_method == AttributionMethod.LEFTOVER_BLANK:
            B_group = experiment_population[:self.size_B]
            A_group = experiment_population[self.size_B:self.size_A+self.size_B]
        return A_group, B_group

    def add_group_column(self, input_df: pd.DataFrame, A_group: np.array, B_group: np.array) -> pd.DataFrame:
        """Add a column to the input dataframe to indicate the group for each user

        :returns: The input dataframe with a "AB_group" column
        :rtype: pd.DataFrame
        """
        input_df["AB_group"] = input_df[self.reference_column].apply(lambda x: retrieve_group(x, A_group, B_group))
        return input_df

    def group_to_df(self, group: np.array) -> pd.DataFrame:
        """
        Turns a group array into a one column dataframe

        :param np.array group: array containing references to one experiment group (A or B)

        :returns: A one column dataframe containing references to users of one grou
        :rtype : pd.DataFrame
        """
        columns = [self.reference_column]
        df = pd.DataFrame(data=group, index=range(group.shape[0]), columns=columns)
        return df


def retrieve_group(reference: str, A_group: np.array, B_group: np.array) -> Group:
    """
    Retrieve which group a user belongs to thanks to its reference

    :param str reference: reference of a user (contact_id, email...)
    :param np.array A_group : array containing the users of the A group
    :param np.array B_group : array containing the users of the B group

    :returns: The group where a user belongs
    :rtype: Group
    """
    if reference in A_group:
        return Group.A
    elif reference in B_group:
        return Group.B
