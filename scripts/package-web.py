import zipfile
import os

out_path = 'M:/new/packages/quick-dial-v1.0.8-web.zip'
src_dir = 'M:/new/website'

with zipfile.ZipFile(out_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.join('website', os.path.relpath(file_path, src_dir))
            z.write(file_path, arcname)

size_mb = os.path.getsize(out_path) / 1024 / 1024
print(f'Web zip: {out_path} ({size_mb:.2f} MB)')
