"""
Structured Logging Configuration with Scientific Provenance Tracking.
"""

import logging
import sys


def setup_logger(name: str = "sensory_synthesizer") -> logging.Logger:
    """Configures a standardized logger with timestamp and provenance formatting."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        stream_handler = logging.StreamHandler(sys.stdout)
        stream_handler.setFormatter(formatter)
        logger.addHandler(stream_handler)
    return logger


logger = setup_logger()

