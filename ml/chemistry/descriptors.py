"""
Physicochemical Molecular Descriptors for Aroma and Flavor Science.
Calculates Lipinski-style properties, polar surface area, and volatility indices.
"""

import math
from typing import Dict, Any, List
import numpy as np

try:
    from rdkit import Chem
    from rdkit.Chem import Descriptors, Crippen, rdMolDescriptors
    RDKIT_AVAILABLE = True
except ImportError:
    RDKIT_AVAILABLE = False

from backend.app.core.constants import MOLECULAR_PROPERTY_KEYS
from ml.chemistry.smiles_parser import SMILESParser, ATOMIC_WEIGHTS


class MolecularDescriptorCalculator:
    """Computes relevant physicochemical and sensory-volatility descriptors."""

    def __init__(self, use_rdkit: bool = True):
        self.use_rdkit = use_rdkit and RDKIT_AVAILABLE
        self.parser = SMILESParser(use_rdkit=self.use_rdkit)

    def calculate(self, smiles: str) -> Dict[str, float]:
        """Calculates normalized descriptor dictionary for a given SMILES string."""
        if not self.parser.is_valid(smiles):
            return {k: 0.0 for k in MOLECULAR_PROPERTY_KEYS}

        if self.use_rdkit:
            mol = Chem.MolFromSmiles(smiles)
            if mol is not None:
                mw = float(Descriptors.MolWt(mol))
                logp = float(Crippen.MolLogP(mol))
                tpsa = float(Descriptors.TPSA(mol))
                hbd = float(rdMolDescriptors.CalcNumHBD(mol))
                hba = float(rdMolDescriptors.CalcNumHBA(mol))
                rotb = float(Descriptors.NumRotatableBonds(mol))
                arom = float(rdMolDescriptors.CalcNumAromaticRings(mol))
                heavy = float(mol.GetNumHeavyAtoms())
                
                # Volatility Index: higher for low-MW, low-TPSA volatile aroma compounds
                volatility = float(np.clip(100.0 / (math.sqrt(max(1.0, mw)) * (1.0 + tpsa / 30.0)), 0.01, 10.0))

                return {
                    "molecular_weight": round(mw, 3),
                    "logp": round(logp, 3),
                    "tpsa": round(tpsa, 3),
                    "h_bond_donors": hbd,
                    "h_bond_acceptors": hba,
                    "rotatable_bonds": rotb,
                    "aromatic_rings": arom,
                    "heavy_atom_count": heavy,
                    "volatility_index": round(volatility, 3)
                }

        # Fallback estimation
        counts = self.parser.get_atom_counts(smiles)
        mw = sum(counts.get(elem, 0) * weight for elem, weight in ATOMIC_WEIGHTS.items())
        heavy = sum(counts.get(elem, 0) for elem in ATOMIC_WEIGHTS if elem != "H")
        o_count = counts.get("O", 0)
        n_count = counts.get("N", 0)
        hba = float(o_count + n_count)
        hbd = float(min(counts.get("H", 0), o_count))
        tpsa = float(o_count * 15.0 + n_count * 20.0)
        logp = float(0.2 * counts.get("C", 0) - 0.4 * o_count - 0.3 * n_count)
        rotb = float(max(0, counts.get("C", 0) - 3))
        arom = 1.0 if any(c.islower() for c in smiles) else 0.0
        volatility = float(np.clip(100.0 / (math.sqrt(max(1.0, mw)) * (1.0 + tpsa / 30.0)), 0.01, 10.0))

        return {
            "molecular_weight": round(mw, 3),
            "logp": round(logp, 3),
            "tpsa": round(tpsa, 3),
            "h_bond_donors": hbd,
            "h_bond_acceptors": hba,
            "rotatable_bonds": rotb,
            "aromatic_rings": arom,
            "heavy_atom_count": float(heavy),
            "volatility_index": round(volatility, 3)
        }

    def to_vector(self, smiles: str) -> np.ndarray:
        """Returns ordered numpy array of descriptors."""
        props = self.calculate(smiles)
        return np.array([props[k] for k in MOLECULAR_PROPERTY_KEYS], dtype=np.float32)

