const btnComenzar = document.getElementById('btn-comenzar');

function iniciarSimulador() {
  document.getElementById('pantalla-inicio').style.display = 'none';
  document.getElementById('simulador').style.display = 'block';
}

// Soporte para mouse
btnComenzar.addEventListener('click', iniciarSimulador);

// Soporte para pantallas táctiles
btnComenzar.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Previene doble activación
  iniciarSimulador();
}, { passive: false });


let ingredientes = {
  cafe: 0,
  te: 0,
  yerba: 0,
  agua: 0
};

let mezclaProgreso = 0;
let residuoSeleccionado = null;
let mezclaInterval = null;

function agregarIngrediente(tipo) {
  if (residuoSeleccionado && residuoSeleccionado !== tipo) {
    alert(`Solo puedes usar ${residuoSeleccionado}. Reinicia para cambiar.`);
    return;
  }
  if (!residuoSeleccionado) {
    residuoSeleccionado = tipo;
    desactivarOtrosBotones(tipo);
  }
  ingredientes[tipo]++;
  mezclaProgreso = 0;
  actualizarVisual();
}

function agregarAgua() {
  ingredientes.agua += 100;
  mezclaProgreso = 0;
  actualizarVisual();
}

function desactivarOtrosBotones(tipoActivo) {
  const botones = {
    cafe: document.getElementById("btn-cafe"),
    te: document.getElementById("btn-te"),
    yerba: document.getElementById("btn-yerba")
  };
  for (let tipo in botones) {
    if (tipo !== tipoActivo) {
      botones[tipo].disabled = true;
      botones[tipo].style.opacity = "0.4";
    }
  }
}

function reiniciarSimulador() {
  ingredientes = { cafe: 0, te: 0, yerba: 0, agua: 0 };
  mezclaProgreso = 0;
  residuoSeleccionado = null;
  const botones = {
    cafe: document.getElementById("btn-cafe"),
    te: document.getElementById("btn-te"),
    yerba: document.getElementById("btn-yerba")
  };
  for (let tipo in botones) {
    botones[tipo].disabled = false;
    botones[tipo].style.opacity = "1";
  }
  actualizarVisual();
}

function getTotalResiduos() {
  return ingredientes.cafe + ingredientes.te + ingredientes.yerba;
}

function getTotalVolumen() {
  return getTotalResiduos() + ingredientes.agua / 100;
}

function crearCapa(texto, color, valor, altura, opacidad = 1) {
  const div = document.createElement("div");
  div.className = "capa";
  div.style.transition = "all 0.3s ease-in-out";
  div.style.backgroundColor = color;
  div.style.height = `${altura}%`;
  div.style.opacity = opacidad;
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
  div.style.color = "white";
  div.style.fontWeight = "bold";
  div.style.fontSize = "0.8rem";
  div.style.textTransform = "uppercase";
  div.style.textAlign = "center";
  div.innerText = texto ? (valor ? `${texto} (${valor})` : texto) : "";

  return div;
}

function calcularColorArray() {
  const totalResiduos = getTotalResiduos();
  if (totalResiduos === 0) return [255, 255, 255];

  let r = 0, g = 0, b = 0;

  if (ingredientes.cafe > 0) {
    r += 111 * ingredientes.cafe;
    g += 78 * ingredientes.cafe;
    b += 55 * ingredientes.cafe;
  }
  if (ingredientes.te > 0) {
    r += 193 * ingredientes.te;
    g += 68 * ingredientes.te;
    b += 14 * ingredientes.te;
  }
  if (ingredientes.yerba > 0) {
    r += 59 * ingredientes.yerba;
    g += 122 * ingredientes.yerba;
    b += 87 * ingredientes.yerba;
  }

  r = Math.round(r / totalResiduos);
  g = Math.round(g / totalResiduos);
  b = Math.round(b / totalResiduos);

  const aclaradoPor100ml = 10;
  const cantidadAgua = ingredientes.agua;
  const aclaradoMaximo = 255;
  const aclarado = Math.min((cantidadAgua / 100) * aclaradoPor100ml, aclaradoMaximo);

  r = Math.min(255, r + aclarado);
  g = Math.min(255, g + aclarado);
  b = Math.min(255, b + aclarado);

  return [r, g, b];
}

function interpolateColor(color1, color2, factor) {
  return color1.map((c, i) => Math.round(c + factor * (color2[i] - c)));
}

function rgbArrayToString(rgbArr) {
  return `rgb(${rgbArr[0]},${rgbArr[1]},${rgbArr[2]})`;
}

function actualizarVisual() {
  const tubo = document.querySelector(".tubo-container");
  tubo.innerHTML = "";

  const totalResiduos = getTotalResiduos();
  const totalVolumen = getTotalVolumen();
  if (totalVolumen === 0) return;

  const alturaTotal = 100;
  const mezclaAltura = mezclaProgreso * alturaTotal;

  const colorBase = [255, 255, 255];
  const colorFinal = calcularColorArray();
  const colorIntermedio = interpolateColor(colorBase, colorFinal, mezclaProgreso);
  const colorStr = rgbArrayToString(colorIntermedio);

  if (mezclaProgreso > 0) {
    const mezclaDiv = crearCapa("Pigmento", colorStr, "", mezclaAltura);
    mezclaDiv.style.opacity = 1;
    tubo.appendChild(mezclaDiv);
  }

  const alturaRestante = alturaTotal - mezclaAltura;
  if (mezclaProgreso < 1) {
    const residuosAltura = (totalResiduos / totalVolumen) * alturaRestante;
    const aguaAltura = (ingredientes.agua / 100 / totalVolumen) * alturaRestante;

    if (ingredientes.cafe > 0) {
      const h = (ingredientes.cafe / totalResiduos) * residuosAltura;
      tubo.appendChild(crearCapa("Café", "#4b3100", ingredientes.cafe, h));
    }
    if (ingredientes.te > 0) {
      const h = (ingredientes.te / totalResiduos) * residuosAltura;
      tubo.appendChild(crearCapa("Saquito de Té", "#ff4500", ingredientes.te, h));
    }
    if (ingredientes.yerba > 0) {
      const h = (ingredientes.yerba / totalResiduos) * residuosAltura;
      tubo.appendChild(crearCapa("Yerba", "#003d00", ingredientes.yerba, h));
    }
    if (ingredientes.agua > 0) {
      tubo.appendChild(crearCapa("Agua", "#AADDFF", ingredientes.agua / 100, aguaAltura));
    }
  }
}

function empezarMezcla() {
  if (getTotalResiduos() === 0) {
    alert("Agrega algún residuo antes de mezclar.");
    return;
  }
  if (mezclaInterval) clearInterval(mezclaInterval);
  mezclaInterval = setInterval(() => {
    if (mezclaProgreso < 1) {
      mezclaProgreso += 0.01;
      if (mezclaProgreso > 1) mezclaProgreso = 1;
      actualizarVisual();
    }
  }, 40);
}

function terminarMezcla() {
  if (mezclaInterval) clearInterval(mezclaInterval);
}

// Soporte para mezcla (mouse y touch)
const btnMezcla = document.getElementById("btn-mezcla");

btnMezcla.addEventListener("mousedown", empezarMezcla);
btnMezcla.addEventListener("mouseup", terminarMezcla);
btnMezcla.addEventListener("mouseleave", terminarMezcla);

btnMezcla.addEventListener("touchstart", (e) => {
  e.preventDefault();
  empezarMezcla();
}, { passive: false });

btnMezcla.addEventListener("touchend", (e) => {
  e.preventDefault();
  terminarMezcla();
}, { passive: false });

btnMezcla.addEventListener("touchcancel", (e) => {
  e.preventDefault();
  terminarMezcla();
}, { passive: false });
