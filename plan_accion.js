// Plan de Accion GSB - Desktop + Mobile (Instagram)
(function() {
  'use strict';

  var STORAGE_KEY = 'gsb_plan_tasks';

  var FASES = [
    { id: 'fase1', title: 'Fase 1: Sistema de Consulta CUIT', short: 'Fase 1 — CUIT', period: '28 Enero - 13 Febrero 2026', status: 'completed', tasks: [
      'Motor de busqueda de CUIT con API ARCA (ex AFIP)', 'Base de datos centralizada para almacenamiento', 'Consulta individual y masiva de CUITs',
      'Sistema de autenticacion con usuarios y sesiones', 'Historial de busquedas y sistema de favoritos', 'Comparador de CUITs lado a lado',
      'Exportacion PDF, Excel y CSV', 'Estadisticas de uso con graficos', 'Diseno responsive Mobile First'
    ]},
    { id: 'fase2', title: 'Fase 2: Riesgo Crediticio', short: 'Fase 2 — BCRA', period: '13 Febrero - 13 Marzo 2026', status: 'completed', tasks: [
      'Integracion con APIs del BCRA (Central de Deudores)', 'Consulta de situacion crediticia y cheques rechazados', 'Cache inteligente con fallback cuando BCRA no responde',
      'Panel de riesgo integrado en resultados de busqueda', 'Alertas Tempranas (watchlist con deteccion de cambios)', 'Actualizacion automatica semanal',
      'Score de Confianza interno (escala 1-5) con historial', 'Feed cronologico de alertas y novedades', 'Indicadores visuales datos frescos vs cache'
    ]},
    { id: 'fase3b', title: 'Fase 3B: Precios CSOnline (Shell / Raizen)', short: 'Shell', period: '28 Marzo - 25 Abril 2026', status: 'in-progress', tasks: [
      'Analisis del flujo OAuth2 de CSOnline (Raizen)', 'Desarrollo de login automatico CSOnline', 'Navegacion programatica en CSOnline',
      'Extraccion de FOB y CIF por estacion', 'Extraccion de IDC (CO2) e ICL (ITC)', 'Extraccion de Precio Sugerido (surtidor)',
      'Soporte para las 4 estaciones de servicio', 'Extraccion de datos cuenta AGRO Gral Pico', 'Extraccion de datos cuenta AGRO Pehuajo',
      'Extraccion de datos cuenta AGRO Pihue', 'Consolidacion de datos de 7 cuentas', 'Base de datos para precios Shell con historico',
      'Panel de precios Shell en sistema Berria', 'Tabla comparativa Axion vs Shell', 'Automatizacion diaria 7:00 AM (Shell + Axion)',
      'Testing integral con todas las cuentas', 'Deploy a produccion y entrega Fase 3'
    ], deadlines: [
      '2026-03-29', '2026-03-31', '2026-04-01',
      '2026-04-04', '2026-04-05', '2026-04-05',
      '2026-04-06', '2026-04-07', '2026-04-08',
      '2026-04-09', '2026-04-13', '2026-04-15',
      '2026-04-16', '2026-04-20', '2026-04-23',
      '2026-04-24', '2026-04-25'
    ]},
    { id: 'fase3a', title: 'Fase 3A: Precios Energy Center (Axion)', short: 'Axion', period: '27 Abril - 27 Mayo 2026', status: 'pending', tasks: [
      'Analisis del flujo OAuth2 de Energy Center', 'Desarrollo del modulo de login automatico', 'Navegacion programatica dentro de la plataforma',
      'Extraccion de Costo Basico (CB) por estacion', 'Extraccion de ITC (impuesto interno)', 'Extraccion de CO2 (impuesto interno)',
      'Extraccion de Precio Surtidor (precio sugerido)', 'Extraccion de precio FOB por estacion', 'Simulacion automatica de pedido para obtener CIF',
      'Soporte multi-estacion con datos independientes', 'Manejo de estaciones con solo FOB o solo CIF', 'Base de datos para precios con historico',
      'Panel de precios Axion en sistema Berria', 'Tarea programada diaria a las 7:00 AM', 'Testing integral con todas las estaciones', 'Deploy a produccion del modulo Axion'
    ], deadlines: [
      '2026-04-27', '2026-04-30', '2026-05-01',
      '2026-05-04', '2026-05-04', '2026-05-04',
      '2026-05-04', '2026-05-08', '2026-05-11',
      '2026-05-14', '2026-05-15', '2026-05-17',
      '2026-05-18', '2026-05-22', '2026-05-24', '2026-05-27'
    ]}
  ];

  // ============ STATE ============
  function getState() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch(e) { return {}; } }
  function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
  function isTaskDone(faseId, idx) {
    var f = FASES.find(function(x) { return x.id === faseId; });
    if (f && f.status === 'completed') return true;
    // Auto-tick: si la fecha limite ya paso, la tarea esta completada
    if (f && f.deadlines && f.deadlines[idx]) {
      var today = new Date(); today.setHours(0,0,0,0);
      var dl = new Date(f.deadlines[idx] + 'T00:00:00'); dl.setHours(0,0,0,0);
      if (today >= dl) return true;
    }
    return !!getState()[faseId + '_' + idx];
  }
  function toggleTask(faseId, idx) {
    var f = FASES.find(function(x) { return x.id === faseId; });
    if (f && f.status === 'completed') return;
    // No permitir destildar tareas auto-completadas por fecha
    if (f && f.deadlines && f.deadlines[idx]) {
      var today = new Date(); today.setHours(0,0,0,0);
      var dl = new Date(f.deadlines[idx] + 'T00:00:00'); dl.setHours(0,0,0,0);
      if (today >= dl) return;
    }
    var s = getState(); s[faseId + '_' + idx] = !s[faseId + '_' + idx]; saveState(s);
    renderFase(faseId); updateProgress();
  }
  window.__toggle = toggleTask;

  // ============ RENDER FASE (both desktop + mobile) ============
  function renderFase(faseId) {
    var fase = FASES.find(function(x) { return x.id === faseId; });
    if (!fase) return;
    var done = 0;
    fase.tasks.forEach(function(t, i) { if (isTaskDone(faseId, i)) done++; });
    var pct = Math.round((done / fase.tasks.length) * 100);
    var circumference = 2 * Math.PI * 34;
    var offset = circumference - (pct / 100) * circumference;
    var statusClass = fase.status === 'completed' ? 'completed' : fase.status === 'in-progress' ? 'in-progress' : 'pending';
    var statusText = fase.status === 'completed' ? 'Completada' : fase.status === 'in-progress' ? 'En Desarrollo' : 'Pendiente';
    var ringColor = pct === 100 ? '' : fase.status === 'in-progress' ? 'yellow' : 'gold';

    // Build task HTML (reused)
    function buildTasks(prefix) {
      var h = '';
      var today = new Date(); today.setHours(0,0,0,0);
      fase.tasks.forEach(function(task, idx) {
        var isDone = isTaskDone(faseId, idx);
        var isLocked = fase.status === 'completed';
        // Tareas auto-completadas por fecha tambien son locked
        if (!isLocked && fase.deadlines && fase.deadlines[idx]) {
          var dl = new Date(fase.deadlines[idx] + 'T00:00:00'); dl.setHours(0,0,0,0);
          if (today >= dl) isLocked = true;
        }
        if (prefix === 'mob') {
          var cls = isLocked ? 'mob-task-item locked' : isDone ? 'mob-task-item done' : 'mob-task-item';
          var oc = isLocked ? '' : ' onclick="window.__toggle(\'' + faseId + '\',' + idx + ')"';
          h += '<div class="' + cls + '"' + oc + '><div class="mob-task-check"><i class="fas fa-check"></i></div><div class="mob-task-text">' + task + '</div></div>';
        } else {
          var cls2 = isDone ? 'd-task done' : 'd-task pending';
          var oc2 = isLocked ? '' : ' onclick="window.__toggle(\'' + faseId + '\',' + idx + ')"';
          var icon = isDone ? '<i class="fas fa-check-circle"></i>' : '<i class="far fa-circle"></i>';
          h += '<div class="' + cls2 + '"' + oc2 + '>' + icon + ' ' + task + '</div>';
        }
      });
      return h;
    }

    // --- Mobile ---
    var mobEl = document.getElementById('mob-' + faseId);
    if (mobEl) {
      var mh = '<div class="mob-fase-header">';
      mh += '<div class="mob-fase-ring"><svg width="80" height="80"><circle class="ring-bg" cx="40" cy="40" r="34"/><circle class="ring-fill ' + ringColor + '" cx="40" cy="40" r="34" stroke-dasharray="' + circumference + '" stroke-dashoffset="' + offset + '"/></svg><div class="mob-fase-ring-pct">' + pct + '%</div></div>';
      mh += '<div class="mob-fase-title">' + fase.title + '</div>';
      mh += '<div class="mob-fase-period">' + fase.period + '</div>';
      mh += '<div class="mob-fase-status ' + statusClass + '">' + statusText + ' — ' + done + '/' + fase.tasks.length + '</div></div>';
      mh += '<div class="mob-task-card"><div class="mob-task-card-header">Tareas</div>' + buildTasks('mob') + '</div>';
      mobEl.innerHTML = mh;
    }

    // --- Desktop timeline item ---
    // We rebuild the whole timeline for simplicity
  }

  function renderDesktopTimeline() {
    var container = document.getElementById('d-fases-timeline');
    if (!container) return;
    var html = '';
    FASES.forEach(function(fase) {
      var done = 0;
      fase.tasks.forEach(function(t, i) { if (isTaskDone(fase.id, i)) done++; });
      var pct = Math.round((done / fase.tasks.length) * 100);
      var markerClass = fase.status === 'completed' ? 'completed' : fase.status === 'in-progress' ? 'in-progress' : 'pending';
      var markerIcon = fase.status === 'completed' ? '<i class="fas fa-check"></i>' : fase.status === 'in-progress' ? '<i class="fas fa-cog fa-spin"></i>' : '<i class="fas fa-clock"></i>';
      var badgeClass = fase.status === 'completed' ? 'd-badge-completed' : fase.status === 'in-progress' ? 'd-badge-progress' : 'd-badge-pending';
      var badgeText = fase.status === 'completed' ? 'Completada' : fase.status === 'in-progress' ? 'En Desarrollo' : 'Pendiente';

      html += '<div class="d-timeline-item"><div class="d-timeline-marker ' + markerClass + '">' + markerIcon + '</div><div class="d-timeline-content">';
      html += '<div class="d-timeline-header"><h3>' + fase.title + '</h3><span class="d-badge ' + badgeClass + '">' + badgeText + '</span></div>';
      html += '<div class="d-timeline-period">' + fase.period + '</div>';
      html += '<div class="d-phase-progress"><div class="d-phase-progress-bar"><div class="d-phase-progress-fill" style="width:' + pct + '%;"></div></div><span class="d-phase-progress-text">' + done + '/' + fase.tasks.length + '</span></div>';
      html += '<div class="d-timeline-tasks">';
      var today = new Date(); today.setHours(0,0,0,0);
      fase.tasks.forEach(function(task, idx) {
        var isDone = isTaskDone(fase.id, idx);
        var isLocked = fase.status === 'completed';
        if (!isLocked && fase.deadlines && fase.deadlines[idx]) {
          var dl = new Date(fase.deadlines[idx] + 'T00:00:00'); dl.setHours(0,0,0,0);
          if (today >= dl) isLocked = true;
        }
        var cls = isDone ? 'd-task done' : 'd-task pending';
        var oc = isLocked ? '' : ' onclick="window.__toggle(\'' + fase.id + '\',' + idx + ')"';
        var icon = isDone ? '<i class="fas fa-check-circle"></i>' : '<i class="far fa-circle"></i>';
        html += '<div class="' + cls + '"' + oc + '>' + icon + ' ' + task + '</div>';
      });
      html += '</div></div></div>';
    });
    container.innerHTML = html;
  }

  function renderAllFases() {
    FASES.forEach(function(f) { renderFase(f.id); });
    renderDesktopTimeline();
  }

  // ============ PROGRESS (updates both desktop + mobile) ============
  function updateProgress() {
    var total = 0, done = 0, completedF = 0, inProgressF = 0, currentFase = null;
    FASES.forEach(function(f) {
      var d = 0;
      f.tasks.forEach(function(t, i) { total++; if (isTaskDone(f.id, i)) { done++; d++; } });
      if (d === f.tasks.length) completedF++;
      else if (d > 0 || f.status === 'in-progress') { inProgressF++; if (!currentFase) currentFase = f; }
      else if (!currentFase) currentFase = f;
    });
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;

    function set(id, val) { var e = document.getElementById(id); if (e) e.textContent = val; }
    function setW(id, val) { var e = document.getElementById(id); if (e) e.style.width = val; }

    // Desktop
    set('d-stat-completadas', completedF);
    set('d-stat-desarrollo', inProgressF || (FASES.length - completedF));
    set('d-stat-tareas', done + '/' + total);
    if (currentFase) set('d-fase-actual', currentFase.title);
    set('d-progress-fill', pct + '%'); setW('d-progress-fill', pct + '%');

    // Mobile
    set('mob-stat-completadas', completedF);
    set('mob-stat-desarrollo', inProgressF || (FASES.length - completedF));
    set('mob-stat-tareas', done + '/' + total);
    if (currentFase) { set('mob-fase-actual', currentFase.title); set('mob-fase-actual-period', currentFase.period); }
    set('mob-progress-pct', pct + '%');
    var mobFill = document.getElementById('mob-progress-fill');
    if (mobFill) mobFill.style.width = pct + '%';

    // Legends
    function buildLegend(prefix) {
      var h = '';
      FASES.forEach(function(f) {
        var d = 0; f.tasks.forEach(function(t, i) { if (isTaskDone(f.id, i)) d++; });
        var allDone = d === f.tasks.length;
        var dotClass = allDone ? (prefix === 'mob' ? 'green' : 'completed') : (d > 0 || f.status === 'in-progress') ? (prefix === 'mob' ? 'yellow' : 'in-progress') : (prefix === 'mob' ? 'dim' : 'pending');
        var itemClass = prefix === 'mob' ? 'mob-legend-item' : 'd-legend-item';
        var dotEl = prefix === 'mob' ? 'mob-legend-dot' : 'd-legend-dot';
        h += '<span class="' + itemClass + '"><span class="' + dotEl + ' ' + dotClass + '"></span>' + f.short + '</span>';
      });
      return h;
    }

    var dl = document.getElementById('d-progress-legend');
    if (dl) dl.innerHTML = buildLegend('desk');
    var ml = document.getElementById('mob-progress-legend');
    if (ml) ml.innerHTML = buildLegend('mob');

    renderDesktopTimeline();
  }

  // ============ TABS ============
  function setupTabs() {
    // Desktop sidebar
    document.querySelectorAll('[data-desk]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.getAttribute('data-desk');
        document.querySelectorAll('.desk-page').forEach(function(p) { p.classList.remove('active'); });
        document.querySelectorAll('[data-desk]').forEach(function(b) { b.classList.remove('active'); });
        var target = document.getElementById(id);
        if (target) target.classList.add('active');
        this.classList.add('active');
      });
    });

    // Mobile stories + bottom nav
    document.querySelectorAll('[data-mob]').forEach(function(el) {
      el.addEventListener('click', function() {
        var id = this.getAttribute('data-mob');
        document.querySelectorAll('.mob-page').forEach(function(p) { p.classList.remove('active'); });
        document.querySelectorAll('.mob-story').forEach(function(s) { s.classList.remove('active'); });
        document.querySelectorAll('.mob-nav-btn').forEach(function(b) { b.classList.remove('active'); });
        var target = document.getElementById(id);
        if (target) target.classList.add('active');
        // Activate story
        var story = document.querySelector('.mob-story[data-mob="' + id + '"]');
        if (story) { story.classList.add('active'); story.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
        // Activate bottom nav
        var nav = document.querySelector('.mob-nav-btn[data-mob="' + id + '"]');
        if (nav) nav.classList.add('active');
        // If it's a fase, activate the fases button
        if (id.indexOf('mob-fase') === 0) {
          var navF = document.getElementById('mob-nav-fases');
          if (navF) navF.classList.add('active');
        }
        window.scrollTo(0, 0);
      });
    });
  }

  // ============ DATETIME ============
  function updateDateTime() {
    var now = new Date();
    var fechaStr = now.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    var horaStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    var horaFull = horaStr + ':' + String(now.getSeconds()).padStart(2, '0');

    var df = document.getElementById('d-fecha'); if (df) df.textContent = fechaStr;
    var dh = document.getElementById('d-hora'); if (dh) dh.textContent = horaFull;
    var mf = document.getElementById('mob-fecha'); if (mf) mf.textContent = fechaStr;
    var mh = document.getElementById('mob-hora'); if (mh) mh.textContent = horaStr;
  }

  // ============ CRONOGRAMA ============
  async function loadCronograma() {
    try {
      var res = await fetch('cronograma.json');
      var data = await res.json();

      // Desktop
      var dc = document.getElementById('d-crono-content');
      if (dc) {
        var dh = '';
        data.periodos.forEach(function(p) {
          dh += '<div class="d-crono-project"><div class="d-crono-project-header">' + p.titulo + '</div><div class="d-crono-grid">';
          p.dias.forEach(function(d) {
            dh += '<div class="d-crono-day"><div class="d-crono-day-date">' + d.fecha + '</div><div class="d-crono-day-title">' + d.titulo + '</div><ul>';
            d.actividades.forEach(function(a) { dh += '<li>' + a + '</li>'; });
            dh += '</ul></div>';
          });
          dh += '</div></div>';
        });
        dc.innerHTML = dh;
      }

      // Mobile - solo Fase 3A (Axion) y 3B (Shell) con tabs
      var mobAxion = document.getElementById('mob-crono-axion');
      var mobShell = document.getElementById('mob-crono-shell');

      function buildMobCrono(periodo) {
        var h = '<div class="mob-crono-block"><div class="mob-crono-block-title">' + periodo.titulo + '</div>';
        periodo.dias.forEach(function(d) {
          h += '<div class="mob-crono-item"><div class="mob-crono-date">' + d.fecha + '</div><div class="mob-crono-title">' + d.titulo + '</div><ul class="mob-crono-acts">';
          d.actividades.forEach(function(a) { h += '<li>' + a + '</li>'; });
          h += '</ul></div>';
        });
        h += '</div>';
        return h;
      }

      // Fase 3B (Shell) = index 2, Fase 3A (Axion) = index 3, Historico = index 0+1
      if (mobShell && data.periodos[2]) mobShell.innerHTML = buildMobCrono(data.periodos[2]);
      if (mobAxion && data.periodos[3]) mobAxion.innerHTML = buildMobCrono(data.periodos[3]);
      var mobHist = document.getElementById('mob-crono-historico');
      if (mobHist) {
        var hh = '';
        if (data.periodos[0]) hh += buildMobCrono(data.periodos[0]);
        if (data.periodos[1]) hh += buildMobCrono(data.periodos[1]);
        mobHist.innerHTML = hh;
      }

      // Setup tabs
      document.querySelectorAll('.mob-crono-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          var target = this.getAttribute('data-crono');
          document.querySelectorAll('.mob-crono-tab').forEach(function(t) { t.classList.remove('active'); });
          document.querySelectorAll('.mob-crono-panel').forEach(function(p) { p.classList.remove('active'); });
          this.classList.add('active');
          var panel = document.getElementById(target);
          if (panel) panel.classList.add('active');
        });
      });
    } catch(e) {}
  }

  // ============ CAROUSEL ============
  function setupCarousel() {
    var carousel = document.querySelector('.mob-carousel');
    var dotsC = document.getElementById('mob-carousel-dots');
    if (!carousel || !dotsC) return;
    var cards = carousel.querySelectorAll('.mob-carousel-card');
    var dh = '';
    for (var i = 0; i < cards.length; i++) dh += '<div class="mob-carousel-dot' + (i === 0 ? ' active' : '') + '"></div>';
    dotsC.innerHTML = dh;
    var dots = dotsC.querySelectorAll('.mob-carousel-dot');
    carousel.addEventListener('scroll', function() {
      var idx = Math.round(carousel.scrollLeft / (cards[0].offsetWidth + 10));
      dots.forEach(function(d, i) { d.classList.toggle('active', i === idx); });
    });
  }

  // ============ INIT ============
  document.addEventListener('DOMContentLoaded', function() {
    setupTabs();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    renderAllFases();
    updateProgress();
    loadCronograma();
    setupCarousel();
  });

})();
