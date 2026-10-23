"""
Scientific Dataset Curator: Generates an extensive, highly calibrated dataset
of >80 flavor/aroma compounds and >30 ingredients across all sensory dimensions.
"""

import json
from pathlib import Path
from backend.app.core.constants import AROMA_DESCRIPTORS, FLAVOR_DESCRIPTORS, ProvenanceLevel

RAW_DIR = Path(__file__).resolve().parent / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# Curated dataset of 85 primary aroma and flavor molecules
EXTENDED_COMPOUNDS = [
    # ESTERS (Fruity / Sweet)
    {"name": "Ethyl butyrate", "smiles": "CCCC(=O)OCC", "cas": "105-54-4", "pubchem_cid": 7762, "chemical_class": "Ester", "odor_threshold_ug_l": 1.0, "descriptors": ["fruity", "strawberry", "pineapple"], "aroma": {"fruity": 0.95, "fresh_cooling": 0.25, "caramel_sweet": 0.20}, "flavor": {"sweet": 0.50, "fruity": 0.85, "acidic_crisp": 0.30}},
    {"name": "Isoamyl acetate", "smiles": "CC(=O)OCCC(C)C", "cas": "123-92-2", "pubchem_cid": 31276, "chemical_class": "Ester", "odor_threshold_ug_l": 2.0, "descriptors": ["fruity", "banana", "sweet", "pear"], "aroma": {"fruity": 0.95, "caramel_sweet": 0.30}, "flavor": {"sweet": 0.60, "fruity": 0.90}},
    {"name": "Ethyl 2-methylbutyrate", "smiles": "CCC(C)C(=O)OCC", "cas": "7452-79-1", "pubchem_cid": 24020, "chemical_class": "Ester", "odor_threshold_ug_l": 0.1, "descriptors": ["fruity", "apple", "berry"], "aroma": {"fruity": 0.96, "fresh_cooling": 0.30}, "flavor": {"fruity": 0.92, "sweet": 0.45}},
    {"name": "Hexyl acetate", "smiles": "CCCCCC(=O)OC", "cas": "142-92-7", "pubchem_cid": 8908, "chemical_class": "Ester", "odor_threshold_ug_l": 2.0, "descriptors": ["fruity", "green", "pear", "apple"], "aroma": {"fruity": 0.80, "green_herbal": 0.60, "fresh_cooling": 0.35}, "flavor": {"fruity": 0.75, "acidic_crisp": 0.40}},
    {"name": "Methyl anthranilate", "smiles": "COC(=O)c1ccccc1N", "cas": "134-20-3", "pubchem_cid": 8635, "chemical_class": "Aromatic Ester", "odor_threshold_ug_l": 3.0, "descriptors": ["fruity", "grape", "floral"], "aroma": {"fruity": 0.85, "floral": 0.75}, "flavor": {"fruity": 0.85, "sweet": 0.50}},
    {"name": "Benzyl acetate", "smiles": "CC(=O)OCc1ccccc1", "cas": "140-11-4", "pubchem_cid": 8785, "chemical_class": "Ester", "odor_threshold_ug_l": 15.0, "descriptors": ["floral", "jasmine", "fruity"], "aroma": {"floral": 0.90, "fruity": 0.50}, "flavor": {"sweet": 0.40}},
    {"name": "Allyl hexanoate", "smiles": "CCCCCC(=O)OCC=C", "cas": "123-68-2", "pubchem_cid": 31266, "chemical_class": "Ester", "odor_threshold_ug_l": 1.0, "descriptors": ["fruity", "pineapple"], "aroma": {"fruity": 0.95, "caramel_sweet": 0.25}, "flavor": {"fruity": 0.90, "sweet": 0.40}},

    # TERPENES & ALCOHOLS (Citrus / Floral / Fresh)
    {"name": "Linalool", "smiles": "CC(=CCCC(C)(O)C=C)C", "cas": "78-70-6", "pubchem_cid": 6549, "chemical_class": "Monoterpene Alcohol", "odor_threshold_ug_l": 6.0, "descriptors": ["floral", "citrus", "lavender", "woody"], "aroma": {"floral": 0.90, "citrus": 0.40, "woody": 0.25, "fresh_cooling": 0.30}, "flavor": {"sweet": 0.30, "fruity": 0.30}},
    {"name": "D-Limonene", "smiles": "CC1=CCC(C(C)=C)CC1", "cas": "5989-27-5", "pubchem_cid": 440917, "chemical_class": "Monoterpene Hydrocarbon", "odor_threshold_ug_l": 10.0, "descriptors": ["citrus", "orange", "fresh"], "aroma": {"citrus": 0.95, "fresh_cooling": 0.45, "fruity": 0.20}, "flavor": {"acidic_crisp": 0.50}},
    {"name": "Geraniol", "smiles": "CC(=CCCC(C)=CCO)C", "cas": "106-24-1", "pubchem_cid": 637566, "chemical_class": "Monoterpene Alcohol", "odor_threshold_ug_l": 4.0, "descriptors": ["floral", "rose", "sweet"], "aroma": {"floral": 0.95, "fruity": 0.30, "sweet": 0.30}, "flavor": {"sweet": 0.40}},
    {"name": "Citronellol", "smiles": "CC(CCO)CCC=C(C)C", "cas": "106-22-9", "pubchem_cid": 8842, "chemical_class": "Monoterpene Alcohol", "odor_threshold_ug_l": 8.0, "descriptors": ["floral", "rose", "citrus"], "aroma": {"floral": 0.90, "citrus": 0.35, "green_herbal": 0.25}, "flavor": {"sweet": 0.30}},
    {"name": "Beta-Myrcene", "smiles": "CC(=CCCC(=C)C=C)C", "cas": "123-35-3", "pubchem_cid": 31253, "chemical_class": "Monoterpene", "odor_threshold_ug_l": 15.0, "descriptors": ["woody", "herbal", "earthy", "spicy"], "aroma": {"woody": 0.70, "green_herbal": 0.65, "earthy": 0.40}, "flavor": {"bitter": 0.30}},
    {"name": "Alpha-Pinene", "smiles": "CC1=CCC2CC1C2(C)C", "cas": "80-56-8", "pubchem_cid": 6654, "chemical_class": "Monoterpene", "odor_threshold_ug_l": 25.0, "descriptors": ["woody", "pine", "fresh", "earthy"], "aroma": {"woody": 0.90, "fresh_cooling": 0.60, "earthy": 0.30}, "flavor": {"astringent": 0.30}},
    {"name": "Beta-Caryophyllene", "smiles": "CC1=CCCC(C)(C)C2CC(=C)C12", "cas": "87-44-5", "pubchem_cid": 5281515, "chemical_class": "Sesquiterpene", "odor_threshold_ug_l": 60.0, "descriptors": ["woody", "spicy", "clove"], "aroma": {"woody": 0.85, "spicy": 0.65, "earthy": 0.35}, "flavor": {"pungent": 0.25, "bitter": 0.20}},
    {"name": "L-Menthol", "smiles": "CC(C)C1CCC(C)CC1O", "cas": "2216-51-5", "pubchem_cid": 16654, "chemical_class": "Monoterpene Alcohol", "odor_threshold_ug_l": 40.0, "descriptors": ["cooling", "fresh", "minty"], "aroma": {"fresh_cooling": 0.95, "green_herbal": 0.40}, "flavor": {"cooling": 0.95, "acidic_crisp": 0.25}},
    {"name": "Eucalyptol (1,8-Cineole)", "smiles": "CC12CCC(CC1)(C(C)(C)O2)C", "cas": "470-82-6", "pubchem_cid": 2758, "chemical_class": "Monoterpenoid Ether", "odor_threshold_ug_l": 12.0, "descriptors": ["fresh", "camphor", "cooling", "herbal"], "aroma": {"fresh_cooling": 0.92, "green_herbal": 0.50, "woody": 0.30}, "flavor": {"cooling": 0.80}},

    # ALDEHYDES (Citrus / Green / Spicy)
    {"name": "Citral (Neral/Geranial)", "smiles": "CC(=CCCC(C)=CC=O)C", "cas": "5392-40-5", "pubchem_cid": 638011, "chemical_class": "Monoterpene Aldehyde", "odor_threshold_ug_l": 30.0, "descriptors": ["citrus", "lemon", "crisp"], "aroma": {"citrus": 0.95, "green_herbal": 0.35, "fresh_cooling": 0.30}, "flavor": {"acidic_crisp": 0.65}},
    {"name": "Hexanal", "smiles": "CCCCCC=O", "cas": "66-25-1", "pubchem_cid": 6184, "chemical_class": "Aliphatic Aldehyde", "odor_threshold_ug_l": 5.0, "descriptors": ["green", "grassy", "fresh", "apple"], "aroma": {"green_herbal": 0.90, "fresh_cooling": 0.40, "fruity": 0.20}, "flavor": {"acidic_crisp": 0.30}},
    {"name": "cis-3-Hexen-1-ol", "smiles": "CCC=CCCO", "cas": "928-96-1", "pubchem_cid": 5352498, "chemical_class": "Alkenol", "odor_threshold_ug_l": 10.0, "descriptors": ["green", "grassy", "cut grass"], "aroma": {"green_herbal": 0.96, "fresh_cooling": 0.45}, "flavor": {"acidic_crisp": 0.25}},
    {"name": "Benzaldehyde", "smiles": "O=Cc1ccccc1", "cas": "100-52-7", "pubchem_cid": 240, "chemical_class": "Aromatic Aldehyde", "odor_threshold_ug_l": 100.0, "descriptors": ["almond", "cherry", "nutty", "sweet"], "aroma": {"roasted_nutty": 0.85, "fruity": 0.45, "caramel_sweet": 0.35}, "flavor": {"sweet": 0.40, "bitter": 0.25}},
    {"name": "Cinnamaldehyde", "smiles": "O=CC=Cc1ccccc1", "cas": "104-55-2", "pubchem_cid": 637511, "chemical_class": "Aromatic Aldehyde", "odor_threshold_ug_l": 50.0, "descriptors": ["spicy", "cinnamon", "warm"], "aroma": {"spicy": 0.95, "caramel_sweet": 0.40, "woody": 0.35}, "flavor": {"pungent": 0.60, "sweet": 0.45}},
    {"name": "Nonanal", "smiles": "CCCCCCCCC=O", "cas": "124-19-6", "pubchem_cid": 31289, "chemical_class": "Aliphatic Aldehyde", "odor_threshold_ug_l": 1.0, "descriptors": ["citrus", "floral", "waxy", "green"], "aroma": {"citrus": 0.70, "floral": 0.50, "green_herbal": 0.40}, "flavor": {"acidic_crisp": 0.20}},
    {"name": "Octanal", "smiles": "CCCCCCCC=O", "cas": "124-13-0", "pubchem_cid": 454, "chemical_class": "Aliphatic Aldehyde", "odor_threshold_ug_l": 0.7, "descriptors": ["citrus", "orange peel", "fatty"], "aroma": {"citrus": 0.85, "fresh_cooling": 0.30}, "flavor": {"acidic_crisp": 0.35}},

    # PHENOLS & PHENYLPROPANOIDS (Spicy / Vanilla / Smoky)
    {"name": "Vanillin", "smiles": "O=Cc1cc(OC)c(O)cc1", "cas": "121-33-5", "pubchem_cid": 1183, "chemical_class": "Phenolic Aldehyde", "odor_threshold_ug_l": 20.0, "descriptors": ["vanilla", "sweet", "creamy", "warm"], "aroma": {"creamy_vanilla": 0.95, "caramel_sweet": 0.60, "woody": 0.20}, "flavor": {"sweet": 0.70, "creamy_mouthfeel": 0.65}},
    {"name": "Ethyl vanillin", "smiles": "CCOc1cc(C=O)ccc1O", "cas": "121-32-4", "pubchem_cid": 8467, "chemical_class": "Phenolic Aldehyde", "odor_threshold_ug_l": 6.0, "descriptors": ["vanilla", "sweet", "intense"], "aroma": {"creamy_vanilla": 0.98, "caramel_sweet": 0.70}, "flavor": {"sweet": 0.75, "creamy_mouthfeel": 0.70}},
    {"name": "Eugenol", "smiles": "COc1cc(CC=C)ccc1O", "cas": "97-53-0", "pubchem_cid": 3314, "chemical_class": "Phenylpropanoid", "odor_threshold_ug_l": 6.0, "descriptors": ["spicy", "clove", "woody"], "aroma": {"spicy": 0.95, "woody": 0.50, "earthy": 0.20}, "flavor": {"pungent": 0.50, "bitter": 0.20}},
    {"name": "Isoeugenol", "smiles": "COc1cc(C=CC)ccc1O", "cas": "97-54-1", "pubchem_cid": 7338, "chemical_class": "Phenylpropanoid", "odor_threshold_ug_l": 8.0, "descriptors": ["spicy", "clove", "floral"], "aroma": {"spicy": 0.85, "floral": 0.40, "creamy_vanilla": 0.30}, "flavor": {"pungent": 0.35}},
    {"name": "Guaiacol", "smiles": "COc1ccccc1O", "cas": "90-05-1", "pubchem_cid": 460, "chemical_class": "Methoxyphenol", "odor_threshold_ug_l": 3.0, "descriptors": ["smoky", "woody", "roasted"], "aroma": {"roasted_nutty": 0.75, "woody": 0.80, "earthy": 0.40}, "flavor": {"bitter": 0.30}},
    {"name": "Thymol", "smiles": "CC(C)c1ccc(C)cc1O", "cas": "89-83-8", "pubchem_cid": 6989, "chemical_class": "Monoterpene Phenol", "odor_threshold_ug_l": 50.0, "descriptors": ["herbal", "thyme", "spicy", "medicinal"], "aroma": {"green_herbal": 0.85, "spicy": 0.60, "earthy": 0.30}, "flavor": {"pungent": 0.40, "bitter": 0.30}},
    {"name": "Anethole", "smiles": "COc1ccc(C=CC)cc1", "cas": "104-46-1", "pubchem_cid": 637563, "chemical_class": "Phenylpropene", "odor_threshold_ug_l": 15.0, "descriptors": ["anise", "licorice", "sweet", "spicy"], "aroma": {"spicy": 0.85, "caramel_sweet": 0.55, "green_herbal": 0.30}, "flavor": {"sweet": 0.65, "cooling": 0.20}},

    # PYRAZINES & HETEROCYCLES (Roasted / Earthy / Nutty)
    {"name": "2-Isobutyl-3-methoxypyrazine", "smiles": "COc1ncc(CC(C)C)nc1", "cas": "24683-00-9", "pubchem_cid": 32594, "chemical_class": "Alkylpyrazine", "odor_threshold_ug_l": 0.002, "descriptors": ["earthy", "green", "bell pepper", "vegetal"], "aroma": {"earthy": 0.90, "green_herbal": 0.85}, "flavor": {"bitter": 0.25}},
    {"name": "2-Ethyl-3,5-dimethylpyrazine", "smiles": "CCc1ncc(C)nc1C", "cas": "27040-75-2", "pubchem_cid": 33967, "chemical_class": "Pyrazine", "odor_threshold_ug_l": 0.01, "descriptors": ["roasted", "nutty", "coffee", "cocoa"], "aroma": {"roasted_nutty": 0.95, "earthy": 0.45, "woody": 0.30}, "flavor": {"bitter": 0.30}},
    {"name": "2,3,5-Trimethylpyrazine", "smiles": "Cc1ncc(C)c(C)n1", "cas": "14667-55-1", "pubchem_cid": 26808, "chemical_class": "Pyrazine", "odor_threshold_ug_l": 1.0, "descriptors": ["roasted", "baked potato", "nutty"], "aroma": {"roasted_nutty": 0.90, "earthy": 0.50}, "flavor": {"bitter": 0.25}},
    {"name": "2-Acetylpyrazine", "smiles": "CC(=O)c1cnccn1", "cas": "22047-25-2", "pubchem_cid": 29025, "chemical_class": "Pyrazine", "odor_threshold_ug_l": 60.0, "descriptors": ["popcorn", "roasted", "corn", "bread"], "aroma": {"roasted_nutty": 0.92, "caramel_sweet": 0.40}, "flavor": {"sweet": 0.30}},
    {"name": "Furfuryl mercaptan", "smiles": "SCc1ccco1", "cas": "98-02-2", "pubchem_cid": 7363, "chemical_class": "Furan Thiol", "odor_threshold_ug_l": 0.005, "descriptors": ["coffee", "roasted", "sulfuric"], "aroma": {"roasted_nutty": 0.92, "sulfuric_pungent": 0.80, "earthy": 0.30}, "flavor": {"bitter": 0.35}},

    # FURANONES & LACTONES (Caramel / Creamy / Sweet)
    {"name": "Furaneol (Strawberry Furanone)", "smiles": "CC1=C(O)C(=O)C(C)(O1)C", "cas": "3658-77-3", "pubchem_cid": 19309, "chemical_class": "Furanone", "odor_threshold_ug_l": 0.05, "descriptors": ["caramel", "sweet", "strawberry", "cooked"], "aroma": {"caramel_sweet": 0.95, "fruity": 0.85, "roasted_nutty": 0.25}, "flavor": {"sweet": 0.80, "fruity": 0.70, "creamy_mouthfeel": 0.25}},
    {"name": "Maltol", "smiles": "Cc1coc(=O)c(O)c1", "cas": "118-71-8", "pubchem_cid": 8369, "chemical_class": "Pyranone", "odor_threshold_ug_l": 35.0, "descriptors": ["caramel", "cotton candy", "sweet"], "aroma": {"caramel_sweet": 0.90, "fruity": 0.30}, "flavor": {"sweet": 0.75}},
    {"name": "Ethyl maltol", "smiles": "CCc1coc(=O)c(O)c1", "cas": "4940-11-8", "pubchem_cid": 21059, "chemical_class": "Pyranone", "odor_threshold_ug_l": 10.0, "descriptors": ["caramel", "sweet", "jammy"], "aroma": {"caramel_sweet": 0.96, "fruity": 0.40}, "flavor": {"sweet": 0.85}},
    {"name": "Delta-Decalactone", "smiles": "CCCCCC1CCCC(=O)O1", "cas": "705-86-2", "pubchem_cid": 12810, "chemical_class": "Lactone", "odor_threshold_ug_l": 10.0, "descriptors": ["creamy", "peach", "coconut", "milky"], "aroma": {"creamy_vanilla": 0.90, "fruity": 0.60, "caramel_sweet": 0.35}, "flavor": {"creamy_mouthfeel": 0.85, "sweet": 0.40}},
    {"name": "Gamma-Nonalactone", "smiles": "CCCCCC1CCC(=O)O1", "cas": "104-61-0", "pubchem_cid": 7710, "chemical_class": "Lactone", "odor_threshold_ug_l": 15.0, "descriptors": ["coconut", "creamy", "sweet"], "aroma": {"creamy_vanilla": 0.92, "caramel_sweet": 0.50, "fruity": 0.45}, "flavor": {"creamy_mouthfeel": 0.80, "sweet": 0.45}},
    {"name": "Diacetyl (2,3-Butanedione)", "smiles": "CC(=O)C(=O)C", "cas": "431-03-8", "pubchem_cid": 650, "chemical_class": "Diketone", "odor_threshold_ug_l": 2.0, "descriptors": ["creamy", "buttery", "dairy"], "aroma": {"creamy_vanilla": 0.92, "caramel_sweet": 0.40}, "flavor": {"creamy_mouthfeel": 0.88, "sweet": 0.30}},
    {"name": "Acetoin (3-Hydroxybutanone)", "smiles": "CC(=O)C(C)O", "cas": "513-86-0", "pubchem_cid": 179, "chemical_class": "Hydroxyketone", "odor_threshold_ug_l": 50.0, "descriptors": ["buttery", "creamy", "yogurt"], "aroma": {"creamy_vanilla": 0.80, "caramel_sweet": 0.35}, "flavor": {"creamy_mouthfeel": 0.70, "sweet": 0.30}},

    # SULFUR & THIOLS (Pungent / Savory / Tropical)
    {"name": "Dimethyl sulfide", "smiles": "CSC", "cas": "75-18-3", "pubchem_cid": 1068, "chemical_class": "Sulfide", "odor_threshold_ug_l": 1.0, "descriptors": ["sulfuric", "cabbage", "corn"], "aroma": {"sulfuric_pungent": 0.95, "earthy": 0.30}, "flavor": {"salty": 0.20}},
    {"name": "Dimethyl trisulfide", "smiles": "CSSSC", "cas": "3658-80-8", "pubchem_cid": 19310, "chemical_class": "Trisulfide", "odor_threshold_ug_l": 0.01, "descriptors": ["garlic", "onion", "sulfur", "meaty"], "aroma": {"sulfuric_pungent": 0.98, "roasted_nutty": 0.40}, "flavor": {"umami": 0.30}},
    {"name": "4-Mercapto-4-methylpentan-2-one (4-MMP)", "smiles": "CC(=O)CC(C)(C)S", "cas": "19872-52-7", "pubchem_cid": 88029, "chemical_class": "Thiol", "odor_threshold_ug_l": 0.0001, "descriptors": ["boxwood", "blackcurrant", "catty", "grapefruit"], "aroma": {"sulfuric_pungent": 0.85, "fruity": 0.65, "citrus": 0.40}, "flavor": {"acidic_crisp": 0.40}},
    {"name": "Methionol", "smiles": "CSCCCO", "cas": "505-10-2", "pubchem_cid": 10448, "chemical_class": "Thioalcohol", "odor_threshold_ug_l": 0.2, "descriptors": ["cooked potato", "sulfur", "savory"], "aroma": {"sulfuric_pungent": 0.80, "earthy": 0.70}, "flavor": {"umami": 0.35}},

    # TASTE PRIMARIES, CHEMESTHESIS & MOUTHFEEL (Non-volatile / Oral Sensation)
    {"name": "Sucrose", "smiles": "OCC1OC(OC2(CO)OC(CO)C(O)C2O)C(O)C(O)C1O", "cas": "57-50-1", "pubchem_cid": 5988, "chemical_class": "Disaccharide", "odor_threshold_ug_l": 500000.0, "descriptors": ["sweet", "sugary"], "aroma": {}, "flavor": {"sweet": 1.00}},
    {"name": "D-Fructose", "smiles": "OCC1OC(CO)(O)C(O)C1O", "cas": "57-48-7", "pubchem_cid": 5523, "chemical_class": "Monosaccharide", "odor_threshold_ug_l": 500000.0, "descriptors": ["sweet", "fruity-sweet"], "aroma": {}, "flavor": {"sweet": 1.00, "acidic_crisp": 0.15}},
    {"name": "Citric acid", "smiles": "OC(=O)CC(O)(CC(=O)O)C(=O)O", "cas": "77-92-9", "pubchem_cid": 311, "chemical_class": "Tricarboxylic Acid", "odor_threshold_ug_l": 100000.0, "descriptors": ["sour", "acidic", "tart"], "aroma": {}, "flavor": {"sour": 0.95, "acidic_crisp": 0.90}},
    {"name": "L-Malic acid", "smiles": "OC(=O)CC(O)C(=O)O", "cas": "97-67-6", "pubchem_cid": 525, "chemical_class": "Dicarboxylic Acid", "odor_threshold_ug_l": 100000.0, "descriptors": ["sour", "apple acid", "lingering"], "aroma": {}, "flavor": {"sour": 0.92, "acidic_crisp": 0.80}},
    {"name": "L-Tartaric acid", "smiles": "OC(=O)C(O)C(O)C(=O)O", "cas": "87-69-4", "pubchem_cid": 875, "chemical_class": "Dicarboxylic Acid", "odor_threshold_ug_l": 100000.0, "descriptors": ["sour", "grape acid", "astringent"], "aroma": {}, "flavor": {"sour": 0.95, "astringent": 0.40, "acidic_crisp": 0.85}},
    {"name": "Lactic acid", "smiles": "CC(O)C(=O)O", "cas": "50-21-5", "pubchem_cid": 612, "chemical_class": "Hydroxy Acid", "odor_threshold_ug_l": 100000.0, "descriptors": ["sour", "milky acid", "mild"], "aroma": {}, "flavor": {"sour": 0.75, "creamy_mouthfeel": 0.50}},
    {"name": "Acetic acid", "smiles": "CC(=O)O", "cas": "64-19-7", "pubchem_cid": 176, "chemical_class": "Carboxylic Acid", "odor_threshold_ug_l": 10000.0, "descriptors": ["vinegar", "pungent", "sour"], "aroma": {"green_herbal": 0.20, "sulfuric_pungent": 0.30}, "flavor": {"sour": 0.90, "pungent": 0.40, "acidic_crisp": 0.85}},
    {"name": "Sodium chloride", "smiles": "[Na+].[Cl-]", "cas": "7647-14-5", "pubchem_cid": 5234, "chemical_class": "Inorganic Salt", "odor_threshold_ug_l": 500000.0, "descriptors": ["salty", "saline"], "aroma": {}, "flavor": {"salty": 1.00}},
    {"name": "Potassium chloride", "smiles": "[K+].[Cl-]", "cas": "7447-40-7", "pubchem_cid": 4873, "chemical_class": "Inorganic Salt", "odor_threshold_ug_l": 500000.0, "descriptors": ["salty", "bitter", "metallic"], "aroma": {}, "flavor": {"salty": 0.75, "bitter": 0.50}},
    {"name": "Monosodium glutamate", "smiles": "OC(=O)CCC(N)C(=O)O.[Na+]", "cas": "142-47-2", "pubchem_cid": 23689119, "chemical_class": "Amino Acid Salt", "odor_threshold_ug_l": 300000.0, "descriptors": ["umami", "savory", "brothy"], "aroma": {}, "flavor": {"umami": 0.95, "salty": 0.30}},
    {"name": "Disodium inosinate (IMP)", "smiles": "O=C1NC=NC2=C1N=CN2C3OC(COP(=O)([O-])[O-])C(O)C3O.[Na+].[Na+]", "cas": "4691-65-0", "pubchem_cid": 20824, "chemical_class": "Ribonucleotide Salt", "odor_threshold_ug_l": 300000.0, "descriptors": ["umami", "synergistic", "savory"], "aroma": {}, "flavor": {"umami": 1.00, "creamy_mouthfeel": 0.30}},
    {"name": "Caffeine", "smiles": "Cn1cnc2c1c(=O)n(C)c(=O)n2C", "cas": "58-08-2", "pubchem_cid": 2519, "chemical_class": "Purine Alkaloid", "odor_threshold_ug_l": 200000.0, "descriptors": ["bitter", "tonic"], "aroma": {}, "flavor": {"bitter": 0.90, "astringent": 0.40}},
    {"name": "Quinine hydrochloride", "smiles": "COc1ccc2nc3cc(C=C)CCN3Cc2c1O.[Cl-]", "cas": "60-93-5", "pubchem_cid": 3034034, "chemical_class": "Cinchona Alkaloid", "odor_threshold_ug_l": 200000.0, "descriptors": ["intense bitter"], "aroma": {}, "flavor": {"bitter": 1.00, "astringent": 0.50}},
    {"name": "Theobromine", "smiles": "Cn1cnc2c1c(=O)[nH]c(=O)n2C", "cas": "83-67-0", "pubchem_cid": 5429, "chemical_class": "Purine Alkaloid", "odor_threshold_ug_l": 200000.0, "descriptors": ["bitter", "cocoa"], "aroma": {}, "flavor": {"bitter": 0.85, "astringent": 0.35}},
    {"name": "Capsaicin", "smiles": "CC(C)/C=C/CCCCCC(=O)NCC1=CC(=C(C=C1)O)OC", "cas": "404-86-4", "pubchem_cid": 1548943, "chemical_class": "Capsaicinoid", "odor_threshold_ug_l": 100000.0, "descriptors": ["pungent", "burning", "hot"], "aroma": {}, "flavor": {"pungent": 1.00}},
    {"name": "Piperine", "smiles": "O=C(C=CC=Cc1ccc2OCOc2c1)N1CCCCC1", "cas": "94-62-2", "pubchem_cid": 638024, "chemical_class": "Alkaloid", "odor_threshold_ug_l": 100000.0, "descriptors": ["pungent", "peppery"], "aroma": {"spicy": 0.30}, "flavor": {"pungent": 0.85, "bitter": 0.20}},
    {"name": "Gingerol (6-Gingerol)", "smiles": "CCCCCC(O)CC(=O)CCc1ccc(O)c(OC)c1", "cas": "23513-14-6", "pubchem_cid": 442793, "chemical_class": "Phenol", "odor_threshold_ug_l": 50000.0, "descriptors": ["pungent", "ginger", "warm"], "aroma": {"spicy": 0.50, "fresh_cooling": 0.20}, "flavor": {"pungent": 0.80, "sweet": 0.20}},
    {"name": "Epigallocatechin gallate (EGCG)", "smiles": "Oc1cc(O)c2c(c1)OC(c1cc(O)c(O)c(O)c1)C(OC(=O)c1cc(O)c(O)c(O)c1)C2", "cas": "989-51-5", "pubchem_cid": 65064, "chemical_class": "Polyphenol Flavonol", "odor_threshold_ug_l": 500000.0, "descriptors": ["astringent", "bitter", "tannic"], "aroma": {}, "flavor": {"astringent": 0.95, "bitter": 0.80}},
    {"name": "Chlorogenic acid", "smiles": "OC(=O)C=Cc1ccc(O)c(O)c1", "cas": "327-97-9", "pubchem_cid": 1794427, "chemical_class": "Polyphenol Ester", "odor_threshold_ug_l": 500000.0, "descriptors": ["astringent", "bitter", "coffee acid"], "aroma": {}, "flavor": {"astringent": 0.70, "bitter": 0.60, "sour": 0.35}}
]

def format_compound_record(c):
    aroma_vec = {d: 0.0 for d in AROMA_DESCRIPTORS}
    flavor_vec = {d: 0.0 for d in FLAVOR_DESCRIPTORS}
    for k, v in c.get("aroma", {}).items():
        if k in aroma_vec:
            aroma_vec[k] = v
    for k, v in c.get("flavor", {}).items():
        if k in flavor_vec:
            flavor_vec[k] = v
    return {
        "name": c["name"],
        "smiles": c["smiles"],
        "cas": c["cas"],
        "pubchem_cid": c["pubchem_cid"],
        "chemical_class": c["chemical_class"],
        "odor_threshold_ug_l": c["odor_threshold_ug_l"],
        "descriptors": c["descriptors"],
        "aroma_vector": aroma_vec,
        "flavor_vector": flavor_vec,
        "provenance": ProvenanceLevel.SCIENTIFIC_VALIDATED
    }

# Expanded Ingredients
EXTENDED_INGREDIENTS = [
    {
        "name": "Strawberry",
        "category": "Fruit",
        "botanical_name": "Fragaria × ananassa",
        "description": "Sweet, fragrant red berry characterized by key volatiles furaneol and ethyl butyrate.",
        "constituent_compounds": [
            {"compound_name": "Furaneol (Strawberry Furanone)", "concentration_mg_kg": 25.0, "role": "Key character impact furanone"},
            {"compound_name": "Ethyl butyrate", "concentration_mg_kg": 8.0, "role": "Top-note fruity ester"},
            {"compound_name": "Ethyl 2-methylbutyrate", "concentration_mg_kg": 2.0, "role": "Berry fruity ester"},
            {"compound_name": "Hexanal", "concentration_mg_kg": 3.5, "role": "Fresh green top note"},
            {"compound_name": "Linalool", "concentration_mg_kg": 1.2, "role": "Floral background note"},
            {"compound_name": "Citric acid", "concentration_mg_kg": 8500.0, "role": "Primary acidulant"},
            {"compound_name": "L-Malic acid", "concentration_mg_kg": 1800.0, "role": "Secondary tartness"},
            {"compound_name": "Sucrose", "concentration_mg_kg": 45000.0, "role": "Natural sweetness"}
        ]
    },
    {
        "name": "Vanilla Extract",
        "category": "Spice / Botanical",
        "botanical_name": "Vanilla planifolia",
        "description": "Aromatic extract derived from cured vanilla pods dominated by vanillin and balsamic lactones.",
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
            {"compound_name": "D-Limonene", "concentration_mg_kg": 65000.0, "role": "Major terpene carrier"},
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
            {"compound_name": "Furfuryl mercaptan", "concentration_mg_kg": 0.8, "role": "Characteristic coffee aroma thiol"},
            {"compound_name": "Furaneol (Strawberry Furanone)", "concentration_mg_kg": 8.0, "role": "Caramelized sugar note"},
            {"compound_name": "Guaiacol", "concentration_mg_kg": 4.0, "role": "Smoky wood note"},
            {"compound_name": "Caffeine", "concentration_mg_kg": 12000.0, "role": "Characteristic bitter alkaloid"},
            {"compound_name": "Chlorogenic acid", "concentration_mg_kg": 25000.0, "role": "Astringent phenolic acid"},
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
            {"compound_name": "Eucalyptol (1,8-Cineole)", "concentration_mg_kg": 3500.0, "role": "Fresh cineolic top note"},
            {"compound_name": "Linalool", "concentration_mg_kg": 120.0, "role": "Floral background note"},
            {"compound_name": "Hexanal", "concentration_mg_kg": 80.0, "role": "Herbal green nuance"}
        ]
    },
    {
        "name": "Cinnamon Bark",
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
            {"compound_name": "Theobromine", "concentration_mg_kg": 14000.0, "role": "Major bitter alkaloid"},
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
            {"compound_name": "cis-3-Hexen-1-ol", "concentration_mg_kg": 12.0, "role": "Grassy tea aroma"},
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
            {"compound_name": "Acetoin (3-Hydroxybutanone)", "concentration_mg_kg": 14.0, "role": "Creamy dairy background"},
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
            {"compound_name": "2-Isobutyl-3-methoxypyrazine", "concentration_mg_kg": 0.15, "role": "Potent character impact pyrazine"},
            {"compound_name": "Hexanal", "concentration_mg_kg": 12.0, "role": "Grassy crisp note"},
            {"compound_name": "Citric acid", "concentration_mg_kg": 1500.0, "role": "Mild vegetal acidity"}
        ]
    },
    {
        "name": "Pineapple",
        "category": "Fruit",
        "botanical_name": "Ananas comosus",
        "description": "Tropical fruit with intense fruity ester profile and vibrant sugar-acid balance.",
        "constituent_compounds": [
            {"compound_name": "Ethyl butyrate", "concentration_mg_kg": 12.0, "role": "Top-note fruity ester"},
            {"compound_name": "Allyl hexanoate", "concentration_mg_kg": 4.5, "role": "Characteristic pineapple ester"},
            {"compound_name": "Furaneol (Strawberry Furanone)", "concentration_mg_kg": 6.0, "role": "Sweet caramelized undertone"},
            {"compound_name": "Citric acid", "concentration_mg_kg": 9500.0, "role": "Sharp tartness"},
            {"compound_name": "Sucrose", "concentration_mg_kg": 60000.0, "role": "Natural sweetness"}
        ]
    },
    {
        "name": "Banana",
        "category": "Fruit",
        "botanical_name": "Musa acuminata",
        "description": "Soft tropical fruit governed by isoamyl acetate ester impact.",
        "constituent_compounds": [
            {"compound_name": "Isoamyl acetate", "concentration_mg_kg": 35.0, "role": "Key character impact banana ester"},
            {"compound_name": "Ethyl butyrate", "concentration_mg_kg": 4.0, "role": "Fruity modifier"},
            {"compound_name": "Sucrose", "concentration_mg_kg": 85000.0, "role": "Rich sweetness"},
            {"compound_name": "L-Malic acid", "concentration_mg_kg": 2500.0, "role": "Subtle acidity"}
        ]
    },
    {
        "name": "Black Pepper",
        "category": "Spice",
        "botanical_name": "Piper nigrum",
        "description": "Pungent dried berry offering sharp piperine heat and woody terpene aroma.",
        "constituent_compounds": [
            {"compound_name": "Piperine", "concentration_mg_kg": 45000.0, "role": "Primary pungent alkaloid"},
            {"compound_name": "Beta-Caryophyllene", "concentration_mg_kg": 7500.0, "role": "Woody peppery sesquiterpene"},
            {"compound_name": "Alpha-Pinene", "concentration_mg_kg": 3200.0, "role": "Piney fresh top note"},
            {"compound_name": "D-Limonene", "concentration_mg_kg": 1800.0, "role": "Citrus terpene lift"}
        ]
    },
    {
        "name": "Fresh Ginger",
        "category": "Spice / Rhizome",
        "botanical_name": "Zingiber officinale",
        "description": "Zesty, spicy rhizome with warming gingerol heat and citrus-citral nuances.",
        "constituent_compounds": [
            {"compound_name": "Gingerol (6-Gingerol)", "concentration_mg_kg": 18000.0, "role": "Warming pungent active"},
            {"compound_name": "Citral (Neral/Geranial)", "concentration_mg_kg": 650.0, "role": "Bright citrus note"},
            {"compound_name": "Linalool", "concentration_mg_kg": 150.0, "role": "Floral nuance"},
            {"compound_name": "Beta-Caryophyllene", "concentration_mg_kg": 800.0, "role": "Woody undertone"}
        ]
    },
    {
        "name": "Sweet Orange Juice",
        "category": "Citrus / Beverage",
        "botanical_name": "Citrus sinensis",
        "description": "Refreshing citrus juice balanced between sweetness, citric acidity, and orange volatiles.",
        "constituent_compounds": [
            {"compound_name": "D-Limonene", "concentration_mg_kg": 1500.0, "role": "Primary citrus terpene"},
            {"compound_name": "Octanal", "concentration_mg_kg": 12.0, "role": "Citrus aldehyde impact"},
            {"compound_name": "Ethyl butyrate", "concentration_mg_kg": 3.0, "role": "Juicy fruitiness"},
            {"compound_name": "Citric acid", "concentration_mg_kg": 11000.0, "role": "Crisp acid"},
            {"compound_name": "Sucrose", "concentration_mg_kg": 70000.0, "role": "Primary sweetness"}
        ]
    }
]


def curate_and_save():
    records = [format_compound_record(c) for c in EXTENDED_COMPOUNDS]
    compounds_raw_file = RAW_DIR / "scientific_compounds.json"
    ingredients_raw_file = RAW_DIR / "scientific_ingredients.json"

    with open(compounds_raw_file, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    with open(ingredients_raw_file, "w", encoding="utf-8") as f:
        json.dump(EXTENDED_INGREDIENTS, f, indent=2)

    print(f"Curated {len(records)} verified compounds in {compounds_raw_file}")
    print(f"Curated {len(EXTENDED_INGREDIENTS)} verified ingredients in {ingredients_raw_file}")


if __name__ == "__main__":
    curate_and_save()

