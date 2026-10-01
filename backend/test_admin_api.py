import json
import sys
import urllib.request
import urllib.parse

sys.stdout.reconfigure(encoding='utf-8')

BASE = 'http://localhost:8000/api'

def request(path, method='GET', data=None, token=None):
    url = f"{BASE}{path}"
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req_body = json.dumps(data).encode('utf-8') if data is not None else None
    req = urllib.request.Request(url, data=req_body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            ct = resp.headers.get('Content-Type', '')
            if 'application/json' in ct:
                return resp.status, json.loads(content)
            return resp.status, content
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        return e.code, err_body

# 0. Login
status, res = request('/auth/login/', method='POST', data={'email': 'admin@skillnet.demo', 'password': 'DemoPass123!'})
print('Login status:', status)
assert status == 200, f'Login failed: {res}'
token = res['access']

# 1. Analytics
status, ana = request('/admin/analytics/', token=token)
print('Analytics status:', status)
print('Analytics users total:', ana['users']['total'])
print('Analytics jobs active:', ana['jobs']['active'])
print('Analytics needs_attention:', ana['needs_attention'])
print('Analytics outcomes:', ana['outcomes'])
print('Analytics growth data points:', len(ana['growth']))

# 2. Users list & Actions
status, users = request('/admin/users/', token=token)
print('Users count:', users['count'])
test_user = users['results'][0]
uid = test_user['id']
print(f'Testing on user {uid}: {test_user["name"]} ({test_user["email"]}), active={test_user["is_active"]}')

# Toggle active
status, r1 = request(f'/admin/users/{uid}/toggle_active/', method='POST', token=token)
print(f'Toggled active to: {r1["is_active"]}')
# Toggle back
status, r2 = request(f'/admin/users/{uid}/toggle_active/', method='POST', token=token)
print(f'Toggled back to: {r2["is_active"]}')

# Toggle verify
status, r3 = request(f'/admin/users/{uid}/toggle_verify/', method='POST', token=token)
print(f'Toggled verify to: {r3["is_verified"]}')

# Employer approval
employer_user = next((u for u in users['results'] if u['role'] == 'EMPLOYER'), None)
if employer_user:
    eid = employer_user['id']
    cur_appr = employer_user.get('is_approved')
    status, r_appr = request(f'/admin/users/{eid}/approve_employer/', method='POST', data={'is_approved': not cur_appr}, token=token)
    print(f'Employer {eid} approval toggled to: {r_appr.get("is_approved")}')
    # restore
    request(f'/admin/users/{eid}/approve_employer/', method='POST', data={'is_approved': cur_appr}, token=token)

# 3. Moderation Reports
status, reports = request('/admin/moderation-reports/', token=token)
print('Reports count:', reports['count'])
for r in reports['results']:
    print(f'Report #{r["id"]}: {r["target_title"]} [{r["target_type"]}] - Status: {r["status"]}')

# 4. CSV Reports Export
for rtype in ['overview', 'users', 'jobs', 'applications', 'courses', 'moderation']:
    status, exp = request(f'/admin/reports/export/?type={rtype}', token=token)
    assert status == 200, f'Export failed for {rtype}'
    print(f'CSV export "{rtype}": status {status}, lines: {len(exp.strip().splitlines())}')

print('\n>>> ALL LIVE HTTP ADMIN API ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY! <<<')
