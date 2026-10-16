<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<meta name="design_doc_mode" content="canvas">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet">
<style>body{margin:0;background:#f7f7f6;color:#111312;font-family:Inter,system-ui,sans-serif}a{color:#4a6b22}a:hover{color:#111312}</style>
</helmet>
<div style="font-feature-settings:'tnum' 1">
  <div style="padding:6px 24px;background:#0a0b0a;color:#f2f2f2;font:400 12px/1.4 Inter">Independent concept. Not affiliated with or endorsed by Delivery One. Illustrative data.</div>
  <div style="padding:40px 32px 80px;display:flex;flex-direction:column;gap:48px">
    <header style="display:flex;flex-direction:column;gap:10px;max-width:820px">
      <span style="font:500 12px/1.3 Inter;letter-spacing:.14em;text-transform:uppercase;color:#5f645f">Steps 2 + 3 · screens</span>
      <h1 style="margin:0;font:600 40px/1.1 Inter;letter-spacing:-.03em">PicksyOS Operations Console screens<span style="color:#84b926">.</span></h1>
      <p style="margin:0;font:400 16px/1.55 Inter;color:#3d423e">Every frame is the live prototype loaded into a scripted state, clock frozen at 14:00 (illustrative). Click a title to open that state full size; <a href="PicksyOS Console.dc.html">open the prototype</a> to click through from the seed.</p>
    </header>
    <sc-for list="{{ groups }}" as="g" hint-placeholder-count="3">
      <section style="display:flex;flex-direction:column;gap:16px">
        <h2 style="margin:0;font:600 22px/1.2 Inter;letter-spacing:-.02em">{{ g.title }}</h2>
        <div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start">
          <sc-for list="{{ g.items }}" as="it" hint-placeholder-count="3">
            <figure style="margin:0;display:flex;flex-direction:column;gap:8px">
              <sc-if value="{{ it.desk }}">
                <div style="width:648px;height:405px;overflow:hidden;border-radius:10px;border:1px solid #dcdfdc;background:#fff"><iframe src="{{ it.src }}" loading="lazy" title="{{ it.label }}" style="width:1440px;height:900px;border:0;transform:scale(.45);transform-origin:0 0"></iframe></div>
              </sc-if>
              <sc-if value="{{ it.phone }}">
                <div style="width:234px;height:506px;overflow:hidden;border-radius:18px;border:1px solid #dcdfdc;background:#fff"><iframe src="{{ it.src }}" loading="lazy" title="{{ it.label }}" style="width:390px;height:844px;border:0;transform:scale(.6);transform-origin:0 0"></iframe></div>
              </sc-if>
              <figcaption style="display:flex;flex-direction:column;gap:2px;max-width:648px">
                <a href="{{ it.src }}" target="_blank" style="font:500 14px/1.35 Inter;text-underline-offset:3px">{{ it.label }}</a>
                <span style="font:400 12px/1.4 'JetBrains Mono';color:#5f645f">{{ it.meta }}</span>
              </figcaption>
            </figure>
          </sc-for>
        </div>
      </section>
    </sc-for>
  </div>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script>
const G=[
 ['Queue + incident panel',[['load','light','d','Default at load: P1 2 · P2 2 · P3 3 · Offline 4 · Signal delayed 1'],['load','dark','d','Default at load · dark'],['load','light','p','Phone · queue'],['load','dark','p','Phone · queue · dark'],['loading','light','d','Loading (skeleton rows)']]],
 ['Primary flow · INC-101',[['inc101','light','d','1 · INC-101 selected: recipient waiting tops P1'],['inc101-confirm','light','d','2 · Retry dispense · inline confirm'],['inc101-running','light','d','3 · Retrying dispense… (in hand, other actions disabled)'],['inc101-done','light','d','4 · Resolved; P1 drops to 1, INC-102 on top'],['inc101','dark','d','INC-101 selected · dark'],['inc101','light','p','Phone · incident page, sticky action bar'],['inc101-done','dark','p','Phone · resolved · dark']]],
 ['Failure flow · INC-102',[['inc102-failed','light','d','Backup fails · Acknowledged, recommendation changes'],['inc102-field-confirm','light','d','Request field visit · inline confirm (breached)'],['inc102-awaiting','light','d','Awaiting field service · In hand'],['inc102-complete','dark','d','Demo control: field task completed · dark']]],
 ['Edge states',[['inc105-owner','light','d','Owned by Operator B · take over notice'],['inc104-recovered','light','d','Recovered on its own · confirm to close'],['inc104-toast','light','d','Off-screen recovery toast'],['inc108-locked','light','d','No permission · Mark for return locked'],['inc108-supervisor','dark','d','Supervisor role · Mark for return confirm · dark'],['inc103','light','d','WAL-02 offline · backup disabled (no LTE)'],['inc106','light','d','Two incidents on LIT-04 · context note'],['inc091','light','d','Resolved incident · read only, Reopen'],['submit-failed','light','d','Submit failed · nothing changed, Retry'],['empty','light','d','No incidents'],['filtered-empty','light','d','Filter with no match (P1)'],['stress','light','d','Large queue · Stress test (47 open)'],['stress-filter','dark','d','Large queue · filtered · dark'],['stress-filter','light','p','Phone · large queue, filtered']]],
 ['Station detail',[['st-LIT-06','light','d','LIT-06 · Signal delayed, values as of 13:54'],['st-LIT-06','dark','p','Phone · LIT-06 · dark'],['st-LIT-04','light','d','LIT-04 · Offline, two open incidents'],['st-WAL-02','dark','d','WAL-02 · Offline, no LTE · dark'],['st-WAL-01-oos','light','d','WAL-01 · Out of service, Return to service available']]],
 ['Parcel detail',[['pcl-0412','light','d','PCL-0412 · one parcel under two incidents'],['pcl-0412','dark','p','Phone · PCL-0412 · dark'],['pcl-0107-picked','light','d','PCL-0107 · Picked up (terminal, no actions)'],['pcl-0301','light','d','PCL-0301 · Hold expired, locked Mark for return'],['pcl-0610','dark','d','PCL-0610 · Ready, availability unknown · dark']]]
];
class Component extends DCLogic {
  renderVals(){
    return {groups:G.map(([title,items])=>({title,items:items.map(([scene,theme,kind,label])=>({src:`PicksyOS Console.dc.html?scene=${scene}&theme=${theme}`,desk:kind==='d',phone:kind==='p',label,meta:`${kind==='d'?'Desktop 1440':'Phone 390'} · ${theme} · scene=${scene}`}))}))};
  }
}
</script>
</body>
</html>
