"""
seed_firestore.py
Carga los datos de seed_data.json a Firebase Firestore.

Uso:
    python seed_firestore.py --credentials ./serviceAccountKey.json
    python seed_firestore.py --credentials ./serviceAccountKey.json --data ./seed_data.json
"""

import argparse
import json
import os
from datetime import datetime, timezone

import firebase_admin
from firebase_admin import credentials, firestore


def parse_args():
    parser = argparse.ArgumentParser(description="Seed Firestore con datos de prueba")
    parser.add_argument(
        "--credentials",
        required=True,
        help="Ruta al archivo serviceAccountKey.json de Firebase",
    )
    parser.add_argument(
        "--data",
        default=os.path.join(os.path.dirname(__file__), "seed_data.json"),
        help="Ruta al archivo JSON con los datos (default: seed_data.json)",
    )
    return parser.parse_args()


def parse_datetime(value):
    """Convierte un string ISO 8601 a un objeto datetime con timezone UTC."""
    if isinstance(value, str):
        try:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return dt
        except ValueError:
            return value
    return value


def process_document(doc: dict) -> dict:
    """Convierte campos de fecha string a datetime para Firestore."""
    processed = {}
    date_fields = {"createdAt", "updatedAt", "ultimoRiego"}
    for key, value in doc.items():
        if key in date_fields and isinstance(value, str):
            processed[key] = parse_datetime(value)
        elif isinstance(value, dict):
            processed[key] = process_document(value)
        else:
            processed[key] = value
    return processed


def seed_collection(db, collection_name: str, documents: list):
    """Sube todos los documentos de una colección a Firestore."""
    print(f"\n[+] Coleccion: {collection_name} ({len(documents)} documentos)")
    col_ref = db.collection(collection_name)

    for doc in documents:
        doc_id = doc.get("id")
        if not doc_id:
            print(f"  [!] Documento sin 'id', se omite: {doc}")
            continue

        data = {k: v for k, v in doc.items() if k != "id"}
        data = process_document(data)

        col_ref.document(doc_id).set(data)
        print(f"  [ok] {doc_id}")


def main():
    args = parse_args()

    # ── Validar archivos ──────────────────────────────────────────────────────
    if not os.path.exists(args.credentials):
        print(f"[ERROR] No se encontro el archivo de credenciales: {args.credentials}")
        return

    if not os.path.exists(args.data):
        print(f"[ERROR] No se encontro el archivo de datos: {args.data}")
        return

    # ── Inicializar Firebase ──────────────────────────────────────────────────
    print("Conectando a Firebase...")
    cred = credentials.Certificate(args.credentials)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Conexion exitosa\n")

    # ── Cargar datos ──────────────────────────────────────────────────────────
    with open(args.data, encoding="utf-8") as f:
        seed = json.load(f)

    collections = seed.get("collections", {})
    if not collections:
        print("[!] No se encontraron colecciones en el archivo de datos.")
        return

    # ── Subir colecciones ─────────────────────────────────────────────────────
    for collection_name, documents in collections.items():
        seed_collection(db, collection_name, documents)

    print(f"\nSeed completado -- {sum(len(d) for d in collections.values())} documentos subidos.")


if __name__ == "__main__":
    main()
