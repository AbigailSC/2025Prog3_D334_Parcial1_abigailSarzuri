/*
  ===========================================================
                  Declaracion Variables
  ===========================================================
*/

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
const botonCarrito = document.querySelector(".cart__bubble");
const listaCarrito = document.querySelector(".cart__container");
const contadorProductosCarrito = document.querySelector(".cart__bubble__count")
const listaProductosCarrito = document.querySelector(".cart__container__list");
const montoTotalCarrito = document.querySelector(".cart-total-amount")
const vaciarCarritoBtn = document.querySelector(".btn-delete")

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

/*
  ===========================================================
                  Renderizar Productos
  ===========================================================
*/

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
                <h3 class="result-title">${remarcarTextoEncontrado(item.nombre, query)}</h3>
                <p>$${item.precio}</p>
              </div>
            </div>
            <button class="buy-button" data-name="${item.nombre}" data-id=${item.id} data-price="${item.precio}">Agregar al Carrito</button>
        </div>
    `).join('');
}

/*
  ===========================================================
                  Busqeuda Productos
  ===========================================================
*/

const filtrarResultados = (data, query) => {
  if (!query.trim()) {
    return data;
  }
  query = query.trim()
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

/*
  ===========================================================
                  Logica Boton Carrito
  ===========================================================
*/


const toggleCarrito = () => {
  listaCarrito.classList.toggle("open-cart-list")
}

const agregarProductoCarrito = (e) => {
  const button = e.target.closest('.buy-button');
  if (!button) {
    return
  }
  const { id, name, price } = button.dataset;
  const productoCarrito = carrito.find((producto) => producto.id === id)
  if (productoCarrito) {
    productoCarrito.cantidad++
  } else {
    carrito.push({ id, name, price, cantidad: 1 })
  }
  actualizarEstado();
}

const actualizarCantProductos = () => {
  contadorProductosCarrito.textContent = carrito.reduce((acu, { cantidad }) => acu + cantidad, 0)
}

/*
  ===========================================================
                  Logica Lista Carrito
  ===========================================================
*/

const renderizarProductosCarrito = () => {
  if (!carrito.length) {
    listaProductosCarrito.innerHTML = "<p>Ey! Todavia no agregaste nada a tu carrito 👀</p>"
  } else {
    listaProductosCarrito.innerHTML = carrito.map(renderizarProdCarrito).join("");
  }
}

const renderizarProdCarrito = (producto) => {
  const { id, name, price, cantidad } = producto;

  return `
    <div class="cart-list__card">
      <div class="cart-list__container">
        <div class="cart-list__header">
          <h3>${name}</h3>
          <p>$${price}</p>
        </div>
        <div class="cart-list__btns">
          <button class="quantity-handler-down" data-id="${id}">-</button>
          <span class="quantityItem">${cantidad}</span>
          <button class="quantity-handler-sum" data-id="${id}">+</button>
        </div>
      </div>
    </div>
  `
}

const renderizarTotalCarrito = () => {
  let totalCarrito = carrito.reduce((acc, { price, cantidad }) => acc + Number(price) * cantidad, 0);
  return montoTotalCarrito.innerHTML = `$${totalCarrito.toFixed(2)}`
}

const vaciarCarrito = () => {
  carrito = [];
  actualizarEstado();
}

/*
  ===========================================================
                  Logica Btns Item Carrito
  ===========================================================
*/

const encontrarProducto = (id) => {
  return carrito.find(producto => producto.id == id);
}

const restaItemCarrito = (id) => {
  const producto = encontrarProducto(id)
  if (producto.cantidad === 1) {
    carrito = carrito.filter(producto => producto.id !== id);
    return;
  } else {
    restarCantidad(producto);
  }
  actualizarEstado();
}

const restarCantidad = (producto) => {
  carrito = carrito.map((prodCarrito) => {
    if (prodCarrito.id === producto.id) {
      return { ...prodCarrito, cantidad: Number(prodCarrito.cantidad) - 1 }
    } else {
      return prodCarrito
    }
  })
}

const sumaItemCarrito = (id) => {
  const producto = encontrarProducto(id)
  sumarCantidad(producto);
  actualizarEstado();
}

const sumarCantidad = (producto) => {
  carrito = carrito.map((prodCarrito) => {
    if (prodCarrito.id === producto.id) {
      return { ...prodCarrito, cantidad: Number(prodCarrito.cantidad) + 1 }
    } else {
      return prodCarrito
    }
  })
}

const actualizarCantidad = (e) => {
  if (!e.target.classList.contains("quantity-handler-down") && !e.target.classList.contains("quantity-handler-sum")) {
    return
  }
  const { id } = e.target.dataset
  if (e.target.classList.contains("quantity-handler-down")) {
    restaItemCarrito(id)
  } else {
    sumaItemCarrito(id)
  }
  actualizarEstado()
}

const actualizarEstado = () => {
  actualizarCarrito(carrito);
  actualizarCantProductos();
  renderizarProductosCarrito();
  renderizarTotalCarrito();
}

const ocultarCarritoScroll = () => {
  if (listaCarrito.classList.contains("open-cart-list")) {
    listaCarrito.classList.remove("open-cart-list")
  }
}

/*
  ===========================================================
                Filtrado y Ordenamiento
  ===========================================================
*/

const ordenarProductos = (data) => {
  let query = buscador.value;
  let resultadosEncontrados = filtrarResultados(data, query);
  let metodoOrdenamiento = ordenFrutas.value;
  console.log("🚀 ~ ordenarProductos ~ metodoOrdenamiento:", metodoOrdenamiento)

  switch (metodoOrdenamiento) {
    case 'price-asc':
      resultadosEncontrados.sort((a, b) => a.precio - b.precio);
      break;
    case 'price-desc':
      resultadosEncontrados.sort((a, b) => b.precio - a.precio);
      break;
    case 'title-asc':
      resultadosEncontrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;
    case 'title-desc':
      resultadosEncontrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
      break;
    default:
      break;
  }
  renderizarProductos(data, "");
}

const init = async () => {
  const data = await obtenerDatos();

  buscador.addEventListener("keyup", (e) => {
    let query = e.target.value;
    const resultadosFiltrados = filtrarResultados(data, query);
    renderizarProductos(resultadosFiltrados, query);
  });
  botonCarrito.addEventListener("click", toggleCarrito);
  resultadosContenedor.addEventListener("click", agregarProductoCarrito)
  window.addEventListener("scroll", ocultarCarritoScroll);
  vaciarCarritoBtn.addEventListener("click", vaciarCarrito);
  listaProductosCarrito.addEventListener("click", actualizarCantidad);
  ordenFrutas.addEventListener("change", (e) => {
    ordenarProductos(data)
  });
  imprimirDatosAlumno();
  renderizarProductos(data, "");
  actualizarCantProductos();
  renderizarProductosCarrito();
  renderizarTotalCarrito();
}

init();

