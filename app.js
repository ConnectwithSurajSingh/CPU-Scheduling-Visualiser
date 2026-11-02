'use strict';
const $ = (id) => document.getElementById(id);
const ALGORITHMS = {
  fcfs: { name: 'First Come, First Served', short: 'FCFS', label: 'FCFS', type: 'Non-preemptive', description: 'Processes are executed in the order they arrive. Once a process gets the CPU, it runs until its CPU burst is complete.', rules: ['Selection: earliest arrival time (FCFS order).', 'Preemption: not allowed; a running process keeps the CPU.', 'Trade-off: simple and fair by arrival order, but a long job can make short jobs wait.'] },
  sjf: { name: 'Shortest Job First', short: 'SJF · NP', label: 'SJF (non-preemptive)', type: 'Non-preemptive', description: 'Whenever the CPU becomes free, the scheduler chooses the ready process with the smallest CPU burst. The chosen process runs to completion.', rules: ['Selection: smallest burst time among arrived processes.', 'Preemption: not allowed once a process starts.', 'Trade-off: often reduces average waiting time, but long jobs may starve.'] },
  srtf: { name: 'Shortest Remaining Time First', short: 'SRTF · P', label: 'SRTF (preemptive)', type: 'Preemptive', description: 'The preemptive form of SJF. At each scheduling instant, the CPU runs the ready process with the least remaining burst time. A newly arrived shorter job can preempt the current one.', rules: ['Selection: smallest remaining CPU time.', 'Preemption: allowed when a process with less remaining time becomes ready.', 'Trade-off: responsive to short jobs, but long jobs can be delayed.'] },
  'priority-np': { name: 'Priority Scheduling', short: 'Priority · NP', label: 'Priority (non-preemptive)', type: 'Non-preemptive', description: 'When the CPU becomes free, it selects the ready process with the highest priority. In this lab, a smaller priority number represents a higher priority.', rules: ['Selection: smallest priority number among ready processes.', 'Preemption: not allowed after a process starts.', 'Trade-off: important jobs run first, but low-priority jobs may starve.'] },
  'priority-p': { name: 'Priority Scheduling', short: 'Priority · P', label: 'Priority (preemptive)', type: 'Preemptive', description: 'The CPU always runs the ready process with the highest priority. If a higher-priority process arrives, it can interrupt the current process. A smaller number means higher priority.', rules: ['Selection: smallest priority number among ready processes.', 'Preemption: allowed when a higher-priority process arrives.', 'Trade-off: urgent work gets faster service; aging can be used to reduce starvation.'] },
  rr: { name: 'Round Robin', short: 'Round Robin', label: 'Round robin', type: 'Preemptive · time-shared', description: 'Each ready process receives the CPU for at most one time quantum. If it is not finished, it returns to the end of the ready queue. This gives processes repeated turns.', rules: ['Selection: first process in the FIFO ready queue.', 'Preemption: at quantum expiry, unless the process has completed.', 'Trade-off: good response for time-sharing; a very small quantum increases context-switch overhead.'] }
};
let processes = [];
let latest = null;
let compareResults = [];
let playbackTime = 0;
let playing = false;
let rafId = null;
let previousFrame = 0;
let toastTimer = null;

function escapeHTML(value) { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
/* Thousands separators for display only; the CSV export stays machine-formatted (DESIGN.md §8) */
const fmtInt = (n) => n.toLocaleString('en-US');
const fmtFixed = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function showToast(message) {
  $('toast').textContent = message; $('toast').classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2600);
}
/* Field errors (§7/§11): 12px message under the failing input, linked with
   aria-describedby + aria-invalid="true"; focus stays on the input. The toast
   remains reserved for global messages (limits, run-before-X, confirmations). */
function showFieldError(id, message) {
  const input = $(id), error = $(id + 'Error');
  error.textContent = message; error.hidden = false;
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', error.id);
}
function clearFieldError(id) {
  const input = $(id), error = $(id + 'Error');
  error.textContent = ''; error.hidden = true;
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
}
/* Same rules addProcess()/validateInputs() enforce, so a visible error clears
   the moment that field's value becomes valid (re-checked on every input). */
function fieldValid(id) {
  if (id === 'arrival') { const n = Number($('arrival').value); return Number.isInteger(n) && n >= 0; }
  if (id === 'burst') { const n = Number($('burst').value); return Number.isInteger(n) && n >= 1; }
  if (id === 'priority') { const n = Number($('priority').value); return Number.isInteger(n) && n >= 0; }
  if (id === 'pid') return !processes.some(p => p.id.toLowerCase() === $('pid').value.trim().toLowerCase());
  if (id === 'quantum') {
    if ($('algorithm').value !== 'rr') return true;
    const q = Number($('quantum').value);
    return Number.isInteger(q) && q >= 1;
  }
  return true;
}
function invalidateResults() {
  latest = null; compareResults = []; stopPlayback(); playbackTime = 0;
  renderPlaybackLabel('play'); /* presentation: un-stick a cached Pause label after playback was stopped */
  $('avgTat').textContent = $('avgWt').textContent = $('avgRt').textContent = $('cpuUtil').textContent = '—';
  $('metricCaption').textContent = 'Run a simulation to calculate performance metrics.';
  $('resultRows').innerHTML = '<tr><td colspan="8" class="empty-row">Results will appear after you run the simulation.</td></tr>';
  $('resultFoot').innerHTML = ''; $('resultCount').textContent = $('finishedCount').textContent = '—';
  $('ganttEmpty').classList.remove('hidden'); $('ganttInner').classList.add('hidden');
  $('executionState').textContent = 'Waiting for simulation'; $('timeReadout').textContent = 'T = 0';
  $('comparisonChart').className = 'compare-empty'; $('comparisonChart').textContent = 'Add at least one process, then select the algorithms you want to compare.';
  $('bestCallout').classList.remove('visible');
}
function renderInputRows() {
  $('processCount').textContent = `${processes.length} process${processes.length === 1 ? '' : 'es'}`;
  if (!processes.length) {
    $('inputRows').innerHTML = '<tr><td class="empty-row" colspan="5">No processes yet. Add a process or load the example.</td></tr>'; return;
  }
  $('inputRows').innerHTML = processes.map((p, i) => `<tr><td class="mono">${escapeHTML(p.id)}</td><td>${p.arrival}</td><td>${p.burst}</td><td>${p.priority}</td><td><button type="button" class="icon-button" data-remove="${i}" aria-label="Remove ${escapeHTML(p.id)}"><svg class="icon" aria-hidden="true" focusable="false"><use href="#i-close"/></svg></button></td></tr>`).join('');
  $('inputRows').querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', () => {
    /* a removed row can resolve a duplicate-ID error, so drop that field error too */
    processes.splice(Number(btn.dataset.remove), 1); clearFieldError('pid'); renderInputRows(); invalidateResults();
  }));
}
function updateAlgorithmBrief() {
  const key = $('algorithm').value, a = ALGORITHMS[key];
  $('algoType').textContent = a.type; $('algoName').textContent = a.name; $('algoDescription').textContent = a.description;
  $('algoRules').innerHTML = a.rules.map((r) => `<li class="rule">${escapeHTML(r)}</li>`).join('');
  $('quantumWrap').classList.toggle('visible', key === 'rr');
}
function addSegment(segments, pid, start, end) {
  if (end <= start) return;
  const last = segments[segments.length - 1];
  if (last && last.pid === pid && last.end === start) last.end = end;
  else segments.push({ pid, start, end });
}
function validateInputs() {
  if (!processes.length) { showToast('Add at least one process before running the simulation.'); return false; }
  const q = Number($('quantum').value);
  if ($('algorithm').value === 'rr' && (!Number.isInteger(q) || q < 1)) { showFieldError('quantum', 'Time quantum must be a whole number, 1 or more.'); $('quantum').focus(); return false; }
  return true;
}
function computeSchedule(key, list, quantum) {
  const sorted = [...list].sort((a,b) => a.arrival-b.arrival || a.order-b.order);
  const remaining = new Map(sorted.map(p => [p.id, p.burst]));
  const firstStart = new Map(); const completion = new Map(); const segments = [];
  let time = 0; let guard = 0;
  const addIdleUntil = (nextTime) => { if (nextTime > time) { addSegment(segments, 'IDLE', time, nextTime); time = nextTime; } };
  if (key === 'fcfs') {
    for (const p of sorted) {
      if (time < p.arrival) addIdleUntil(p.arrival);
      firstStart.set(p.id, time); addSegment(segments, p.id, time, time + p.burst);
      time += p.burst; completion.set(p.id, time);
    }
  } else if (key === 'sjf' || key === 'priority-np') {
    const pending = new Set(sorted.map(p => p.id));
    while (pending.size) {
      if (++guard > 100000) throw new Error('Simulation limit reached. Reduce the process burst times.');
      const ready = sorted.filter(p => pending.has(p.id) && p.arrival <= time);
      if (!ready.length) { const next = sorted.find(p => pending.has(p.id)); addIdleUntil(next.arrival); continue; }
      ready.sort((a,b) => key === 'sjf' ? (a.burst-b.burst || a.arrival-b.arrival || a.order-b.order) : (a.priority-b.priority || a.arrival-b.arrival || a.order-b.order));
      const p = ready[0]; firstStart.set(p.id, time); addSegment(segments, p.id, time, time + p.burst);
      time += p.burst; completion.set(p.id, time); pending.delete(p.id);
    }
  } else if (key === 'srtf' || key === 'priority-p') {
    let finished = 0, current = null;
    while (finished < sorted.length) {
      if (++guard > 1000000) throw new Error('Simulation limit reached. Reduce the process burst times.');
      const ready = sorted.filter(p => remaining.get(p.id) > 0 && p.arrival <= time);
      if (!ready.length) {
        const next = sorted.find(p => remaining.get(p.id) > 0);
        addIdleUntil(next.arrival); current = null; continue;
      }
      let chosen;
      const compare = key === 'srtf'
        ? (a,b) => remaining.get(a.id)-remaining.get(b.id) || a.arrival-b.arrival || a.order-b.order
        : (a,b) => a.priority-b.priority || a.arrival-b.arrival || a.order-b.order;
      ready.sort(compare); chosen = ready[0];
      // Keep the running process on an exact policy tie to avoid artificial preemption.
      if (current && remaining.get(current.id) > 0 && current.arrival <= time) {
        const tie = key === 'srtf' ? remaining.get(current.id) === remaining.get(chosen.id) : current.priority === chosen.priority;
        if (tie) chosen = current;
      }
      if (!firstStart.has(chosen.id)) firstStart.set(chosen.id, time);
      addSegment(segments, chosen.id, time, time + 1);
      remaining.set(chosen.id, remaining.get(chosen.id)-1);
      time += 1; current = chosen;
      if (remaining.get(chosen.id) === 0) { completion.set(chosen.id, time); finished++; current = null; }
    }
  } else if (key === 'rr') {
    const readyQueue = []; let index = 0;
    while (completion.size < sorted.length) {
      if (++guard > 1000000) throw new Error('Simulation limit reached. Reduce the process burst times.');
      while (index < sorted.length && sorted[index].arrival <= time) readyQueue.push(sorted[index++]);
      if (!readyQueue.length) {
        if (index < sorted.length) { addIdleUntil(sorted[index].arrival); continue; }
        break;
      }
      const p = readyQueue.shift();
      if (!firstStart.has(p.id)) firstStart.set(p.id, time);
      const duration = Math.min(quantum, remaining.get(p.id));
      addSegment(segments, p.id, time, time + duration);
      time += duration; remaining.set(p.id, remaining.get(p.id)-duration);
      while (index < sorted.length && sorted[index].arrival <= time) readyQueue.push(sorted[index++]);
      if (remaining.get(p.id) > 0) readyQueue.push(p); else completion.set(p.id, time);
    }
  }
  const rows = sorted.map(p => {
    const ct = completion.get(p.id), tat = ct-p.arrival, wt = tat-p.burst, rt = firstStart.get(p.id)-p.arrival;
    return {...p, ct, tat, wt, rt};
  });
  const average = field => rows.reduce((sum, r) => sum+r[field], 0) / rows.length;
  const busy = rows.reduce((sum, r) => sum+r.burst, 0);
  const start = Math.min(...rows.map(r => r.arrival));
  const end = Math.max(...rows.map(r => r.ct));
  return { key, rows, segments, totalTime: end, startTime: start, busy, elapsed: end-start, avgTat: average('tat'), avgWt: average('wt'), avgRt: average('rt'), utilization: end > start ? busy/(end-start)*100 : 0 };
}
function renderMetrics(result) {
  $('avgTat').textContent = fmtFixed(result.avgTat);
  $('avgWt').textContent = fmtFixed(result.avgWt);
  $('avgRt').textContent = fmtFixed(result.avgRt);
  $('cpuUtil').textContent = `${result.utilization.toFixed(1)}%`;
  $('metricCaption').textContent = `${ALGORITHMS[result.key].label} · ${result.rows.length} processes · ${fmtInt(result.elapsed)} time units elapsed`;
}
function renderResults(result) {
  $('resultCount').textContent = result.rows.length; $('finishedCount').textContent = result.rows.length;
  /* data-pid lets renderPlayback mark the executing process's row (§7) */
  $('resultRows').innerHTML = result.rows.map(r => `<tr data-pid="${escapeHTML(r.id)}"><td class="mono">${escapeHTML(r.id)}</td><td>${fmtInt(r.arrival)}</td><td>${fmtInt(r.burst)}</td><td>${fmtInt(r.priority)}</td><td>${fmtInt(r.ct)}</td><td>${fmtInt(r.tat)}</td><td>${fmtInt(r.wt)}</td><td>${fmtInt(r.rt)}</td></tr>`).join('');
  $('resultFoot').innerHTML = `<tr><td colspan="5" class="average-label">Average</td><td>${fmtFixed(result.avgTat)}</td><td>${fmtFixed(result.avgWt)}</td><td>${fmtFixed(result.avgRt)}</td></tr>`;
}
function renderGantt(result) {
  const unit = Math.max(40, Math.min(76, 950 / Math.max(1, result.totalTime)));
  const width = Math.max(650, Math.ceil(result.totalTime * unit));
  $('ganttEmpty').classList.add('hidden'); $('ganttInner').classList.remove('hidden');
  $('ganttInner').style.width = `${width}px`;
  $('ganttTrack').style.width = `${width}px`; $('timeRuler').style.width = `${width}px`;
  $('ganttTrack').innerHTML = result.segments.map(s => {
    const left = s.start*unit, w = (s.end-s.start)*unit;
    const label = s.pid === 'IDLE' ? 'idle' : escapeHTML(s.pid);
    return `<div class="gantt-segment ${s.pid === 'IDLE' ? 'idle' : ''}" data-start="${s.start}" data-end="${s.end}" data-pid="${escapeHTML(s.pid)}" style="left:${left}px;width:${w}px"><span class="segment-id">${label}</span><span class="segment-duration">${fmtInt(s.end-s.start)} unit${s.end-s.start === 1 ? '' : 's'}</span></div>`;
  }).join('');
  const ticks = new Set([0, result.totalTime]); result.segments.forEach(s => { ticks.add(s.start); ticks.add(s.end); });
  $('timeRuler').innerHTML = [...ticks].sort((a,b)=>a-b).map(t => `<span class="time-tick ${t===0?'first':''} ${t===result.totalTime?'last':''}" style="left:${t*unit}px">${fmtInt(t)}</span>`).join('');
  $('playhead').style.transform = 'translateX(-1px)'; /* T = 0; -1px centers the 2px line (§8) */
  $('playhead').dataset.unit = unit;
  $('ganttInner').dataset.width = width;
  renderPlayback();
}
/* Transport button = state swap: sprite icon + plain word (Play/Pause, the §12
   set). The last rendered state is cached so the per-frame render path only
   touches the button when the state actually changes. At the end of the
   timeline Play restarts from T = 0, which the state line already reports. */
let playbackLabel = '';
function renderPlaybackLabel(state) {
  if (state === playbackLabel) return;
  playbackLabel = state;
  const [icon, word] = { play: ['i-play', 'Play'], pause: ['i-pause', 'Pause'] }[state];
  $('playPlayback').innerHTML = `<svg class="icon icon--20" aria-hidden="true" focusable="false"><use href="#${icon}"/></svg>${word}`;
}
function renderPlayback() {
  if (!latest) return;
  /* §10: the reduced-motion preference is read live on every render, never cached. */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t = Math.min(playbackTime, latest.totalTime);
  /* §10 reduced motion: the playhead renders in discrete one-unit steps (no
     sub-unit interpolation); the internal clock keeps its fractional value, so
     playback timing stays honest. With motion allowed, shown === t. */
  const shown = reduced ? Math.round(t) : t;
  const unit = Number($('playhead').dataset.unit || 40);
  /* transform, not left: position without layout work, movement stays linear (§8) */
  $('playhead').style.transform = `translateX(${shown * unit - 1}px)`;
  $('timeReadout').textContent = `T = ${shown.toLocaleString('en-US', { maximumFractionDigits: 1 })}`;
  const segment = latest.segments.find(s => shown >= s.start && shown < s.end);
  document.querySelectorAll('.gantt-segment').forEach(el => {
    const active = segment && el.dataset.pid === segment.pid && Number(el.dataset.start) === segment.start;
    el.classList.toggle('active', !!active);
  });
  /* §7: the executing process's row carries the active treatment; no row while
     the CPU is idle or between runs. One highlighted row at a time. */
  document.querySelectorAll('#resultRows tr[data-pid]').forEach(row => {
    row.classList.toggle('is-active', !!(segment && segment.pid !== 'IDLE' && row.dataset.pid === segment.pid));
  });
  if (t >= latest.totalTime) { $('executionState').textContent = 'All processes completed'; }
  else if (segment) $('executionState').textContent = segment.pid === 'IDLE' ? 'CPU is idle' : `Executing ${segment.pid}`;
  else $('executionState').textContent = 'Ready';
  renderPlaybackLabel(playing ? 'pause' : 'play');
}
function stopPlayback() { playing = false; if (rafId !== null) cancelAnimationFrame(rafId); rafId = null; previousFrame = 0; }
function animationFrame(ts) {
  if (!playing || !latest) return;
  if (!previousFrame) previousFrame = ts;
  const delta = Math.min(100, ts-previousFrame); previousFrame = ts;
  playbackTime += delta/1000 * Number($('speed').value) * 2;
  if (playbackTime >= latest.totalTime) { playbackTime = latest.totalTime; stopPlayback(); }
  renderPlayback();
  if (playing) rafId = requestAnimationFrame(animationFrame);
}
function togglePlayback() {
  if (!latest) { showToast('Run a simulation before starting playback.'); return; }
  if (playing) { stopPlayback(); renderPlayback(); return; }
  if (playbackTime >= latest.totalTime) playbackTime = 0;
  playing = true; previousFrame = 0; renderPlayback(); rafId = requestAnimationFrame(animationFrame);
}
function runSimulation() {
  if (!validateInputs()) return;
  stopPlayback();
  try {
    const result = computeSchedule($('algorithm').value, processes, Number($('quantum').value));
    latest = result; playbackTime = 0;
    renderMetrics(result); renderResults(result); renderGantt(result); renderPlayback();
    showToast(`${ALGORITHMS[result.key].label} simulation completed.`);
  } catch (error) { showToast(error.message || 'Unable to run simulation.'); }
}
function runComparison() {
  if (!validateInputs()) return;
  const selected = [...$('compareSelect').querySelectorAll('input:checked')].map(i => i.value);
  if (selected.length < 2) { showToast('Select at least two algorithms to compare.'); return; }
  try {
    const q = Number($('quantum').value);
    compareResults = selected.map(key => computeSchedule(key, processes, q));
    renderComparison(compareResults);
    showToast(`Compared ${selected.length} algorithms on the same process set.`);
  } catch (error) { showToast(error.message || 'Unable to compare algorithms.'); }
}
function renderComparison(results) {
  const maxValue = Math.max(1, ...results.flatMap(r => [r.avgTat, r.avgWt]));
  $('comparisonChart').className = 'compare-chart';
  /* Each fill carries its final width inline from the start (data-width kept as
     the value's carrier). The label is a sibling of the fill, anchored to
     .bar-line, so the scaleX reveal can never distort or re-contain it (§8). */
  $('comparisonChart').innerHTML = results.map(r => {
    const tat = r.avgTat/maxValue*100, wt = r.avgWt/maxValue*100;
    return `<div class="compare-row"><div class="compare-name">${escapeHTML(ALGORITHMS[r.key].label)}</div><div class="bars"><div class="bar-line"><div class="bar-fill tat" data-width="${tat}" style="width:${tat}%"></div><span class="bar-value">${fmtFixed(r.avgTat)}</span></div><div class="bar-line"><div class="bar-fill wt" data-width="${wt}" style="width:${wt}%"></div><span class="bar-value">${fmtFixed(r.avgWt)}</span></div></div></div>`;
  }).join('');
  /* One-shot reveal (§8): transform scaleX 0 → 1, 200ms, once per run. The
     forced reflow computes the scaleX(0) state before the class flips, so the
     transition actually runs instead of snapping. */
  const fills = $('comparisonChart').querySelectorAll('.bar-fill');
  void $('comparisonChart').offsetHeight;
  requestAnimationFrame(() => fills.forEach(el => el.classList.add('revealed')));
  const bestTat = [...results].sort((a,b)=>a.avgTat-b.avgTat)[0];
  const bestWt = [...results].sort((a,b)=>a.avgWt-b.avgWt)[0];
  $('bestCallout').innerHTML = `For this workload, <strong>${escapeHTML(ALGORITHMS[bestTat.key].label)}</strong> has the lowest average turnaround time (${fmtFixed(bestTat.avgTat)}), while <strong>${escapeHTML(ALGORITHMS[bestWt.key].label)}</strong> has the lowest average waiting time (${fmtFixed(bestWt.avgWt)}).`;
  $('bestCallout').classList.add('visible');
}
function exportCSV() {
  if (!latest) { showToast('Run a simulation before exporting results.'); return; }
  const header = ['Process ID','Arrival Time','Burst Time','Priority','Completion Time','Turnaround Time','Waiting Time','Response Time'];
  const lines = [header, ...latest.rows.map(r => [r.id,r.arrival,r.burst,r.priority,r.ct,r.tat,r.wt,r.rt]), ['AVERAGE','','','','',latest.avgTat.toFixed(2),latest.avgWt.toFixed(2),latest.avgRt.toFixed(2)]];
  const csv = lines.map(row => row.map(value => `"${String(value).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'}); const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `cpu-lab-${latest.key}-results.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  showToast('Results exported as CSV.');
}
function nextAvailablePid() {
  let n = 1;
  while (processes.some(p => p.id.toLowerCase() === `p${n}`)) n++;
  return `P${n}`;
}
function addProcess() {
  const arrival = Number($('arrival').value), burst = Number($('burst').value), priority = Number($('priority').value);
  const id = $('pid').value.trim() || nextAvailablePid();
  if (!Number.isInteger(arrival) || arrival < 0) { showFieldError('arrival', 'Arrival time must be a whole number, 0 or more.'); $('arrival').focus(); return; }
  if (!Number.isInteger(burst) || burst < 1) { showFieldError('burst', 'Burst time must be a whole number, 1 or more.'); $('burst').focus(); return; }
  if (!Number.isInteger(priority) || priority < 0) { showFieldError('priority', 'Priority must be a whole number, 0 or more.'); $('priority').focus(); return; }
  if (processes.some(p => p.id.toLowerCase() === id.toLowerCase())) { showFieldError('pid', 'That ID is already in the queue. Process IDs must be unique.'); $('pid').focus(); return; }
  if (processes.length >= 30) { showToast('The queue holds up to 30 processes.'); return; }
  const order = processes.reduce((max, p) => Math.max(max, p.order), -1) + 1;
  processes.push({id, arrival, burst, priority, order});
  $('pid').value = ''; $('arrival').value = '0'; $('burst').value = '5'; $('priority').value = '1';
  ['pid', 'arrival', 'burst', 'priority'].forEach(clearFieldError); /* the form reset to valid defaults */
  renderInputRows(); invalidateResults(); $('pid').focus();
}
function loadExample() {
  processes = [
    {id:'P1',arrival:0,burst:7,priority:3,order:0},
    {id:'P2',arrival:2,burst:4,priority:1,order:1},
    {id:'P3',arrival:4,burst:1,priority:4,order:2},
    {id:'P4',arrival:5,burst:4,priority:2,order:3}
  ];
  $('algorithm').value = 'srtf'; $('quantum').value = '2'; updateAlgorithmBrief();
  clearFieldError('pid'); clearFieldError('quantum'); /* the replaced queue and quantum are both valid now */
  renderInputRows(); invalidateResults(); showToast('Example process set loaded. Run the simulation to view the result.');
}
function clearAll() { processes = []; clearFieldError('pid'); renderInputRows(); invalidateResults(); showToast('Process queue cleared.'); }

$('algorithm').addEventListener('change', () => { updateAlgorithmBrief(); invalidateResults(); clearFieldError('quantum'); });
$('quantum').addEventListener('change', invalidateResults);
$('addProcess').addEventListener('click', addProcess);
$('loadExample').addEventListener('click', loadExample);
$('clearAll').addEventListener('click', clearAll);
$('runSimulation').addEventListener('click', runSimulation);
$('compareButton').addEventListener('click', runComparison);
$('exportCsv').addEventListener('click', exportCSV);
$('playPlayback').addEventListener('click', togglePlayback);
$('resetPlayback').addEventListener('click', () => { if (!latest) return; stopPlayback(); playbackTime = 0; renderPlayback(); });
$('stepPlayback').addEventListener('click', () => { if (!latest) { showToast('Run a simulation before stepping.'); return; } stopPlayback(); playbackTime = Math.min(latest.totalTime, Math.floor(playbackTime)+1); renderPlayback(); });
$('pid').addEventListener('keydown', e => { if (e.key === 'Enter') addProcess(); });
$('burst').addEventListener('keydown', e => { if (e.key === 'Enter') addProcess(); });
/* inline errors clear as soon as the edited value satisfies the field's rule */
['pid', 'arrival', 'burst', 'priority', 'quantum'].forEach(id => $(id).addEventListener('input', () => { if (fieldValid(id)) clearFieldError(id); }));
updateAlgorithmBrief(); renderInputRows();
