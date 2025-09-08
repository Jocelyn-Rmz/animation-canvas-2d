/* ============================
   1) SETUP INICIAL DEL CANVAS
   ============================ */

// Obtiene el elemento <canvas> por su id
const canvas = document.getElementById("canvas");

// Obtiene el contexto 2D para dibujar (figuras, texto, etc.)
let ctx = canvas.getContext("2d");

// Dimensiones activas del canvas (se usan para colisiones y límites)
// Usamos "let" (no const) para poder ACTUALIZAR cuando el usuario cambie el tamaño
let window_height = canvas.height;
let window_width  = canvas.width;


/* ============================
   2) CLASE "Circle" (POO)
   ============================ */

class Circle {
  /**
   * @param {number} x        - Posición inicial X
   * @param {number} y        - Posición inicial Y
   * @param {number} radius   - Radio del círculo
   * @param {string} color    - Color del borde y texto
   * @param {string|number} text - Texto en el centro (ej. índice)
   * @param {number} speed    - Velocidad base del círculo
   */
  constructor(x, y, radius, color, text, speed) {
    // Posición
    this.posX = x;             // Guarda la coordenada X
    this.posY = y;             // Guarda la coordenada Y

    // Apariencia
    this.radius = radius;      // Radio para dibujar el círculo
    this.color = color;        // Color del borde (y del texto)
    this.text  = text;         // Texto centrado dentro del círculo

    // Movimiento
    this.speed = speed;        // Escala de velocidad para este círculo

    // Direcciones iniciales aleatorias: -1 o 1 en cada eje
    const dirX = Math.random() < 0.5 ? -1 : 1;
    const dirY = Math.random() < 0.5 ? -1 : 1;

    // Velocidad por eje (se multiplicará por un factor global)
    this.dx = dirX * this.speed;  // Velocidad horizontal
    this.dy = dirY * this.speed;  // Velocidad vertical
  }

  // Dibuja el círculo y su texto en el contexto recibido
  draw(context) {
    context.beginPath();             // Inicia un nuevo trazado

    // Configura estilos del borde y del texto
    context.strokeStyle = this.color; // Color del borde
    context.textAlign   = "center";   // Centra el texto horizontalmente
    context.textBaseline = "middle";  // Centra el texto verticalmente
    context.font = "16px Arial";      // Tipo y tamaño de fuente
    context.fillStyle = this.color;   // Color del texto

    // Dibuja el texto en la posición actual del círculo
    context.fillText(this.text, this.posX, this.posY);

    // Dibuja la circunferencia
    context.lineWidth = 2;            // Grosor del borde
    context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
    context.stroke();                 // Traza el borde
    context.closePath();              // Cierra el trazado
  }

  /**
   * Actualiza la posición y maneja rebotes
   * @param {CanvasRenderingContext2D} context - Contexto de dibujo
   * @param {number} speedMultiplier - Factor de velocidad global (slider)
   */
  update(context, speedMultiplier) {
    // Antes de mover, lo dibujamos en el frame actual
    this.draw(context);

    // --- Colisiones horizontales (pared izquierda/derecha) ---
    if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
      this.dx = -this.dx; // Invierte dirección horizontal
      // Asegura que no se quede fuera de los límites
      this.posX = Math.min(Math.max(this.posX, this.radius), window_width - this.radius);
    }

    // --- Colisiones verticales (techo/piso) ---
    if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
      this.dy = -this.dy; // Invierte dirección vertical
      // Asegura que no se quede fuera de los límites
      this.posY = Math.min(Math.max(this.posY, this.radius), window_height - this.radius);
    }

    // --- Actualiza posición según velocidades y factor global ---
    this.posX += this.dx * speedMultiplier;
    this.posY += this.dy * speedMultiplier;
  }
}


/* ============================
   3) ESTADO GLOBAL Y UTILIDADES
   ============================ */

// Arreglo que almacena todos los círculos activos
let arrayCircle = [];

// Factor de velocidad global controlado por el slider (1.0 = normal)
let speedMultiplier = 1;

// Paleta de colores cíclica para los círculos
const COLORS = ["red", "blue", "green", "purple", "orange", "pink", "teal", "brown", "navy", "gray"];

/**
 * Devuelve un número aleatorio entre min y max
 * @param {number} min - mínimo
 * @param {number} max - máximo
 */
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Limita un valor para que no exceda [min, max]
 * @param {number} val - valor a limitar
 * @param {number} min - mínimo
 * @param {number} max - máximo
 */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Crea un círculo con valores aleatorios válidos dentro del canvas
 * @param {string|number} indexLabel - texto opcional para el círculo
 * @returns {Circle} instancia de Circle lista para usar
 */
function createRandomCircle(indexLabel) {
  const margin = 30; // margen para no iniciar pegado a los bordes

  // Posición aleatoria respetando el margen
  const x = randomBetween(margin, window_width - margin);
  const y = randomBetween(margin, window_height - margin);

  // Radio entre 20 y 50 píxeles
  const radius = Math.floor(Math.random() * 30 + 20);

  // Escoge color rotando sobre la paleta
  const color = COLORS[arrayCircle.length % COLORS.length];

  // Texto mostrado en el centro (si no se pasa, toma correlativo)
  const text = indexLabel ?? (arrayCircle.length + 1);

  // Velocidad base individual entre 1 y 4
  const speed = Math.random() * 3 + 1;

  // Devuelve la instancia
  return new Circle(x, y, radius, color, text, speed);
}

/**
 * Actualiza el contador visual de círculos (span#countLabel)
 */
function updateCountLabel() {
  const lbl = document.getElementById("countLabel");
  if (lbl) lbl.textContent = arrayCircle.length.toString();
}

/**
 * Regenera exactamente 10 círculos con valores aleatorios
 */
function resetCircles() {
  arrayCircle = [];             // Limpia el arreglo
  for (let i = 0; i < 10; i++) {
    arrayCircle.push(createRandomCircle(i + 1)); // Crea 10 y numéralos 1..10
  }
  updateCountLabel();           // Refresca contador visual
}

/**
 * Agrega un círculo nuevo al arreglo
 */
function addCircle() {
  arrayCircle.push(createRandomCircle()); // Agrega uno más
  updateCountLabel();                     // Actualiza contador
}

/**
 * Quita el último círculo del arreglo (si hay)
 */
function removeCircle() {
  if (arrayCircle.length > 0) {
    arrayCircle.pop();                    // Elimina el último
    updateCountLabel();                   // Refresca contador
  }
}


/* ============================
   4) ENLACE DE CONTROLES (DOM)
   ============================ */

// Botones de acción
const btnAdd    = document.getElementById("btnAdd");      // Botón “Agregar”
const btnRemove = document.getElementById("btnRemove");   // Botón “Quitar”
const btnReset  = document.getElementById("btnReset");    // Botón “Reiniciar 10”

// Slider de velocidad y etiqueta de valor
const speedRange = document.getElementById("speedRange"); // Input type=range
const speedValue = document.getElementById("speedValue"); // Span que muestra “1.0×”

// Controles de tamaño del canvas
const btnResize  = document.getElementById("btnResize");  // Botón “Aplicar” tamaño
const inputWidth = document.getElementById("canvasWidth");// Input numérico ancho
const inputHeight= document.getElementById("canvasHeight");// Input numérico alto
const sizeLabel  = document.getElementById("canvasSizeLabel"); // Texto del tamaño actual

// Asocia eventos a los botones si existen en el DOM
if (btnAdd)    btnAdd.addEventListener("click", addCircle);
if (btnRemove) btnRemove.addEventListener("click", removeCircle);
if (btnReset)  btnReset.addEventListener("click", resetCircles);

// Cuando el slider se mueve, actualiza el multiplicador y el texto
if (speedRange) {
  speedRange.addEventListener("input", () => {
    speedMultiplier = Number(speedRange.value);            // Lee valor numérico del slider
    if (speedValue) speedValue.textContent = `${speedMultiplier.toFixed(1)}×`; // Muestra “X.X×”
  });
}


/* ========================================
   5) CAMBIO DE TAMAÑO DINÁMICO DEL CANVAS
   ======================================== */

// Maneja el click en “Aplicar” para redimensionar el canvas
if (btnResize) {
  btnResize.addEventListener("click", () => {
    // Lee los valores de los inputs
    let newW = Number(inputWidth.value);   // Nuevo ancho
    let newH = Number(inputHeight.value);  // Nuevo alto

    // Asegura que estén dentro de un rango razonable
    newW = clamp(newW, 200, 1000);         // Limita 200..1000
    newH = clamp(newH, 200, 1000);         // Limita 200..1000

    // Aplica los nuevos tamaños al canvas
    canvas.width  = newW;
    canvas.height = newH;

    // Actualiza las variables globales usadas para colisiones
    window_width  = canvas.width;
    window_height = canvas.height;

    // Reinicia los círculos para que se adapten al nuevo tamaño
    resetCircles();

    // Actualiza la etiqueta visual del tamaño actual
    if (sizeLabel) sizeLabel.textContent = `Canvas ${newW}×${newH}`;
  });
}


/* ============================
   6) BUCLE DE ANIMACIÓN
   ============================ */

/**
 * Función que se repite en cada frame para animar los círculos
 * Usa requestAnimationFrame para 60fps suaves (depende del navegador)
 */
function updateCircle() {
  // Solicita al navegador llamar otra vez a updateCircle en el siguiente frame
  requestAnimationFrame(updateCircle);

  // Limpia el canvas completo antes de dibujar el nuevo frame
  ctx.clearRect(0, 0, window_width, window_height);

  // Actualiza cada círculo (dibuja, mueve y rebota)
  arrayCircle.forEach((c) => c.update(ctx, speedMultiplier));
}


/* ============================
   7) INICIALIZACIÓN
   ============================ */

// Crea los 10 círculos iniciales
resetCircles();

// Muestra el valor de velocidad inicial en la UI (1.0×)
if (speedValue) speedValue.textContent = `${speedMultiplier.toFixed(1)}×`;

// Arranca la animación
updateCircle();
