// Dirección de la API
const URL_API = 'https://api.hyrule-compendium.com/v3/compendium/all';
// Almacén global de datos de la API
let todoElCompendio = [];

// Traducir los títulos de las categorías + comandos de bootstrap
const CONFIG_CATEGORIAS = {
    'materials': { titulo: 'Materiales', icono: 'fa-apple-whole', color: 'text-warning' },
    'treasure': { titulo: 'Tesoros y Minerales', icono: 'fa-gem', color: 'text-info' },
    'monsters': { titulo: 'Monstruos', icono: 'fa-dragon', color: 'text-danger' },
    'equipment': { titulo: 'Equipamiento y Armas', icono: 'fa-shield-halved', color: 'text-primary' },
    'creatures': { titulo: 'Criaturas', icono: 'fa-frog', color: 'text-success' }
};

// La página pide los datos de la API y comienza a recolectar con paciencia
async function cargarCompendio() {
    try {
        const respuesta = await fetch(URL_API);

        // Medida de seguridad por si el servidor original falla
        if (!respuesta.ok) {
            throw new Error(`Error en petición HTTP: ${respuesta.status}`);
        }

        // Transforma la respuesta a formato JSON y lo guardamos en los datos de Javascript
        const json = await respuesta.json();
        todoElCompendio = json.data;

        // Con los datos necesarios ya recolectados, se llamará esta función para poner en pantalla los ítems de la API
        renderizarSeccionesPorCategoria(todoElCompendio);

    } catch (error) {
        //Medida adicional por si falla la API o el internet
        console.error('Error al obtener datos de la API:', error);
        document.getElementById('contenedorCategorias').innerHTML = `
            <div class="alert alert-danger text-center shadow" role="alert">
                Hubo un problema al conectar con la API de Hyrule.
            </div>
        `;
    }
}

// Borra el texto de carga, y agrupar los ítems en sus respectivas categorías, por último arma los carruseles
function renderizarSeccionesPorCategoria(lista) {
    const contenedor = document.getElementById('contenedorCategorias');
    contenedor.innerHTML = ''; // Limpia el HTML para próximamente añadir los ítems

    // Si no existe resultado, es decir, no encuentra el ITEM, la lista o el carrusel se reemplazará por el texto de abajo
    if (lista.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-5">
                <p class="fs-4 text-warning">No se encontraron resultados en el compendio.</p>
            </div>
        `;
        return;
    }

    // Agrupar y ordenar los items dentro de la lista usando reduce() en sus respectivas categorías
    const grupos = lista.reduce((acc, item) => {
        const cat = item.category || 'otros';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    // Recorrer las categorías agrupadas para construir su sección y carrusel 
    Object.keys(grupos).forEach((claveCategoria) => {
        const config = CONFIG_CATEGORIAS[claveCategoria] || { titulo: claveCategoria, icono: 'fa-box', color: 'text-light' };
        const items = grupos[claveCategoria];        
        const carouselId = `carrusel-${claveCategoria}`;

        // Slice para tener solo 3 tarjetas por slide de carrusel gracias al índice de la lista
        const gruposDeTres = [];
        for (let i = 0; i < items.length; i += 3) {
            gruposDeTres.push(items.slice(i, i + 3));
        }

        // Construcción del HTML en bloques armando los carruseles, con plantillas de texto (Es decir las comillas invertidas)
        const seccionHTML = `
            <div class="mb-5 bg-secondary bg-opacity-10 p-4 rounded-3 border border-secondary">
                <h3 class="h4 border-bottom border-secondary pb-2 mb-4 d-flex align-items-center gap-2">
                    <i class="fa-solid ${config.icono} ${config.color}"></i>
                    <span class="text-uppercase fw-bold">${config.titulo}</span>
                    <span class="badge bg-dark text-warning ms-auto fs-6">${items.length} ítems</span>
                </h3>

                <div id="${carouselId}" class="carousel slide" data-bs-ride="false">
                    <div class="carousel-inner">
                        ${gruposDeTres.map((grupo, idxGrupo) => `
                            <div class="carousel-item ${idxGrupo === 0 ? 'active' : ''}">
                                <div class="row g-3">
                                    ${grupo.map(item => `
                                        <div class="col-md-4">
                                            <div class="card h-100 text-white shadow-sm">
                                                <!-- Marco embellecido para la imagen -->
                                                <div class="marco-imagen-zelda text-center">
                                                    <img src="${item.image}" class="img-fluid imagen-item-zelda" alt="${item.name}">
                                                </div>
                                                <div class="card-body d-flex flex-column p-3">
                                                    <h5 class="card-title text-capitalize text-warning fw-bold h6">${item.name}</h5>
                                                    <p class="card-text text-light small flex-grow-1" style="font-size: 0.85rem;">${item.description}</p>
                                                    <p class="card-text mb-0 mt-2 small text-light">
                                                        <strong class="text-warning">Ubicación:</strong> <span class="text-warning">${item.common_locations ? item.common_locations[0] : 'Desconocida'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    ${gruposDeTres.length > 1 ? `
                        <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev" style="width: 5%; left: -30px;">
                            <span class="carousel-control-prev-icon bg-black rounded-circle p-2" aria-hidden="true"></span>
                            <span class="visually-hidden">Anterior</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next" style="width: 5%; right: -30px;">
                            <span class="carousel-control-next-icon bg-black rounded-circle p-2" aria-hidden="true"></span>
                            <span class="visually-hidden">Siguiente</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        // Se añade todo el HTML costruido para generar la página web
        contenedor.innerHTML += seccionHTML;
    });
}

// Filtro DOM 
function inicializarBuscador() {
    const buscador = document.getElementById('inputBuscador');

    // Detecta las palabras puestas en el buscador para filtrar los elementos
    buscador.addEventListener('input', (e) => {
        const texto = e.target.value.toLowerCase().trim();

        const filtrados = todoElCompendio.filter(item =>
            item.name.toLowerCase().includes(texto)
        );

        renderizarSeccionesPorCategoria(filtrados);
    });
}

cargarCompendio();
inicializarBuscador();