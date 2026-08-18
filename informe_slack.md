# 📊 INFORME DE ANÁLISIS DE DATOS - HR SAAS (EVALUACIÓN)
*Generado automáticamente por Antigravity Data Agent*

---

### 🚀 Resumen Ejecutivo

1. **Retorno a la Educación**: Completar el nivel secundario (o superior) incrementa el ingreso promedio en un **47.6%** en comparación con quienes no lo completaron.
2. **Brecha de Calificación**: Los puestos clasificados como *Profesionales / Técnicos* perciben, en promedio, un **57.6%** más que los puestos *Operativos o No Calificados*.
3. **Curva de Vida Laboral**: Los ingresos mensuales siguen un comportamiento cóncavo respecto a la edad, alcanzando su punto máximo al rededor de los **43-45 años** antes de comenzar a descender.
4. **Relación Horas-Ingreso**: Existe una relación lineal positiva entre la cantidad de horas trabajadas semanalmente y el ingreso, aunque con una variabilidad alta explicada por la calificación de la tarea.

---

### 📈 Estadísticas Descriptivas Clave

#### 🎓 1. Ingresos por Nivel Educativo
| Nivel Educativo | Casos (N) | Ingreso Promedio ($) | Ingreso Mediano ($) | Desviación Estándar ($) |
| :--- | :---: | :---: | :---: | :---: |
| **Hasta Secundario Incompleto** | 8814 | $6,250.01 | $5,100.00 | $5,060.42 |
| **Secundario Completo y Más** | 14634 | $9,226.91 | $8,000.00 | $6,841.93 |

#### 💼 2. Ingresos por Calificación Laboral
| Calificación Ocupacional | Casos (N) | Ingreso Promedio ($) | Ingreso Mediano ($) | Desviación Estándar ($) |
| :--- | :---: | :---: | :---: | :---: |
| **Operativo / No Calificado** | 17372 | $7,054.32 | $6,000.00 | $5,202.55 |
| **Profesional / Técnico** | 6076 | $11,120.22 | $9,200.00 | $8,263.55 |

#### 🔗 3. Matriz de Correlación (Coeficiente de Pearson)
| Variable | Edad (`ch06`) | Horas Semanales (`htot`) | Ingreso Total (`p47t`) | Salario por Hora |
| :--- | :---: | :---: | :---: | :---: |
| **Edad (`ch06`)** | 1.0000 | 0.0163 | 0.1840 | 0.1417 |
| **Horas Semanales (`htot`)** | 0.0163 | 1.0000 | 0.2511 | -0.2347 |
| **Ingreso Total (`p47t`)** | 0.1840 | 0.2511 | 1.0000 | 0.5445 |
| **Salario por Hora** | 0.1417 | -0.2347 | 0.5445 | 1.0000 |

---

### 💡 Insights y Recomendaciones de HR

* **Brecha por Calificación vs Educación**: La brecha salarial por calificación (el puesto que se ocupa, **57.6%**) es mayor que la brecha por nivel de educación formal obtenido (**47.6%**). Esto sugiere que la formación técnica/práctica específica y la inserción laboral efectiva tienen un impacto directo crítico.
* **Retorno a la Educación**: Tener educación secundaria completa aumenta significativamente el piso salarial (el ingreso mediano pasa de $5,100 a $8,000), lo que justifica políticas internas de capacitación y terminalidad educativa en la plataforma HR SaaS.
* **Correlación Horas vs Salario por Hora**: Existe una correlación negativa moderada (-0.2347) entre las horas semanales trabajadas y el salario por hora estimado. Esto indica que quienes trabajan jornadas extremadamente largas suelen tener salarios por hora más bajos (trabajos más precarizados u operativos), mientras que los profesionales concentran mayores ingresos en jornadas estándar.

---

### 📁 Visualizaciones Generadas
Los gráficos han sido guardados en la carpeta raíz del proyecto y pueden visualizarse directamente:
1. Distribución por Educación: `visualizaciones/1_educacion_ingresos.png`
2. Comparativa de Calificación: `visualizaciones/2_calificacion_ingresos.png`
3. Curva de Ingresos por Edad: `visualizaciones/3_edad_ingresos.png`
4. Horas vs Ingresos: `visualizaciones/4_horas_ingresos.png`
