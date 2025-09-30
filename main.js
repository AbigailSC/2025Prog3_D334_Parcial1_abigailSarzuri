const alumno = {
  "dni": 41756095,
  "nombre": "Abigail",
  "apellido": "Sarzuri"
}

const textoAlumno = document.querySelector("#alumno")
const filtroFrutas = document.querySelector("#category-filter")
const ordenFrutas = document.querySelector("#products-sort")
const resultadosContenedor = document.querySelector(".results__container")
const contadorResultados = document.querySelector('.result-count');
const buscador = document.querySelector("#search-input");

let carrito = JSON.parse(localStorage.getItem("carrito")) || []

const actualizarCarrito = (listaCarrito) => localStorage.setItem("carrito", JSON.stringify(listaCarrito))

const imprimirDatosAlumno = () => {
  console.log(`DNI: ${alumno.dni}\nNOMBRE: ${alumno.nombre}\nAPELLIDO:${alumno.apellido}`);
  textoAlumno.innerHTML = `${alumno.nombre} ${alumno.apellido}`
}

const obtenerDatos = async () => {
  try {
    const response = await fetch("data.json")
    const data = await response.json();
    return data
  } catch (error) {
    console.error(error.message);
  }
}

const renderizarProductos = (resultados, query) => {
  let cantidad = resultados.length;
  if (query.trim()) {
    contadorResultados.textContent = `${cantidad} resultado${cantidad !== 1 ? 's' : ''} encontrado${cantidad !== 1 ? 's' : ''}`;
  } else {
    contadorResultados.textContent = `Mostrando todos los productos (${cantidad})`;
  }
  if (cantidad === 0) {
    resultadosContenedor.innerHTML = `
            <div class="no-results">
                <p>😕 No se encontraron resultados para "<strong>${query}</strong>"</p>
                <p style="margin-top: 10px; font-size: 14px;">Intenta con otras palabras clave</p>
            </div>
        `;
    return;
  }
  resultadosContenedor.innerHTML = resultados.map((item) => `
        <div class="result-item">
            <div class="result-info">
              <img src="${item.ruta_img}" alt="${item.nombre}"/>
              <div class="result-data">
                <h4 class="result-title">${remarcarTextoEncontrado(item.nombre, query)}</h4>
                <span>${item.precio}</span>
              </div>
            </div>
            <button class="buy-button" data-name="${item.nombre}" data-id=${item.id} data-price="${item.precio}">Agregar al Carrito</button>
        </div>
    `).join('');
}

const filtrarResultados = (data, query) => {
  if (!query.trim()) {
    return data;
  }

  let queryNormalizada = normalizarQuery(query);

  return data.filter(item => {
    let tituloNormalizado = normalizarQuery(item.nombre);
    return tituloNormalizado.includes(queryNormalizada)
  })
}

const normalizarQuery = (texto) => {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const remarcarTextoEncontrado = (texto, query) => {
  if (!query.trim()) {
    return texto;
  }
  const regex = new RegExp(`(${query})`, "gi");
  return texto.replace(regex, '<mark style="background: #ffd93d; padding: 1px 2px; border-radius: 3px;">$1</mark>');
}

const init = async () => {
  const data = await obtenerDatos()
  console.log("🚀 ~ init ~ data:", data)

  imprimirDatosAlumno()
  renderizarProductos(data, "")
  buscador.addEventListener("keyup", (e) => {
    let query = e.target.value;
    const resultadosFiltrados = filtrarResultados(data, query);
    renderizarProductos(resultadosFiltrados, query);
  })
}

init();