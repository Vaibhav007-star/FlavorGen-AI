"""
Scientific Dataset Builder: Curates verified chemical volatiles, taste actives,
and ingredient mappings based on Flavornet, FooDB, and sensory chemistry literature.
"""

import json
from pathlib import Path
from backend.app.core.constants import AROMA_DESCRIPTORS, FLAVOR_DESCRIPTORS, ProvenanceLevel

DATA_DIR = Path(__file__).resolve().parent

# Curated list of verified flavor & aroma molecules
SCIENTIFIC_COMPOUNDS = [
    {
        "name": "Vanillin",
        "smiles": "O=Cc1cc(OC)c(O)cc1",
        "cas": "121-33-5",
        "pubchem_cid": 1183,
        "chemical_class": "Phenolic Aldehyde",
        "odor_threshold_ug_l": 20.0,
        "descriptors": ["vanilla", "sweet", "creamy", "warm", "balsamic"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Ethyl butyrate",
        "smiles": "CCCC(=O)OCC",
        "cas": "105-54-4",
        "pubchem_cid": 7762,
        "chemical_class": "Ester",
        "odor_threshold_ug_l": 1.0,
        "descriptors": ["fruity", "strawberry", "pineapple", "sweet", "fresh"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Linalool",
        "smiles": "CC(=CCCC(C)(O)C=C)C",
        "cas": "78-70-6",
        "pubchem_cid": 6549,
        "chemical_class": "Monoterpene Alcohol",
        "odor_threshold_ug_l": 6.0,
        "descriptors": ["floral", "citrus", "lavender", "sweet", "woody"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "D-Limonene",
        "smiles": "CC1=CCC(C(C)=C)CC1",
        "cas": "5989-27-5",
        "pubchem_cid": 440917,
        "chemical_class": "Monoterpene Hydrocarbon",
        "odor_threshold_ug_l": 10.0,
        "descriptors": ["citrus", "orange", "fresh", "sweet"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Furaneol (Strawberry Furanone)",
        "smiles": "CC1=C(O)C(=O)C(C)(O1)C",
        "cas": "3658-77-3",
        "pubchem_cid": 19309,
        "chemical_class": "Furanone",
        "odor_threshold_ug_l": 0.05,
        "descriptors": ["caramel", "sweet", "cotton candy", "strawberry", "fruity", "cooked"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Eugenol",
        "smiles": "COc1cc(CC=C)ccc1O",
        "cas": "97-53-0",
        "pubchem_cid": 3314,
        "chemical_class": "Phenylpropanoid",
        "odor_threshold_ug_l": 6.0,
        "descriptors": ["spicy", "clove", "woody", "warm", "pungent"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Cinnamaldehyde",
        "smiles": "O=CC=Cc1ccccc1",
        "cas": "104-55-2",
        "pubchem_cid": 637511,
        "chemical_class": "Aromatic Aldehyde",
        "odor_threshold_ug_l": 50.0,
        "descriptors": ["spicy", "cinnamon", "warm", "sweet"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "L-Menthol",
        "smiles": "CC(C)C1CCC(C)CC1O",
        "cas": "2216-51-5",
        "pubchem_cid": 16654,
        "chemical_class": "Monoterpene Alcohol",
        "odor_threshold_ug_l": 40.0,
        "descriptors": ["cooling", "fresh", "minty", "herbal"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Isoamyl acetate",
        "smiles": "CC(=O)OCCC(C)C",
        "cas": "123-92-2",
        "pubchem_cid": 31276,
        "chemical_class": "Ester",
        "odor_threshold_ug_l": 2.0,
        "descriptors": ["fruity", "banana", "sweet", "pear"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "2-Isobutyl-3-methoxypyrazine",
        "smiles": "COc1ncc(CC(C)C)nc1",
        "cas": "24683-00-9",
        "pubchem_cid": 32594,
        "chemical_class": "Alkylpyrazine",
        "odor_threshold_ug_l": 0.002,
        "descriptors": ["earthy", "green", "bell pepper", "vegetal", "pea"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "2-Ethyl-3,5-dimethylpyrazine",
        "smiles": "CCc1ncc(C)nc1C",
        "cas": "27040-75-2",
        "pubchem_cid": 33967,
        "chemical_class": "Pyrazine",
        "odor_threshold_ug_l": 0.01,
        "descriptors": ["roasted", "nutty", "coffee", "cocoa", "toasty"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Delta-Decalactone",
        "smiles": "CCCCCC1CCCC(=O)O1",
        "cas": "705-86-2",
        "pubchem_cid": 12810,
        "chemical_class": "Lactone",
        "odor_threshold_ug_l": 10.0,
        "descriptors": ["creamy", "peach", "coconut", "milky", "buttery"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Hexanal",
        "smiles": "CCCCCC=O",
        "cas": "66-25-1",
        "pubchem_cid": 6184,
        "chemical_class": "Aliphatic Aldehyde",
        "odor_threshold_ug_l": 5.0,
        "descriptors": ["green", "grassy", "fresh", "leafy", "apple"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Citral (Neral/Geranial)",
        "smiles": "CC(=CCCC(C)=CC=O)C",
        "cas": "5392-40-5",
        "pubchem_cid": 638011,
        "chemical_class": "Monoterpene Aldehyde",
        "odor_threshold_ug_l": 30.0,
        "descriptors": ["citrus", "lemon", "crisp", "fresh"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Dimethyl sulfide",
        "smiles": "CSC",
        "cas": "75-18-3",
        "pubchem_cid": 1068,
        "chemical_class": "Sulfide",
        "odor_threshold_ug_l": 1.0,
        "descriptors": ["sulfuric", "cabbage", "corn", "pungent", "marine"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Citric acid",
        "smiles": "OC(=O)CC(O)(CC(=O)O)C(=O)O",
        "cas": "77-92-9",
        "pubchem_cid": 311,
        "chemical_class": "Tricarboxylic Acid",
        "odor_threshold_ug_l": 100000.0,
        "descriptors": ["sour", "acidic", "tart", "crisp"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Sucrose",
        "smiles": "OCC1OC(OC2(CO)OC(CO)C(O)C2O)C(O)C(O)C1O",
        "cas": "57-50-1",
        "pubchem_cid": 5988,
        "chemical_class": "Disaccharide",
        "odor_threshold_ug_l": 500000.0,
        "descriptors": ["sweet", "sugary", "clean"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Caffeine",
        "smiles": "Cn1cnc2c1c(=O)n(C)c(=O)n2C",
        "cas": "58-08-2",
        "pubchem_cid": 2519,
        "chemical_class": "Purine Alkaloid",
        "odor_threshold_ug_l": 200000.0,
        "descriptors": ["bitter", "astringent", "tonic"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Sodium chloride",
        "smiles": "[Na+].[Cl-]",
        "cas": "7647-14-5",
        "pubchem_cid": 5234,
        "chemical_class": "Inorganic Salt",
        "odor_threshold_ug_l": 500000.0,
        "descriptors": ["salty", "mineral", "saline"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Monosodium glutamate",
        "smiles": "OC(=O)CCC(N)C(=O)O.[Na+]",
        "cas": "142-47-2",
        "pubchem_cid": 23689119,
        "chemical_class": "Amino Acid Salt",
        "odor_threshold_ug_l": 300000.0,
        "descriptors": ["umami", "savory", "brothy"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Diacetyl (2,3-Butanedione)",
        "smiles": "CC(=O)C(=O)C",
        "cas": "431-03-8",
        "pubchem_cid": 650,
        "chemical_class": "Diketone",
        "odor_threshold_ug_l": 2.0,
        "descriptors": ["creamy", "buttery", "dairy", "sweet"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Capsaicin",
        "smiles": "CC(C)/C=C/CCCCCC(=O)NCC1=CC(=C(C=C1)O)OC",
        "cas": "404-86-4",
        "pubchem_cid": 1548943,
        "chemical_class": "Capsaicinoid",
        "odor_threshold_ug_l": 100000.0,
        "descriptors": ["pungent", "burning", "spicy", "hot"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Epigallocatechin gallate (EGCG)",
        "smiles": "Oc1cc(O)c2c(c1)OC(c1cc(O)c(O)c(O)c1)C(OC(=O)c1cc(O)c(O)c(O)c1)C2",
        "cas": "989-51-5",
        "pubchem_cid": 65064,
        "chemical_class": "Polyphenol Flavonol",
        "odor_threshold_ug_l": 500000.0,
        "descriptors": ["astringent", "bitter", "dry", "tannic"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    },
    {
        "name": "Ethyl maltol",
        "smiles": "CCc1coc(=O)c(O)c1",
        "cas": "4940-11-8",
        "pubchem_cid": 21059,
        "chemical_class": "Pyranone",
        "odor_threshold_ug_l": 10.0,
        "descriptors": ["caramel", "sweet", "cotton candy", "fruity"],
        "aroma_vector": {d: 0.0 for d in AROMA_DESCRIPTORS},
        "flavor_vector": {d: 0.0 for d in FLAVOR_DESCRIPTORS},
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    }
]

# Populate explicit normalized sensory vectors for calibrated molecules
AROMA_CALIBRATIONS = {
    "Vanillin": {"creamy_vanilla": 0.95, "caramel_sweet": 0.60, "woody": 0.20},
    "Ethyl butyrate": {"fruity": 0.95, "fresh_cooling": 0.25, "caramel_sweet": 0.20},
    "Linalool": {"floral": 0.90, "citrus": 0.40, "woody": 0.25, "fresh_cooling": 0.30},
    "D-Limonene": {"citrus": 0.95, "fresh_cooling": 0.45, "fruity": 0.20},
    "Furaneol (Strawberry Furanone)": {"caramel_sweet": 0.95, "fruity": 0.85, "roasted_nutty": 0.25},
    "Eugenol": {"spicy": 0.95, "woody": 0.50, "earthy": 0.20},
    "Cinnamaldehyde": {"spicy": 0.95, "caramel_sweet": 0.40, "woody": 0.35},
    "L-Menthol": {"fresh_cooling": 0.95, "green_herbal": 0.40},
    "Isoamyl acetate": {"fruity": 0.95, "caramel_sweet": 0.30},
    "2-Isobutyl-3-methoxypyrazine": {"earthy": 0.90, "green_herbal": 0.85},
    "2-Ethyl-3,5-dimethylpyrazine": {"roasted_nutty": 0.95, "earthy": 0.45, "woody": 0.30},
    "Delta-Decalactone": {"creamy_vanilla": 0.90, "fruity": 0.60, "caramel_sweet": 0.35},
    "Hexanal": {"green_herbal": 0.90, "fresh_cooling": 0.40, "fruity": 0.20},
    "Citral (Neral/Geranial)": {"citrus": 0.95, "green_herbal": 0.35, "fresh_cooling": 0.30},
    "Dimethyl sulfide": {"sulfuric_pungent": 0.95, "earthy": 0.30},
    "Diacetyl (2,3-Butanedione)": {"creamy_vanilla": 0.90, "caramel_sweet": 0.40},
    "Ethyl maltol": {"caramel_sweet": 0.95, "fruity": 0.40}
}

FLAVOR_CALIBRATIONS = {
    "Vanillin": {"sweet": 0.70, "creamy_mouthfeel": 0.65},
    "Ethyl butyrate": {"sweet": 0.50, "fruity": 0.80, "acidic_crisp": 0.30},
    "Citric acid": {"sour": 0.95, "acidic_crisp": 0.90},
    "Sucrose": {"sweet": 1.00},
    "Caffeine": {"bitter": 0.90, "astringent": 0.40},
    "Sodium chloride": {"salty": 1.00},
    "Monosodium glutamate": {"umami": 0.95, "salty": 0.30},
    "L-Menthol": {"cooling": 0.95, "acidic_crisp": 0.20},
    "Capsaicin": {"pungent": 1.00},
    "Epigallocatechin gallate (EGCG)": {"astringent": 0.95, "bitter": 0.80},
    "Diacetyl (2,3-Butanedione)": {"creamy_mouthfeel": 0.85, "sweet": 0.30},
    "Furaneol (Strawberry Furanone)": {"sweet": 0.80, "creamy_mouthfeel": 0.25}
}

# Apply calibrations
for comp in SCIENTIFIC_COMPOUNDS:
    name = comp["name"]
    if name in AROMA_CALIBRATIONS:
        for k, v in AROMA_CALIBRATIONS[name].items():
            comp["aroma_vector"][k] = v
    if name in FLAVOR_CALIBRATIONS:
        for k, v in FLAVOR_CALIBRATIONS[name].items():
            comp["flavor_vector"][k] = v

# Curated Scientific Ingredients with Compositional Breakdown
SCIENTIFIC_INGREDIENTS = [
    {
        "name": "Strawberry",
        "category": "Fruit",
        "botanical_name": "Fragaria × ananassa",
        "description": "Sweet, fragrant red berry characterized by key volatiles furaneol and ethyl butyrate.",
        "constituent_compounds": [
            {"compound_name": "Furaneol (Strawberry Furanone)", "concentration_mg_kg": 25.0, "role": "Key character impact furanone"},
            {"compound_name": "Ethyl butyrate", "concentration_mg_kg": 8.0, "role": "Top-note fruity ester"},
            {"compound_name": "Hexanal", "concentration_mg_kg": 3.5, "role": "Fresh green top note"},
            {"compound_name": "Linalool", "concentration_mg_kg": 1.2, "role": "Floral background note"},
            {"compound_name": "Citric acid", "concentration_mg_kg": 8500.0, "role": "Primary acidulant"},
            {"compound_name": "Sucrose", "concentration_mg_kg": 45000.0, "role": "Natural sweetness"}
        ]
    },
    {
        "name": "Vanilla Extract",
        "category": "Spice / Botanical",
        "botanical_name": "Vanilla planifolia",
        "description": "Aromatic extract derived from cured vanilla pods dominated by 4-hydroxy-3-methoxybenzaldehyde.",
        "constituent_compounds": [
            {"compound_name": "Vanillin", "concentration_mg_kg": 1500.0, "role": "Primary characteristic phenolic"},
            {"compound_name": "Delta-Decalactone", "concentration_mg_kg": 12.0, "role": "Creamy lactone nuance"},
            {"compound_name": "Ethyl maltol", "concentration_mg_kg": 5.0, "role": "Sweet caramel background"},
            {"compound_name": "Sucrose", "concentration_mg_kg": 10000.0, "role": "Carrier sugar"}
        ]
    },
    {
        "name": "Lemon Peel",
        "category": "Citrus",
        "botanical_name": "Citrus limon",
        "description": "Zesty citrus peel rich in monoterpenes and citral providing bright, sparkling aroma.",
        "constituent_compounds": [
            {"compound_name": "D-Limonene", "concentration_mg_kg": 65000.0, "role": "Major terpene carrier (65-70%)"},
            {"compound_name": "Citral (Neral/Geranial)", "concentration_mg_kg": 2500.0, "role": "Key characteristic lemon impact"},
            {"compound_name": "Linalool", "concentration_mg_kg": 450.0, "role": "Floral citrus modifier"},
            {"compound_name": "Citric acid", "concentration_mg_kg": 12000.0, "role": "Crisp tartness"}
        ]
    },
    {
        "name": "Roasted Coffee",
        "category": "Beverage / Roasted",
        "botanical_name": "Coffea arabica",
        "description": "Complex thermal roast profile resulting from Maillard reactions and Strecker degradations.",
        "constituent_compounds": [
            {"compound_name": "2-Ethyl-3,5-dimethylpyrazine", "concentration_mg_kg": 15.0, "role": "Roasty nutty pyrazine"},
            {"compound_name": "Furaneol (Strawberry Furanone)", "concentration_mg_kg": 8.0, "role": "Caramelized sugar note"},
            {"compound_name": "Caffeine", "concentration_mg_kg": 12000.0, "role": "Characteristic bitter alkaloid"},
            {"compound_name": "Citric acid", "concentration_mg_kg": 2500.0, "role": "Bright coffee acidity"}
        ]
    },
    {
        "name": "Peppermint",
        "category": "Herb",
        "botanical_name": "Mentha × piperita",
        "description": "Pungent, refreshing aromatic herb providing distinct TRPM8 receptor cooling.",
        "constituent_compounds": [
            {"compound_name": "L-Menthol", "concentration_mg_kg": 28000.0, "role": "Primary cooling monoterpene"},
            {"compound_name": "Linalool", "concentration_mg_kg": 120.0, "role": "Floral background note"},
            {"compound_name": "Hexanal", "concentration_mg_kg": 80.0, "role": "Herbal green nuance"}
        ]
    },
    {
        "name": "Cinnamon",
        "category": "Spice",
        "botanical_name": "Cinnamomum verum",
        "description": "Warm, pungent spice bark rich in cinnamaldehyde and eugenol.",
        "constituent_compounds": [
            {"compound_name": "Cinnamaldehyde", "concentration_mg_kg": 18000.0, "role": "Primary spicy aroma impact"},
            {"compound_name": "Eugenol", "concentration_mg_kg": 1200.0, "role": "Warm woody clove modifier"},
            {"compound_name": "Linalool", "concentration_mg_kg": 300.0, "role": "Sweet floral floral lift"}
        ]
    },
    {
        "name": "Dark Chocolate (70%)",
        "category": "Confectionery",
        "botanical_name": "Theobroma cacao",
        "description": "Rich roasted fermented cocoa mass with pronounced bitter, roasty, and creamy notes.",
        "constituent_compounds": [
            {"compound_name": "2-Ethyl-3,5-dimethylpyrazine", "concentration_mg_kg": 22.0, "role": "Roasty nutty cocoa note"},
            {"compound_name": "Caffeine", "concentration_mg_kg": 800.0, "role": "Bitterness stimulant"},
            {"compound_name": "Vanillin", "concentration_mg_kg": 45.0, "role": "Round vanilla smoothing"},
            {"compound_name": "Delta-Decalactone", "concentration_mg_kg": 10.0, "role": "Cocoa butter creaminess"},
            {"compound_name": "Epigallocatechin gallate (EGCG)", "concentration_mg_kg": 3500.0, "role": "Polyphenolic astringency"}
        ]
    },
    {
        "name": "Green Tea",
        "category": "Beverage / Herb",
        "botanical_name": "Camellia sinensis",
        "description": "Steamed unfermented tea leaves with high catechin polyphenols and clean grassy notes.",
        "constituent_compounds": [
            {"compound_name": "Epigallocatechin gallate (EGCG)", "concentration_mg_kg": 42000.0, "role": "Astringent antioxidant catechin"},
            {"compound_name": "Caffeine", "concentration_mg_kg": 15000.0, "role": "Brisk bitterness"},
            {"compound_name": "Hexanal", "concentration_mg_kg": 15.0, "role": "Fresh leafy green top-note"},
            {"compound_name": "Linalool", "concentration_mg_kg": 8.0, "role": "Floral floral accent"},
            {"compound_name": "Monosodium glutamate", "concentration_mg_kg": 2500.0, "role": "Natural theanine umami equivalent"}
        ]
    },
    {
        "name": "Fresh Butter",
        "category": "Dairy",
        "botanical_name": "Bos taurus (Milk Fat)",
        "description": "Rich dairy emulsion dominated by diacetyl and short-chain fatty acid lactones.",
        "constituent_compounds": [
            {"compound_name": "Diacetyl (2,3-Butanedione)", "concentration_mg_kg": 8.0, "role": "Primary buttery aroma impact"},
            {"compound_name": "Delta-Decalactone", "concentration_mg_kg": 18.0, "role": "Creamy mouthfeel and dairy roundness"},
            {"compound_name": "Vanillin", "concentration_mg_kg": 0.5, "role": "Sweet trace background"}
        ]
    },
    {
        "name": "Bell Pepper",
        "category": "Vegetable",
        "botanical_name": "Capsicum annuum",
        "description": "Crisp vegetable with extraordinarily low odor threshold pyrazines.",
        "constituent_compounds": [
            {"compound_name": "2-Isobutyl-3-methoxypyrazine", "concentration_mg_kg": 0.15, "role": "Potent character impact pyrazine (OT: 0.002 ug/L)"},
            {"compound_name": "Hexanal", "concentration_mg_kg": 12.0, "role": "Grassy crisp note"},
            {"compound_name": "Citric acid", "concentration_mg_kg": 1500.0, "role": "Mild vegetal acidity"}
        ]
    }
]


def build_and_save():
    compounds_path = DATA_DIR / "scientific_compounds.json"
    ingredients_path = DATA_DIR / "scientific_ingredients.json"

    with open(compounds_path, "w", encoding="utf-8") as f:
        json.dump(SCIENTIFIC_COMPOUNDS, f, indent=2)

    with open(ingredients_path, "w", encoding="utf-8") as f:
        json.dump(SCIENTIFIC_INGREDIENTS, f, indent=2)

    print(f"Saved {len(SCIENTIFIC_COMPOUNDS)} scientific compounds to {compounds_path}")
    print(f"Saved {len(SCIENTIFIC_INGREDIENTS)} scientific ingredients to {ingredients_path}")


if __name__ == "__main__":
    build_and_save()

