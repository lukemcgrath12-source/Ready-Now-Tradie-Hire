"""Builds the trade and suburb landing pages (/tradies/...) and /for-tradies from the About page shell.
Run from the repo root: python3 scripts/build_pages.py"""
import re, os, html, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://readynowtradiehire.com.au'
shell = open(os.path.join(ROOT, 'about.html'), encoding='utf-8').read()
# absolute asset paths so pages work in sub folders
shell = re.sub(r'(src|href)="(?!/|https?:|#|data:|tel:|mailto:|sms:)([^"]+)"', r'\1="/\2"', shell)
shell = re.sub(r'<script type="application/ld\+json">.*?</script>\n?', '', shell, flags=re.S)
head_end = shell.index('<main id="main">'); main_end = shell.index('</main>') + len('</main>')

TRADES = {
 'Electricians': ('electrician', ['Switchboard upgrades', 'Power points and lighting', 'Smoke alarms', 'Ceiling fans', 'Fault finding', 'EV chargers'], 'Electrical work in NSW has to be done by a licensed electrician. Ask for their licence number and check it on Service NSW.'),
 'Plumbers': ('plumber', ['Blocked drains', 'Leaking taps and toilets', 'Hot water systems', 'Gas fitting', 'Bathroom rough-ins', 'Burst pipes'], 'Plumbing, drainage and gas fitting in NSW need a licensed tradie. Ask for their licence number and check it on Service NSW.'),
 'Carpenters': ('carpenter', ['Framing', 'Decks and pergolas', 'Doors and skirting', 'Fit outs', 'Stairs', 'Repairs and odd jobs'], 'For residential work over $5,000 in NSW the tradie needs a contractor licence. Ask for it and check it on Service NSW.'),
 'Builders': ('builder', ['Renovations', 'Extensions', 'Granny flats', 'Kitchen and bathroom renos', 'Structural repairs', 'New builds'], 'Residential building work over $5,000 in NSW needs a licensed contractor, and jobs over $20,000 need home building compensation cover. Check both before you sign.'),
 'Roofers': ('roofer', ['Roof leaks and repairs', 'Re-roofing', 'Gutters and downpipes', 'Roof restoration', 'Flashings', 'Storm damage'], 'Ask for their licence and insurance, and make sure they have working at heights cover before they go up.'),
 'Tilers': ('tiler', ['Bathroom tiling', 'Floor tiling', 'Splashbacks', 'Waterproofing', 'Regrouting', 'Outdoor tiling'], 'Waterproofing in NSW is licensed work. Ask for their licence number and check it on Service NSW.'),
 'Painters': ('painter', ['Interior painting', 'Exterior painting', 'Roof painting', 'Decks and fences', 'Prep and patching', 'Touch-ups'], 'Painting work over $5,000 in NSW needs a licence. Ask for it and check it on Service NSW.'),
 'Labourers': ('labourer', ['Site cleans', 'Demolition', 'Rubbish removal', 'Digging and landscaping help', 'Moving materials', 'General labour'], 'Ask about their white card and insurance before they start on a site.'),
 'Concreters': ('concreter', ['Slabs', 'Driveways', 'Footpaths', 'Exposed aggregate', 'Formwork', 'Repairs'], 'For residential work over $5,000 in NSW the tradie needs a contractor licence. Ask for it and check it on Service NSW.'),
}
AREAS = ['Sutherland Shire', 'Cronulla', 'Miranda', 'St George', 'Hurstville', 'Inner West', 'Eastern Suburbs', 'Randwick', 'Parramatta', 'Liverpool', 'Bankstown', 'Campbelltown', 'Canterbury', 'North Shore', 'Northern Beaches', 'Hills District']
NEAR = {
 'Sutherland Shire': ['Cronulla', 'Miranda', 'St George', 'Hurstville'], 'Cronulla': ['Sutherland Shire', 'Miranda', 'St George'], 'Miranda': ['Sutherland Shire', 'Cronulla', 'Hurstville'],
 'St George': ['Hurstville', 'Sutherland Shire', 'Canterbury', 'Randwick'], 'Hurstville': ['St George', 'Canterbury', 'Bankstown', 'Miranda'],
 'Inner West': ['Canterbury', 'Eastern Suburbs', 'Bankstown', 'Parramatta'], 'Eastern Suburbs': ['Randwick', 'Inner West', 'North Shore'], 'Randwick': ['Eastern Suburbs', 'St George', 'Inner West'],
 'Parramatta': ['Hills District', 'Bankstown', 'Liverpool', 'Inner West'], 'Liverpool': ['Campbelltown', 'Bankstown', 'Parramatta'], 'Bankstown': ['Canterbury', 'Liverpool', 'Parramatta', 'Hurstville'],
 'Campbelltown': ['Liverpool', 'Bankstown', 'Sutherland Shire'], 'Canterbury': ['Inner West', 'Bankstown', 'Hurstville', 'St George'],
 'North Shore': ['Northern Beaches', 'Hills District', 'Eastern Suburbs'], 'Northern Beaches': ['North Shore', 'Hills District'], 'Hills District': ['Parramatta', 'North Shore', 'Northern Beaches'],
}
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
esc = html.escape
TRADE_OPTS = ['Builder', 'Carpenter', 'Electrician', 'Plumber', 'Roofer', 'Concreter', 'Tiler', 'Painter', 'Plasterer', 'Bricklayer', 'Landscaper', 'Labourer', 'Traffic control', 'Scaffolder', 'Not sure']

def post_form(single='', area=''):
    opts = ''.join('<option%s>%s</option>' % (' selected' if o == single else '', o) for o in TRADE_OPTS)
    return f'''<form class="pj-form" novalidate>
      <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
      <div class="rq-grid">
        <div class="rq-f"><label for="pjTrade">Trade *</label><select id="pjTrade" name="trade" required><option value="">Choose a trade</option>{opts}</select></div>
        <div class="rq-f"><label for="pjSuburb">Suburb *</label><input id="pjSuburb" name="suburb" type="text" required autocomplete="address-level2" value="{esc(area)}" placeholder="e.g. Cronulla"></div>
        <div class="rq-f full"><label for="pjWhen">When?</label><select id="pjWhen" name="when"><option>As soon as possible</option><option>This week</option><option>Next week</option><option>In the next month</option><option>Flexible</option></select></div>
        <div class="rq-f full"><label for="pjJob">What is the job? *</label><textarea id="pjJob" name="job" required rows="4" placeholder="A few lines on the work and the site."></textarea></div>
        <div class="rq-f"><label for="pjName">Your name *</label><input id="pjName" name="name" type="text" required autocomplete="name"></div>
        <div class="rq-f"><label for="pjPhone">Phone *</label><input id="pjPhone" name="phone" type="tel" required autocomplete="tel" inputmode="tel"></div>
        <div class="rq-f full"><label for="pjEmail">Email</label><input id="pjEmail" name="email" type="email" autocomplete="email" placeholder="Optional"></div>
      </div>
      <p class="rq-err" role="alert"></p>
      <button type="submit" class="call-btn rq-send">Post my job</button>
      <p class="pj-note">Your details only go to Ready Now to arrange this job.</p>
      <div class="pj-done" hidden tabindex="-1"><h3>Job posted. Thanks.</h3><p>We will be in touch soon. If it is urgent, ring <a href="tel:+61432910369">0432 910 369</a>.</p></div>
    </form>'''

def page(path, title, desc, main, crumbs):
    s = shell[:head_end] + main + shell[main_end:]
    s = re.sub(r'<title>.*?</title>', '<title>%s</title>' % esc(title), s, count=1)
    s = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="%s">' % esc(desc), s, count=1)
    url = SITE + path
    s = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="%s">' % url, s, count=1)
    s = re.sub(r'<meta property="og:url" content="[^"]*">', '<meta property="og:url" content="%s">' % url, s, count=1)
    s = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="%s">' % esc(title), s, count=1)
    s = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="%s">' % esc(desc), s, count=1)
    s = s.replace(' aria-current="page" class="active"', '')
    bc = {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': SITE + u} for i, (n, u) in enumerate(crumbs)]}
    s = s.replace('</head>', '<script type="application/ld+json">%s</script>\n</head>' % json.dumps(bc), 1)
    s = s.replace('</body>', '<script src="/crew.js"></script>\n<script src="/rn-tools.js"></script>\n<script src="/area.js"></script>\n<script src="/pj.js"></script>\n</body>', 1)
    out = os.path.join(ROOT, path.strip('/') + '.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w', encoding='utf-8').write(s)
    return path

def hero(eyebrow, h1, em, sub, ctas):
    return f'''<section class="page-hero ph-tight ar-hero">
  <div class="wrap px ph-inner">
    <span class="ph-eyebrow">{esc(eyebrow)}</span>
    <h1>{esc(h1)} <em>{esc(em)}</em></h1>
    <p class="ph-sub">{esc(sub)}</p>
    <div class="ph-cta">{ctas}</div>
  </div>
</section>'''

paths = []
for trade, (single, jobs, licence) in TRADES.items():
    tl = trade.lower(); ts = slug(trade); art = 'an' if single[0] in 'aeiou' else 'a'
    for area in AREAS:
        a_s = slug(area)
        near = ''.join(f'<a href="/tradies/{ts}/{slug(n)}">{esc(trade)} in {esc(n)}</a>' for n in NEAR[area])
        others = ''.join(f'<a href="/tradies/{slug(t)}/{a_s}">{esc(t)} in {esc(area)}</a>' for t in TRADES if t != trade)
        main = '<main id="main">\n' + hero(f'{trade} · {area}', f'{trade} in', f'{area}.',
            f'Find {art} local {single} who works in {area}'[:0] + f'Find a local {single} who works in {area}, see who they are, then send a request or call them direct. Free to use, no booking fees.',
            f'<a href="#post-job" class="pillbtn pillbtn-gold"><span class="roll"><i><b>Post a job</b><b aria-hidden="true">Post a job</b></i></span><span class="circ"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span></a><a href="/members?trade={esc(trade)}" class="btn-ghost">All {tl}</a>') + f'''
<section class="ar-sec">
  <div class="wrap px">
    <p class="rey">Listed {tl}</p>
    <h2 class="ar-h">{esc(trade)} covering {esc(area)}</h2>
    <div class="ar-list" id="areaList" data-trade="{esc(trade)}" data-area="{esc(area)}"><p class="ar-empty">Loading local {tl}...</p></div>
  </div>
</section>
<section class="ar-sec ar-alt">
  <div class="wrap px ar-two">
    <div>
      <p class="rey">Common jobs</p>
      <h2 class="ar-h">What {art} {single} can help with</h2>
      <ul class="ar-jobs">{''.join('<li>%s</li>' % esc(j) for j in jobs)}</ul>
    </div>
    <div>
      <p class="rey">Before you hire</p>
      <h2 class="ar-h">Check these first</h2>
      <ul class="ar-check"><li>{esc(licence)}</li><li>Ask for proof of public liability insurance.</li><li>Get the price and the start date in writing before work starts.</li></ul>
    </div>
  </div>
</section>
<section class="ar-sec pj-sec" id="post-job">
  <div class="wrap px pj-in">
    <div class="pj-h">
      <p class="rey">Post a job</p>
      <h2>Need {art} {single} in {esc(area)}? <em>Post the job.</em></h2>
      <p class="pj-lead">Tell us what you need and when. We will line up a local {single} and get back to you. Free, no obligation.</p>
    </div>
    {post_form(single.capitalize(), area)}
  </div>
</section>
<section class="ar-sec">
  <div class="wrap px">
    <p class="rey">Nearby</p>
    <div class="ar-links">{near}</div>
    <p class="rey" style="margin-top:32px">Other trades in {esc(area)}</p>
    <div class="ar-links">{others}</div>
  </div>
</section>
</main>'''
        paths.append(page(f'/tradies/{ts}/{a_s}', f'{trade} in {area} | Ready Now Tradie Hire',
            f'Find local {tl} in {area}. See their profile, trade and area, then send a request or call them direct. Free to use, no booking fees.',
            main, [('Find a tradie', '/tradies'), (trade, f'/tradies/{ts}'), (area, f'/tradies/{ts}/{a_s}')]))
    # trade hub
    links = ''.join(f'<a href="/tradies/{ts}/{slug(a)}">{esc(trade)} in {esc(a)}</a>' for a in AREAS)
    main = '<main id="main">\n' + hero(f'{trade} · Wider Sydney', f'{trade} across', 'wider Sydney.',
        f'Pick your area to see {tl} who work there, or post the job and we will line someone up.',
        f'<a href="#post-job" class="pillbtn pillbtn-gold"><span class="roll"><i><b>Post a job</b><b aria-hidden="true">Post a job</b></i></span><span class="circ"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span></a><a href="/members?trade={esc(trade)}" class="btn-ghost">All {tl}</a>') + f'''
<section class="ar-sec"><div class="wrap px"><p class="rey">By area</p><h2 class="ar-h">{esc(trade)} by suburb</h2><div class="ar-links ar-links-lg">{links}</div></div></section>
<section class="ar-sec ar-alt"><div class="wrap px"><p class="rey">Listed {tl}</p><div class="ar-list" id="areaList" data-trade="{esc(trade)}" data-area=""><p class="ar-empty">Loading...</p></div></div></section>
<section class="ar-sec pj-sec" id="post-job"><div class="wrap px pj-in"><div class="pj-h"><p class="rey">Post a job</p><h2>Need {art} {single}? <em>Post the job.</em></h2><p class="pj-lead">Tell us what you need, where and when. Free, no obligation.</p></div>{post_form(single.capitalize())}</div></section>
</main>'''
    paths.append(page(f'/tradies/{ts}', f'{trade} in Sydney by Suburb | Ready Now Tradie Hire',
        f'Find local {tl} across wider Sydney by suburb. Free to use, no booking fees.', main, [('Find a tradie', '/tradies'), (trade, f'/tradies/{ts}')]))

# hub
cols = ''.join(f'<div class="ar-col"><h3><a href="/tradies/{slug(t)}">{esc(t)}</a></h3>' + ''.join(f'<a href="/tradies/{slug(t)}/{slug(a)}">{esc(a)}</a>' for a in AREAS) + '</div>' for t in TRADES)
main = '<main id="main">\n' + hero('Find a tradie · By suburb', 'Tradies by trade', 'and suburb.', 'Every trade, every area we cover. Pick one to see who is listed there.',
    '<a href="/members" class="pillbtn pillbtn-gold"><span class="roll"><i><b>Search all tradies</b><b aria-hidden="true">Search all tradies</b></i></span><span class="circ"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span></a><a href="/#post" class="btn-ghost">Post a job</a>') + f'''
<section class="ar-sec"><div class="wrap px"><div class="ar-cols">{cols}</div></div></section>
</main>'''
paths.append(page('/tradies', 'Find a Tradie by Suburb | Ready Now Tradie Hire', 'Find local tradies across wider Sydney by trade and suburb. Free to use, no booking fees.', main, [('Find a tradie', '/tradies')]))

# for tradies
benefits = [('Free to list', 'No sign up fee, no lead fees, no cut of the job.'), ('Your own profile', 'Your photo, trade, area and a few lines on your work.'),
            ('Customers come to you', 'People call you direct or send a request through Ready Now.'), ('A "Ready now" badge', 'Tap your link on days you are free and get a green badge and a spot in the "Ready now today" filter.'),
            ('Your own QR code', 'Put it on the ute, quotes and socials. It opens your profile.'), ('Local pages', 'You show up on the pages for your trade and suburb across wider Sydney.')]
cards = ''.join(f'<li><h3>{esc(a)}</h3><p>{esc(b)}</p></li>' for a, b in benefits)
main = '<main id="main">\n' + hero('For tradies · Free to list', 'On the tools?', 'Get found by locals.', 'List your trade free and let people across wider Sydney find you, call you and send you jobs.',
    '<a href="/join" class="pillbtn pillbtn-gold"><span class="roll"><i><b>List my trade free</b><b aria-hidden="true">List my trade free</b></i></span><span class="circ"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span></a><a href="tel:+61432910369" class="btn-ghost">Questions? 0432 910 369</a>') + f'''
<section class="ar-sec"><div class="wrap px"><p class="rey">Why list</p><h2 class="ar-h">What you get</h2><ul class="ft-g">{cards}</ul></div></section>
<section class="ar-sec ar-alt"><div class="wrap px ar-two">
  <div><p class="rey">How it works</p><h2 class="ar-h">Three minutes to list</h2><ol class="pj-steps"><li>Add your photo, trade and area</li><li>Your profile goes up on Find a Tradie</li><li>Locals call you or send a request</li></ol></div>
  <div class="ft-cta"><h2 class="ar-h">Ready to get found?</h2><p class="pj-lead">It is free for now. Change or remove your listing any time by messaging us.</p><a href="/join" class="call-btn rq-send" style="margin-top:20px;text-decoration:none">List my trade free</a></div>
</div></section>
</main>'''
paths.append(page('/for-tradies', 'List Your Trade Free | Ready Now Tradie Hire', 'Tradies, builders and labourers: list your trade free on Ready Now, get your own profile, QR code and a "Ready now" badge, and get found by locals across wider Sydney.', main, [('For tradies', '/for-tradies')]))
print(len(paths), 'pages')
open(os.path.join(ROOT, 'scripts', 'pages.txt'), 'w').write('\n'.join(paths))
