from enum import Enum


class Columns(object):
    AB_GROUP = "dku_ab_group"
    SUCCESS_RATE = "success_rate"
    SIZE = "sample_size"


class Group(Enum):
    A = "A"
    B = "B"


class SizeDefinition(Enum):
    WEB_APP = "web_app"
    MANUAL = "manual"


class AttributionMethod(Enum):
    LEFTOVER_TO_A = "leftover_to_A"
    LEFTOVER_TO_B = "leftover_to_B"
    LEFTOVER_BLANK = "leftover_blank"


class Parameters(Enum):
    SIZE_A = "size_A"
    SIZE_B = "size_B"
    RATIO = "ratio"
    POWER = "power"
    MDE = "mde"
    TAIL = "tail"
    TRAFFIC = "traffic"
    SIG_LEVEL = "sig_level"
    BCR = "bcr"
    REACH = "reach"
