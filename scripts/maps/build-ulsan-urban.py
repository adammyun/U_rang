"""Convert a cached, bounded OSM Overpass response to same-origin map assets.
Usage: python3 scripts/maps/build-ulsan-urban.py /path/to/overpass.json
Does not contact any service or download tiles. See public/maps/README.md.
"""
import sys, json, math
from pathlib import Path
from collections import defaultdict, Counter

raw = json.loads(Path(sys.argv[1]).read_text())
if raw.get('remark'):
    raise ValueError(raw['remark'])
BBOX = [129.17, 35.44, 129.46, 35.66]
STEP = .02
out = Path(__file__).resolve().parents[2] / 'public/maps/ulsan-urban'
out.mkdir(parents=True, exist_ok=True)

def simplify(points, tolerance=.000009):
    if len(points) <= 2: return points
    a, b = points[0], points[-1]
    dx, dy = b[0]-a[0], b[1]-a[1]
    length = dx*dx+dy*dy
    def distance(p):
        t = max(0, min(1, ((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length)) if length else 0
        return (p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2
    i = max(range(1, len(points)-1), key=lambda n: distance(points[n]))
    if distance(points[i]) <= tolerance*tolerance: return [a, b]
    return simplify(points[:i+1],tolerance)[:-1]+simplify(points[i:],tolerance)

def area(points):
    # Local planar approximation is only used for display thresholds.
    return abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(points,points[1:])))*.5*111320**2*math.cos(math.radians(35.55))

def bounds(points):
    return [min(p[0] for p in points),min(p[1] for p in points),max(p[0] for p in points),max(p[1] for p in points)]

features=[]; overview=[]; counts=Counter(); grid=defaultdict(list)
for element in raw['elements']:
    tags=element.get('tags',{})
    coords=[[round(p['lon'],6),round(p['lat'],6)] for p in element.get('geometry',[]) if p]
    if len(coords)<2: continue
    kind = 'building' if 'building' in tags and tags['building']!='no' else 'street' if 'highway' in tags else 'block' if 'landuse' in tags else None
    if not kind: continue
    closed=coords[0]==coords[-1]
    if kind!='street' and (not closed or len(coords)<4): continue
    size=area(coords) if closed else 0
    if kind=='building' and size<12: continue
    if closed:
        # Split ring before RDP to avoid dropping the entire closed polygon.
        pivot=len(coords)//2
        coords=simplify(coords[:pivot+1])+simplify(coords[pivot:])[1:]
    else: coords=simplify(coords,.000018)
    if kind!='street' and len(coords)<4: continue
    if kind!='street' and sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(coords,coords[1:]))<0:
        coords=coords[::-1]
    feature={'id':str(element['id']),'kind':kind,'bounds':bounds(coords),'coordinates':coords}
    if kind=='block': feature['use']=tags['landuse']
    if kind=='street': feature['major']=tags['highway'] in ('secondary','tertiary')
    counts[kind]+=1
    if kind!='building' or size>=300: overview.append(feature)
    if kind=='building':
        b=feature['bounds']
        for x in range(max(0,math.floor((b[0]-BBOX[0])/STEP)),min(14,math.floor((b[2]-BBOX[0])/STEP))+1):
            for y in range(max(0,math.floor((b[1]-BBOX[1])/STEP)),min(10,math.floor((b[3]-BBOX[1])/STEP))+1):
                grid[(x,y)].append(feature)
# Derive bounded street-block faces from real, shared road coordinates. These
# are urban blocks, never invented building footprints. Disconnected roads and
# large exterior faces are deliberately left unfilled.
graph=defaultdict(set)
for element in raw['elements']:
    if 'highway' not in element.get('tags',{}): continue
    points=[(round(p['lon'],6),round(p['lat'],6)) for p in element.get('geometry',[]) if p]
    for a,b in zip(points,points[1:]):
        if a!=b: graph[a].add(b); graph[b].add(a)
# Remove dead ends before tracing faces.
leaves=[p for p,neighbors in graph.items() if len(neighbors)<2]
while leaves:
    p=leaves.pop()
    for n in graph.pop(p,[]):
        graph[n].discard(p)
        if len(graph[n])<2: leaves.append(n)
ordered={p:sorted(ns,key=lambda n:math.atan2(n[1]-p[1],n[0]-p[0])) for p,ns in graph.items()}
visited=set(); derived=0
for start,neighbors in ordered.items():
    for neighbor in neighbors:
        if (start,neighbor) in visited: continue
        a,b=start,neighbor; ring=[]
        while (a,b) not in visited:
            visited.add((a,b)); ring.append(a)
            ns=ordered[b]
            a,b=b,ns[(ns.index(a)-1)%len(ns)]
        if (a,b)!=(start,neighbor) or len(ring)<3 or len(set(ring))!=len(ring): continue
        ring.append(ring[0])
        signed=sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(ring,ring[1:]))
        size=area(ring)
        if signed<=0 or not 800<=size<=120000: continue
        pivot=len(ring)//2
        coords=simplify(ring[:pivot+1])+simplify(ring[pivot:])[1:]
        if len(coords)<4: continue
        derived+=1
        overview.append({'id':f'street-block-{derived}','kind':'block','use':'street-block','bounds':bounds(coords),'coordinates':coords})
counts['streetBlock']=derived
manifest=[]
for (x,y),items in sorted(grid.items()):
    filename=f'{x}-{y}.json'
    (out/filename).write_text(json.dumps(items,separators=(',',':'),ensure_ascii=False))
    manifest.append({'file':filename,'bounds':[round(BBOX[0]+x*STEP,6),round(BBOX[1]+y*STEP,6),round(BBOX[0]+(x+1)*STEP,6),round(BBOX[1]+(y+1)*STEP,6)],'count':len(items)})
result={'version':1,'bbox':BBOX,'osmTimestamp':raw.get('osm3s',{}).get('timestamp_osm_base'),'retrievedAt':'2026-10-19','copyright':'© OpenStreetMap contributors','license':'ODbL-1.0','counts':dict(counts),'overview':overview,'tiles':manifest}
(out/'overview.json').write_text(json.dumps(result,separators=(',',':'),ensure_ascii=False))
print(json.dumps({'counts':counts,'overview':len(overview),'tiles':len(manifest),'bytes':sum(p.stat().st_size for p in out.glob('*.json')),'timestamp':result['osmTimestamp']}))
