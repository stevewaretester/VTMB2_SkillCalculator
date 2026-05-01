"""Merge category/owner/venue/sublevel from collectibles.lua into js/collectibles.js.

Pass --dry-run to preview without writing.
"""
import re, sys

DRY_RUN = '--dry-run' in sys.argv

lua_path = r'Ref/spring/22727210/collectibles.lua'
js_path  = r'js/collectibles.js'

# --- Parse every lua entry ---
# Builds two lookups:
#   by_name[name]      → {category, className, owner, venue, sublevel, raw_line}
#   by_classname[cls]  → same (for entries without a UAID-style name)
def parse_lua(path):
    entries = []
    with open(path, encoding='utf-8') as f:
        for line in f:
            cat = re.search(r"category='([^']+)'", line)
            cls = re.search(r"className='([^']+)'", line)
            nm  = re.search(r"(?<![a-zA-Z])name='([^']+)'", line)  # avoid className
            if not cat:
                continue
            entries.append({
                'category':  cat.group(1),
                'className': cls.group(1) if cls else '',
                'name':      nm.group(1)  if nm  else '',
                'owner':     (re.search(r"owner='([^']+)'",    line) or re.compile('').search('')),
                'venue':     (re.search(r"venue='([^']+)'",    line) or re.compile('').search('')),
                'sublevel':  (re.search(r"sublevel='([^']+)'", line) or re.compile('').search('')),
                'x': re.search(r'\bx=(-?\d+)', line),
                'y': re.search(r'\by=(-?\d+)', line),
                'z': re.search(r'\bz=(-?\d+)', line),
                'raw': line,
            })
    # resolve match objects to strings
    for e in entries:
        for k in ('owner', 'venue', 'sublevel'):
            e[k] = e[k].group(1) if e[k] and hasattr(e[k], 'group') and e[k].lastindex else 'Unknown' if k == 'owner' else ''
        for k in ('x', 'y', 'z'):
            e[k] = int(e[k].group(1)) if e[k] else 0
    return entries

lua_entries = parse_lua(lua_path)
print(f'Lua entries: {len(lua_entries)}')

# Build name → entry lookup (primary key = lua `name` field = JS `n` field)
by_name = {e['name']: e for e in lua_entries if e['name']}
# Also className → entry (fallback for class-named items)
by_cls  = {e['className']: e for e in lua_entries if e['className']}

# --- Load JS ---
with open(js_path, encoding='utf-8') as f:
    js_lines = f.readlines()

cat_updated = 0
already_ok  = 0
unmatched   = 0

out_lines = []
js_names_seen = set()

for line in js_lines:
    # Collect all n: values so we can detect missing entries later
    nm = re.search(r'n:"([^"]+)"', line)
    if nm:
        js_names_seen.add(nm.group(1))

    # Find cls: value for category-update fallback
    cls_m = re.search(r'cls:"([^"]+)"', line)
    js_cls = cls_m.group(1) if cls_m else ''

    lua_e = by_name.get(nm.group(1) if nm else '') or by_cls.get(js_cls)

    if lua_e is None or not re.search(r'c:"[A-Z]+"', line):
        out_lines.append(line)
        if nm or cls_m:
            unmatched += 1 if lua_e is None else 0
        continue

    lua_cat = lua_e['category']
    js_cat_m = re.search(r'c:"([A-Z]+)"', line)
    js_cat = js_cat_m.group(1) if js_cat_m else ''

    if js_cat == lua_cat:
        already_ok += 1
        out_lines.append(line)
        continue

    # Update c:"..." to the authoritative lua category
    new_line = re.sub(r'c:"[A-Z]+"', f'c:"{lua_cat}"', line)
    cat_updated += 1
    out_lines.append(new_line)

print(f'Category updated: {cat_updated}, already correct: {already_ok}, unmatched: {unmatched}')

# --- Find missing JS entries (in lua but not in JS by name) ---
missing = [e for e in lua_entries if e['name'] and e['name'] not in js_names_seen]
print(f'Missing entries (in lua, not in JS): {len(missing)}')
for e in missing:
    print(f"  [{e['category']}] {e['className']} — {e['name'][:60]}")

# --- Append missing entries before closing ]; ---
if missing and not DRY_RUN:
    # Find insert position: last line with a collectible entry
    insert_idx = None
    for i in range(len(out_lines) - 1, -1, -1):
        if re.search(r'c:"[A-Z]+"', out_lines[i]):
            insert_idx = i + 1
            break
    if insert_idx is None:
        insert_idx = len(out_lines) - 1

    new_js_lines = []
    for e in sorted(missing, key=lambda x: x['category']):
        parts = [
            f'c:"{e["category"]}"',
            f'cls:"{e["className"]}"',
            f'n:"{e["name"]}"',
            f'x:{e["x"]}', f'y:{e["y"]}', f'z:{e["z"]}',
            f'owner:"{e["owner"]}"',
            f'venue:"{e["venue"]}"',
            f'sublevel:"{e["sublevel"]}"',
        ]
        new_js_lines.append(f'  {{ {", ".join(parts)} }},\n')

    out_lines[insert_idx:insert_idx] = new_js_lines
    print(f'Inserted {len(new_js_lines)} missing entries')

if not DRY_RUN:
    with open(js_path, 'w', encoding='utf-8') as f:
        f.writelines(out_lines)
    print('Written.')
else:
    print('Dry run — no changes written.')
