# Casos de prueba

## Univariado
X = [2, 3, 4, 5, 6]
- Media = 4
- Mediana = 4
- Varianza muestral = 2.5
- Desviación muestral ≈ 1.5811

## Correlación y covarianza
X = [2, 3, 4, 5, 6]
Y = [10, 12, 13, 15, 17]
- Covarianza muestral = 4.25
- r ≈ 0.9934    

## K-means
X = [2, 3, 4, 8, 9, 10]
Y = [100, 120, 140, 500, 520, 550]
K = 2

## K-medoids
Datos pequeños verificables manualmente.

## Gráficos (P5)
Datos de ejemplo (6 filas):

| Estudiante | Horas de estudio | Nota promedio |
|---|---|---|
| A | 2 | 10 |
| B | 4 | 12 |
| C | 5 | 11 |
| D | 7 | 16 |
| E | 8 | 15 |
| F | 10 | 18 |

- Dispersión X = Horas, Y = Nota, con recta:
  - Etiqueta en el gráfico: Ŷ = 7.524 + 1.024·X, R² = 0.892
  - Tooltip del punto D: "D · Horas de estudio: 7 · Nota promedio: 16"
  - Leyenda: "Observaciones" y "Recta ajustada" (clic oculta/muestra)
- Histograma de Nota con 3 intervalos: [10 – 12.667) → 3, [12.667 – 15.333) → 1, [15.333 – 18] → 2
- Caja de Nota: Q1 = 11.25, Mediana = 13.5, Q3 = 15.75, bigotes 10 a 18, sin atípicos
- Caja de [1, 2, 3, 4, 5, 6, 30]: Q1 = 2.5, Mediana = 4, Q3 = 5.5, bigotes 1 a 6, atípico 30 (punto hueco)
- Barras de [Puno, Cusco, Puno]: Cusco → 1 (33.3 %), Puno → 2 (66.7 %)
- K-means con K = 2 sobre Horas y Nota: 2 elipses punteadas, centroides con "×", leyenda con 2 clusters
- Descargas: "dispersion_AAAA-MM-DD.svg" (con título, sin var()) y ".png" de 1440×840
- Teclado: Tab enfoca el gráfico; flechas recorren los datos; Escape limpia
- Con 150 filas y en 768 px: sin textos cortados ni scroll horizontal

### Caso conocido (pendiente, js/estadistica/frecuencias.js)
Valores [0.1, 0.5, 0.9] con 3 intervalos: el último límite queda en 0.8999999999999999,
así que 0.9 no entra en ningún intervalo (suma 2 de 3). Corrección sugerida:
usar limiteSuperior = max en el último intervalo.
