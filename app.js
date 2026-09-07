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
    const inputHora = document.getElementById('materia-hora');
    const inputAula = document.getElementById('materia-aula');

    const colorSolid = document.getElementById('color-solid');
    const gradColor1 = document.getElementById('grad-color1');
    const gradColor2 = document.getElementById('grad-color2');
    const gradDirection = document.getElementById('grad-direction');

    const btnExportImg = document.getElementById('btn-export-img');
    const scheduleCard = document.getElementById('schedule-card');

    const diasOrden = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "VIRTUAL / SIN HORARIO FIJO"];

    if (selectDia && inputHora && inputAula) {
        selectDia.addEventListener('change', () => {
            if (selectDia.value === "VIRTUAL / SIN HORARIO FIJO") {
                inputHora.value = "N/A";
                inputHora.disabled = true;
                inputAula.value = "N/A";
                inputAula.disabled = true;
            } else {
                if (inputHora.value === "N/A") inputHora.value = "";
                if (inputAula.value === "N/A") inputAula.value = "";
                inputHora.disabled = false;
                inputAula.disabled = false;
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

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const diaSeleccionado = selectDia.value;
            const esVirtualFijo = diaSeleccionado === "VIRTUAL / SIN HORARIO FIJO";

            const nuevaMateria = {
                nombre: document.getElementById('materia-nombre').value.trim(),
                dia: diaSeleccionado,
                hora: esVirtualFijo ? "Sin horario fijo" : inputHora.value.trim(),
                aula: esVirtualFijo ? "Virtual" : inputAula.value.trim(),
                modalidad: esVirtualFijo ? "Virtual" : document.getElementById('materia-modalidad').value
            };

            state.materias.push(nuevaMateria);
            renderSchedule();
            form.reset();

            if (inputHora) inputHora.disabled = false;
            if (inputAula) inputAula.disabled = false;
        });
    }

    function renderSchedule() {
        if (!tbody) return;
        tbody.innerHTML = '';

        diasOrden.forEach(dia => {
            const materiasDelDia = state.materias.filter(m => m.dia === dia);

            if (materiasDelDia.length > 0) {
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

    // Color Sólido: Ajusta el fondo y evalúa el contraste para el texto general de la cabecera
    if (colorSolid && headerElement) {
        colorSolid.addEventListener('input', (e) => {
            const hex = e.target.value;
            headerElement.style.background = hex;
            headerElement.style.color = getContrastColor(hex);
            state.modoEstilo = 'solido';
            renderSchedule();
        });
    }

    // Gradiente: Aplica el gradiente y evalúa el color de contraste basándose en el primer color (primario)
    function updateGradient() {
        if (!headerElement || !gradColor1 || !gradColor2 || !gradDirection) return;
        const c1 = gradColor1.value;
        const c2 = gradColor2.value;
        const dir = gradDirection.value;

        headerElement.style.background = `linear-gradient(${dir}, ${c1}, ${c2})`;
        headerElement.style.color = getContrastColor(c1); // Contraste basado en el color primario

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
        // Establecer contraste inicial al cargar
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
