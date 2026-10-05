'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Site, Project, siteSchema } from '@/lib/model';
import { renderSite } from '@/lib/publish';

type Section = 'hero' | 'work' | 'about' | 'contact';
type Device = 'desktop' | 'mobile';
const sections: { id: Section; number: string; label: string }[] = [
  { id: 'hero', number: '01', label: 'Introduction' },
  { id: 'work', number: '02', label: 'Selected work' },
  { id: 'about', number: '03', label: 'About' },
  { id: 'contact', number: '04', label: 'Contact' },
];

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Editor() {
  const [site, setSite] = useState<Site | null>(null);
  const [section, setSection] = useState<Section>('hero');
  const [device, setDevice] = useState<Device>('desktop');
  const [busy, setBusy] = useState<'save' | 'publish' | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/site', { cache: 'no-store' }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load site.');
      setSite(data); setStatus('Loaded from this computer.');
    }).catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to load site.'));
  }, []);

  function change(patch: Partial<Site>) {
    setSite((current) => current ? { ...current, ...patch } : current);
    setDirty(true); setStatus(''); setError('');
  }

  function updateProject(id: string, patch: Partial<Project>) {
    if (site) change({ projects: site.projects.map((project) => project.id === id ? { ...project, ...patch } : project) });
  }

  function addProject() {
    if (!site || site.projects.length >= 12) return;
    change({ projects: [...site.projects, { id: crypto.randomUUID(), title: 'New project', category: 'Design', year: String(new Date().getFullYear()), description: 'Describe the project.', color: 'sage' }] });
  }

  async function persist(action: 'save' | 'publish') {
    if (!site) return;
    const validated = siteSchema.safeParse(site);
    if (!validated.success) { setError(validated.error.issues[0]?.message || 'Check your fields.'); return; }
    setBusy(action); setError(''); setStatus('');
    try {
      const response = await fetch(action === 'save' ? '/api/site' : '/api/publish', {
        method: action === 'save' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated.data),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Operation failed.');
      setDirty(false);
      setStatus(action === 'save' ? 'Changes saved on this computer.' : `Published to ${data.folder}. Open index.html there or download the HTML file.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Operation failed.'); }
    finally { setBusy(null); }
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 100_000) { setError('Import file is too large (100 KB max).'); return; }
    try {
      const result = siteSchema.safeParse(JSON.parse(await file.text()));
      if (!result.success) throw new Error(result.error.issues[0]?.message || 'Invalid site file.');
      setSite(result.data); setDirty(true); setError(''); setStatus('Imported for review. Save to keep these changes.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not import the file.'); }
  }

  const field = (label: string, key: keyof Site, multiline = false, hint?: string) => {
    if (!site) return null;
    const id = `field-${key}`;
    const value = site[key] as string;
    return <div className="field" key={key}><label htmlFor={id}>{label}</label>{multiline
      ? <textarea id={id} value={value} rows={key === 'aboutBody' ? 6 : 4} onChange={(event) => change({ [key]: event.target.value })} />
      : <input id={id} type={key === 'email' ? 'email' : 'text'} value={value} onChange={(event) => change({ [key]: event.target.value })} />}
      {hint && <p className="hint">{hint}</p>}</div>;
  };

  return <div className="app-shell">
    <header className="app-header"><div className="brand"><span className="brand-mark" aria-hidden="true">✳</span><span>folio<span className="brand-light">local</span></span></div><div className="header-right"><span className="private-pill">● Private workspace</span><span className="header-caption">One site, made yours.</span></div></header>
    <div className="workspace">
      <aside className="sidebar" aria-label="Editor navigation"><div className="sidebar-head"><p className="overline">YOUR WEBSITE</p><h1>Make it yours<span className="period">.</span></h1><p>Edit the essentials. See every change as you make it.</p></div><nav aria-label="Sections">{sections.map((item) => <button key={item.id} type="button" className={`section-button ${section === item.id ? 'active' : ''}`} aria-current={section === item.id ? 'step' : undefined} onClick={() => setSection(item.id)}><span className="section-no">{item.number}</span><span>{item.label}</span><span className="section-arrow" aria-hidden="true">↗</span></button>)}</nav><div className="sidebar-foot"><p>Built for a single local owner.</p><p>No account or cloud connection required.</p></div></aside>
      <main className="editor-panel" id="editor"><div className="panel-top"><span className="overline">PAGE CONTENT</span><span className="save-indicator" aria-live="polite">{dirty ? '● Unsaved changes' : '✓ Saved locally'}</span></div>
        {!site ? <div className="state-box" role="status">{error ? <><h2>Could not open your site</h2><p>{error}</p><button onClick={() => location.reload()}>Try again</button></> : <><h2>Opening your workspace…</h2><p>Loading the local site.</p></>}</div> : <>
          <div className="editor-scroll">
            {section === 'hero' && <><div className="section-heading"><span className="eyebrow">01 / INTRODUCTION</span><h2>First impressions.</h2><p>Introduce your practice in a few clear words.</p></div>{field('Site name', 'siteName', false, 'Shown in the header and browser title.')}{field('Eyebrow', 'eyebrow')}{field('Headline', 'headline')}{field('Introduction', 'introduction', true)}</>}
            {section === 'work' && <><div className="section-heading"><span className="eyebrow">02 / SELECTED WORK</span><h2>Show the work.</h2><p>A small collection of projects with simple color covers.</p></div>{site.projects.length === 0 && <div className="empty-projects"><strong>No projects yet.</strong><p>Add one to fill this section. The published site can also stay empty.</p></div>}{site.projects.map((project, index) => <div className="project-card" key={project.id}><div className="project-card-head"><h3>Project {String(index + 1).padStart(2, '0')}</h3><button type="button" className="text-button danger" onClick={() => change({ projects: site.projects.filter((item) => item.id !== project.id) })}>Remove</button></div><label htmlFor={`title-${project.id}`}>Title</label><input id={`title-${project.id}`} value={project.title} onChange={(event) => updateProject(project.id, { title: event.target.value })} /><div className="two-fields"><div><label htmlFor={`category-${project.id}`}>Category</label><input id={`category-${project.id}`} value={project.category} onChange={(event) => updateProject(project.id, { category: event.target.value })} /></div><div><label htmlFor={`year-${project.id}`}>Year</label><input id={`year-${project.id}`} inputMode="numeric" value={project.year} onChange={(event) => updateProject(project.id, { year: event.target.value })} /></div></div><label htmlFor={`description-${project.id}`}>Description</label><textarea id={`description-${project.id}`} rows={3} value={project.description} onChange={(event) => updateProject(project.id, { description: event.target.value })} /><label htmlFor={`color-${project.id}`}>Cover color</label><select id={`color-${project.id}`} value={project.color} onChange={(event) => updateProject(project.id, { color: event.target.value as Project['color'] })}><option value="sage">Sage</option><option value="clay">Clay</option><option value="lilac">Lilac</option><option value="sand">Sand</option></select></div>)}<button type="button" className="add-button" onClick={addProject} disabled={site.projects.length >= 12}>+ Add project</button></>}
            {section === 'about' && <><div className="section-heading"><span className="eyebrow">03 / ABOUT</span><h2>The person behind it.</h2><p>Share a little about what drives your work.</p></div>{field('Section heading', 'aboutTitle')}{field('About text', 'aboutBody', true)}</>}
            {section === 'contact' && <><div className="section-heading"><span className="eyebrow">04 / CONTACT</span><h2>Keep in touch.</h2><p>Visitors can reach you through a simple email link.</p></div>{field('Contact email', 'email', false, 'Used for the contact link in your published site.')}</>}
          </div>
          <div className="editor-footer"><div className="messages" aria-live="polite">{error && <p className="error" role="alert">{error}</p>}{!error && status && <p className="success">{status}</p>}</div><div className="main-actions"><button className="button secondary" type="button" disabled={!!busy} onClick={() => persist('save')}>{busy === 'save' ? 'Saving…' : 'Save draft'}</button><button className="button primary" type="button" disabled={!!busy} onClick={() => persist('publish')}>{busy === 'publish' ? 'Publishing…' : 'Publish static site'} <span aria-hidden="true">↗</span></button></div><div className="utility-actions"><button type="button" className="text-button" onClick={() => download('portfolio-data.json', JSON.stringify(site, null, 2), 'application/json')}>Export data</button><span aria-hidden="true">·</span><button type="button" className="text-button" onClick={() => fileRef.current?.click()}>Import data</button><span aria-hidden="true">·</span><button type="button" className="text-button" onClick={() => download('portfolio.html', renderSite(site), 'text/html')}>Download HTML</button><input ref={fileRef} type="file" accept="application/json,.json" className="visually-hidden" aria-label="Import site JSON" onChange={importFile} /></div></div>
        </>}
      </main>
      <section className="preview-panel" aria-label="Website preview"><div className="preview-top"><div><span className="overline">LIVE PREVIEW</span><p>This is how your site will look.</p></div><div className="device-toggle" role="group" aria-label="Preview size"><button type="button" className={device === 'desktop' ? 'chosen' : ''} aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}>Desktop</button><button type="button" className={device === 'mobile' ? 'chosen' : ''} aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}>Mobile</button></div></div><div className="preview-stage">{site ? <iframe title={`${device} portfolio preview`} className={`preview-frame ${device}`} srcDoc={renderSite(site)} sandbox="" /> : <div className="preview-loading">Preview will appear here.</div>}</div><p className="preview-note">Preview uses the same layout as the exported static site.</p></section>
    </div>
  </div>;
}
