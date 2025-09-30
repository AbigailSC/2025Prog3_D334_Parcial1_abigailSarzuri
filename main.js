const alumno = {
  "dni": 41756095,
  "nombre": "Abigail",
  "apellido": "Sarzuri"
}

const textoAlumno = document.querySelector("#alumno")

const imprimirDatosAlumno = () => {
  console.log(`DNI: ${alumno.dni}\nNOMBRE: ${alumno.apellido}\nAPELLIDO:${alumno.apellido}`);
  textoAlumno.innerHTML = `${alumno.nombre} ${alumno.apellido}`
}

imprimirDatosAlumno()