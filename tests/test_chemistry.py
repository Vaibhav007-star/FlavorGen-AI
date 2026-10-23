"""
Unit Tests for Cheminformatics Modules: SMILES parsing, Descriptors, Fingerprints, and Fallback.
"""

import pytest
import numpy as np
from ml.chemistry.smiles_parser import SMILESParser
from ml.chemistry.descriptors import MolecularDescriptorCalculator
from ml.chemistry.fingerprints import MolecularFingerprinter
from backend.app.core.constants import MOLECULAR_PROPERTY_KEYS


class TestCheminformatics:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.parser = SMILESParser()
        self.desc_calc = MolecularDescriptorCalculator()
        self.fingerprinter = MolecularFingerprinter(n_bits=256, radius=2)

    def test_smiles_validation(self):
        # Valid aroma molecules
        assert self.parser.is_valid("O=Cc1cc(OC)c(O)cc1")  # Vanillin
        assert self.parser.is_valid("CCCC(=O)OCC")        # Ethyl butyrate
        assert self.parser.is_valid("CC1=CCC(C(C)=C)CC1")  # Limonene
        
        # Invalid inputs
        assert not self.parser.is_valid("")
        assert not self.parser.is_valid("XYZ123!@#")

    def test_canonicalization(self):
        s1 = "CCCC(=O)OCC"
        canon = self.parser.canonicalize(s1)
        assert canon != ""
        assert "O" in canon and "C" in canon

    def test_functional_group_detection(self):
        ester_groups = self.parser.detect_functional_groups("CCCC(=O)OCC")
        assert ester_groups["ester"] is True

        aldehyde_groups = self.parser.detect_functional_groups("O=Cc1ccccc1")
        assert aldehyde_groups["aldehyde"] is True
        assert aldehyde_groups["aromatic_ring"] is True

    def test_molecular_descriptors(self):
        vanillin_smiles = "O=Cc1cc(OC)c(O)cc1"
        props = self.desc_calc.calculate(vanillin_smiles)
        
        for k in MOLECULAR_PROPERTY_KEYS:
            assert k in props
            assert isinstance(props[k], (int, float))

        # Check reasonable physical bounds for Vanillin (MW ~ 152.15 g/mol)
        assert 140.0 < props["molecular_weight"] < 160.0
        assert props["aromatic_rings"] >= 1.0
        assert props["h_bond_donors"] >= 1.0
        assert props["volatility_index"] > 0.0

    def test_fingerprint_generation(self):
        fp = self.fingerprinter.generate_fingerprint("CCCC(=O)OCC")
        assert isinstance(fp, np.ndarray)
        assert fp.shape == (256,)
        assert np.sum(fp) > 0  # Should have set bits

    def test_tanimoto_similarity(self):
        fp_ethyl_butyrate = self.fingerprinter.generate_fingerprint("CCCC(=O)OCC")
        fp_isoamyl_acetate = self.fingerprinter.generate_fingerprint("CC(=O)OCCC(C)C")
        fp_caffeine = self.fingerprinter.generate_fingerprint("Cn1cnc2c1c(=O)n(C)c(=O)n2C")

        sim_esters = self.fingerprinter.tanimoto_similarity(fp_ethyl_butyrate, fp_isoamyl_acetate)
        sim_caffeine = self.fingerprinter.tanimoto_similarity(fp_ethyl_butyrate, fp_caffeine)

        # Related fruity aliphatic esters should have higher chemical similarity than caffeine
        assert sim_esters > sim_caffeine
        assert 0.0 <= sim_esters <= 1.0

