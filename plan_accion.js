// Function to load cronograma from JSON
async function loadCronograma() {
    try {
        const response = await fetch('cronograma.json');
        const data = await response.json();

        const tituloElement = document.getElementById('cronograma-titulo');
        const contentElement = document.getElementById('cronograma-content');

        // Set title
        tituloElement.textContent = data.titulo;

        // Generate HTML for periods
        let html = '';
        data.periodos.forEach(periodo => {
            html += `
                <div class="periodo-section">
                    <h2 class="periodo-titulo">${periodo.titulo}</h2>
                    <div class="dias-grid">
            `;

            periodo.dias.forEach(dia => {
                html += `
                    <div class="dia-calendario">
                        <h3>${dia.fecha}: ${dia.titulo}</h3>
                        <div class="dia-actividades">
                            <ul class="cronograma-list">
                                ${dia.actividades.map(actividad => `<li>${actividad}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        contentElement.innerHTML = html;

    } catch (error) {
        console.error('Error loading cronograma:', error);
        document.getElementById('cronograma-titulo').textContent = 'Error al cargar el cronograma';
        document.getElementById('cronograma-content').innerHTML = '<p>No se pudo cargar la información del cronograma.</p>';
    }
}

// Tab functionality for the Action Plan viewer
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Initialize first tab as active (Resumen Ejecutivo)
    if (tabButtons.length > 0 && tabPanes.length > 0) {
        tabButtons[0].classList.add('active');
        tabPanes[0].classList.add('active');
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            const targetPane = document.getElementById(tabId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    // Add smooth scrolling for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        });
    });

    // Add animation delay for tab content
    tabPanes.forEach((pane, index) => {
        if (index > 0) {
            pane.style.animationDelay = `${index * 0.1}s`;
        }
    });

    // Add loading animation for content
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all sections for animation (including cronograma sections)
    const sections = document.querySelectorAll('.info-section, .objective-card, .tech-section, .feature-card, .future-section, .deployment-section, .dia-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Load cronograma data
    loadCronograma();

    // Add click tracking for external links
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Could add analytics tracking here
            console.log('External link clicked:', this.href);
        });
    });

    console.log('Plan de Acción - Sistema CUIT loaded successfully');
});

// Function to update current date, time and phase
function updateCurrentInfo() {
    const now = new Date();

    // Format date
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const fechaElement = document.getElementById('fecha-actual');
    if (fechaElement) {
        fechaElement.textContent = now.toLocaleDateString('es-ES', options);
    }

    // Format time with seconds
    const horaElement = document.getElementById('hora-actual');
    if (horaElement) {
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        horaElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // Determine current day based on date
    const faseElement = document.getElementById('fase-actual');
    if (faseElement) {
        const day = now.getDate();
        const month = now.getMonth() + 1; // JavaScript months are 0-indexed

        let diaActual = "Proyecto Completado";

        // Find the specific day in cronograma
        try {
            // Load cronograma data synchronously (assuming it's already loaded)
            fetch('cronograma.json')
                .then(response => response.json())
                .then(data => {
                    let found = false;

                    // Search through all periods and days
                    for (const periodo of data.periodos) {
                        for (const dia of periodo.dias) {
                            // Parse the date from the dia.fecha (format: "7 Enero", "8 Enero", etc.)
                            const fechaParts = dia.fecha.split(' ');
                            const diaNum = parseInt(fechaParts[0]);
                            const mesStr = fechaParts[1].toLowerCase();

                            // Convert month name to number
                            const meses = {
                                'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
                                'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
                            };

                            const mesNum = meses[mesStr];

                            // Check if this is the current date
                            if (diaNum === day && mesNum === month) {
                                diaActual = dia.titulo;
                                found = true;
                                break;
                            }
                        }
                        if (found) break;
                    }

                    if (!found) {
                        // If not found in cronograma, show general phase
                        if (month === 1) {
                            if (day >= 1 && day <= 7) {
                                diaActual = "Inicio del Proyecto";
                            } else if (day >= 8 && day <= 22) {
                                diaActual = "Fase 1: Planificación";
                            } else if (day >= 23 && day <= 31) {
                                diaActual = "Fase 2: Implementación";
                            }
                        } else if (month === 2 && day >= 1 && day <= 7) {
                            diaActual = "Fase 2: Implementación (Final)";
                        } else {
                            diaActual = "Proyecto Completado - En Mantenimiento";
                        }
                    }

                    faseElement.textContent = diaActual;
                })
                .catch(error => {
                    console.error('Error loading cronograma for phase:', error);
                    faseElement.textContent = "Error al determinar fase actual";
                });
        } catch (error) {
            console.error('Error in phase determination:', error);
            faseElement.textContent = "Error al determinar fase actual";
        }
    }
}

// Update info immediately and then every second
updateCurrentInfo();
setInterval(updateCurrentInfo, 1000);

// Function to load cronograma from JSON
async function loadCronograma() {
    try {
        const response = await fetch('cronograma.json');
        const data = await response.json();

        const tituloElement = document.getElementById('cronograma-titulo');
        const contentElement = document.getElementById('cronograma-content');

        // Set title
        tituloElement.textContent = data.titulo;

        // Generate HTML for periods
        let html = '';
        data.periodos.forEach(periodo => {
            html += `
                <div class="periodo-section">
                    <h2 class="periodo-titulo">${periodo.titulo}</h2>
                    <div class="dias-grid">
            `;

            periodo.dias.forEach(dia => {
                html += `
                    <div class="dia-calendario">
                        <h3>${dia.fecha}: ${dia.titulo}</h3>
                        <div class="dia-actividades">
                            <ul class="cronograma-list">
                                ${dia.actividades.map(actividad => `<li>${actividad}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        contentElement.innerHTML = html;

    } catch (error) {
        console.error('Error loading cronograma:', error);
        document.getElementById('cronograma-titulo').textContent = 'Error al cargar el cronograma';
        document.getElementById('cronograma-content').innerHTML = '<p>No se pudo cargar la información del cronograma.</p>';
    }
};
