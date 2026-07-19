import requests
import json

base_url = "http://localhost:8033"

# 1. Test Upload
print("Testing Upload...")
with open("test_data.csv", "rb") as f:
    files = {"file": f}
    response = requests.post(f"{base_url}/upload", files=files)
    
if response.status_code == 200:
    print("Upload Success!")
    print(json.dumps(response.json()['cleaning_report'], indent=2))
else:
    print("Upload Failed:", response.text)
    exit(1)

# 2. Test Charts Suggestion
print("\nTesting Charts Suggestion...")
response = requests.get(f"{base_url}/charts")
if response.status_code == 200:
    data = response.json()
    print("Charts Suggested:", [c['name'] for c in data['charts']])
    charts = [c['name'] for c in data['charts']]
else:
    print("Charts fetch failed:", response.text)
    exit(1)

# 3. Test Generate First Chart
if charts:
    chart_name = charts[0]
    print(f"\nTesting Generate Chart: {chart_name}...")
    response = requests.get(f"{base_url}/generate/{chart_name}")
    if response.status_code == 200:
        print(f"Generate {chart_name} Success!")
        print("Chart Data length:", len(json.dumps(response.json())))
    else:
        print(f"Generate {chart_name} failed:", response.text)
        exit(1)

print("\nIntegration test fully passed!")
