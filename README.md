# 📊 HR SaaS Data Agent

**HR SaaS Data Agent** es un agente inteligente y panel de control web diseñado para analizar, limpiar y reportar métricas clave de recursos humanos en empresas de servicios SaaS. Combina procesamiento estadístico de nómina (cuantitativo) con análisis de sentimiento y categorización de temas en comentarios de empleados (cualitativo), ofreciendo análisis cruzados híbridos rápidos y reportes listos para compartir.

---

## 🚀 Características Principales

*   **Entrada de Datos Híbrida y Flexible:**
    *   **Archivos Locales:** Soporte para archivos `.csv`, `.json`, `.db`, `.sqlite` y `.txt`.
    *   **Enlaces Web:** Extracción automática de tablas de datos estructurados directamente desde cualquier URL web (scraping).
    *   **Conexiones Remotas:** Conexión directa a bases de datos relacionales SQL (PostgreSQL, MySQL, SQLite) y NoSQL (MongoDB) mediante cadenas de conexión.
*   **Limpieza y Normalización Inteligente:**
    *   Mapeo difuso de columnas (edad, educación, horas de jornada, puesto e ingresos) a un estándar unificado.
    *   Limpieza y conversión automática de monedas (símbolos `$`, `€`, formato de miles y decimales) a valores numéricos válidos.
*   **Visualización y Análisis Avanzado:**
    *   **Análisis EDA:** Estadísticas descriptivas de la plantilla, rangos de ingresos y distribuciones horarias.
    *   **Análisis Financiero:** ROI educativo, coste de hora laboral, simulación de masa salarial ante aumentos y curva de Lorenz (coeficiente de Gini para medir desigualdad).
    *   **Análisis Híbrido Avanzado:** Conexión de métricas duras (salarios, horas) con comentarios reales de feedback de empleados. Sentiment analysis por palabras clave y categorización temática.
*   **Optimización de Rendimiento:**
    *   Muestreo estadístico automático para archivos de texto masivos (comentarios de +10 MB) para garantizar respuestas en milisegundos sin congelar el servidor Flask.
    *   Bypass automático de caché del navegador (Cache-Busting) para desarrollos más ágiles.
*   **Integraciones Compartidas:**
    *   Envío instantáneo de reportes ejecutivos en formato Markdown a canales de Slack mediante webhooks.
    *   Redacción automática de reportes para enviar por Gmail.

---

## 🛠️ Estructura del Proyecto

```text
├── backend/
│   └── main.py          # Servidor Flask, endpoints API y motor de análisis de datos
├── frontend/
│   ├── index.html       # Interfaz de usuario (HTML5 responsivo con sistema de pestañas)
│   ├── app.js           # Lógica cliente JS, peticiones Fetch y renderizado dinámico de tablas/gráficos
│   ├── style.css        # Hoja de estilos moderna y limpia (Glassmorphism & Flexbox)
│   └── visualizaciones/ # Directorio donde se guardan los gráficos generados dinámicamente
├── analisis.py          # Script de análisis original en consola
├── data_filt.csv        # Conjunto de datos estructurado de prueba
├── .gitignore           # Archivo de exclusión para Git (ignora entornos virtuales, cachés y archivos de carga)
└── README.md            # Documentación del repositorio (este archivo)
```

---

## ⚙️ Instalación y Configuración

### Prerrequisitos
*   Python 3.10 o superior instalado en el sistema.
*   Gestor de paquetes `uv` (recomendado) o `pip`.

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/Elocss/-HR-SaaS-Data-Agent.git
cd -HR-SaaS-Data-Agent
```

### Paso 2: Crear el Entorno Virtual e Instalar Dependencias
Si utilizas `uv`:
```bash
uv venv
uv pip install flask pandas numpy matplotlib seaborn sqlalchemy pymongo openpyxl lxml html5lib
```
Si utilizas `pip`:
```bash
python -m venv .venv
# En Windows:
.venv\Scripts\activate
# Instalar paquetes:
pip install flask pandas numpy matplotlib seaborn sqlalchemy pymongo openpyxl lxml html5lib
```

*Nota: Los controladores adicionales de base de datos (como `psycopg2-binary` para PostgreSQL o `pymysql` para MySQL) se instalarán de manera dinámica mediante el servidor cuando se intente realizar una conexión que los requiera.*

---

## 🖥️ Uso de la Aplicación

### Paso 1: Lanzar el Servidor Backend
Ejecuta el servidor web en segundo plano desde el directorio raíz:
```bash
python backend/main.py
```
El servidor comenzará a ejecutarse en modo debug en [http://127.0.0.1:5000](http://127.0.0.1:5000).

### Paso 2: Usar la Interfaz Web
1. Abre tu navegador web y navega a [http://127.0.0.1:5000/](http://127.0.0.1:5000/).
2. En la barra de configuración izquierda:
   * **📁 Archivos:** Arrastra tu base de datos CSV/JSON/DB o archivo de texto cualitativo.
   * **🔗 Enlace Web:** Pega una dirección URL con tablas financieras para extraerlas.
   * **🗄️ Base de Datos:** Conecta tu base de datos mediante su URI correspondiente.
3. El panel de la derecha mostrará automáticamente la **🗂️ Vista Previa** de los datos cargados bajo la pestaña de gráficos.
4. En el panel de control izquierdo, selecciona el análisis que deseas ejecutar (EDA, Financiero o Híbrido).
5. Visualiza el **informe ejecutivo** redactado de forma automática y los **gráficos generados** en las pestañas correspondientes del visor.
6. Configura el webhook de Slack o comparte la plantilla generada por correo electrónico a través de la sección de envíos.
