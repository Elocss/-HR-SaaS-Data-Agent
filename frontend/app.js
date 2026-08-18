// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileStatus = document.getElementById('file-status');
const fileNameSpan = document.getElementById('file-name');
const fileSizeSpan = document.getElementById('file-size');
const removeFileBtn = document.getElementById('remove-file');

// Text File Elements
const textFileStatus = document.getElementById('text-file-status');
const textFileNameSpan = document.getElementById('text-file-name');
const textFileSizeSpan = document.getElementById('text-file-size');
const removeTextFileBtn = document.getElementById('remove-text-file');

// URL and Database Elements
const webUrlInput = document.getElementById('web-url');
const btnScrapeUrl = document.getElementById('btn-scrape-url');
const dbTypeSelect = document.getElementById('db-type');
const dbUriInput = document.getElementById('db-uri');
const dbQueryInput = document.getElementById('db-query');
const btnConnectDb = document.getElementById('btn-connect-db');

const actionsCard = document.getElementById('actions-card');
const btnEda = document.getElementById('btn-eda');
const btnFinancial = document.getElementById('btn-financial');
const btnHybrid = document.getElementById('btn-hybrid');

const slackCard = document.getElementById('slack-card');
const slackWebhookInput = document.getElementById('slack-webhook');
const btnSendSlack = document.getElementById('btn-send-slack');
const btnSendGmail = document.getElementById('btn-send-gmail');

const resultsWelcome = document.getElementById('results-welcome');
const resultsContent = document.getElementById('results-content');
const resultsCard = document.getElementById('results-card');
const loadingOverlay = document.getElementById('loading');
const loadingText = document.getElementById('loading-text');

const reportTextContainer = document.getElementById('report-text');
const chartsContainer = document.getElementById('charts-container');
const analysisTypeTag = document.getElementById('analysis-type-tag');

const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// State Variables
let activeFile = null;
let activeTextFile = null;
let currentReportMarkdown = "";

// --- Source Tabs Switcher ---
const sourceTabButtons = document.querySelectorAll('.source-tab-btn');
const sourceContents = document.querySelectorAll('.source-content');
sourceTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        sourceTabButtons.forEach(b => {
            b.classList.remove('active');
            b.style.borderBottom = 'none';
            b.style.color = '#64748b';
            b.style.fontWeight = '500';
        });
        btn.classList.add('active');
        btn.style.borderBottom = '2px solid #2563eb';
        btn.style.color = '#2563eb';
        btn.style.fontWeight = '600';
        
        sourceContents.forEach(c => c.classList.add('hidden'));
        document.getElementById(btn.dataset.source).classList.remove('hidden');
    });
});

// --- Drag & Drop Event Listeners ---
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

removeFileBtn.addEventListener('click', () => {
    resetFileState();
});

removeTextFileBtn.addEventListener('click', () => {
    resetTextFileState();
});

// --- Handle Selected File ---
function handleFileSelect(file) {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.csv', '.txt', '.json', '.db', '.sqlite'].includes(ext)) {
        alert('Por favor, selecciona un archivo válido (.csv, .txt, .json, .db, .sqlite).');
        return;
    }
    
    if (ext === '.txt') {
        uploadFile(file, true);
    } else {
        activeFile = file;
        fileNameSpan.textContent = file.name;
        fileSizeSpan.textContent = formatBytes(file.size);
        dropZone.classList.add('hidden');
        fileStatus.classList.remove('hidden');
        uploadFile(file, false);
    }
}

function resetFileState() {
    activeFile = null;
    fileInput.value = '';
    dropZone.classList.remove('hidden');
    fileStatus.classList.add('hidden');
    
    const table = document.getElementById('preview-table');
    if (table) table.innerHTML = '';
    
    if (!activeFile && !activeTextFile) {
        actionsCard.classList.add('disabled');
    }
    slackCard.classList.add('disabled');
    resultsWelcome.classList.remove('hidden');
    resultsContent.classList.add('hidden');
    currentReportMarkdown = "";
}

function resetTextFileState() {
    activeTextFile = null;
    textFileStatus.classList.add('hidden');
    if (!activeFile && !activeTextFile) {
        actionsCard.classList.add('disabled');
    }
}

// --- Render Table Preview ---
function renderPreviewTable(columns, rows) {
    const table = document.getElementById('preview-table');
    table.innerHTML = '';
    if (!rows || rows.length === 0) return;
    
    // Header
    const thead = document.createElement('thead');
    thead.style.background = '#f1f5f9';
    thead.style.borderBottom = '1px solid #cbd5e1';
    thead.style.position = 'sticky';
    thead.style.top = '0';
    thead.style.zIndex = '1';
    
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.style.padding = '0.75rem';
        th.style.fontWeight = '600';
        th.style.color = '#334155';
        th.textContent = col;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Body
    const tbody = document.createElement('tbody');
    rows.forEach(row => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';
        columns.forEach(col => {
            const td = document.createElement('td');
            td.style.padding = '0.75rem';
            td.style.color = '#475569';
            td.textContent = row[col] !== undefined ? row[col] : '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    
    document.getElementById('data-preview-container').classList.remove('hidden');

    // Mostrar resultados y activar pestaña
    resultsWelcome.classList.add('hidden');
    resultsContent.classList.remove('hidden');
    
    analysisTypeTag.textContent = "Datos Cargados";
    analysisTypeTag.style.backgroundColor = "#64748b";
    
    switchTab('tab-report');
}

// --- Upload File to Server ---
async function uploadFile(file, isText = false) {
    showLoading(isText ? 'Subiendo y evaluando archivo...' : 'Subiendo y normalizando datos...');
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (response.ok) {
            if (result.columns) {
                // Se detectó como base de datos estructurada
                activeFile = file;
                fileNameSpan.textContent = file.name;
                fileSizeSpan.textContent = formatBytes(file.size);
                dropZone.classList.add('hidden');
                fileStatus.classList.remove('hidden');
                
                if (isText) {
                    resetTextFileState();
                }
                
                if (result.preview) {
                    renderPreviewTable(result.columns, result.preview);
                }
            } else {
                // Se detectó como comentarios cualitativos
                activeTextFile = file;
                textFileNameSpan.textContent = file.name;
                textFileSizeSpan.textContent = formatBytes(file.size);
                textFileStatus.classList.remove('hidden');
            }
            actionsCard.classList.remove('disabled');
            alert(result.message || 'Archivo cargado con éxito.');
        } else {
            alert(result.error || 'Error al subir el archivo.');
            if (isText) resetTextFileState();
            else resetFileState();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor.');
        if (isText) resetTextFileState();
        else resetFileState();
    } finally {
        hideLoading();
    }
}

// --- Web URL Scrape Listener ---
btnScrapeUrl.addEventListener('click', async () => {
    const url = webUrlInput.value.trim();
    if (!url) {
        alert('Por favor, ingresa una URL válida.');
        return;
    }
    
    showLoading('Extrayendo tablas de la página web...');
    try {
        const response = await fetch('/api/upload/url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        
        const result = await response.json();
        if (response.ok) {
            activeFile = { name: "Datos Extraídos de la Web" };
            fileNameSpan.textContent = "Datos Web (URL Scraped)";
            fileSizeSpan.textContent = "Dinámico";
            dropZone.classList.add('hidden');
            fileStatus.classList.remove('hidden');
            actionsCard.classList.remove('disabled');
            
            if (result.preview) {
                renderPreviewTable(result.columns, result.preview);
            }
            
            alert(result.message || 'Datos extraídos con éxito.');
        } else {
            alert(result.error || 'Error al extraer datos.');
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión con el servidor.');
    } finally {
        hideLoading();
    }
});

// --- DB Connection Listener ---
btnConnectDb.addEventListener('click', async () => {
    const uri = dbUriInput.value.trim();
    const query = dbQueryInput.value.trim();
    const type = dbTypeSelect.value;
    
    if (!uri) {
        alert('Por favor, ingresa una URI de conexión.');
        return;
    }
    
    showLoading('Conectando con la base de datos y cargando datos...');
    try {
        const response = await fetch('/api/connect/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, uri, query })
        });
        
        const result = await response.json();
        if (response.ok) {
            activeFile = { name: "Base de Datos Conectada" };
            fileNameSpan.textContent = `Base de Datos (${type.toUpperCase()})`;
            fileSizeSpan.textContent = "Dinámico";
            dropZone.classList.add('hidden');
            fileStatus.classList.remove('hidden');
            actionsCard.classList.remove('disabled');
            
            if (result.preview) {
                renderPreviewTable(result.columns, result.preview);
            }
            
            alert(result.message || 'Conexión y carga exitosa.');
        } else {
            alert(result.error || 'Error al conectar con la base de datos.');
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión con el servidor.');
    } finally {
        hideLoading();
    }
});

// --- Action Button Listeners ---
btnEda.addEventListener('click', () => runAnalysis('eda'));
btnFinancial.addEventListener('click', () => runAnalysis('financial'));
btnHybrid.addEventListener('click', () => runAnalysis('hybrid'));

async function runAnalysis(type) {
    if (!activeFile) {
        alert('Por favor, carga un origen de datos primero.');
        return;
    }
    
    let endpoint = '/api/analyze/eda';
    let tagText = 'EDA';
    let tagColor = '#2563eb';
    
    if (type === 'financial') {
        endpoint = '/api/analyze/financial';
        tagText = 'Financiero';
        tagColor = '#10b981';
    } else if (type === 'hybrid') {
        endpoint = '/api/analyze/hybrid';
        tagText = 'Híbrido';
        tagColor = '#a855f7';
    }
    
    showLoading('Procesando datos y generando visualizaciones...');
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST'
        });
        
        const result = await response.json();
        if (response.ok) {
            currentReportMarkdown = result.report;
            analysisTypeTag.textContent = tagText;
            analysisTypeTag.style.backgroundColor = tagColor;
            
            // Renderizar Markdown
            reportTextContainer.innerHTML = renderMarkdown(result.report);
            
            // Cargar Gráficos (agregar timestamp para evitar cache)
            const t = Date.now();
            chartsContainer.innerHTML = '';
            result.charts.forEach((chartPath, idx) => {
                const chartItem = document.createElement('div');
                chartItem.className = 'chart-item';
                
                const title = document.createElement('h4');
                title.style.fontSize = '0.9rem';
                title.style.marginBottom = '0.5rem';
                title.style.color = '#334155';
                
                let labels = [];
                if (type === 'eda') {
                    labels = ['Distribución por Educación', 'Comparativa por Calificación', 'Ingresos por Edad', 'Horas vs Ingresos'];
                } else if (type === 'financial') {
                    labels = ['ROI en Educación', 'Costo de Hora Laboral', 'Simulación de Masa Salarial', 'Curva de Lorenz (Desigualdad)'];
                } else if (type === 'hybrid') {
                    labels = ['Distribución General de Sentimiento', 'Sentimiento por Temática de Interés'];
                }
                
                title.textContent = labels[idx] || `Gráfico ${idx + 1}`;
                
                const img = document.createElement('img');
                img.src = `${chartPath}?t=${t}`;
                img.alt = title.textContent;
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.borderRadius = '6px';
                
                chartItem.appendChild(title);
                chartItem.appendChild(img);
                chartsContainer.appendChild(chartItem);
            });
            
            // Mostrar resultados
            resultsWelcome.classList.add('hidden');
            resultsContent.classList.remove('hidden');
            slackCard.classList.remove('disabled');
            
            // Activar la pestaña del reporte por defecto
            switchTab('tab-report');
        } else {
            alert(result.error || 'Error al ejecutar el análisis.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al ejecutar el análisis.');
    } finally {
        hideLoading();
    }
}

// --- Send to Slack ---
btnSendSlack.addEventListener('click', async () => {
    const webhookUrl = slackWebhookInput.value.trim();
    if (!webhookUrl) {
        alert('Por favor, ingresa una URL de Webhook de Slack válida.');
        return;
    }
    
    showLoading('Enviando reporte a Slack...');
    
    try {
        const response = await fetch('/api/slack/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                report: currentReportMarkdown,
                webhook_url: webhookUrl
            })
        });
        
        const result = await response.json();
        if (response.ok) {
            alert('¡Reporte enviado exitosamente a Slack!');
        } else {
            alert(result.error || 'Error al enviar a Slack.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar el reporte.');
    } finally {
        hideLoading();
    }
});

// --- Send to Gmail ---
btnSendGmail.addEventListener('click', () => {
    if (!currentReportMarkdown) {
        alert('Por favor, ejecuta un análisis primero para generar el reporte.');
        return;
    }
    const subject = encodeURIComponent("Reporte de Análisis de Datos - HR SaaS");
    const body = encodeURIComponent(currentReportMarkdown);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
});

// --- Tabs Logic ---
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        switchTab(targetTab);
    });
});

function switchTab(tabId) {
    tabButtons.forEach(b => {
        if (b.getAttribute('data-tab') === tabId) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });
    
    tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// --- Utility Functions ---
function showLoading(text) {
    loadingText.textContent = text || 'Cargando...';
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// --- Simple Markdown to HTML Parser ---
function renderMarkdown(md) {
    let html = md;
    
    // Encabezados
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    
    // Línea horizontal
    html = html.replace(/^---$/gm, '<hr>');
    
    // Negrita
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Código en línea
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Viñetas / Listas
    html = html.replace(/^\*\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
    
    // Agrupar li en ul
    html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, ''); // Unificar listas consecutivas
    
    // Tablas
    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';
    let newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line.startsWith('|') && line.endsWith('|')) {
            if (!inTable) {
                inTable = true;
                tableHtml = '<table>';
            }
            if (line.includes('---')) {
                continue; // Saltarse la línea de separación
            }
            
            const cells = line.split('|').slice(1, -1).map(c => c.trim());
            tableHtml += '<tr>';
            cells.forEach(cell => {
                // Si es la primera fila de la tabla, usar th, si no td
                const isHeader = !tableHtml.includes('</td>') && !tableHtml.includes('</th>') || tableHtml.endsWith('<tr>');
                const tag = isHeader ? 'th' : 'td';
                tableHtml += `<${tag}>${cell}</${tag}>`;
            });
            tableHtml += '</tr>';
        } else {
            if (inTable) {
                inTable = false;
                tableHtml += '</table>';
                newLines.push(tableHtml);
                tableHtml = '';
            }
            newLines.push(lines[i]);
        }
    }
    if (inTable) {
        tableHtml += '</table>';
        newLines.push(tableHtml);
    }
    
    html = newLines.join('\n');
    
    // Párrafos sencillos (líneas de texto que no tienen etiquetas de bloque)
    const blockTags = ['h1', 'h2', 'h3', 'h4', 'hr', 'ul', 'li', 'table', 'tr', 'td', 'th', 'div'];
    const outputLines = html.split('\n');
    for (let i = 0; i < outputLines.length; i++) {
        let line = outputLines[i].trim();
        if (line && !blockTags.some(tag => line.startsWith(`<${tag}`) || line.startsWith(`</${tag}`))) {
            outputLines[i] = `<p>${outputLines[i]}</p>`;
        }
    }
    
    return outputLines.join('\n');
}
