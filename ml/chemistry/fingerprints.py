"""
Molecular Fingerprint Extraction (ECFP4 / Morgan) and Chemical Similarity Metrics.
Uses modern rdFingerprintGenerator with fallback support.
"""

import hashlib
from typing import List, Optional
import numpy as np

try:
    from rdkit import Chem
    from rdkit.Chem import rdFingerprintGenerator, DataStructs
    RDKIT_AVAILABLE = True
except ImportError:
    RDKIT_AVAILABLE = False

from ml.chemistry.smiles_parser import SMILESParser


class MolecularFingerprinter:
    """Generates circular topological fingerprints (Morgan/ECFP4) and computes chemical similarity."""

    def __init__(self, radius: int = 2, n_bits: int = 256, use_rdkit: bool = True):
        self.radius = radius
        self.n_bits = n_bits
        self.use_rdkit = use_rdkit and RDKIT_AVAILABLE
        self.parser = SMILESParser(use_rdkit=self.use_rdkit)
        self._init_generator()

    def _init_generator(self):
        if self.use_rdkit:
            try:
                self.generator = rdFingerprintGenerator.GetMorganGenerator(
                    radius=self.radius, fpSize=self.n_bits
                )
            except Exception:
                self.generator = None
        else:
            self.generator = None

    def __getstate__(self):
        state = self.__dict__.copy()
        state["generator"] = None
        return state

    def __setstate__(self, state):
        self.__dict__.update(state)
        self._init_generator()

    def generate_fingerprint(self, smiles: str) -> np.ndarray:
        """Generates a binary fingerprint vector of length n_bits."""
        if not smiles or not self.parser.is_valid(smiles):
            return np.zeros(self.n_bits, dtype=np.float32)

        if self.use_rdkit and self.generator is not None:
            mol = Chem.MolFromSmiles(smiles)
            if mol is not None:
                bv = self.generator.GetFingerprint(mol)
                arr = np.zeros((self.n_bits,), dtype=np.int8)
                DataStructs.ConvertToNumpyArray(bv, arr)
                return arr.astype(np.float32)

        # Fallback circular n-gram path hasher
        arr = np.zeros(self.n_bits, dtype=np.float32)
        clean = self.parser.canonicalize(smiles)
        for k in range(2, min(len(clean) + 1, 6)):
            for i in range(len(clean) - k + 1):
                sub = clean[i:i + k]
                idx = int(hashlib.md5(sub.encode("utf-8")).hexdigest(), 16) % self.n_bits
                arr[idx] = 1.0
        return arr

    @staticmethod
    def tanimoto_similarity(fp1: np.ndarray, fp2: np.ndarray) -> float:
        """Computes Tanimoto coefficient between two binary or continuous fingerprint vectors."""
        dot = float(np.dot(fp1, fp2))
        sum1 = float(np.sum(fp1))
        sum2 = float(np.sum(fp2))
        denom = sum1 + sum2 - dot
        if denom <= 0:
            return 0.0
        return float(np.clip(dot / denom, 0.0, 1.0))

    @staticmethod
    def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
        """Computes cosine similarity between two dense vectors."""
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return float(np.clip(np.dot(v1, v2) / (norm1 * norm2), -1.0, 1.0))

