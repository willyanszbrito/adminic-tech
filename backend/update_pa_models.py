import urllib.request
import urllib.error
import json
import re
import sys
import uuid

sys.stdout.reconfigure(encoding='utf-8')

username = 'botfinanceirowill'
token = '6b9bec9068dda62c29fd9ca512f3c85f248b4f79'
headers = {'Authorization': f'Token {token}'}
file_path = '/home/botfinanceirowill/adminic-bot-main/config.py'

print(f"1. Lendo {file_path} do PythonAnywhere...")

req = urllib.request.Request(
    f'https://www.pythonanywhere.com/api/v0/user/{username}/files/path{file_path}',
    headers=headers
)

with urllib.request.urlopen(req, timeout=15) as resp:
    content = resp.read().decode('utf-8')

print(f"   Arquivo lido ({len(content)} bytes).")

# 2. Update MODELOS_IA
old_pattern = r'MODELOS_IA:\s*Final\[List\[str\]\]\s*=\s*\[[^\]]+\]'
new_code = 'MODELOS_IA: Final[List[str]] = ["models/gemini-3.7-flash", "models/gemini-3.5-flash-lite"]'

if re.search(old_pattern, content):
    updated_content = re.sub(old_pattern, new_code, content)
    print("2. Padrão MODELOS_IA substituído com sucesso!")
else:
    updated_content = content.replace("models/gemini-2.5-flash", "models/gemini-3.7-flash")
    print("2. Substituição direta efetuada!")

# 3. Multipart form upload
print("3. Fazendo upload via multipart/form-data...")
boundary = f"----WebKitFormBoundary{uuid.uuid4().hex}"
body_parts = []
body_parts.append(f"--{boundary}".encode('utf-8'))
body_parts.append(f'Content-Disposition: form-data; name="content"; filename="config.py"'.encode('utf-8'))
body_parts.append(b'Content-Type: text/plain; charset=utf-8\r\n')
body_parts.append(updated_content.encode('utf-8'))
body_parts.append(f"--{boundary}--\r\n".encode('utf-8'))

body_data = b'\r\n'.join(body_parts)

upload_headers = {
    'Authorization': f'Token {token}',
    'Content-Type': f'multipart/form-data; boundary={boundary}',
    'Content-Length': str(len(body_data))
}

upload_req = urllib.request.Request(
    f'https://www.pythonanywhere.com/api/v0/user/{username}/files/path{file_path}',
    data=body_data,
    headers=upload_headers,
    method='POST'
)

try:
    with urllib.request.urlopen(upload_req, timeout=15) as upload_resp:
        print(f"   Upload concluído! Status HTTP: {upload_resp.status}")
except urllib.error.HTTPError as e:
    print(f"   Erro no upload: HTTP {e.code}: {e.read().decode('utf-8', errors='replace')}")
    sys.exit(1)

# 4. Reload WebApp
print("4. Recarregando WebApp no PythonAnywhere...")
reload_req = urllib.request.Request(
    f'https://www.pythonanywhere.com/api/v0/user/{username}/webapps/botfinanceirowill.pythonanywhere.com/reload/',
    headers=headers,
    method='POST'
)

with urllib.request.urlopen(reload_req, timeout=30) as reload_resp:
    print(f"   Reload concluído! Status HTTP: {reload_resp.status}")

# 5. Verify the updated file
print("5. Verificando conteúdo salvo...")
verify_req = urllib.request.Request(
    f'https://www.pythonanywhere.com/api/v0/user/{username}/files/path{file_path}',
    headers=headers
)
with urllib.request.urlopen(verify_req, timeout=15) as v_resp:
    v_content = v_resp.read().decode('utf-8')
    for line in v_content.split('\n'):
        if 'MODELOS_IA' in line:
            print(f"   Confirmado no servidor: {line.strip()}")

print("\n🎉 Atualização 100% finalizada no PythonAnywhere!")
