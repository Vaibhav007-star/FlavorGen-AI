"""
Domain-Specific Exceptions and Error Handlers for AI Smell & Flavor Synthesizer.
"""

class SensorySynthesizerError(Exception):
    """Base exception for all domain errors."""
    def __init__(self, message: str, details: dict = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class InvalidChemicalStructureError(SensorySynthesizerError):
    """Raised when a SMILES string, InChI, or chemical structure cannot be parsed."""
    pass


class MissingCompoundDataError(SensorySynthesizerError):
    """Raised when required molecular descriptors or sensory ground-truths are missing."""
    pass


class FormulationConstraintError(SensorySynthesizerError):
    """Raised when recipe or formulation proportions violate physical or user constraints."""
    pass


class ModelInferenceError(SensorySynthesizerError):
    """Raised when ML sensory regressor fails or yields out-of-domain predictions."""
    pass


class OptimizationConvergenceError(SensorySynthesizerError):
    """Raised when generative optimization fails to converge within specified tolerances."""
    pass

