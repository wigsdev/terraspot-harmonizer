#!/usr/bin/env python3
"""
Meteomatics Weather API Data Fetcher for TerraSpot Harmonizer
NASA Space Apps Challenge 2026 — Global Offers Integration

Queries real-time and climatological fire weather indicators (Forest Fire Warning Index,
multi-layer soil moisture, 10m wind speed, and relative humidity) for benchmark AOIs
and persists a static, high-performance JSON cache in public/data/meteomatics_weather.json.
"""

import os
import sys
import json
import base64
import urllib.request
import urllib.error
from datetime import datetime, timezone

# Load .env file manually without external dependencies
ENV_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(ENV_FILE):
    with open(ENV_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

USERNAME = os.environ.get("METEOMATICS_USERNAME")
PASSWORD = os.environ.get("METEOMATICS_PASSWORD")

# Benchmark Areas of Interest coordinates (center points)
AOI_TARGETS = {
    "PE-HCO": {
        "name": "Huánuco & Central Peruvian Andes",
        "lat": -9.50,
        "lon": -75.75,
    },
    "US-CAL": {
        "name": "California Sierra & Coastal Ranges",
        "lat": 38.75,
        "lon": -121.15,
    },
    "BR-PAN": {
        "name": "Pantanal Tropical Wetlands",
        "lat": -17.50,
        "lon": -56.75,
    },
    "AU-NSW": {
        "name": "New South Wales Eucalyptus Forest Belt",
        "lat": -33.85,
        "lon": 150.25,
    },
    "PT-CEN": {
        "name": "Central Portugal Pine & Eucalyptus Belt",
        "lat": 40.20,
        "lon": -7.90,
    },
}

PARAMETERS = [
    "forest_fire_warning:idx",
    "t_2m:C",
    "relative_humidity_2m:p",
    "wind_speed_10m:ms",
    "wind_gusts_10m_1h:ms",
    "precip_24h:mm",
    "evapotranspiration_24h:mm",
]


def query_meteomatics(lat: float, lon: float, timestamp: str = None) -> dict:
    if not USERNAME or not PASSWORD or USERNAME == "your_username_here":
        raise ValueError(
            "METEOMATICS_USERNAME and METEOMATICS_PASSWORD must be configured in your .env file."
        )

    if timestamp is None:
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:00:00Z")

    param_str = ",".join(PARAMETERS)
    url = f"https://api.meteomatics.com/{timestamp}/{param_str}/{lat},{lon}/json"

    auth_str = f"{USERNAME}:{PASSWORD}"
    auth_b64 = base64.b64encode(auth_str.encode("utf-8")).decode("ascii")

    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Basic {auth_b64}",
            "User-Agent": "TerraSpotHarmonizer-NASA-Space-Apps/1.0",
        },
    )

    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    print("=" * 70)
    print("TerraSpot Harmonizer — Meteomatics API Global Offer Ingestion")
    print("=" * 70)

    if not USERNAME or not PASSWORD or USERNAME == "your_username_here":
        print("⚠️  Warning: Meteomatics credentials not found in environment or .env.")
        print("   Please create a .env file in the project root with:")
        print("   METEOMATICS_USERNAME=your_username")
        print("   METEOMATICS_PASSWORD=your_password\n")
        sys.exit(1)

    print(f"Authenticated as user: {USERNAME}")
    print(f"Querying parameters: {', '.join(PARAMETERS)}\n")

    results = {
        "meta": {
            "source": "Meteomatics Weather API (NASA Space Apps Challenge Global Offer)",
            "retrieved_at": datetime.now(timezone.utc).isoformat(),
            "parameters": PARAMETERS,
        },
        "regions": {},
    }

    for region_id, target in AOI_TARGETS.items():
        print(f"-> Fetching data for {region_id} ({target['name']}) at ({target['lat']}, {target['lon']})...")
        try:
            data = query_meteomatics(target["lat"], target["lon"])
            region_metrics = {}

            for p in data.get("data", []):
                p_name = p.get("parameter")
                coordinates = p.get("coordinates", [])
                if coordinates and "dates" in coordinates[0]:
                    dates = coordinates[0]["dates"]
                    if dates:
                        region_metrics[p_name] = dates[0].get("value")

            results["regions"][region_id] = {
                "name": target["name"],
                "coordinates": [target["lat"], target["lon"]],
                "metrics": region_metrics,
            }
            print(f"   ✓ Received: {region_metrics}")
        except Exception as e:
            print(f"   ✗ Error querying {region_id}: {e}")

    output_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "public",
        "data",
        "meteomatics_weather.json",
    )
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"\n✓ Successfully exported validated cache to: {output_path}")


if __name__ == "__main__":
    main()
