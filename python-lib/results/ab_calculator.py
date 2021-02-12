import numpy as np
from scipy import stats


def compute_Z_score(size_A, size_B, CR_A, CR_B):
    pooled_probability = (size_A * CR_A + size_B * CR_B)/(size_A + size_B)
    Z_score = abs(CR_A-CR_B)/np.sqrt(pooled_probability*(1-pooled_probability)*(1/size_A + 1/size_B))
    return Z_score


def compute_p_value(Z_score, two_tailed):
    if two_tailed:
        p_value = 2*(1-stats.norm(0, 1).cdf(Z_score))
    else:
        p_value = 1-stats.norm(0, 1).cdf(Z_score)
    return p_value

