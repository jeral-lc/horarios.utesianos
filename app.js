document.addEventListener('DOMContentLoaded', () => {
    const state = {
        materias: [],
        modoEstilo: 'gradiente',
        colorPresencialOverride: '',
        colorVirtualOverride: ''
    };

    const form = document.getElementById('schedule-form');
    const tbody = document.querySelector('.schedule-table tbody');
    const headerElement = document.getElementById('schedule-header');

    const selectDia = document.getElementById('materia-dia');
    const horaInicioInput = document.getElementById('hora-inicio');
    const horaFinInput = document.getElementById('hora-fin');
    const tandaSelect = document.getElementById('tanda');
    const horarioInputsContainer = document.getElementById('horario-inputs-container');
    const inputAula = document.getElementById('materia-aula');

    const colorSolid = document.getElementById('color-solid');
    const gradColor1 = document.getElementById('grad-color1');
    const gradColor2 = document.getElementById('grad-color2');
    const gradDirection = document.getElementById('grad-direction');

    const btnExportImg = document.getElementById('btn-export-img');
    const btnDarkMode = document.getElementById('btn-dark-mode');
    const scheduleCard = document.getElementById('schedule-card');

    const diasOrden = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "VIRTUAL / SIN HORARIO FIJO"];

    // Controlar campos según el día seleccionado
    if (selectDia) {
        selectDia.addEventListener('change', () => {
            if (selectDia.value === "VIRTUAL / SIN HORARIO FIJO") {
                horarioInputsContainer.style.display = 'none';
                horaInicioInput.required = false;
                horaFinInput.required = false;
                inputAula.value = "VIRTU";
            } else {
                horarioInputsContainer.style.display = 'block';
                horaInicioInput.required = true;
                horaFinInput.required = true;
                if (inputAula.value === "VIRTU") inputAula.value = "";
            }
        });
    }

    function getContrastColor(hexColor) {
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq >= 128 ? '#0f172a' : '#ffffff';
    }

    if (btnDarkMode) {
        btnDarkMode.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            btnDarkMode.textContent = document.body.classList.contains('dark-mode') ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const diaSeleccionado = selectDia.value;
            const esVirtualFijo = diaSeleccionado === "VIRTUAL / SIN HORARIO FIJO";

            let horaFormateada = "Sin horario fijo";
            let valorComparacionMinutos = 0;

            if (!esVirtualFijo) {
                const hInicio = horaInicioInput.value.trim();
                const hFin = horaFinInput.value.trim();
                const tnd = tandaSelect.value.toLowerCase();

                horaFormateada = `${hInicio} a ${hFin} ${tnd}`;

                // Convertir hora de inicio a minutos totales desde las 00:00 para ordenar perfecto
                valorComparacionMinutos = parseTimeToMinutes(hInicio, tnd);
            }

            const nuevaMateria = {
                nombre: document.getElementById('materia-nombre').value.trim(),
                dia: diaSeleccionado,
                hora: horaFormateada,
                minutosInicio: valorComparacionMinutos,
                aula: inputAula.value.trim(),
                modalidad: esVirtualFijo ? "Virtual" : document.getElementById('materia-modalidad').value
            };

            state.materias.push(nuevaMateria);
            renderSchedule();
            form.reset();
            if (horarioInputsContainer) horarioInputsContainer.style.display = 'block';
        });
    }

    // Función auxiliar para convertir hora (ej. "7:00", "pm") a minutos numéricos y ordenar bien
    function parseTimeToMinutes(timeStr, tanda) {
        const parts = timeStr.split(':');
        let hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;

        // Ajuste AM/PM (formato 24h para comparación correcta)
        if (tanda === 'pm' && hours < 12) hours += 12;
        if (tanda === 'am' && hours === 12) hours = 0;

        return (hours * 60) + minutes;
    }

    function renderSchedule() {
        if (!tbody) return;
        tbody.innerHTML = '';

        diasOrden.forEach(dia => {
            let materiasDelDia = state.materias.filter(m => m.dia === dia);

            if (materiasDelDia.length > 0) {
                // Ordenar cronológicamente usando los minutos de inicio calculados
                materiasDelDia.sort((a, b) => a.minutosInicio - b.minutosInicio);

                const dayRow = document.createElement('tr');
                dayRow.className = 'day-header-row';
                dayRow.innerHTML = `<td colspan="4">${dia}</td>`;
                tbody.appendChild(dayRow);

                materiasDelDia.forEach(m => {
                    const row = document.createElement('tr');
                    const esPresencial = m.modalidad.toLowerCase() === 'presencial';

                    let badgeHtml = '';
                    if (state.modoEstilo === 'gradiente') {
                        const bgColor = esPresencial ? state.colorPresencialOverride : state.colorVirtualOverride;
                        const textColor = getContrastColor(bgColor);
                        badgeHtml = `<span style="background-color: ${bgColor}; color: ${textColor}; padding: 3px 6px; border-radius: 4px; font-size: 8pt; font-weight: 600; display: inline-block;">${m.modalidad}</span>`;
                    } else {
                        const badgeClass = esPresencial ? 'badge-presencial' : 'badge-virtual';
                        badgeHtml = `<span class="${badgeClass}">${m.modalidad}</span>`;
                    }

                    row.innerHTML = `
                        <td>${m.nombre}</td>
                        <td>${m.hora}</td>
                        <td>${m.aula}</td>
                        <td>${badgeHtml}</td>
                    `;
                    tbody.appendChild(row);
                });
            }
        });
    }

    if (colorSolid && headerElement) {
        colorSolid.addEventListener('input', (e) => {
            const hex = e.target.value;
            headerElement.style.background = hex;
            headerElement.style.color = getContrastColor(hex);
            state.modoEstilo = 'solido';
            renderSchedule();
        });
    }

    function updateGradient() {
        if (!headerElement || !gradColor1 || !gradColor2 || !gradDirection) return;
        const c1 = gradColor1.value;
        const c2 = gradColor2.value;
        const dir = gradDirection.value;

        headerElement.style.background = `linear-gradient(${dir}, ${c1}, ${c2})`;
        headerElement.style.color = getContrastColor(c1);

        state.modoEstilo = 'gradiente';
        state.colorPresencialOverride = c1;
        state.colorVirtualOverride = c2;

        renderSchedule();
    }

    if (gradColor1 && gradColor2 && gradDirection) {
        gradColor1.addEventListener('input', updateGradient);
        gradColor2.addEventListener('input', updateGradient);
        gradDirection.addEventListener('change', updateGradient);

        state.colorPresencialOverride = gradColor1.value;
        state.colorVirtualOverride = gradColor2.value;
        headerElement.style.color = getContrastColor(gradColor1.value);
    }

    if (btnExportImg && scheduleCard) {
        btnExportImg.addEventListener('click', () => {
            if (window.html2canvas) {
                html2canvas(scheduleCard, { scale: 2, useCORS: true }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = 'mi-horario-academico.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }).catch(err => {
                    console.error("Error al generar la imagen:", err);
                });
            } else {
                alert("La librería de exportación se está cargando. Inténtalo de nuevo.");
            }
        });
    }

    renderSchedule();
});
