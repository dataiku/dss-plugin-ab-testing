import numpy as np
from numpy import random
import pandas as pd
import logging

from constants import Columns, Group, AttributionMethod

logger = logging.getLogger()
logging.basicConfig(level=logging.INFO, format="AB testing plugin %(levelname)s - %(message)s")


class AbDispatcher(object):

    def __init__(self, size_A: int, size_B: int):
        self.size_A = size_A
        self.size_B = size_B

    def dispatch(self, input_df: pd.DataFrame, reference_column: str, leftovers_handling: AttributionMethod) -> tuple:
        """Dispatch the experiment population into two groups

        :param pd.DataFrame input_df: population dataset, an input of the recipe
        :param AttributionMethod leftovers_handling: defines how to deal with the leftover users.
        :raises: :class:`ValueError`: Not enough users to run the experiment

        :returns: Experiment dataset and two arrays containing the contacts for each group
        :rtype: tuple
        """
        population_df = input_df.drop_duplicates(subset=[reference_column])
        self.check_sample_size(population_df)
        group_df = self.split_into_groups(population_df, leftovers_handling)
        return group_df

    def check_sample_size(self, df_unique_ids: pd.DataFrame):
        """Check if the size of the population is large enough to run the experiment.

        :raises: :class:`ValueError`: Not enough users to run the experiment
        """
        population_size = df_unique_ids.shape[0]

        logger.info("Dispatching experiment population ...")
        logger.info("Dispatching experiment population: checking the sample sizes")
        logger.info("Sample size of the A group:" + str(self.size_A))
        logger.info("Sample size of the B group:" + str(self.size_B))
        logger.info("Size of the experiment population: " + str(population_size))

        if self.size_A + self.size_B > population_size:
            raise ValueError("Not enough user ids or emails to run the current AB testing.")

    def split_into_groups(self, population_df: pd.DataFrame, leftovers_handling: AttributionMethod) -> pd.DataFrame:
        """Shuffle the population and splits it into groups

        :param pd.DataFrame population_df; input dataframe without duplicated ids

        :returns: Two arrays containing the contacts for each group
        :rtype: tuple
        """
        logger.info("Dispatching experiment population: shuffle")
        shuffled_index = np.array(population_df.index)
        random.seed(1)
        if leftovers_handling == AttributionMethod.LEFTOVER_TO_A:
            population_df[Columns.AB_GROUP] = Group.A.value
            random.shuffle(shuffled_index)
            population_df.loc[shuffled_index[:self.size_B], Columns.AB_GROUP] = Group.B.value
        elif leftovers_handling == AttributionMethod.LEFTOVER_TO_B:
            population_df[Columns.AB_GROUP] = Group.B.value
            random.shuffle(shuffled_index)
            population_df.loc[shuffled_index[:self.size_A], Columns.AB_GROUP] = Group.A.value
        elif leftovers_handling == AttributionMethod.LEFTOVER_BLANK:
            population_df[Columns.AB_GROUP] = np.nan
            random.shuffle(shuffled_index)
            population_df.loc[shuffled_index[:self.size_A], Columns.AB_GROUP] = Group.A.value
            population_df.loc[shuffled_index[self.size_A:self.size_A+self.size_B], Columns.AB_GROUP] = Group.B.value
        logger.info("Dispatching experiment population: done")
        return population_df
