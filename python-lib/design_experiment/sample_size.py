import scipy.stats as scs


def min_sample_size(baseline_conversion_rate, minimum_detectable_effect, significance_level=0.05, min_power=0.8, size_ratio=1., two_tailed=True):

    if minimum_detectable_effect == 0:
        raise ValueError('Minimum detectable effect must be greater than 0%')
    if significance_level == 0:
        raise ValueError('The statistical significant level must be less than 100%')
    if significance_level == 1:
        raise ValueError('The statistical significant level must be greater than 0%')
    if min_power == 1:
        raise ValueError('The power must be less than 100%')
    if min_power == 0:
        raise ValueError('The power must be greater than 100%')
    if size_ratio == 0:
        raise ValueError('Size ratio must be greater than 0%')

    Z_alpha = z_value(significance_level, two_tailed=two_tailed)
    Z_power = z_value(1-min_power, two_tailed=False)
    pooled_probability = (baseline_conversion_rate+size_ratio*(baseline_conversion_rate+minimum_detectable_effect))/(1+size_ratio)
    min_N_B = (1+size_ratio)*pooled_probability*(1-pooled_probability)*(Z_alpha+Z_power)**2/minimum_detectable_effect**2
    min_N_A = min_N_B/size_ratio
    return round(min_N_A), round(min_N_B)


def z_value(significance_level, two_tailed=True):
    z_dist = scs.norm()
    if two_tailed:
        significance_level = significance_level/2
        area = 1 - significance_level
    else:
        area = 1 - significance_level
    z = z_dist.ppf(area)
    return z
