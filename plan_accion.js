// Plan de Acción - Sistema CUIT | GSB
// Optimized JavaScript

(function() {
  'use strict';

  // Cache DOM elements
  const DOM = {
    tabButtons: null,
    tabPanes: null,
    fechaActual: null,
    horaActual: null,
    faseActual: null,
    cronogramaTitulo: null,
    cronogramaContent: null
  };

  // Cronograma data cache
  let cronogramaData = null;

  // Month name to number mapping
  const MESES = {
    'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
    'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
    'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
  };

  /**
   * Initialize DOM cache
   */
  function initDOM() {
    DOM.tabButtons = document.querySelectorAll('.tab-button');
    DOM.tabPanes = document.querySelectorAll('.tab-pane');
    DOM.fechaActual = document.getElementById('fecha-actual');
    DOM.horaActual = document.getElementById('hora-actual');
    DOM.faseActual = document.getElementById('fase-actual');
    DOM.cronogramaTitulo = document.getElementById('cronograma-titulo');
    DOM.cronogramaContent = document.getElementById('cronograma-content');
  }

  /**
   * Setup tab navigation
   */
  function setupTabs() {
    if (!DOM.tabButtons.length || !DOM.tabPanes.length) return;

    DOM.tabButtons[0].classList.add('active');
    DOM.tabPanes[0].classList.add('active');

    DOM.tabButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        var tabId = this.getAttribute('data-tab');

        DOM.tabButtons.forEach(function(btn) { btn.classList.remove('active'); });
        DOM.tabPanes.forEach(function(pane) { pane.classList.remove('active'); });

        this.classList.add('active');
        var targetPane = document.getElementById(tabId);
        if (targetPane) {
          targetPane.classList.add('active');
        }
      });
    });
  }

  /**
   * Setup intersection observer for scroll animations with stagger effect
   */
  function setupScrollAnimations() {
    var staggerIndex = 0;

    var observer = new IntersectionObserver(function(entries) {
      var visibleEntries = entries.filter(function(e) { return e.isIntersecting; });
      visibleEntries.forEach(function(entry, i) {
        var delay = i * 80;
        setTimeout(function() {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    var sections = document.querySelectorAll(
      '.info-section, .objective-card, .tech-section, .feature-card, .future-section, .deployment-section, .phase, .stat-card, .progress-section'
    );

    sections.forEach(function(section) {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      section.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      observer.observe(section);
    });
  }

  /**
   * Load cronograma data from JSON (single fetch, cached)
   */
  async function loadCronograma() {
    try {
      var response = await fetch('cronograma.json');
      cronogramaData = await response.json();

      if (DOM.cronogramaTitulo) {
        DOM.cronogramaTitulo.textContent = cronogramaData.titulo;
      }

      if (DOM.cronogramaContent) {
        DOM.cronogramaContent.innerHTML = buildCronogramaHTML(cronogramaData);
      }

      // Update phase and progress after data is loaded
      updatePhase();
      updateProgressStats();

    } catch (error) {
      console.error('Error loading cronograma:', error);
      if (DOM.cronogramaTitulo) {
        DOM.cronogramaTitulo.textContent = 'Error al cargar el cronograma';
      }
      if (DOM.cronogramaContent) {
        DOM.cronogramaContent.innerHTML = '<p>No se pudo cargar la información del cronograma.</p>';
      }
    }
  }

  /**
   * Build cronograma HTML from data
   */
  function buildCronogramaHTML(data) {
    var html = '';
    data.periodos.forEach(function(periodo) {
      html += '<div class="periodo-section"><h2 class="periodo-titulo">' +
        periodo.titulo + '</h2><div class="dias-grid">';

      periodo.dias.forEach(function(dia) {
        var actividades = dia.actividades.map(function(a) {
          return '<li>' + a + '</li>';
        }).join('');

        html += '<div class="dia-calendario"><h3>' + dia.fecha + ': ' +
          dia.titulo + '</h3><div class="dia-actividades"><ul class="cronograma-list">' +
          actividades + '</ul></div></div>';
      });

      html += '</div></div>';
    });
    return html;
  }

  /**
   * Update current date and time display
   */
  function updateDateTime() {
    var now = new Date();

    if (DOM.fechaActual) {
      DOM.fechaActual.textContent = now.toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }

    if (DOM.horaActual) {
      var h = String(now.getHours()).padStart(2, '0');
      var m = String(now.getMinutes()).padStart(2, '0');
      var s = String(now.getSeconds()).padStart(2, '0');
      DOM.horaActual.textContent = h + ':' + m + ':' + s;
    }
  }

  /**
   * Update current phase based on cronograma data
   */
  function updatePhase() {
    if (!DOM.faseActual || !cronogramaData) return;

    var now = new Date();
    var day = now.getDate();
    var month = now.getMonth() + 1;
    var diaActual = 'Proyecto en curso';

    for (var i = 0; i < cronogramaData.periodos.length; i++) {
      var periodo = cronogramaData.periodos[i];
      for (var j = 0; j < periodo.dias.length; j++) {
        var dia = periodo.dias[j];
        var parts = dia.fecha.split(' ');
        var diaNum = parseInt(parts[0], 10);
        var mesStr = (parts[1] || '').toLowerCase();
        var mesNum = MESES[mesStr];

        if (diaNum === day && mesNum === month) {
          diaActual = dia.titulo;
          DOM.faseActual.textContent = diaActual;
          return;
        }
      }
    }

    // Fallback phases
    if (month === 1) {
      if (day >= 28 && day <= 31) diaActual = 'Fase 1: Sistema CUIT';
    } else if (month === 2) {
      if (day >= 1 && day <= 13) diaActual = 'Fase 1: Cierre Sistema CUIT';
      else if (day >= 14 && day <= 28) diaActual = 'Fase 2: Riesgo Crediticio + APIs BCRA';
    } else if (month === 3) {
      if (day <= 13) diaActual = 'Fase 2: Riesgo Crediticio (Entrega 13 Marzo)';
      else diaActual = 'Proyecto Completado - En Mantenimiento';
    } else {
      diaActual = 'Proyecto Completado - En Mantenimiento';
    }

    DOM.faseActual.textContent = diaActual;
  }

  /**
   * Parse a cronograma date string and return a Date object (year 2026)
   * Handles: "28 Enero", "9-13 Febrero", "23 Febrero - 12 Marzo"
   * Returns { start: Date, end: Date }
   */
  function parseCronogramaDate(fechaStr) {
    var year = 2026;

    // Range with different months: "23 Febrero - 12 Marzo"
    var rangeMatch = fechaStr.match(/(\d+)\s+(\w+)\s*-\s*(\d+)\s+(\w+)/);
    if (rangeMatch) {
      var startMonth = MESES[rangeMatch[2].toLowerCase()];
      var endMonth = MESES[rangeMatch[4].toLowerCase()];
      if (startMonth && endMonth) {
        return {
          start: new Date(year, startMonth - 1, parseInt(rangeMatch[1])),
          end: new Date(year, endMonth - 1, parseInt(rangeMatch[3]))
        };
      }
    }

    // Range same month: "9-13 Febrero"
    var sameMonthRange = fechaStr.match(/(\d+)-(\d+)\s+(\w+)/);
    if (sameMonthRange) {
      var month = MESES[sameMonthRange[3].toLowerCase()];
      if (month) {
        return {
          start: new Date(year, month - 1, parseInt(sameMonthRange[1])),
          end: new Date(year, month - 1, parseInt(sameMonthRange[2]))
        };
      }
    }

    // Single date: "28 Enero"
    var singleMatch = fechaStr.match(/(\d+)\s+(\w+)/);
    if (singleMatch) {
      var m = MESES[singleMatch[2].toLowerCase()];
      if (m) {
        var d = new Date(year, m - 1, parseInt(singleMatch[1]));
        return { start: d, end: d };
      }
    }

    return null;
  }

  /**
   * Calculate and update progress stats based on cronograma dates
   */
  function updateProgressStats() {
    if (!cronogramaData) return;

    var now = new Date();
    now.setHours(0, 0, 0, 0);

    var totalDias = 0;
    var diasCompletados = 0;
    var diasEnCurso = 0;
    var diasPendientes = 0;
    var totalProyectos = cronogramaData.periodos.length;
    var proyectosCompletados = 0;
    var proyectosEnCurso = 0;

    cronogramaData.periodos.forEach(function(periodo, pIdx) {
      var periodoCompleto = true;
      var periodoEnCurso = false;

      periodo.dias.forEach(function(dia) {
        totalDias++;
        var parsed = parseCronogramaDate(dia.fecha);
        if (!parsed) { diasPendientes++; return; }

        if (now > parsed.end) {
          diasCompletados++;
        } else if (now >= parsed.start && now <= parsed.end) {
          diasEnCurso++;
          periodoEnCurso = true;
          periodoCompleto = false;
        } else {
          diasPendientes++;
          periodoCompleto = false;
        }
      });

      if (periodoCompleto && periodo.dias.length > 0) proyectosCompletados++;
      else if (periodoEnCurso) proyectosEnCurso++;
    });

    var percent = totalDias > 0 ? Math.round((diasCompletados / totalDias) * 100) : 0;

    // Update stat cards
    var statFases = document.getElementById('stat-fases');
    var statCompletadas = document.getElementById('stat-completadas');
    var statDesarrollo = document.getElementById('stat-desarrollo');
    var statPendientes = document.getElementById('stat-pendientes');

    if (statFases) statFases.textContent = totalProyectos;
    if (statCompletadas) statCompletadas.textContent = proyectosCompletados;
    if (statDesarrollo) statDesarrollo.textContent = proyectosEnCurso;
    if (statPendientes) statPendientes.textContent = diasPendientes;

    // Update progress bar
    var progressFill = document.getElementById('progress-fill');
    if (progressFill) {
      setTimeout(function() {
        progressFill.style.width = percent + '%';
        progressFill.textContent = percent + '%';
      }, 300);
    }

    // Build legend from periodos
    var legend = document.getElementById('progress-legend');
    if (legend) {
      var html = '';
      cronogramaData.periodos.forEach(function(periodo) {
        var pCompleto = true;
        var pEnCurso = false;
        periodo.dias.forEach(function(dia) {
          var parsed = parseCronogramaDate(dia.fecha);
          if (!parsed) return;
          if (now <= parsed.end) pCompleto = false;
          if (now >= parsed.start && now <= parsed.end) pEnCurso = true;
        });

        var dotClass = 'dot-pending';
        if (pCompleto && periodo.dias.length > 0) dotClass = 'dot-completed';
        else if (pEnCurso) dotClass = 'dot-in-progress';

        // Extract short name from title
        var name = periodo.titulo.replace(/^[^\s]+\s*/, '').split('(')[0].trim();
        if (name.length > 30) name = name.substring(0, 30) + '...';

        html += '<span class="progress-phase-label"><span class="dot ' + dotClass + '"></span> ' + name + '</span>';
      });
      legend.innerHTML = html;
    }
  }

  /**
   * Main initialization
   */
  document.addEventListener('DOMContentLoaded', function() {
    initDOM();
    setupTabs();
    loadCronograma();
    setupScrollAnimations();
    updateDateTime();
    setInterval(updateDateTime, 1000);
  });

})();
