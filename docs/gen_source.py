"""Generate EXACTLY 1500+1500=3000 lines for 60-page PDF"""
import os

order = [
    "main.ts","types/index.ts",
    "utils/storage.ts","utils/search.ts","utils/theme.ts","utils/keyboard.ts",
    "utils/weather.ts","utils/bookmark.ts","utils/sync.ts","utils/payment.ts",
    "utils/i18n.svelte.ts","utils/contextMenu.ts","utils/toast.svelte.ts",
    "stores/dials.svelte.ts","stores/theme.svelte.ts","stores/settings.svelte.ts",
    "stores/subscription.svelte.ts","stores/wallpaper.svelte.ts","stores/recentSites.svelte.ts",
    "App.svelte","app.css",
    "components/SearchBox.svelte","components/ClockWidget.svelte",
    "components/WeatherWidget.svelte","components/LunarWidget.svelte",
    "components/SpeedDial.svelte","components/DialCard.svelte","components/DialGroup.svelte",
    "components/AddDialModal.svelte","components/IconPicker.svelte",
    "components/GroupManage.svelte","components/RecentSites.svelte",
    "components/WallpaperPicker.svelte","components/ImportExport.svelte",
    "components/SettingsPanel.svelte","components/StatisticsPanel.svelte",
    "components/HelpPanel.svelte","components/OnboardingGuide.svelte",
    "components/SubscribePanel.svelte","components/SyncPanel.svelte",
]

src = r"M:\new\src"
out_dir = r"M:\new\docs"
os.makedirs(out_dir, exist_ok=True)

# Collect ALL source lines
all_lines = []
for fname in order:
    fpath = os.path.join(src, fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        for line in f:
            all_lines.append(line.rstrip('\n\r'))

total = len(all_lines)
print(f'Total source lines: {total}')

# First 30 pages = 1500 lines, Last 30 pages = 1500 lines
LPP = 50
first_part = all_lines[:1500]
last_part = all_lines[-1500:]

# Write first 30 pages
with open(os.path.join(out_dir, 'src-p1-30.txt'), 'w', encoding='utf-8') as f:
    for i, line in enumerate(first_part):
        f.write(f'{i+1:5d}  {line}\n')

# Write last 30 pages  
with open(os.path.join(out_dir, 'src-p31-60.txt'), 'w', encoding='utf-8') as f:
    for i, line in enumerate(last_part):
        f.write(f'{1500 + total - 1500 + i + 1:5d}  {line}\n')

print(f'First: {len(first_part)} lines -> 30 pages')
print(f'Last: {len(last_part)} lines -> 30 pages')
print('src-p1-30.txt + src-p31-60.txt ready')
