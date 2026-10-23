"""
Scientific Constants, Standard Sensory Lexicons, and Scientific Disclaimers.
"""

from typing import List, Dict

# Standard 12-Dimensional Aroma Lexicon (aligned with Flavornet, Leffingwell, and Dravnieks Atlas)
AROMA_DESCRIPTORS: List[str] = [
    "fruity",           # Esters (e.g., ethyl butyrate, isoamyl acetate)
    "floral",           # Terpene alcohols, aldehydes (e.g., linalool, geraniol)
    "citrus",           # Monoterpenes (e.g., limonene, citral)
    "woody",            # Sesquiterpenes, aromatics (e.g., cedrol, santalol)
    "spicy",            # Phenylpropanoids (e.g., eugenol, cinnamaldehyde)
    "earthy",           # Alkylpyrazines, geosmin (e.g., 2-isobutyl-3-methoxypyrazine)
    "creamy_vanilla",   # Lactones, phenols (e.g., vanillin, delta-decalactone)
    "roasted_nutty",    # Pyrazines, furans (e.g., 2-ethyl-3,5-dimethylpyrazine, furfuryl mercaptan)
    "green_herbal",     # C6 aldehydes, terpene hydrocarbons (e.g., hexanal, cis-3-hexenol)
    "caramel_sweet",    # Furanones, maltol (e.g., furaneol, ethyl maltol)
    "sulfuric_pungent", # Thiols, disulfides (e.g., dimethyl sulfide, 4-MMP)
    "fresh_cooling",    # Monoterpenes, monoterpenols (e.g., menthol, eucalyptol)
]

# Standard 10-Dimensional Taste & Chemesthesis Lexicon
FLAVOR_DESCRIPTORS: List[str] = [
    "sweet",            # Sugars, polyols, glycosides (TAS1R2/TAS1R3)
    "sour",             # Organic acids: citric, malic, lactic (OTOP1 proton channel)
    "bitter",           # Alkaloids, glucosides, polyphenols (TAS2Rs)
    "salty",            # Sodium/potassium ions (ENaC)
    "umami",            # Glutamates, ribonucleotides (TAS1R1/TAS1R3)
    "astringent",       # Polyphenols, tannins precipitating salivary proline-rich proteins
    "pungent",          # Capsaicinoids, gingerols, isothiocyanates (TRPV1 / TRPA1)
    "cooling",          # Menthol, menthyl lactate (TRPM8 receptor)
    "creamy_mouthfeel", # Lipid emulsions, rheological fat-like coating
    "acidic_crisp",     # Retronasal effervescence and sharp tartness combination
]

# Data Provenance & Scientific Confidence Classification
class ProvenanceLevel:
    SCIENTIFIC_VALIDATED = "SCIENTIFIC_VALIDATED"       # Gas Chromatography-Olfactometry (GC-O) / Published human sensory panel
    EMPIRICAL_DERIVED = "EMPIRICAL_DERIVED"             # Calculated from constituent OAV (Odor Activity Values)
    COMPUTATIONAL_PREDICTED = "COMPUTATIONAL_PREDICTED" # Statistical / Machine Learning model inference
    DEMO_SIMULATED = "DEMO_SIMULATED"                   # Benchmark calibration profile for offline exploration

# Mandatory Scientific Disclaimer
SCIENTIFIC_DISCLAIMER = (
    "SCIENTIFIC NOTICE: All sensory profiles, odor intensity scores, and formulation candidates "
    "are computational estimations derived from cheminformatics features, statistical regression, "
    "and published flavor chemistry datasets (e.g., Flavornet, FooDB, DREAM Olfaction). "
    "Predictions do NOT constitute experimental sensory validation, toxicological clearance, "
    "edibility guarantees, or chemical synthesis protocols. Formulation suggestions must be "
    "validated by qualified food scientists and sensory panels in a controlled laboratory environment."
)

# Canonical Molecular Descriptor Names
MOLECULAR_PROPERTY_KEYS: List[str] = [
    "molecular_weight",
    "logp",
    "tpsa",
    "h_bond_donors",
    "h_bond_acceptors",
    "rotatable_bonds",
    "aromatic_rings",
    "heavy_atom_count",
    "volatility_index",
]

