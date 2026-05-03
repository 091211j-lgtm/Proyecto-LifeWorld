async function cargarDatos() {
  try {
    let res = await fetch("http://localhost:6753/server.js");
    let data = await res.json();
    console.log(data);
  } catch (err) {
    console.log("Error:", err);
  }
}
cargarDatos();