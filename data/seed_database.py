"""
Database Seeder: Populates normalized relational database with scientific compounds,
calculates physicochemical descriptors and circular fingerprints, and creates ingredients.
"""

import json
from pathlib import Path
from backend.app.models.database import engine, SessionLocal, Base
from backend.app.models.domain import (
    CompoundModel, IngredientModel, IngredientCompoundModel
)
from backend.app.core.constants import AROMA_DESCRIPTORS, FLAVOR_DESCRIPTORS, ProvenanceLevel
from ml.chemistry.smiles_parser import SMILESParser
from ml.chemistry.descriptors import MolecularDescriptorCalculator
from ml.chemistry.fingerprints import MolecularFingerprinter

DATA_DIR = Path(__file__).resolve().parent
RAW_DIR = DATA_DIR / "raw"


def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    parser = SMILESParser()
    desc_calc = MolecularDescriptorCalculator()
    fingerprinter = MolecularFingerprinter()

    compounds_file = RAW_DIR / "scientific_compounds.json"
    ingredients_file = RAW_DIR / "scientific_ingredients.json"

    if not compounds_file.exists() or not ingredients_file.exists():
        raise FileNotFoundError("Raw scientific data files missing. Run data.dataset_curator first.")

    with open(compounds_file, "r", encoding="utf-8") as f:
        compounds_data = json.load(f)

    with open(ingredients_file, "r", encoding="utf-8") as f:
        ingredients_data = json.load(f)

    # 1. Clear existing records cleanly
    db.query(IngredientCompoundModel).delete()
    db.query(IngredientModel).delete()
    db.query(CompoundModel).delete()
    db.commit()

    print(f"Seeding {len(compounds_data)} chemical compounds...")
    compound_name_to_model = {}

    for c in compounds_data:
        smiles = c["smiles"]
        canon_smiles = parser.canonicalize(smiles)
        descriptors = desc_calc.calculate(smiles)
        fp = fingerprinter.generate_fingerprint(smiles).tolist()

        compound_model = CompoundModel(
            name=c["name"],
            smiles=smiles,
            canonical_smiles=canon_smiles,
            cas=c.get("cas"),
            pubchem_cid=c.get("pubchem_cid"),
            chemical_class=c.get("chemical_class"),
            odor_threshold_ug_l=c.get("odor_threshold_ug_l"),
            molecular_weight=descriptors["molecular_weight"],
            logp=descriptors["logp"],
            tpsa=descriptors["tpsa"],
            h_bond_donors=descriptors["h_bond_donors"],
            h_bond_acceptors=descriptors["h_bond_acceptors"],
            rotatable_bonds=descriptors["rotatable_bonds"],
            aromatic_rings=descriptors["aromatic_rings"],
            heavy_atom_count=descriptors["heavy_atom_count"],
            volatility_index=descriptors["volatility_index"],
            fingerprint=fp,
            raw_descriptors=c.get("descriptors", []),
            aroma_vector=c["aroma_vector"],
            flavor_vector=c["flavor_vector"],
            provenance=c.get("provenance", ProvenanceLevel.SCIENTIFIC_VALIDATED)
        )
        db.add(compound_model)
        compound_name_to_model[c["name"]] = compound_model

    db.commit()

    # Re-query saved compounds to obtain IDs
    saved_compounds = {c.name: c for c in db.query(CompoundModel).all()}
    print(f"Successfully committed {len(saved_compounds)} compounds.")

    print(f"Seeding {len(ingredients_data)} ingredients and associations...")
    for ing in ingredients_data:
        # Calculate empirical aroma and flavor profiles from constituent compounds
        # Aroma uses Odor Activity Value (OAV = Concentration / OdorThreshold)
        aroma_totals = {d: 0.0 for d in AROMA_DESCRIPTORS}
        flavor_totals = {d: 0.0 for d in FLAVOR_DESCRIPTORS}
        total_oav = 0.0
        total_flavor_mass = 0.0

        constituent_records = []
        for item in ing.get("constituent_compounds", []):
            comp_name = item["compound_name"]
            conc = float(item["concentration_mg_kg"])
            role = item.get("role")

            comp_obj = saved_compounds.get(comp_name)
            if not comp_obj:
                print(f"Warning: Compound '{comp_name}' in ingredient '{ing['name']}' not found in database.")
                continue

            constituent_records.append((comp_obj.id, conc, role))

            # Aroma weight based on OAV (ug/kg / ug/L)
            ot = comp_obj.odor_threshold_ug_l or 100.0
            oav = (conc * 1000.0) / ot  # conc in ug/kg divided by threshold in ug/L
            if oav > 0.01:
                total_oav += oav
                for d in AROMA_DESCRIPTORS:
                    aroma_totals[d] += comp_obj.aroma_vector.get(d, 0.0) * oav

            # Flavor weight based on mass concentration (mg/kg)
            if conc > 1.0:
                total_flavor_mass += conc
                for d in FLAVOR_DESCRIPTORS:
                    flavor_totals[d] += comp_obj.flavor_vector.get(d, 0.0) * conc

        # Normalize aggregated vectors
        norm_aroma = {}
        for d in AROMA_DESCRIPTORS:
            if total_oav > 0:
                val = aroma_totals[d] / total_oav
                norm_aroma[d] = round(min(1.0, val * 1.2), 3)  # Perceptual ceiling scaling
            else:
                norm_aroma[d] = 0.0

        norm_flavor = {}
        for d in FLAVOR_DESCRIPTORS:
            if total_flavor_mass > 0:
                val = flavor_totals[d] / total_flavor_mass
                norm_flavor[d] = round(min(1.0, val * 1.1), 3)
            else:
                norm_flavor[d] = 0.0

        ing_model = IngredientModel(
            name=ing["name"],
            category=ing["category"],
            botanical_name=ing.get("botanical_name"),
            description=ing.get("description"),
            aroma_profile=norm_aroma,
            flavor_profile=norm_flavor
        )
        db.add(ing_model)
        db.flush()

        for comp_id, conc, role in constituent_records:
            assoc = IngredientCompoundModel(
                ingredient_id=ing_model.id,
                compound_id=comp_id,
                concentration_mg_kg=conc,
                role=role
            )
            db.add(assoc)

    db.commit()
    total_ings = db.query(IngredientModel).count()
    total_assocs = db.query(IngredientCompoundModel).count()
    print(f"Successfully seeded {total_ings} ingredients with {total_assocs} compound linkages.")
    db.close()


if __name__ == "__main__":
    seed_database()

