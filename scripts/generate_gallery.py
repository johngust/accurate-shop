import json
import os

MANIFEST_FILE = "scripts/manifest.json"
GALLERY_FILE = "scripts/gallery.html"

def generate():
    with open(MANIFEST_FILE, 'r', encoding='utf-8') as f: manifest = json.load(f)
    
    q_weight = {"EXCELLENT": 100, "GOOD": 80, "NOT STUDIO": 20, "REJECTED": 0}
    manifest.sort(key=lambda x: q_weight.get(x['best'].get('q', "REJECTED"), 0), reverse=True)
    
    html = """
    <html>
    <head>
        <title>V29 Brand Gallery</title>
        <style>
            body { background: #0a0a0a; color: #ddd; font-family: sans-serif; padding: 30px; }
            table { width: 100%; border-collapse: collapse; background: #111; }
            th, td { border: 1px solid #222; padding: 15px; text-align: left; vertical-align: top; }
            th { background: #1a1a1a; color: #888; font-size: 11px; text-transform: uppercase; }
            .sku { color: #00aaff; font-weight: bold; margin-bottom: 5px; }
            .desc { font-size: 13px; color: #aaa; line-height: 1.4; max-width: 400px; }
            img { width: 200px; border-radius: 4px; background: white; }
            .badge { padding: 3px 8px; border-radius: 3px; font-size: 10px; font-weight: bold; }
            tr:hover { background: #151515; }
        </style>
    </head>
    <body>
        <h1>🏆 BRAND EXPERT GALLERY (V29)</h1>
        <p>Бренды: Grohe, LeMark, Rossinka, Haiba. Сортировка по качеству.</p>
        <table>
            <tr>
                <th>Товар / Бренд</th>
                <th>Описание (AI Generated)</th>
                <th>Качество / Источник</th>
                <th>Фото (Стандарт: Белый фон)</th>
            </tr>
    """
    
    for item in manifest:
        best = item['best']
        img_src = os.path.relpath(best['src'], "scripts") if best['src'] != 'placeholder.png' else 'placeholder.png'
        
        html += f"""
            <tr>
                <td>
                    <div class="sku">{item['sku']}</div>
                    <div style="font-size:14px; font-weight:bold;">{item['name']}</div>
                    <div style="color:#666; font-size:12px;">Бренд: {item['brand']}</div>
                </td>
                <td><div class="desc">{item['description']}</div></td>
                <td>
                    <span class="badge" style="background:{best['color']}; color:#000;">{best['q']}</span><br>
                    <div style="margin-top:5px; font-size:11px;">{best['source']}</div>
                    <div style="color:#555; font-size:10px;">{best['info']['w']}x{best['info']['h']}px</div>
                </td>
                <td><img src="{img_src}"></td>
            </tr>
        """
    
    html += "</table></body></html>"
    with open(GALLERY_FILE, 'w', encoding='utf-8') as f: f.write(html)
    print(f"Gallery updated: {GALLERY_FILE}")

if __name__ == "__main__": generate()
