const symbols = [
  { nombre: "cereza", src: "logos/cereza.png", tope: 0.12, tipo: "basica" },
  { nombre: "banana", src: "logos/banana.png", tope: 0.24, tipo: "basica" },
  { nombre: "kiwi", src: "logos/kiwi.png", tope: 0.36, tipo: "basica" },
  { nombre: "limon", src: "logos/limon.png", tope: 0.48, tipo: "basica" },
  { nombre: "manzana", src: "logos/manzana.png", tope: 0.6, tipo: "basica" },
  { nombre: "naranja", src: "logos/naranja.png", tope: 0.72, tipo: "basica" },
  { nombre: "sandia", src: "logos/sandia.png", tope: 0.8, tipo: "rara" },
  { nombre: "uva", src: "logos/uva.png", tope: 0.88, tipo: "rara" },
  { nombre: "diamante", src: "logos/diamante.png", tope: 0.94, tipo: "especial" },
  { nombre: "comodin", src: "logos/comodin.png", tope: 0.97, tipo: "comodin" },
  { nombre: "comodin2", src: "logos/comodin2.png", tope: 1, tipo: "comodin" },
]

let tirosGratisDisponibles = 0
let Saldo_cargado = 0
let montoFijo = null
let lineasFijas = null

function obtenerSimboloPorProbabilidad() {
  const r = Math.random(); // número entre 0 y 1
  for (let i = 0; i < symbols.length; i++) {
    if (r < symbols[i].tope) {
      return symbols[i];
    }
  }
  // fallback en caso raro
  return symbols[symbols.length - 1];
}
  
const reelsContainer = document.getElementById("reels");
const spinButton = document.getElementById("spin-button");
  
  // Crea una celda con símbolo
function createCell(symbol) {
  const cell = document.createElement("div");
  cell.classList.add("reel-cell");

  const img = document.createElement("img");
  img.src = symbol.src;
  img.alt = symbol.nombre;
  img.classList.add("simbolo-img"); // esta clase la usás en CSS

  cell.appendChild(img);
  return cell;
}

  
  // Crea las columnas y celdas
function generateInitialReels() {
  reelsContainer.innerHTML = "";

  for (let col = 0; col < 5; col++) {
    const column = document.createElement("div");
    column.classList.add("column");

    const strip = document.createElement("div");
    strip.classList.add("reel-strip");

    for (let row = 0; row < 4; row++) {
      const symbol = obtenerSimboloPorProbabilidad();
      strip.appendChild(createCell(symbol));
    }

    column.appendChild(strip);
    reelsContainer.appendChild(column);
  }
}

// Función para limpiar efectos visuales de ganancias anteriores
function limpiarEfectosVisuales() {
  const todasLasCeldas = document.querySelectorAll(".reel-cell")
  todasLasCeldas.forEach((celda) => {
    celda.classList.remove("ganadora", "ganadora-diamante")
  })
}

// Función para obtener la celda en una posición específica
function obtenerCelda(fila, columna) {
  const columns = reelsContainer.querySelectorAll(".column")
  if (columna >= 0 && columna < columns.length) {
    const cells = columns[columna].querySelectorAll(".reel-cell")

    // Mapeo de filas: 0=superior(cells[2]), 1=central(cells[3]), 2=inferior(cells[4])
    let indiceCelda
    if (fila === 0)
      indiceCelda = 2 // fila superior
    else if (fila === 1)
      indiceCelda = 3 // fila central
    else if (fila === 2) indiceCelda = 4 // fila inferior

    if (indiceCelda !== undefined && cells[indiceCelda]) {
      return cells[indiceCelda]
    }
  }
  return null
}

// Función para marcar visualmente las celdas ganadoras
function marcarCeldasGanadoras(posicionesGanadoras) {
  posicionesGanadoras.forEach((posicion) => {
    const celda = obtenerCelda(posicion.fila, posicion.columna)
    if (celda) {
      celda.classList.add("ganadora")

      // Agregar un pequeño delay para que el efecto se vea mejor
      setTimeout(() => {
        celda.classList.add("ganadora-activa")
      }, 100)
    }
  })
}

// Función para marcar diamantes ganadores
function marcarDiamantesGanadores() {
  const columns = reelsContainer.querySelectorAll(".column")

  // Recorrer cada columna
  columns.forEach((column) => {
    const cells = column.querySelectorAll(".reel-cell")

    // Solo marcar los diamantes en las filas visibles (2, 3 y 4)
    for (let i = 2; i <= 4; i++) {
      if (cells[i]) {
        const img = cells[i].querySelector("img")
        if (img && img.alt === "diamante") {
          cells[i].classList.add("ganadora-diamante")
        }
      }
    }
  })
}
  
  // Animar giro de una columna (desplaza hacia abajo y luego actualiza símbolos)
function animateColumn(column) {
  const strip = column.querySelector(".reel-strip");
  let spinning = true;

  function spinOnce() {
    if (!spinning) return;

    strip.style.transition = "transform 0.001s linear";
    strip.style.transform = "translateY(0)";

    strip.addEventListener(
      "transitionend",
      () => {
        strip.style.transition = "none";
        strip.style.transform = "translateY(-80px)";

        const newSymbol = createCell(obtenerSimboloPorProbabilidad());
        strip.insertBefore(newSymbol, strip.firstElementChild);

        setTimeout(() => {
          if (spinning) {
            strip.removeChild(strip.lastElementChild);
          }
          spinOnce(); // Llama al próximo giro
        }, 100);
      },
      { once: true }
    );
  }

  spinOnce();

  // Devolvemos una función para detener el giro después
  return () => {
    spinning = false;
  };
}

function mostrarMensajeError(mensaje) {
  const errorContainer = document.getElementById("mensaje-error");
  const texto = document.getElementById("texto-error");
  texto.textContent = mensaje;
  errorContainer.classList.remove("oculto");
}

function cerrarMensajeError() {
  const errorContainer = document.getElementById("mensaje-error");
  errorContainer.classList.add("oculto");
}

// Función para mostrar mensaje de ganancia
function mostrarMensajeGanancia(mensaje) {
  const gananciasContainer = document.getElementById("mensaje-ganancias")
  const texto = document.getElementById("texto-ganancias")
  texto.textContent = mensaje
  gananciasContainer.classList.remove("oculto")
}

function cerrarMensajeGanancia() {
  const gananciasContainer = document.getElementById("mensaje-ganancias")
  gananciasContainer.classList.add("oculto")
}

// Función para analizar las líneas según la selección del usuario
function analizarLineasAJugar() {
  const selectLineas = document.getElementById("lineas-apuesta")
  const primerCaracter = selectLineas.value.charAt(0)
  const lineasSeleccionadas = Number.parseInt(primerCaracter)

  if (lineasSeleccionadas === 1) {
    console.log("El usuario está jugando 1 línea - Solo línea central horizontal")
    return 1;} 
    
    else if (lineasSeleccionadas === 2) {
    console.log("El usuario está jugando 3 líneas - Todas las líneas horizontales")
    return 3;} 
    
    else if (lineasSeleccionadas === 3) {
    console.log("El usuario está jugando 5 líneas - Todas las líneas horizontales + diagonales")
    return 5;}
}

function obtenerMatrizSimbolos() {
  const columns = reelsContainer.querySelectorAll(".column");
  
  // Creamos un array para cada fila visible
  const filaSuperior = [];   // Fila 2 del DOM
  const filaCentral = [];    // Fila 3 del DOM  
  const filaInferior = [];   // Fila 4 del DOM
  
  // Para cada columna, extraemos el símbolo de cada fila
  for (let col = 0; col < columns.length; col++) {
    const cells = columns[col].querySelectorAll(".reel-cell");
    
    filaSuperior.push(cells[2]?.querySelector('img')?.alt || null);
    filaCentral.push(cells[3]?.querySelector('img')?.alt || null);
    filaInferior.push(cells[4]?.querySelector('img')?.alt || null);
  }
  
  console.log("Fila Superior:", filaSuperior);
  console.log("Fila Central:", filaCentral);
  console.log("Fila Inferior:", filaInferior);
  
  return {
    superior: filaSuperior,
    central: filaCentral,
    inferior: filaInferior
  };
}

// Función para obtener el tipo de símbolo
function obtenerTipoSimbolo(nombreSimbolo) {
  for (let i = 0; i < symbols.length; i++) {
    if (symbols[i].nombre === nombreSimbolo) {
      return symbols[i].tipo
    }
  }
  return null
}

// Función para calcular el multiplicador según el tipo y cantidad
function calcularMultiplicador(tipo, cantidad) {
  if (tipo === "basica") {
    if (cantidad === 3) return 2
    if (cantidad === 4) return 5
    if (cantidad >= 5) return 10
  } else if (tipo === "rara") {
    if (cantidad === 3) return 4
    if (cantidad === 4) return 8
    if (cantidad >= 5) return 16
  }
  return 0
}

// Función para contar diamantes en toda la matriz
function contarDiamantes(matrizSimbolos) {
  let contador = 0

  // Contar en fila superior
  matrizSimbolos.superior.forEach((simbolo) => {
    if (simbolo === "diamante") contador++
  })

  // Contar en fila central
  matrizSimbolos.central.forEach((simbolo) => {
    if (simbolo === "diamante") contador++
  })

  // Contar en fila inferior
  matrizSimbolos.inferior.forEach((simbolo) => {
    if (simbolo === "diamante") contador++
  })

  return contador
}

// Función para calcular tiros gratis según cantidad de diamantes
function calcularTirosGratis(cantidadDiamantes) {
  if (cantidadDiamantes === 3) return 5
  if (cantidadDiamantes === 4) return 10
  if (cantidadDiamantes === 5) return 15
  if (cantidadDiamantes >= 6) return 20
  return 0
}

// Función para obtener las posiciones de una línea específica
function obtenerPosicionesLinea(tipoLinea, parametro = null) {
  const posiciones = []

  switch (tipoLinea) {
    case "Superior":
      for (let col = 0; col < 5; col++) {
        posiciones.push({ fila: 0, columna: col })
      }
      break
    case "Central":
      for (let col = 0; col < 5; col++) {
        posiciones.push({ fila: 1, columna: col })
      }
      break
    case "Inferior":
      for (let col = 0; col < 5; col++) {
        posiciones.push({ fila: 2, columna: col })
      }
      break
    case "Vertical":
      // parametro es el número de columna
      posiciones.push({ fila: 0, columna: parametro })
      posiciones.push({ fila: 1, columna: parametro })
      posiciones.push({ fila: 2, columna: parametro })
      break
    case "Diagonal-Sup-Izq":
      posiciones.push({ fila: 0, columna: 2 })
      posiciones.push({ fila: 1, columna: 1 })
      posiciones.push({ fila: 2, columna: 0 })
      break
    case "Diagonal-Sup-Der":
      posiciones.push({ fila: 0, columna: 2 })
      posiciones.push({ fila: 1, columna: 3 })
      posiciones.push({ fila: 2, columna: 4 })
      break
    case "Diagonal-Inf-Izq":
      posiciones.push({ fila: 2, columna: 2 })
      posiciones.push({ fila: 1, columna: 1 })
      posiciones.push({ fila: 0, columna: 0 })
      break
    case "Diagonal-Inf-Der":
      posiciones.push({ fila: 2, columna: 2 })
      posiciones.push({ fila: 1, columna: 3 })
      posiciones.push({ fila: 0, columna: 4 })
      break
  }

  return posiciones
}

// Función para analizar combinaciones ganadoras
function analizarCombinaciones(lineasAJugar, matrizSimbolos, montoApostado) {
  const resultados = []
  let gananciaTotal = 0
  let tirosGratis = 0
  const posicionesGanadoras = []

  // Determinamos qué filas analizar
  let filasAAnalizar = []
  if (lineasAJugar === 1) {
    filasAAnalizar = [{ nombre: "Central", simbolos: matrizSimbolos.central }]
  } else if (lineasAJugar === 3) {
    filasAAnalizar = [
      { nombre: "Central", simbolos: matrizSimbolos.central },
      { nombre: "Superior", simbolos: matrizSimbolos.superior },
      { nombre: "Inferior", simbolos: matrizSimbolos.inferior },
    ]
  } else if (lineasAJugar === 5) {
      // Las 3 líneas horizontales
      filasAAnalizar = [
        { nombre: "Superior", simbolos: matrizSimbolos.superior },
        { nombre: "Central", simbolos: matrizSimbolos.central },
        { nombre: "Inferior", simbolos: matrizSimbolos.inferior },
      ]
      
      // Líneas verticales (columna por columna)
      for (let col = 0; col < 5; col++) {
        const columnaVertical = [
          matrizSimbolos.superior[col],
          matrizSimbolos.central[col], 
          matrizSimbolos.inferior[col]
        ]
        filasAAnalizar.push({ 
          nombre: "Vertical",
          parametro: col, 
          simbolos: columnaVertical 
        })
      }
      
      // Diagonales desde superior central hacia abajo-izquierda y abajo-derecha
      const diagonalSupIzq = [
        matrizSimbolos.superior[2], // col 1
        matrizSimbolos.central[1],  // col 2 (centro)
        matrizSimbolos.inferior[0]  // col 3
      ]
      const diagonalSupDer = [
        matrizSimbolos.superior[2], // col 3
        matrizSimbolos.central[3],  // col 2 (centro)
        matrizSimbolos.inferior[4]  // col 1
      ]
      
      // Diagonales desde inferior central hacia arriba-izquierda y arriba-derecha
      const diagonalInfIzq = [
        matrizSimbolos.inferior[2], // col 1
        matrizSimbolos.central[1],  // col 2 (centro)
        matrizSimbolos.superior[0]  // col 3
      ]
      const diagonalInfDer = [
        matrizSimbolos.inferior[2], // col 3
        matrizSimbolos.central[3],  // col 2 (centro)
        matrizSimbolos.superior[4]  // col 1
      ]
      
      filasAAnalizar.push({ nombre: "Diagonal-Sup-Izq", simbolos: diagonalSupIzq })
      filasAAnalizar.push({ nombre: "Diagonal-Sup-Der", simbolos: diagonalSupDer })
      filasAAnalizar.push({ nombre: "Diagonal-Inf-Izq", simbolos: diagonalInfIzq })
      filasAAnalizar.push({ nombre: "Diagonal-Inf-Der", simbolos: diagonalInfDer })
    }
  // Analizamos cada fila
  filasAAnalizar.forEach((fila) => {
    let contador = 0
    let simboloActual = null
    
    // Variables para guardar el mejor resultado
    let mejorContador = 0
    let mejorSimbolo = null
    let posicionInicio = 0
    let i = 0

while (i < fila.simbolos.length) {
  let contador = 0
  let simboloBase = null
  let j = i

  // Buscamos el primer símbolo no comodín para tomar como base
  while (j < fila.simbolos.length && (fila.simbolos[j] === "comodin" || fila.simbolos[j] === "comodin2")) {
    contador++
    j++
  }

  if (j < fila.simbolos.length) {
    simboloBase = fila.simbolos[j]
    contador++
    j++

    // Seguimos contando mientras sea igual o comodín
    while (j < fila.simbolos.length && 
          (fila.simbolos[j] === simboloBase || 
           fila.simbolos[j] === "comodin" || 
           fila.simbolos[j] === "comodin2")) {
      contador++
      j++
    }

    // Si hay 3 o más en secuencia (con comodines incluidos), es combinación ganadora
    if (contador >= 3 && simboloBase !== "diamante") {
      const tipoSimbolo = obtenerTipoSimbolo(simboloBase)
      const multiplicador = calcularMultiplicador(tipoSimbolo, contador)
      const ganancia = montoApostado * multiplicador

      console.log(`🎉 ¡GANADOR en fila ${fila.nombre}! ${contador} ${simboloBase} - Ganancia: $${ganancia}`)

      const posicionesLinea = obtenerPosicionesLinea(fila.nombre, fila.parametro)
      for (let k = i; k < i + contador; k++) {
        if (posicionesLinea[k]) {
          posicionesGanadoras.push(posicionesLinea[k])
        }
      }

      resultados.push({
        fila: fila.nombre,
        simbolo: simboloBase,
        cantidad: contador,
        ganancia: ganancia,
      })

      gananciaTotal += ganancia
    }
  }

  // Avanzamos al próximo símbolo no evaluado
  i = i + Math.max(1, contador)
}
    
    // Si hay 3 o más símbolos consecutivos, es ganador
    if (
      mejorContador >= 3 &&
      mejorSimbolo !== "comodin" &&
      mejorSimbolo !== "comodin2" &&
      mejorSimbolo !== "diamante"
    ) {
      const tipoSimbolo = obtenerTipoSimbolo(mejorSimbolo)
      const multiplicador = calcularMultiplicador(tipoSimbolo, mejorContador)
      const ganancia = montoApostado * multiplicador

      console.log(`🎉 ¡GANADOR en fila ${fila.nombre}! ${mejorContador} ${mejorSimbolo} - Ganancia: $${ganancia}`)

      // Obtener las posiciones de la línea ganadora
      const posicionesLinea = obtenerPosicionesLinea(fila.nombre, fila.parametro)

      // Agregar solo las posiciones ganadoras (las primeras mejorContador posiciones)
      for (let i = 0; i < mejorContador; i++) {
        if (posicionesLinea[i]) {
          posicionesGanadoras.push(posicionesLinea[i])
        }
      }

      resultados.push({
        fila: fila.nombre,
        simbolo: mejorSimbolo,
        cantidad: mejorContador,
        ganancia: ganancia,
      })

      gananciaTotal += ganancia
    }
  })

  // Verificar diamantes (en cualquier posición)
  const cantidadDiamantes = contarDiamantes(matrizSimbolos)
  if (cantidadDiamantes >= 3) {
    tirosGratis = calcularTirosGratis(cantidadDiamantes)
    console.log(`💎 ¡${cantidadDiamantes} DIAMANTES! Ganaste ${tirosGratis} tiros gratis`)

    // Bloquear selects visualmente y funcionalmente
    document.getElementById("monto-apuesta").disabled = true
    document.getElementById("lineas-apuesta").disabled = true
    document.getElementById("monto-apuesta").classList.add("bloqueado")
    document.getElementById("lineas-apuesta").classList.add("bloqueado")

    resultados.push({
      tipo: "diamantes",
      cantidad: cantidadDiamantes,
      tirosGratis: tirosGratis,
    })
  }

  return {
    resultados: resultados,
    gananciaTotal: gananciaTotal,
    tirosGratis: tirosGratis,
    posicionesGanadoras: posicionesGanadoras,
    hayDiamantes: cantidadDiamantes >= 3,
  }
}

function bloquearOpcionesDeApuesta(bloquear) {
  const montoSelect = document.getElementById("monto-apuesta")
  const lineasSelect = document.getElementById("lineas-apuesta")

  montoSelect.disabled = bloquear
  lineasSelect.disabled = bloquear
}

async function spinReels() {
  const montoPorLinea = tirosGratisDisponibles > 0 ? montoFijo : Number.parseInt(document.getElementById("monto-apuesta").value)  
  const lineasAJugar = tirosGratisDisponibles > 0 ? lineasFijas : analizarLineasAJugar()
  const montoTotalApostado = montoPorLinea * lineasAJugar
  
  spinButton.disabled = true

  // Limpiar efectos visuales del giro anterior
  limpiarEfectosVisuales()

  const analisisLineas = analizarLineasAJugar()
  console.log(`Apuesta: $${montoPorLinea} por línea x ${lineasAJugar} líneas = $${montoTotalApostado} total`)

  // Verificar si tenemos tiros gratis o si debemos cobrar
  let usandoTiroGratis = false

  if (tirosGratisDisponibles > 0) {
    tirosGratisDisponibles--
    usandoTiroGratis = true
    actualizarContadorTirosGratis()
    console.log(`Usando tiro gratis. Quedan: ${tirosGratisDisponibles}`)
  } else if (Saldo_cargado >= montoTotalApostado) {
    Saldo_cargado -= montoTotalApostado
    actualizarSaldoUI()
  } else {
    mostrarMensajeError(`Saldo insuficiente. Necesitas $${montoTotalApostado} para apostar a ${lineasAJugar} líneas.`)
    spinButton.disabled = false
    return
  }

  // 🛠 Desbloquear los controles si se terminaron los tiros gratis
  if (usandoTiroGratis && tirosGratisDisponibles === 0) {
    montoFijo = null
    lineasFijas = null
    document.getElementById("monto-apuesta").disabled = false
    document.getElementById("lineas-apuesta").disabled = false
    document.getElementById("monto-apuesta").classList.remove("bloqueado")
    document.getElementById("lineas-apuesta").classList.remove("bloqueado")
    console.log("Se terminaron los tiros gratis. Se restablecen controles.")
  }

  const columns = reelsContainer.querySelectorAll(".column")

  // Iniciar todas las columnas y guardar funciones para detenerlas
  const stopFunctions = Array.from(columns).map((col) => animateColumn(col))

  // Esperar 5 segundos antes de empezar a detenerlas
  await new Promise((resolve) => setTimeout(resolve, 2500))

  // Detener una por una con delay
  for (let i = 0; i < stopFunctions.length; i++) {
    setTimeout(() => {
      stopFunctions[i]() // Detener esa columna
    }, i * 800) // Delay escalonado (0ms, 500ms, 1000ms, ...)
  }

  // Esperar hasta que todas hayan parado antes de habilitar botón
  await new Promise((resolve) => setTimeout(resolve, stopFunctions.length * 500 + 1000))

  const matrizSimbolos = obtenerMatrizSimbolos()
  const resultado = analizarCombinaciones(lineasAJugar, matrizSimbolos, montoTotalApostado)

  // Aplicar efectos visuales para las ganancias
  if (resultado.posicionesGanadoras.length > 0) {
    setTimeout(() => {
      marcarCeldasGanadoras(resultado.posicionesGanadoras)
    }, 500) // Pequeño delay para que se vea mejor
  }

  // Marcar diamantes si hay tiros gratis
  if (resultado.hayDiamantes) {
    setTimeout(() => {
      marcarDiamantesGanadores()
    }, 500)
  }

  let mensajeCompleto = "";
  // Actualizar saldo con ganancias
  if (resultado.gananciaTotal > 0) {
    Saldo_cargado += resultado.gananciaTotal
    actualizarSaldoUI()
    mensajeCompleto += `¡Felicidades! Ganaste $${resultado.gananciaTotal}`;
    // Mostrar mensaje de ganancia
    // mostrarMensajeGanancia(`¡Felicidades! Ganaste $${resultado.gananciaTotal}`)
  }

  // Actualizar tiros gratis
  if (resultado.tirosGratis > 0) {
    tirosGratisDisponibles += resultado.tirosGratis
    montoFijo = montoPorLinea
    lineasFijas = lineasAJugar
    actualizarContadorTirosGratis()
    bloquearOpcionesDeApuesta(true)

      if (mensajeCompleto !== "") {
        mensajeCompleto += " y ";
      } else {
        mensajeCompleto += "¡";
      }
    mensajeCompleto += `${resultado.tirosGratis} tiros gratis`;

    // Mostrar mensaje de tiros gratis
    // mostrarMensajeGanancia(`¡Ganaste ${resultado.tirosGratis} tiros gratis!`)
  }

  if (mensajeCompleto !== "") {
    mensajeCompleto += "!";
    mostrarMensajeGanancia(mensajeCompleto);
  }

  spinButton.disabled = false
}

// Función para actualizar el contador de tiros gratis en la UI
function actualizarContadorTirosGratis() {
  const contadorElement = document.getElementById("tiros-gratis-contador")
  if (contadorElement) {
    contadorElement.textContent = tirosGratisDisponibles

    // Mostrar u ocultar el contador según si hay tiros gratis disponibles
    const contenedorTirosGratis = document.getElementById("tiros-gratis-container")
    if (contenedorTirosGratis) {
      if (tirosGratisDisponibles > 0) {
        contenedorTirosGratis.classList.remove("oculto")
      } else {
        contenedorTirosGratis.classList.add("oculto")
      }
    }
  }
}

function abrirModalSaldo() {
  document.getElementById("monto-a-agregar").value = ""; // <-- limpia el input
  document.getElementById("modal-cargar-saldo").style.display = "flex";
}

function cerrarModalSaldo() {
  document.getElementById("modal-cargar-saldo").style.display = "none";
}

function agregarSaldo() {
  const monto = parseInt(document.getElementById("monto-a-agregar").value);
  if (!isNaN(monto) && monto >= 500) {
    Saldo_cargado += monto;
    actualizarSaldoUI();
    cerrarModalSaldo();
  } else {
    alert("Por favor, ingresá un monto válido.");
  }
}

function actualizarSaldoUI() {
  // const saldo_actual = document.getElementById("saldo-actual").textContent
  document.getElementById("saldo-actual").textContent = `Saldo: $${Saldo_cargado}`;
}

function mostrarTablaPremios() {
  const modal = document.getElementById("tablaPremiosModal");
  modal.classList.remove("hidden");

  // Reinicia el scroll al principio del contenido
  const scrollable = modal.querySelector(".tabla-premios-scroll");
  if (scrollable) {
    scrollable.scrollTop = 0;
  }
}

function cerrarTablaPremios() {
  document.getElementById("tablaPremiosModal").classList.add("hidden");
}


  
  
spinButton.addEventListener("click", spinReels);
  
generateInitialReels();