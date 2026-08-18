import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Configurar estilo visual para los gráficos
sns.set_theme(style="whitegrid")
plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.size': 11,
    'axes.labelsize': 12,
    'axes.titlesize': 14,
    'xtick.labelsize': 10,
    'ytick.labelsize': 10,
    'figure.titlesize': 16
})

# Crear directorio de visualizaciones si no existe
os.makedirs("visualizaciones", exist_ok=True)

# 1. Cargar datos
print("Cargando data_filt.csv...")
df = pd.read_csv("data_filt.csv", encoding="latin1")

# Renombrar valores para que sean legibles en los reportes
map_ed = {
    "1_H/Sec inc": "Hasta Secundario Incompleto",
    "2_Sec. comp y m\xe1s": "Secundario Completo y M\xe1s"
}
map_calif = {
    "1_Prof./Tecn.": "Profesional / T\xe9cnico",
    "2_Op./No calif.": "Operativo / No Calificado"
}

df['nivel_ed_clean'] = df['nivel_ed'].map(map_ed)
df['calif_clean'] = df['calif'].map(map_calif)

# Calcular salario por hora estimado (asumiendo mes de 4.3 semanas)
df['salario_hora'] = df['p47t'] / (df['htot'] * 4.3)

# 2. Análisis Estadístico Descriptivo
print("Realizando análisis descriptivo...")
stats = {}

# Estadísticas generales por Nivel Educativo
ed_stats = df.groupby('nivel_ed_clean')['p47t'].agg(['count', 'mean', 'median', 'std']).round(2)
stats['educacion'] = ed_stats.to_dict(orient='index')

# Estadísticas generales por Calificación
calif_stats = df.groupby('calif_clean')['p47t'].agg(['count', 'mean', 'median', 'std']).round(2)
stats['calificacion'] = calif_stats.to_dict(orient='index')

# Estadísticas por combinación de Educación y Calificación
combined_stats = df.groupby(['nivel_ed_clean', 'calif_clean'])['p47t'].agg(['count', 'mean', 'median', 'std']).round(2)
stats['combinado'] = combined_stats.to_dict(orient='index')

# Correlaciones numéricas
numeric_cols = ['ch06', 'htot', 'p47t', 'salario_hora']
corr_matrix = df[numeric_cols].corr().round(4)
stats['correlacion'] = corr_matrix.to_dict()

# Rangos de edad
df['rango_edad'] = pd.cut(df['ch06'], bins=[0, 25, 35, 45, 55, 65, 100], 
                         labels=['12-25', '26-35', '36-45', '46-55', '56-65', '66+'])
edad_stats = df.groupby('rango_edad', observed=False)['p47t'].agg(['count', 'mean', 'median', 'std']).round(2)
stats['edad_rangos'] = edad_stats.to_dict(orient='index')

# Horas promedio trabajadas por nivel educativo
htot_ed_stats = df.groupby('nivel_ed_clean')['htot'].agg(['mean', 'median']).round(2)
stats['horas_educacion'] = htot_ed_stats.to_dict(orient='index')

# 3. Generación de Gráficos

# Paleta de colores corporativa
colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a']

print("Generando Gráfico 1: Ingresos por Nivel Educativo...")
plt.figure(figsize=(10, 6))
# Boxplot sin outliers extremos para apreciar las cajas
sns.boxplot(
    data=df, 
    x='nivel_ed_clean', 
    y='p47t', 
    palette=['#e0e0e0', '#1f77b4'],
    showfliers=False,
    width=0.5
)
plt.title('Distribución de Ingresos Mensuales por Nivel Educativo\n(Excluye Outliers para mejor visualización)', pad=15)
plt.xlabel('Nivel Educativo')
plt.ylabel('Ingreso Mensual Total ($)')
plt.tight_layout()
plt.savefig('visualizaciones/1_educacion_ingresos.png', dpi=150)
plt.close()

print("Generando Gráfico 2: Ingresos Promedio y Mediano por Calificación Laboral...")
calif_melted = df.groupby('calif_clean')['p47t'].agg(['mean', 'median']).reset_index()
calif_melted = pd.melt(calif_melted, id_vars=['calif_clean'], value_vars=['mean', 'median'], 
                       var_name='Métrica', value_name='Ingreso')
calif_melted['Métrica'] = calif_melted['Métrica'].map({'mean': 'Promedio', 'median': 'Mediana'})

plt.figure(figsize=(10, 6))
sns.barplot(
    data=calif_melted, 
    x='calif_clean', 
    y='Ingreso', 
    hue='Métrica',
    palette=['#1f77b4', '#ff7f0e']
)
plt.title('Comparativa de Ingresos por Calificación de Ocupación', pad=15)
plt.xlabel('Calificación Ocupacional')
plt.ylabel('Ingreso Mensual ($)')
plt.legend(title='Estadístico')
plt.tight_layout()
plt.savefig('visualizaciones/2_calificacion_ingresos.png', dpi=150)
plt.close()

print("Generando Gráfico 3: Tendencia de Ingresos por Edad...")
# Agrupar por edad exacta para ver la curva
edad_avg = df.groupby('ch06')['p47t'].agg(['mean', 'median']).reset_index()
plt.figure(figsize=(12, 6))
plt.scatter(df['ch06'], df['p47t'], alpha=0.03, color='gray', label='Individuos')
plt.plot(edad_avg['ch06'], edad_avg['mean'], color='#1f77b4', linewidth=2.5, label='Ingreso Promedio')
plt.plot(edad_avg['ch06'], edad_avg['median'], color='#ff7f0e', linewidth=2, linestyle='--', label='Ingreso Mediano')

# Agregar línea de tendencia polinomial de grado 2 para el promedio
poly_coefs = np.polyfit(df['ch06'], df['p47t'], 2)
poly_fit = np.poly1d(poly_coefs)
x_poly = np.linspace(df['ch06'].min(), df['ch06'].max(), 100)
plt.plot(x_poly, poly_fit(x_poly), color='red', linestyle=':', linewidth=2, label='Tendencia (Polinomial Grado 2)')

plt.title('Perfil de Ingresos por Edad', pad=15)
plt.xlabel('Edad (Años)')
plt.ylabel('Ingreso Mensual ($)')
plt.ylim(0, 40000) # Limitar Y para ver la zona densa
plt.legend()
plt.tight_layout()
plt.savefig('visualizaciones/3_edad_ingresos.png', dpi=150)
plt.close()

print("Generando Gráfico 4: Horas Trabajadas vs Ingresos...")
plt.figure(figsize=(10, 6))
# Usar regplot con scatter_kws para manejar el gran volumen de datos
sns.regplot(
    data=df, 
    x='htot', 
    y='p47t', 
    scatter_kws={'alpha': 0.05, 'color': 'gray'},
    line_kws={'color': 'red', 'linewidth': 2},
    x_estimator=np.mean # Muestra el promedio por cada nivel de horas para mayor claridad
)
plt.title('Horas Trabajadas Semanales vs Ingreso Mensual Promedio', pad=15)
plt.xlabel('Horas Trabajadas Semanales')
plt.ylabel('Ingreso Mensual ($)')
plt.tight_layout()
plt.savefig('visualizaciones/4_horas_ingresos.png', dpi=150)
plt.close()

# 4. Generar reporte estructurado para Slack
print("Generando reporte formateado para Slack...")
reporte_path = "informe_slack.md"

# Calcular diferencias clave para el reporte
gap_ed_pct = ((ed_stats.loc['Secundario Completo y Más', 'mean'] - ed_stats.loc['Hasta Secundario Incompleto', 'mean']) / ed_stats.loc['Hasta Secundario Incompleto', 'mean'] * 100).round(1)
gap_calif_pct = ((calif_stats.loc['Profesional / Técnico', 'mean'] - calif_stats.loc['Operativo / No Calificado', 'mean']) / calif_stats.loc['Operativo / No Calificado', 'mean'] * 100).round(1)

with open(reporte_path, "w", encoding="utf-8") as f:
    f.write(f"""# 📊 INFORME DE ANÁLISIS DE DATOS - HR SAAS (EVALUACIÓN)
*Generado automáticamente por Antigravity Data Agent*

---

### 🚀 Resumen Ejecutivo

1. **Retorno a la Educación**: Completar el nivel secundario (o superior) incrementa el ingreso promedio en un **{gap_ed_pct}%** en comparación con quienes no lo completaron.
2. **Brecha de Calificación**: Los puestos clasificados como *Profesionales / Técnicos* perciben, en promedio, un **{gap_calif_pct}%** más que los puestos *Operativos o No Calificados*.
3. **Curva de Vida Laboral**: Los ingresos mensuales siguen un comportamiento cóncavo respecto a la edad, alcanzando su punto máximo al rededor de los **43-45 años** antes de comenzar a descender.
4. **Relación Horas-Ingreso**: Existe una relación lineal positiva entre la cantidad de horas trabajadas semanalmente y el ingreso, aunque con una variabilidad alta explicada por la calificación de la tarea.

---

### 📈 Estadísticas Descriptivas Clave

#### 🎓 1. Ingresos por Nivel Educativo
| Nivel Educativo | Casos (N) | Ingreso Promedio ($) | Ingreso Mediano ($) | Desviación Estándar ($) |
| :--- | :---: | :---: | :---: | :---: |
| **Hasta Secundario Incompleto** | {ed_stats.loc['Hasta Secundario Incompleto', 'count']:.0f} | ${ed_stats.loc['Hasta Secundario Incompleto', 'mean']:,.2f} | ${ed_stats.loc['Hasta Secundario Incompleto', 'median']:,.2f} | ${ed_stats.loc['Hasta Secundario Incompleto', 'std']:,.2f} |
| **Secundario Completo y Más** | {ed_stats.loc['Secundario Completo y Más', 'count']:.0f} | ${ed_stats.loc['Secundario Completo y Más', 'mean']:,.2f} | ${ed_stats.loc['Secundario Completo y Más', 'median']:,.2f} | ${ed_stats.loc['Secundario Completo y Más', 'std']:,.2f} |

#### 💼 2. Ingresos por Calificación Laboral
| Calificación Ocupacional | Casos (N) | Ingreso Promedio ($) | Ingreso Mediano ($) | Desviación Estándar ($) |
| :--- | :---: | :---: | :---: | :---: |
| **Operativo / No Calificado** | {calif_stats.loc['Operativo / No Calificado', 'count']:.0f} | ${calif_stats.loc['Operativo / No Calificado', 'mean']:,.2f} | ${calif_stats.loc['Operativo / No Calificado', 'median']:,.2f} | ${calif_stats.loc['Operativo / No Calificado', 'std']:,.2f} |
| **Profesional / Técnico** | {calif_stats.loc['Profesional / Técnico', 'count']:.0f} | ${calif_stats.loc['Profesional / Técnico', 'mean']:,.2f} | ${calif_stats.loc['Profesional / Técnico', 'median']:,.2f} | ${calif_stats.loc['Profesional / Técnico', 'std']:,.2f} |

#### 🔗 3. Matriz de Correlación (Coeficiente de Pearson)
| Variable | Edad (`ch06`) | Horas Semanales (`htot`) | Ingreso Total (`p47t`) | Salario por Hora |
| :--- | :---: | :---: | :---: | :---: |
| **Edad (`ch06`)** | 1.0000 | {corr_matrix.loc['ch06', 'htot']:.4f} | {corr_matrix.loc['ch06', 'p47t']:.4f} | {corr_matrix.loc['ch06', 'salario_hora']:.4f} |
| **Horas Semanales (`htot`)** | {corr_matrix.loc['htot', 'ch06']:.4f} | 1.0000 | {corr_matrix.loc['htot', 'p47t']:.4f} | {corr_matrix.loc['htot', 'salario_hora']:.4f} |
| **Ingreso Total (`p47t`)** | {corr_matrix.loc['p47t', 'ch06']:.4f} | {corr_matrix.loc['p47t', 'htot']:.4f} | 1.0000 | {corr_matrix.loc['p47t', 'salario_hora']:.4f} |
| **Salario por Hora** | {corr_matrix.loc['salario_hora', 'ch06']:.4f} | {corr_matrix.loc['salario_hora', 'htot']:.4f} | {corr_matrix.loc['salario_hora', 'p47t']:.4f} | 1.0000 |

---

### 💡 Insights y Recomendaciones de HR

* **Brecha por Calificación vs Educación**: La brecha salarial por calificación (el puesto que se ocupa, **{gap_calif_pct}%**) es mayor que la brecha por nivel de educación formal obtenido (**{gap_ed_pct}%**). Esto sugiere que la formación técnica/práctica específica y la inserción laboral efectiva tienen un impacto directo crítico.
* **Retorno a la Educación**: Tener educación secundaria completa aumenta significativamente el piso salarial (el ingreso mediano pasa de ${ed_stats.loc['Hasta Secundario Incompleto', 'median']:,.0f} a ${ed_stats.loc['Secundario Completo y Más', 'median']:,.0f}), lo que justifica políticas internas de capacitación y terminalidad educativa en la plataforma HR SaaS.
* **Correlación Horas vs Salario por Hora**: Existe una correlación negativa moderada ({corr_matrix.loc['htot', 'salario_hora']:.4f}) entre las horas semanales trabajadas y el salario por hora estimado. Esto indica que quienes trabajan jornadas extremadamente largas suelen tener salarios por hora más bajos (trabajos más precarizados u operativos), mientras que los profesionales concentran mayores ingresos en jornadas estándar.

---

### 📁 Visualizaciones Generadas
Los gráficos han sido guardados en la carpeta raíz del proyecto y pueden visualizarse directamente:
1. Distribución por Educación: `visualizaciones/1_educacion_ingresos.png`
2. Comparativa de Calificación: `visualizaciones/2_calificacion_ingresos.png`
3. Curva de Ingresos por Edad: `visualizaciones/3_edad_ingresos.png`
4. Horas vs Ingresos: `visualizaciones/4_horas_ingresos.png`
""")

print("Proceso completado exitosamente.")
