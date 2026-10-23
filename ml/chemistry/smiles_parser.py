"""
Cheminformatics SMILES Parser and Molecular Structure Validator.
Supports RDKit with pure-Python deterministic fallback.
"""

import re
from typing import Optional, Dict, Any, Tuple

try:
    from rdkit import Chem
    from rdkit.Chem import Descriptors, AllChem
    RDKIT_AVAILABLE = True
except ImportError:
    RDKIT_AVAILABLE = False


# Canonical atomic weights for fallback MW calculation
ATOMIC_WEIGHTS = {
    "C": 12.011, "H": 1.008, "O": 15.999, "N": 14.007,
    "S": 32.065, "P": 30.974, "F": 18.998, "Cl": 35.453,
    "Br": 79.904, "I": 126.904
}


class SMILESParser:
    """Parses chemical SMILES strings, standardizes them, and extracts chemical structures."""

    def __init__(self, use_rdkit: bool = True):
        self.use_rdkit = use_rdkit and RDKIT_AVAILABLE

    def is_valid(self, smiles: str) -> bool:
        """Checks if a SMILES string is valid."""
        if not smiles or not isinstance(smiles, str):
            return False
        smiles = smiles.strip()
        if not smiles:
            return False
            
        if self.use_rdkit:
            mol = Chem.MolFromSmiles(smiles)
            return mol is not None
            
        # Basic heuristic validation for fallback
        valid_chars = set("CONSPFClBrIconsp#=()-+1234567890/\\@[]")
        return all(c in valid_chars for c in smiles)

    def canonicalize(self, smiles: str) -> str:
        """Returns canonical SMILES representation."""
        if not smiles:
            return ""
        smiles = smiles.strip()
        if self.use_rdkit:
            mol = Chem.MolFromSmiles(smiles)
            if mol is not None:
                return Chem.MolToSmiles(mol)
        return smiles

    def get_atom_counts(self, smiles: str) -> Dict[str, int]:
        """Calculates element counts from molecular structure or formula approximation."""
        counts = {elem: 0 for elem in ATOMIC_WEIGHTS}
        if self.use_rdkit:
            mol = Chem.MolFromSmiles(smiles)
            if mol:
                mol = Chem.AddHs(mol)
                for atom in mol.GetAtoms():
                    sym = atom.GetSymbol()
                    if sym in counts:
                        counts[sym] += 1
                return counts
        
        # Fallback element scanner from SMILES string
        tokens = re.findall(r"Cl|Br|[CNOPSFIcnos]", smiles)
        for t in tokens:
            sym = t.upper()
            if sym in counts:
                counts[sym] += 1
        # Approximate hydrogens based on typical valency
        c = counts["C"]
        counts["H"] = max(0, int(2 * c + 2 - (counts["O"] + counts["N"])))
        return counts

    def detect_functional_groups(self, smiles: str) -> Dict[str, bool]:
        """Identifies key aroma/flavor pharmacophore functional groups."""
        groups = {
            "ester": False,
            "aldehyde": False,
            "ketone": False,
            "alcohol": False,
            "phenol": False,
            "carboxylic_acid": False,
            "lactone": False,
            "pyrazine": False,
            "thiol": False,
            "furan": False,
            "terpene_chain": False,
            "aromatic_ring": False
        }

        if self.use_rdkit:
            mol = Chem.MolFromSmiles(smiles)
            if mol:
                smart_patterns = {
                    "ester": "[#6][CX3](=O)[OX2H0][#6]",
                    "aldehyde": "[CX3H1](=O)[#6]",
                    "ketone": "[#6][CX3](=O)[#6]",
                    "alcohol": "[#6][OX2H]",
                    "phenol": "c[OX2H]",
                    "carboxylic_acid": "[CX3](=O)[OX2H1]",
                    "lactone": "[#6]1[#6]~[#6]~[#6](=O)O1",
                    "pyrazine": "n1ccncc1",
                    "thiol": "[#6][SX2H]",
                    "furan": "o1cccc1",
                }
                for name, smarts in smart_patterns.items():
                    patt = Chem.MolFromSmarts(smarts)
                    if patt and mol.HasSubstructMatch(patt):
                        groups[name] = True
                
                # Check aromatic rings
                groups["aromatic_ring"] = any(atom.GetIsAromatic() for atom in mol.GetAtoms())
                # Check terpene chain (heuristic: hydrocarbons/alcohols with C10/C15 isoprenoid motifs)
                c_count = sum(1 for atom in mol.GetAtoms() if atom.GetSymbol() == "C")
                if c_count in (10, 15, 20):
                    groups["terpene_chain"] = True
                return groups

        # Regex fallback for functional patterns
        s = smiles.upper()
        if "C(=O)OC" in smiles or "C(=O)OCC" in smiles:
            groups["ester"] = True
        if "C=O" in smiles or "O=C" in smiles or "C(=O)H" in smiles:
            groups["aldehyde"] = True
        if "CCO" in smiles or "CO" in smiles:
            groups["alcohol"] = True
        if "C(=O)O" in smiles:
            groups["carboxylic_acid"] = True
        if "SH" in smiles:
            groups["thiol"] = True
        if any(c.islower() for c in smiles):
            groups["aromatic_ring"] = True
            
        return groups

