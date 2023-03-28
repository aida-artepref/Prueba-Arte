import { Color, Loader, MeshBasicMaterial, LineBasicMaterial, MeshStandardMaterial } from 'three';
import{ IfcViewerAPI } from 'web-ifc-viewer';
import { IfcElementQuantity } from 'web-ifc';
import { NavCube } from './NavCube/NavCube.js';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({container, backgroundColor: new Color("#E8E8E8")});



viewer.clipper.active = true;
viewer.grid.setGrid(200,100);
viewer.axes.setAxes();

document.addEventListener("keydown", function(event) {
    if (event.keyCode === 116) { // keyCode 116 es la tecla F5
      event.preventDefault(); // evita que se procese 
    }
});

viewer.context.renderer.usePostproduction = true;
// viewer.IFC.selector.defHighlightMat.color = new Color(255, 128, 0);
viewer.IFC.selector.defSelectMat.color = new Color(127, 255, 0);

const GUI={
    input: document.getElementById("file-input"),
    loader: document.getElementById("loader-button"),
    props: document.getElementById("main-container"),
    tree: document.getElementById("tree-root"),
    importer: document.getElementById("importCSV"),
    importloader: document.getElementById("importButton"),
}

//Muestra el nombre del archivo abierto
document.getElementById("file-input").addEventListener("change", function() {
    const file = this.files[0];
    document.getElementById("file-name").innerHTML = file.name;
});

GUI.loader.onclick = () => GUI.input.click();  //al hacer clic al boton abre cuadro de dialogo para cargar archivo

GUI.importloader.onclick = () => GUI.importer.click();

let allIDs;
let idsTotal;
let elementosOcultos=[];
let uniqueTypes=[];
let precastElements=[];
let model;

//cada vez elemento imput cambia, genera uURL y lo pasa a la lib IFC
GUI.input.onchange = async (event) => {
    const file=event.target.files[0];
    const url=URL.createObjectURL(file);
    loadModel(url); 
}

//si el Ifc ya esta cargado por defecto y no selecciona atraves del input
async function loadModel(url) {
    // const progressContainer = document.getElementById('progress-container');
    // progressContainer.style.display = 'block';

    // const progressBar = document.getElementById('progress-bar');
    // let progress = 0;
    // drawProgress(progress);

    // model = await viewer.IFC.loadIfcUrl(url, function (progressEvent) {
    //   if (progressEvent.lengthComputable) {
    //     progress = progressEvent.loaded / progressEvent.total;
    //     drawProgress(progress);
    //   }
    // });

    // Ocultar la barra de progreso al finalizar la carga del modelo
    //progressContainer.style.display = 'none';

    model = await viewer.IFC.loadIfcUrl(url);
    createTreeMenu(model.modelID);
    tree= await viewer.IFC.getSpatialStructure(model.modelID);
    allIDs = getAllIds(model); 
    idsTotal=getAllIds(model); 
    console.log(idsTotal.length+" total de elementos en modelo inicial");
    const ifcProject = await viewer.IFC.getSpatialStructure(model.modelID); //ifcProyect parametro necesario para obtener los elementos de IFC del modelo
    setIfcPropertiesContent(ifcProject, viewer, model);
    document.getElementById("checktiposIfc").style.display = "block"; //hace visible el divCheck 

    let subset = getWholeSubset(viewer, model, allIDs);
    replaceOriginalModelBySubset(viewer, model, subset); //reemplaza el modelo original por el subconjunto.


    viewer.shadows = true;
    cargaGlobalIdenPrecast();
    crearBotonPrecas();  
    addCheckboxListeners() ;
    verNumPrecast();

    const divCargas = document.querySelector('.divCargas');
    divCargas.style.display = "block";
    expandeDivBtn.click();
}

// function drawProgress(progress) {
//     const canvas = document.getElementById('progress-bar');
//     const context = canvas.getContext('2d');
//     const x = canvas.width / 2;
//     const y = canvas.height / 2;
//     const radius = 30;
//     const startAngle = -0.5 * Math.PI;
//     const endAngle = (2 * progress - 0.5) * Math.PI;
//     const counterClockwise = false;

//     context.clearRect(0, 0, canvas.width, canvas.height);
//     context.beginPath();
//     context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
//     context.lineWidth = 10;
//     context.strokeStyle = '#4CAF50';
//     context.stroke();
// }
//Nave cube
viewer.container = container;
const navCube = new NavCube(viewer);
navCube.onPick(model);
viewer.clipper.active = true;

//hace que el div con las propiedades del elemento deje de ser visible
const mainContainer = document.getElementById('main-container');
const closeBtn = document.getElementById('close-btn');
closeBtn.addEventListener('click', function() {
    mainContainer.style.display = 'none';
});

function verNumPrecast(){
    var divNumPrecast = document.createElement("div"); // se crea el div que va  a mostrar la info del num de elementos en precastElements
    divNumPrecast.innerHTML =  precastElements.length; //muestra cantidad elementos en HTML
    divNumPrecast.classList.add("divNumPrecast"); //estilo al div
    document.body.appendChild(divNumPrecast);
}

function crearBotonPrecas(){
    // Crea un nuevo botón
    var btnCreaPrecast = document.createElement("button");
    btnCreaPrecast.classList.add("button");
    // Agrega un ID y una clase al nuevo botón
    btnCreaPrecast.id = "btnCreaPrecast";
    btnCreaPrecast.className;
    btnCreaPrecast.textContent = "Añade Prop";// Agrega el texto que deseas que aparezca en el botón

    // Obtiene una referencia al último botón existente
    var ultimoBoton = document.querySelector(".button-container .button:last-of-type");

    // Inserta el nuevo botón justo después del último botón existente
    var contenedorBotones = document.querySelector(".button-container");
    contenedorBotones.insertBefore(btnCreaPrecast, ultimoBoton.nextSibling);

    btnCreaPrecast.addEventListener("click", function() {
        cargaProp();
        btnCreaPrecast.remove();
    });
}

function cargaProp(){
//Carga las propiedades/psets al array
    precastElements.forEach(precast => {
        if (precast.ifcType !='IFCBUILDING'){
            precastProperties(precast, 0, precast.expressID);
        }
    }); 
    
}

function cargaGlobalIdenPrecast(){
    //Carga la propiedade GlobalId al array precastElements
        precastElements.forEach(precast => {
            if (precast.ifcType !='IFCBUILDING'){
                precastPropertiesGlobalId(precast, 0, precast.expressID);
            }
        }); 
        
}
    
  //******************************************************************************************************************* */
 /// ---------------estas tres funciones son necesarias para obtener solo las categorias de IFC cargado------------------------
 //-------------extrae todos los tipos de elementos del modelo y los agrupa en un objeto llamado categorias.
function setIfcPropertiesContent(ifcProject, viewer, model) {
    const ifcClass = getIfcClass(ifcProject);
    let uniqueClasses = [...new Set(ifcClass)];
    const checkboxesHTML = generateCheckboxes(uniqueClasses);
    document.getElementById('checktiposIfc').innerHTML = checkboxesHTML;

    const btnNota = document.querySelectorAll('.btn-notacion');
    btnNota.forEach(function(button) {
    
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-sticky-note');
        button.appendChild(icon);

        button.addEventListener('click', function(event) {
            const checkbox = event.currentTarget.parentElement.querySelector('input[type="checkbox"]');
            if (checkbox !== null) {
                const classValue = checkbox.getAttribute('data-class');
                //console.log("Has pulsado el botón : " + classValue);
            }
        });
    });
}

 //recorre el modelo y almacena el tipo de cada elemento en un array typeArray.
function getIfcClass(ifcProject) {
    let typeArray = [];
    return getIfcClass_base(ifcProject, typeArray);
}

//recursivamente  se llama a sí misma para procesar los hijos de cada elemento y agregar su tipo al array.
function getIfcClass_base(ifcProject, typeArray) {
    const children = ifcProject.children;
    if (children.length === 0) {
        typeArray.push(ifcProject.type);
    } else {
        for (const obj of children) {
            getIfcClass_base(obj, typeArray);
        }
    }
    return typeArray;
}

// Crea automaticamente los check con las categorias del IFC cargado y  asocia un numero a cada check(dataclass)
function generateCheckboxes(uniqueClasses) {
    let html = '';
    uniqueClasses.forEach(function(uniqueClass) {
        html += `<div class="checkbox-container">`;
        // html += `<button class="btn-notacion" data-id="${uniqueClass}"> </button>`;
        html += `<input type="checkbox" checked data-class="${uniqueClass}">${uniqueClass}`;
        html += `</div>`;
    });
    return html;
}

//evento cambio en los checK tipos de elementos
function addCheckboxListeners() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            viewer.IFC.selector.unpickIfcItems();
            const isChecked = this.checked;
            const tipo = this.getAttribute('data-class');
            const matchingIds = [];
            for (let i = 0; i < precastElements.length; i++) {
                const element = precastElements[i];
                if (element.ifcType === tipo) {
                    matchingIds.push(element.expressID);
                }
            }
            if (isChecked) {  // si esta checkeado comprueba que no est eya en el transporte, si es asi lo elimina para no volver a mostrarlo
                for(let i=0; i< matchingIds.length; i++){
                    const matchingId = matchingIds[i];
                    const matchingElement = precastElements.find(el => el.expressID === matchingId);
                    
                    if (matchingElement && matchingElement.Camion !== '' && matchingElement.Camion !== undefined) {
                    matchingIds.splice(i, 1);
                    i--;
                    }
                }
                showAllItems(viewer, matchingIds);
            } else {
                hideAllItems(viewer, matchingIds);
            }
        });
        
    });
    
}

 ////-----------------------------------------------------------------------------------------------------------------------------------
 // reemplaza cualquier subconjunto anterior con el mismo ID personalizado ('full-model-subset').
 //crear un subconjunto de elementos del modelo especificado por allIDs. 
 //El subconjunto se crea en la misma escena que el modelo original model,
 // y cualquier modelo previamente existente en la escena con el mismo identificador personalizado 'full-model-subset' se elimina antes de agregar el nuevo subconjunto.
 // El subconjunto devuelto es un objeto Three.js que contiene solo los elementos especificados por allIDs.
function getWholeSubset(viewer, model, allIDs) {
	return viewer.IFC.loader.ifcManager.createSubset({
		modelID: model.modelID,
		ids: allIDs,
		applyBVH: true,
		scene: model.parent,
		removePrevious: true,
		customID: 'full-model-subset',
	});
}

// function getWholeSubsetRojo(viewer, model, expressID, subset_name, materialRojo) {
// 	return viewer.IFC.loader.ifcManager.createSubset({
//         modelID: model.modelID,
//         ids: expressID,
//         material: materialRojo,
//         applyBVH: true,
//         scene: viewer.context.getScene(),
//         removePrevious: true,
//         customID: subset_name,
// 		// modelID: model.modelID,
// 		// ids: allIDs,
// 		// applyBVH: true,
// 		// scene: model.parent,
// 		// removePrevious: true,
// 		// customID: subset_name,
// 	});
// }

//Remplaza un modelo original (model) por un subconjunto previamente creado (subset).
function replaceOriginalModelBySubset(viewer, model, subset) {
	const items = viewer.context.items;  //obtiene el objeto "items" del contexto del visor y lo almacena en una variable local.
	items.pickableIfcModels = items.pickableIfcModels.filter(model => model !== model);  //Filtra las matrices y elimina cualquier referencia al modelo original
	items.ifcModels = items.ifcModels.filter(model => model !== model);
	model.removeFromParent();  //Elimina el modelo original de su contenedor principal
	items.ifcModels.push(subset);
	items.pickableIfcModels.push(subset); 
}

window.ondblclick = () => hideClickedItem(viewer); //evento dblClic carga al camion elementos
window.oncontextmenu=()=> hideClickedItemBtnDrch(viewer); //evento btnDrch oculta del visor elemento

window.onkeydown = (event) => {  //evento esc, incluye todos los elementos ocultos con el BtnDrch de nuevo al visor
    if (event.code === 'Escape') {
        showAllItems(viewer, allIDs);
        // Buscar los checkbox en elemento con id="checktiposIfc" y los activa
        const checkboxes = document.querySelectorAll('#checktiposIfc input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
    }
};

function showAllItems(viewer, ids) {
	viewer.IFC.loader.ifcManager.createSubset({
		modelID: 0,
		ids,
		removePrevious: false,
		applyBVH: true,
		customID: 'full-model-subset',
	});
}

//oculta los elementos del visor pasandole un arry con los ids que deseamos ocultar
function hideAllItems(viewer, ids) {
	ids.forEach(function(id) {
        viewer.IFC.loader.ifcManager.removeFromSubset(
            0,
            [id],
            'full-model-subset',
        );
    }); 
}

//boton de HTML que pulsandolo crea un nuevo camion
let numCamion=1;// cuenta los camiones totales, todos E A C

let letraTransporte = 'E';
let numT=1;
let numE = 1; 
let numA = 1;
let numC = 1;

document.getElementById("numCamion").innerHTML = numCamion;
document.getElementById("numT").innerHTML = numT + " - " + letraTransporte  ;
actualizaDesplegables();


function activarBoton(target, numCamActual) {
    const targetButton = document.getElementById(target);
    const buttons = document.querySelectorAll('.botonesTransporte');
    buttons.forEach(function(button) {
        if (button.id !== target) {
            button.classList.remove('seleccionado');
        }
    });
    targetButton.classList.add('seleccionado');
    //numCamion=numCamActual;

}

function crearMenuDesplegable(numElementos, target) { // menú desplegable dinámico
    const select = document.createElement('select'); // controlador de eventos en el elemento select.
    select.setAttribute('data-target', target);
    select.addEventListener('change', function() {
        numCamActual = parseInt(this.value); //numCamActual  valor entero del elemento select
        numT=numCamActual;
        
        const targetButton = document.getElementById(this.getAttribute('data-target')); //activa el boton correspondiente al desplegable seleccionado
        targetButton.classList.add('active');
        targetButton.classList.add('seleccionado');
        activarBoton(this.getAttribute('data-target'), numCamActual);

        letraTransporte = '';
        const botonPadre = this.parentNode;
        if (botonPadre.id === 'menosA') {
            letraTransporte = 'A';
        } else if (botonPadre.id === 'menosC') {
            letraTransporte = 'C';
        } else if (botonPadre.id === 'menosE') {
            letraTransporte = 'E';
        }
        document.getElementById("numT").innerHTML = numT + " - " + letraTransporte  ;

        //Busca a que numCamion corresponde  el tipo de transporet seleccionado
        let tipoSeleccionado= numT + " - " + letraTransporte    
        let camSeleccionado = null;

        for (let i = 0; i < precastElements.length; i++) {
            if (precastElements[i].tipoTransporte === tipoSeleccionado) {
                camSeleccionado = precastElements[i].Camion;
                document.getElementById("numCamion").innerHTML = camSeleccionado;
            break;
            }
        } 
    
        this.classList.add('seleccionado');

        if (camSeleccionado === null) {
            for (let objetoTransporte of tablaTransporte) {
                if (objetoTransporte.tipoTransporte === tipoSeleccionado) {
                    numCamion = objetoTransporte.Camion;  // el valor de la propiedad Camion a la variable numCamion
                    document.getElementById("numCamion").innerHTML = numCamion;
                    break; 
                }
            }
            document.getElementById("numCamion").innerHTML = numCamion;
        }
        numCamion=camSeleccionado;
        // numCamion = parseInt(document.getElementById("numCamion").innerHTML);
    });

    for (let i = 0; i <= numElementos; i++) {
        const option = document.createElement('option');
        option.text = i;

        // if (i === 0) { // Si el valor de la opción es 0
        //     option.setAttribute("disabled", true); // Deshabilitar la opción
        // }
        select.add(option);
    }
    return select;
}

//se añaden los menús desplegables a los botones correspondientes
function actualizaDesplegables(){
    while (menosE.lastChild) {
        menosE.removeChild(menosE.lastChild);
    }
    while (menosA.lastChild) {
        menosA.removeChild(menosA.lastChild);
    }
    while (menosC.lastChild) {
        menosC.removeChild(menosC.lastChild);
    }
    menosE.appendChild(crearMenuDesplegable(numE, 'nuevoCamionEstructura'));
    menosA.appendChild(crearMenuDesplegable(numA, 'nuevoCamionAlveolar'));
    menosC.appendChild(crearMenuDesplegable(numC, 'nuevoCamionCerramiento'));
}

// evento para desactivar los botones al hacer click en algún lado del documento
document.addEventListener('click', function(event) {
    const buttons = document.querySelectorAll('.botonesMenos');
    buttons.forEach(function(button) {
        button.classList.remove('seleccionado');
    });
    
});

const nuevoCamionEstructuraBtn = document.getElementById("nuevoCamionEstructura");
const nuevoCamionAlveolarBtn = document.getElementById("nuevoCamionAlveolar");
const nuevoCamionCerramientoBtn = document.getElementById("nuevoCamionCerramiento");

// Variable para mantener el botón seleccionado actualmente
let botonSeleccionado = nuevoCamionEstructuraBtn;
botonSeleccionado.classList.add("seleccionado");

function buscaNumCamionMaximo(){
    for (let i = 0; i < precastElements.length; i++) {
        if (parseInt(precastElements[i].Camion) > numCamion) {
            numCamion = precastElements[i].Camion;
        }
    }
    return(numCamion);
}

let tablaTransporte = [{ Camion: 1, tipoTransporte: '1 - E' }];
function funcTablaTransporte(numCamion, numLetra) {
    //  objeto con las propiedades Camion y tipoTransporte
    const objetoTransporte = { Camion: numCamion, tipoTransporte: numLetra };
    tablaTransporte.push(objetoTransporte);
    console.log(tablaTransporte);
}

nuevoCamionEstructuraBtn.addEventListener("click", function() {
    seleccionarBoton(nuevoCamionEstructuraBtn);
    numCamion=buscaNumCamionMaximo();
    var maxCamion = 0;
    letraTransporte = "E";
    numT = numE;
    numLetra = numT + " - E";
    document.getElementById("numT").innerHTML = numLetra;
    
    for (var i = 0; i < precastElements.length; i++) {
        if (precastElements[i].Camion > maxCamion) {
            maxCamion = precastElements[i].Camion;
        }
    }
    maxCamion=parseInt(maxCamion);
    
    var elementoExistente = precastElements.find(function(elemento) {
        return elemento.tipoTransporte === numLetra;
    });

    if (numCamion === maxCamion && elementoExistente !== undefined ) {
        numCamion++;
        numE++;
        document.getElementById("numCamion").innerHTML = numCamion;
        letraTransporte = "E";
        numT = numE;
        numLetra = numT + " - E";
        document.getElementById("numT").innerHTML = numLetra;
        funcTablaTransporte(numCamion, numLetra);
        actualizaDesplegables();
    } else if (numCamion === maxCamion && elementoExistente === undefined) {
        numCamion=maxCamion+1;
        document.getElementById("numCamion").innerHTML = numCamion;
        //numE++;
        numT = numE;
        numLetra = numT + " - E";
        document.getElementById("numT").innerHTML = numLetra;
        funcTablaTransporte(numCamion, numLetra);
        actualizaDesplegables();
    } else if (numCamion !== maxCamion && elementoExistente !== undefined ) {
        numCamion=parseInt(buscaNumCamionMaximo())+1;
        document.getElementById("numCamion").innerHTML = numCamion;
        numE++;
        numT = numE;
        numLetra = numT + " - E";
        document.getElementById("numT").innerHTML = numLetra;
        funcTablaTransporte(numCamion, numLetra);
        actualizaDesplegables();
    } else if (numCamion !== maxCamion && elementoExistente === undefined ) {
        numCamion="";
        numCamion=parseInt(buscaNumCamionMaximo())+1;
        if (isNaN(numCamion)) {
            numCamion = 1;
        }
        document.getElementById("numCamion").innerHTML = numCamion;
        numT = numE;
        numLetra = numT + " - E";
        document.getElementById("numT").innerHTML = numLetra;
        funcTablaTransporte(numCamion, numLetra);
        actualizaDesplegables();
    } 
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'E' || event.key === 'e') {
        seleccionarBoton(nuevoCamionEstructuraBtn);
        numCamion=buscaNumCamionMaximo();
        var maxCamion = 0;
        letraTransporte = "E";
        numT = numE;
        numLetra = numT + " - E";
        document.getElementById("numT").innerHTML = numLetra;
        
        for (var i = 0; i < precastElements.length; i++) {
            if (precastElements[i].Camion > maxCamion) {
                maxCamion = precastElements[i].Camion;
            }
        }
        maxCamion=parseInt(maxCamion);
        
        var elementoExistente = precastElements.find(function(elemento) {
            return elemento.tipoTransporte === numLetra;
        });

        if (numCamion === maxCamion && elementoExistente !== undefined ) {
            numCamion++;
            numE++;
            document.getElementById("numCamion").innerHTML = numCamion;
            letraTransporte = "E";
            numT = numE;
            numLetra = numT + " - E";
            document.getElementById("numT").innerHTML = numLetra;
            funcTablaTransporte(numCamion, numLetra);
            actualizaDesplegables();
        } else if (numCamion === maxCamion && elementoExistente === undefined) {
            numCamion=maxCamion+1;
            document.getElementById("numCamion").innerHTML = numCamion;
            //numE++;
            numT = numE;
            numLetra = numT + " - E";
            document.getElementById("numT").innerHTML = numLetra;
            funcTablaTransporte(numCamion, numLetra);
            actualizaDesplegables();
        } else if (numCamion !== maxCamion && elementoExistente !== undefined ) {
            numCamion++;
            document.getElementById("numCamion").innerHTML = numCamion;
            numE++;
            numT = numE;
            numLetra = numT + " - E";
            document.getElementById("numT").innerHTML = numLetra;
            funcTablaTransporte(numCamion, numLetra);
            actualizaDesplegables();
        } else if (numCamion !== maxCamion && elementoExistente === undefined ) {
            numCamion="";
            numCamion=parseInt(buscaNumCamionMaximo())+1;
            if (isNaN(numCamion)) {
                numCamion = 1;
            }
            document.getElementById("numCamion").innerHTML = numCamion;
            numT = numE;
            numLetra = numT + " - E";
            document.getElementById("numT").innerHTML = numLetra;
            funcTablaTransporte(numCamion, numLetra);
            actualizaDesplegables();
        } 
    }
});

nuevoCamionAlveolarBtn.addEventListener("click", function() {
    seleccionarBoton(nuevoCamionAlveolarBtn);
    numCamion=buscaNumCamionMaximo();
    var maxCamion = 0;
    letraTransporte = "A";
    numT = numA;
    numLetra = numT + " - A";
    document.getElementById("numT").innerHTML = numLetra;
    for (var i = 0; i < precastElements.length; i++) {
        if (precastElements[i].Camion > maxCamion) {
            maxCamion = precastElements[i].Camion;
        }
    }
    maxCamion=parseInt(maxCamion);
    var elementoExistente = precastElements.find(function(elemento) {
        return elemento.tipoTransporte === numLetra;
    });
    if (numCamion === maxCamion && elementoExistente !== undefined ) {
        numCamion++;
        numA++;
        document.getElementById("numCamion").innerHTML = numCamion;
        letraTransporte = "A";
        numT = numA;
        numLetra = numT + " - A";
        document.getElementById("numT").innerHTML = numLetra;
        funcTablaTransporte(numCamion, numLetra);
        actualizaDesplegables();
    } else if (numCamion === maxCamion && elementoExistente === undefined) {
        numCamion=maxCamion+1;
        document.getElementById("numCamion").innerHTML = numCamion;
        numT = numA;
        numLetra = numT + " - A";
        document.getElementById("numT").innerHTML = numLetra;
        funcTablaTransporte(numCamion, numLetra);
        actualizaDesplegables();
    } else if (numCamion !== maxCamion && elementoExistente !== undefined ) {
        document.getElementById("numCamion").innerHTML = numCamion;
        numA++;
        numT = numA;
        numLetra = numT + " - A";
        document.getElementById("numT").innerHTML = numLetra;
        funcTablaTransporte(numCamion, numLetra);
        actualizaDesplegables();
    }else if (numCamion !== maxCamion && elementoExistente === undefined ) {
        numCamion="";
        numCamion=parseInt(buscaNumCamionMaximo())+1;
        if (isNaN(numCamion)) {
            numCamion = 1;
        }
        document.getElementById("numCamion").innerHTML = numCamion;
        numT = numA;
        numLetra = numT + " - A";
        document.getElementById("numT").innerHTML = numLetra;
        funcTablaTransporte(numCamion, numLetra);
        actualizaDesplegables();
    } 
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'a' || event.key === 'A') {
        seleccionarBoton(nuevoCamionAlveolarBtn);
        numCamion=buscaNumCamionMaximo();
        var maxCamion = 0;

        letraTransporte = "A";
        numT = numA;
        numLetra = numT + " - A";
        document.getElementById("numT").innerHTML = numLetra;

        for (var i = 0; i < precastElements.length; i++) {
            if (precastElements[i].Camion > maxCamion) {
                maxCamion = precastElements[i].Camion;
            }
        }
        maxCamion=parseInt(maxCamion);

        var elementoExistente = precastElements.find(function(elemento) {
            return elemento.tipoTransporte === numLetra;
        });

        if (numCamion === maxCamion && elementoExistente !== undefined ) {
            numCamion++;
            numA++;
            document.getElementById("numCamion").innerHTML = numCamion;
            letraTransporte = "A";
            numT = numA;
            numLetra = numT + " - A";
            document.getElementById("numT").innerHTML = numLetra;
            funcTablaTransporte(numCamion, numLetra);
            actualizaDesplegables();
        } else if (numCamion === maxCamion && elementoExistente === undefined) {
            numCamion=maxCamion+1;
            document.getElementById("numCamion").innerHTML = numCamion;
            //numA++;
            numT = numA;
            numLetra = numT + " - A";
            document.getElementById("numT").innerHTML = numLetra;
            funcTablaTransporte(numCamion, numLetra);
            actualizaDesplegables();
        } else if (numCamion !== maxCamion && elementoExistente !== undefined ) {
            document.getElementById("numCamion").innerHTML = numCamion;
            numA++;
            numT = numA;
            numLetra = numT + " - A";
            document.getElementById("numT").innerHTML = numLetra;
            funcTablaTransporte(numCamion, numLetra);
            actualizaDesplegables();
        }else if (numCamion !== maxCamion && elementoExistente === undefined ) {
            numCamion="";
            numCamion=parseInt(buscaNumCamionMaximo())+1;
            if (isNaN(numCamion)) {
                numCamion = 1;
            }
            document.getElementById("numCamion").innerHTML = numCamion;
            numT = numA;
            numLetra = numT + " - A";
            document.getElementById("numT").innerHTML = numLetra;
            funcTablaTransporte(numCamion, numLetra);
            actualizaDesplegables();
        } 
    }
});

nuevoCamionCerramientoBtn.addEventListener("click", function() {
    seleccionarBoton(nuevoCamionCerramientoBtn);
    numCamion=buscaNumCamionMaximo();
    var maxCamion = 0;

    letraTransporte = "C";
    numT = numC;
    numLetra = numT + " - C";
    document.getElementById("numT").innerHTML = numLetra;

    for (var i = 0; i < precastElements.length; i++) {
        if (precastElements[i].Camion > maxCamion) {
            maxCamion = precastElements[i].Camion;
        }
    }
    maxCamion=parseInt(maxCamion);
    document.getElementById("numCamion").innerHTML = maxCamion+1;
    var elementoExistente = precastElements.find(function(elemento) {
        return elemento.tipoTransporte === numLetra;
    });

    if (numCamion === maxCamion && elementoExistente !== undefined ) {
        numCamion++;
        numC++;
        document.getElementById("numCamion").innerHTML = numCamion;
        letraTransporte = "C";
        numT = numC;
        numLetra = numT + " - C";
        document.getElementById("numT").innerHTML = numLetra;
        funcTablaTransporte(numCamion, numLetra);
        actualizaDesplegables();
    } else if (numCamion === maxCamion && elementoExistente === undefined) {
        numCamion=maxCamion+1;
        document.getElementById("numCamion").innerHTML = numCamion;
        //numE++;
        numT = numC;
        numLetra = numT + " - C";
        document.getElementById("numT").innerHTML = numLetra;
        funcTablaTransporte(numCamion, numLetra);
        actualizaDesplegables();
    } else if (numCamion !== maxCamion && elementoExistente !== undefined ) {
        // numCamion=maxCamion+1;
        document.getElementById("numCamion").innerHTML = numCamion;
        numC++;
        numT = numC;
        numLetra = numT + " - C";
        document.getElementById("numT").innerHTML = numLetra;
        funcTablaTransporte(numCamion, numLetra);
        actualizaDesplegables();
    }else if (numCamion !== maxCamion && elementoExistente === undefined ) {
        numCamion="";
        numCamion=parseInt(buscaNumCamionMaximo())+1;
        if (isNaN(numCamion)) {
            numCamion = 1;
        }
        document.getElementById("numCamion").innerHTML = numCamion;
        numT = numC;
        numLetra = numT + " - C";
        document.getElementById("numT").innerHTML = numLetra;
        funcTablaTransporte(numCamion, numLetra);
        actualizaDesplegables();
    } 
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'c' || event.key === 'C') {
        seleccionarBoton(nuevoCamionCerramientoBtn);
        numCamion=buscaNumCamionMaximo();
        var maxCamion = 0;

        letraTransporte = "C";
        numT = numC;
        numLetra = numT + " - C";
        document.getElementById("numT").innerHTML = numLetra;
        document.getElementById("numCamion").innerHTML = numCamion;

        for (var i = 0; i < precastElements.length; i++) {
            if (precastElements[i].Camion > maxCamion) {
                maxCamion = precastElements[i].Camion;
            }
        }
        maxCamion=parseInt(maxCamion);
        
        var elementoExistente = precastElements.find(function(elemento) {
            return elemento.tipoTransporte === numLetra;
        });

        if (numCamion === maxCamion && elementoExistente !== undefined ) {
            numCamion++;
            numC++;
            document.getElementById("numCamion").innerHTML = numCamion;
            letraTransporte = "C";
            numT = numC;
            numLetra = numT + " - C";
            document.getElementById("numT").innerHTML = numLetra;
            funcTablaTransporte(numCamion, numLetra);
            actualizaDesplegables();

        } else if (numCamion === maxCamion && elementoExistente === undefined) {
            numCamion=maxCamion+1;
            document.getElementById("numCamion").innerHTML = numCamion;
            numT = numC;
            numLetra = numT + " - C";
            document.getElementById("numT").innerHTML = numLetra;
            funcTablaTransporte(numCamion, numLetra);
            actualizaDesplegables();

        } else if (numCamion !== maxCamion && elementoExistente !== undefined ) {
            document.getElementById("numCamion").innerHTML = numCamion;
            numC++;
            numT = numC;
            numLetra = numT + " - C";
            document.getElementById("numT").innerHTML = numLetra;
            funcTablaTransporte(numCamion, numLetra);
            actualizaDesplegables();

        }else if (numCamion !== maxCamion && elementoExistente === undefined ) {
            numCamion="";
            numCamion=parseInt(buscaNumCamionMaximo())+1;
            if (isNaN(numCamion)) {
                numCamion = 1;
            }
            document.getElementById("numCamion").innerHTML = numCamion;
            numT = numC;
            numLetra = numT + " - C";
            document.getElementById("numT").innerHTML = numLetra;
            funcTablaTransporte(numCamion, numLetra);
            actualizaDesplegables();
        } 
    }
});

function seleccionarBoton(boton) {
    const botonesTipoCarga = document.querySelectorAll('#tipoCarga button');
    botonesTipoCarga.forEach((boton) => {
        boton.classList.remove('seleccionado');
    });
    botonSeleccionado = boton;
    botonSeleccionado.classList.add("seleccionado");
}

//Lógica para eliminar de la tabla HTML los elementos cargados, volver a visualizarlos
//los elementos que borra de la tabla HTML los devuelve al array allIDs
// los elimina de la lista elementosOcultos
//y vuelve a colocar el valor de la prop Camion ''
const divCargas = document.querySelector('.divCargas');
let listaElementos = divCargas.querySelector('.item-list-elementos-cargados');
listaElementos.addEventListener('dblclick', function(event) {
    const target = event.target;
    let elementoEliminadoTabla;
    if (target.tagName === 'TD') {
        elementoEliminadoTabla = target.parentNode.firstChild.textContent;
        target.parentNode.remove();
        let indexToRemove = elementosOcultos.indexOf(parseInt(elementoEliminadoTabla));
        if (indexToRemove !== -1) {  //elimina de ambos array el elemento deseado a traves del indice
            elementosOcultos.splice(indexToRemove, 1);
            globalIds.splice(indexToRemove, 1);
        }
        allIDs.push(parseInt(elementoEliminadoTabla));
    }
    showAllItems(viewer, allIDs);
    const divCheck = document.getElementById("checktiposIfc");
    const checkboxes = divCheck.querySelectorAll("input[type='checkbox']");// Obtener todos los checkbox dentro del div
    checkboxes.forEach(checkbox => checkbox.checked = true);// Activa los checkbox
    const actValorCamion = precastElements.find(element => element.expressID === (parseInt(elementoEliminadoTabla)));
        if (actValorCamion) {
            actValorCamion.Camion = "";
            actValorCamion.tipoTransporte = "";
            actValorCamion.Posicion = "";
        }
});

//muestra en HTML a través de una tabla los elemntos no visibles en visor
async function listarOcultos(elementosOcultos) {
    const itemList = document.querySelector(".item-list-elementos-cargados");
    itemList.innerHTML = "";
    const table = document.createElement("table");
    table.classList.add("table");
    
    const thead = document.createElement("thead");
    thead.innerHTML = "<tr><th>expressID</th><th>GlobalId</th><th>Camion</th><th>Tipo</th><th>Volumen</th></tr>";
    table.appendChild(thead);
    
    const tbody = document.createElement("tbody");
    
    for (let i = elementosOcultos.length - 1; i >= 0; i--) {  //Muestra los elementos en orden inverso
        const id = elementosOcultos[i];
        const elemento = precastElements.find(elemento => elemento.expressID === id);
        if (!elemento) {
            throw new Error(`No se encontró el elemento con expressID = ${id}`);
        }
        const tr = document.createElement("tr");
        tr.classList.add("item-list-elemento");
        tr.innerHTML = `<td>${elemento.expressID}</td><td>${elemento.GlobalId}</td><td>${elemento.Camion}</td><td>${elemento.tipoTransporte}</td><td>${(elemento.Volumen_real)}</td>`;
        //tr.innerHTML = `<td>${elemento.expressID}</td><td>${elemento.GlobalId}</td><td>${elemento.Camion}</td><td>${elemento.Volumen_real.toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 9 })}</td>`;
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    itemList.appendChild(table);
    $(table).tablesorter();//para ordenar la tabla si pulsamos en sus encabezados
}

function hideClickedItem(viewer) {
    const divCargas = document.querySelector('.divCargas');
    divCargas.style.display = 'block'; //hace visible el div de la tabla en HTML
    const result = viewer.context.castRayIfc();
    if (!result) return;
    const manager = viewer.IFC.loader.ifcManager;
    const id = manager.getExpressId(result.object.geometry, result.faceIndex);
    
    // Comprobar si hay algún botón con la clase 'seleccionado' sino es asi no deja cargar elementos
    const botonSeleccionado = document.querySelector('.seleccionado');
    const botonSeleccionadoActual=botonSeleccionado;
    if (!botonSeleccionado) {
        alert('Debe seleccionar boton tipo de carga E, A C');
        return;
    }
    for (let i = 0; i < precastElements.length; i++) {
        if (precastElements[i].expressID === id) {
            if (precastElements[i].Camion === '' || precastElements[i].Camion === undefined) {
                viewer.IFC.loader.ifcManager.removeFromSubset(
                    0,
                    [id],
                    'full-model-subset',
                    );
                viewer.IFC.selector.unpickIfcItems();
                elementosOcultos.push(id);
                globalIds.push(globalId);// cuando oculto un elemnto su globalId se añade al array globalIds
                // busca el elemento con el identificador expressID en el array precastElements y modifica su valor en la prop Camion
                const actValorCamion = precastElements.find(element => element.expressID === id);
                if (actValorCamion) {
                    actValorCamion.Camion = numCamion ;
                    actValorCamion.tipoTransporte = numT + ' - ' + letraTransporte;
                    actValorCamion.Posicion="";
                }
                listarOcultos(elementosOcultos);
                //indexOf se utiliza para encontrar el índice del elemento que quieres eliminar.
                // Si el elemento no se encuentra en el array, indexOf devuelve -1. Por lo tanto, antes de llamar a splice, debes verificar que el elemento exista en el array.
                let indexToRemove = allIDs.indexOf(id);
                if (indexToRemove !== -1) {
                    allIDs.splice(indexToRemove, 1);
                } 
            } else {
                alert("El elemento "+precastElements[i].expressID+"  "+ precastElements[i].ifcType +" ya está cargado en el camion: "+precastElements[i].Camion);
            }
            break; 
        }
    }
    camionesUnicos = obtenerValorCamion(precastElements);
    generaBotonesNumCamion(camionesUnicos, botonSeleccionadoActual);
}

//Elimina de visor un elemento pulsado con boton derecho
function hideClickedItemBtnDrch(viewer) {
    const result = viewer.context.castRayIfc();
        if (!result) return;
        const manager = viewer.IFC.loader.ifcManager;
        const id = manager.getExpressId(result.object.geometry, result.faceIndex);
        viewer.IFC.loader.ifcManager.removeFromSubset(
            0,
            [id],
            'full-model-subset',
        );
        viewer.IFC.selector.unpickIfcItems();
}

// **************************************************
//evento que crea boton reduceDiv cuando se genera la tabla
//y evento para expandir la tabla de cargas
const reduceDivBtn = document.createElement("button");
reduceDivBtn.id = "reduceDivBtn";
reduceDivBtn.classList.add("cargas-btn");
divCargas.insertBefore(reduceDivBtn, divCargas.childNodes[0]);

reduceDivBtn.addEventListener("click", () => {
    divCargas.style.width = "20px";
    reduceDivBtn.style.display = "none";
    const expandDivBtn = document.createElement("button");

    expandDivBtn.innerHTML = '<span style="display: inline-block; vertical-align: middle; width: 20px; line-height: 20px;"></span>';

    expandDivBtn.id = "expandDivBtn";
    expandDivBtn.style.verticalAlign = "middle"; // Centra el contenido verticalmente
    expandDivBtn.style.textAlign = "center"; // Centra el contenido horizontalmente
    divCargas.appendChild(expandDivBtn);

    expandDivBtn.addEventListener("click", () => {
        divCargas.style.width = "";
        expandDivBtn.style.display = "none";
        reduceDivBtn.style.display = "";
        expandDivBtn.classList.add("cargas-btn");
    });
});

//************************************************************************ */
//devuelve todos los ID de los elementos del modelo
function getAllIds(ifcModel) {
    return Array.from(
        new Set(ifcModel.geometry.attributes.expressID.array),
    );
}

// ACCEDER A PROPIEDADES
//al mover el raton por el 3D, va preseleccionando los elemnetos que lo componen,
container.onmousemove = () => viewer.IFC.selector.prePickIfcItem();
viewer.IFC.selector.unpickIfcItems();
//para darle otro aspecto en **const viewer = new IfcViewerAPI({container, backgroundColor: new Color(255,255,255)}); se puede modificar su aspecto     
let globalIds=[];
let globalId;
//onclick y selecciona elemento
container.onclick = async()=>{
    const divProp = document.querySelector('#main-container');
    divProp.style.display = 'block'; //hace visible el div de la tabla en HTML
    const found=await viewer.IFC.selector.pickIfcItem(false);
    if(found === null || found === undefined) return; //elemento no seleccionado no hace nada
    //y para acceder a propiedades de ese elemento, con doble true es recursivo y arrastra todas las props->psets incluidas
    const props = await viewer.IFC.getProperties (found.modelID, found.id, true,true);
    globalId=props['GlobalId'].value;
    updatePropertyMenu(props);  
}
// **************************************************

async function precastPropertiesGlobalId(precast,modelID, precastID){
    const props = await viewer.IFC.getProperties(modelID, precastID, true, false);
    precast['GlobalId'] = props['GlobalId'].value; //establece propiedad GlobalId en obj precast y le asigna un valor
}

async function precastProperties(precast,modelID, precastID){
    const props = await viewer.IFC.getProperties(modelID, precastID, true, true);

    const mats =props.mats;
    const psets =props.psets;
    const type= props.type;
    
    delete props.mats;
    delete props.psets;
    delete props.type;
    
    for (let pset in psets){
        psetName = psets[pset].Name.value;
        let properties = psets[pset].HasProperties;
        if (psets[pset] !== IfcElementQuantity){
            
            for (let property in properties){
                if (properties[property].Name.value.includes('Cami')){
                    precast['Camion']=properties[property].NominalValue.value;
                } else if (properties[property].Name.value.includes('Produc')){
                    precast['Produccion']=properties[property].NominalValue.value;
                } else if (properties[property].Name.value.includes('Volum')){   
                   // precast[properties[property].Name.value] = parseFloat(properties[property].NominalValue.value).toFixed(3);
                    const volumenCadena = String(properties[property].NominalValue.value);
                    const volumen = parseFloat(volumenCadena.replace(",", "."));
                    precast[properties[property].Name.value] = volumen;
                } else {
                    precast[properties[property].Name.value] = properties[property].NominalValue.value;
                }
            }
        }
    }
}

//PAra crear arbol del proyecto cuando se selecciona ifc
let tree;
//menu con propiedades nativas 
function updatePropertyMenu (props){
    removeAllChildren(GUI.props); //llama a funcion que borra propiedades
    const mats =props.mats;
    const psets =props.psets;
    const type= props.type;
    delete props.mats;
    delete props.psets;
    delete props.type;
    
    // for(let propertyName in props){
    //     const propValue=props[propertyName];
    //     createPropertyEntry(propertyName, propValue);
    // }
    for (let pset in psets){
        //console.log(pset);
        getName = psets[pset].Name.value;
        createPropertyEntry(getName, '', false);
        let properties = psets[pset].HasProperties;
        if (psets[pset] !== IfcElementQuantity){
            for (let property in properties){
                createPropertyEntry(properties[property].Name.value, 
                    properties[property].NominalValue.value, true);
            }
        }
    }
    let properties2= psets[0].HasProperties
}

//para construir un menu de propiedades 
function createPropertyEntry(key,propertyValue){
    const root=document.createElement ('div');  //crea elemento div contenedor
    root.classList.add('property-root');// y este div le asignamos la clase

    if (propertyValue ===null || propertyValue === undefined) propertyValue = "-------";
    else if (propertyValue.value) propertyValue=propertyValue.value

    //nombre de la propiedad e introducido dentro de property-root
    const keyElement=document.createElement ('div');  //crea elemento div donde va a almacenar el nombre de la propiedad
    keyElement.classList.add("property-name"); //añado clases del elemnto div html
    keyElement.textContent=key;
    root.appendChild(keyElement);

     //valor de la propiedad e introducido dentro de property-root
     const valueElement=document.createElement ('div');  //crea elemento div
    valueElement.classList.add("property-value");
    valueElement.textContent=propertyValue;

    root.appendChild(valueElement);

    GUI.props.appendChild(root);
}

//Limpia el árbol de propiedades
function removeAllChildren(element){
    document.getElementById("main-container").innerHTML = "";
    for(const child of element.children){
        element.removeChild(child);
    }   
}

//MENU THREE w3scholl
var toggler = document.getElementsByClassName("caret");  //enlaca con elemento html
for (let i = 0; i < toggler.length; i++) {
    const current =toggler[i];
    current.onclick=()=>{
        current.parentElement.querySelector(".nested").classList.toggle("active");
        current.classList.toggle("caret-down");
    }
}

//++++++++++++++++++++++++
async function createTreeMenu(modelID){
    const ifcProject = await viewer.IFC.getSpatialStructure (modelID);
    removeAllChildren(GUI.tree); //elimina la estructura html ejemplo creada para ver como lo vamos a montar

    const ifcProjectNode = createNestedChildren(GUI.tree, ifcProject);
    ifcProject.children.forEach(child => {
        constructTreeMenuNode(ifcProjectNode, child)
})
}
//+++++++++++++++++++++
function constructTreeMenuNode(parent, node){
    const children = node.children;

    const exists = uniqueTypes.includes(node.type);

   // TODO: elementos de IFC excluidos BUILDING y SITE
    if (!exists && node.type !== "IFCBUILDING" && node.type !== "IFCSITE" && node.type !== "IFCBUILDINGSTOREY") {
        precastElements.push({expressID: node.expressID,  ifcType: node.type});
    }

    //console.log(children);
    if(children.length === 0){
        createSimpleChild(parent, node);
        return;    
    }
    const nodeElement =createNestedChildren(parent,node);
    children.forEach(child => {
        constructTreeMenuNode(nodeElement, child);
    }); 
}

//++++++++++si elemento tiene hijos, construye nodos rama
function createNestedChildren(parent, node){
    const content=nodeToString(node);
    const root=document.createElement('li');
    createNesteNodeTitle(root,content);
    const childrenContainer= document.createElement("ul");
    childrenContainer.classList.add('nested');
    root.appendChild(childrenContainer);
    parent.appendChild(root);
    return childrenContainer;
}

//++++++++++crea el TITULOtexto cuando lee un nodo padre
function createNesteNodeTitle(parent,content){
    const title=document.createElement('span');
    title.classList.add('caret');
    title.onclick=()=>{
        title.parentElement.querySelector(".nested").classList.toggle("active");
        title.classList.toggle("caret-down");
    }
    title.textContent=content;
    parent.appendChild(title);
}

//++++++++++++++++si elemento no tiene hijos , a partir del nodo del arbol de la estructura ifc
function createSimpleChild(parent, node){
    const childNode = document.createElement('li');
    childNode.classList.add('leaf-nod');
    childNode.textContent= nodeToString(node);
    parent.appendChild (childNode);

    //al pasar el raton por los nodos hijos se visualiza en viewer
    childNode.onmousemove=() => {
        viewer.IFC.selector.prepickIfcItemsByID(0,[node.expressID]);   
    }
    childNode.onclick = async () => {
        viewer.IFC.selector.pickIfcItemsByID(0,[node.expressID],true);   
        const props = await viewer.IFC.getProperties (0, node.expressID, true, true);
        updatePropertyMenu(props);
    }
}

//+++++++++convertir los nodos en inf-texto que vemos en pantalla
function nodeToString(node){
    return `${node.type} - ${node.expressID}`;
}

////********************************************************************************************** */
// Exportar a CSV
const exportCSV = document.getElementById("exportButton");
exportCSV.addEventListener('click', exportCSVmethod, false);


function exportCSVmethod(){

    let header = [];
    precastElements.forEach(precastElement => {
        Object.keys(precastElement).forEach(mKey => {
            const exists = header.includes(mKey);
            if (!exists){header.push(mKey)};
        });
    });

    let csvContent = '';

    csvContent = header.join(',') + '\n'
    
    precastElements.forEach(precast => {
        header.forEach(ekey => {

            csvContent += precast[ekey]==undefined ? ',' : precast[ekey] + ',';

        });

        csvContent += '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,'});
    const objUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('id', 'enlaceDescarga');
    link.setAttribute('href', objUrl);
    link.setAttribute('download', 'File.csv');
    link.textContent = 'Click to Download';
    document.querySelector(".toolbar").append(link);

    //una vez descargado el archivo CSV elimina de HTML el enlace
    link.addEventListener("click", function(e) {
        this.parentNode.removeChild(this); // Elimina el enlace del DOM
    });
    
}


const subset_name='rojo';
                
// Crear un nuevo material rojo
const materialRojo = new MeshBasicMaterial({ color: 0xff0000 });

GUI.importer.addEventListener("change", function(e) {
    e.preventDefault();
    const input = e.target.files[0];
    const reader = new FileReader();
    let headers = [];

    const readCsvFile = new Promise((resolve, reject) => {
        reader.onload = function (e) {
            const text = e.target.result;
            let lines = text.split(/[\r\n]+/g);
            let numObjectosPre = precastElements.length;
            let numLinesCsv = lines.length - 2;

            if (numObjectosPre > numLinesCsv) {
                const nuevos = precastElements.filter(dato => !lines.some(line => line.includes(dato.expressID)));
                const expressID = nuevos.map(nuevo => nuevo.expressID);
                if (expressID.length>0){
                    alert("Aparecen: "+expressID.length+" nuevos elementos. IFC MODIFICADO")
                }
            } else if (numObjectosPre < numLinesCsv) {
                const eliminado = precastElements.find(dato => !lines.some(line => line.includes(dato.expressID)));
                alert("Se ha eliminado un elemento al MODIFICAR el archivo IFC: " + JSON.stringify(eliminado));
            }

            lines.forEach(line => {
                if (headers.length===0){
                    headers = line.split(',');
                } else {
                    let mline = line.split(',');
                    if(!mline[0]==''){
                        let dato = precastElements.find(dato => dato[headers[2]] === mline[2]);
                        for(let i=3; i<headers.length; i++){
                            if(dato && mline[i]!==undefined){ 
                                dato[headers[i]] = mline[i]; 
                            }
                        }
                    }
                }
            });
            resolve();
        };
        reader.readAsText(input); 
    });

    readCsvFile.then(() => {

        mostrarElementosRestantes();
        clasificarPorTipoTransporte();
        actualizaDesplegables();
        creaTablaTransporte();

        nuevoCamionEstructuraBtn.click();
    })
    .catch(error => console.error(error));

    
});

function creaTablaTransporte() {
    for (let objeto of precastElements) {
        if (objeto.hasOwnProperty('Camion') && objeto.hasOwnProperty('tipoTransporte')) {
            // si la propiedad tipoTransporte tiene algún valor y no existe en el array
            if (objeto.tipoTransporte !== '' && !tablaTransporte.some(transporte => transporte.tipoTransporte === objeto.tipoTransporte)) {
                const objetoTransporte = { Camion: objeto.Camion, tipoTransporte: objeto.tipoTransporte };
                tablaTransporte.push(objetoTransporte);
            }
        }
    }
    const nuevoObjeto = {
        Camion: numCamion,
        tipoTransporte: numT
    };
    tablaTransporte.push(nuevoObjeto);
}

let transporteA = [];
let transporteC = [];
let transporteE = [];

function clasificarPorTipoTransporte() {
    for (let i = 0; i < precastElements.length; i++) {
        const tipoTransporte = precastElements[i].tipoTransporte;
        const letra = tipoTransporte.charAt(tipoTransporte.length - 1);
        switch (letra) {
            case "A":
            transporteA.push(precastElements[i]);
            break;

            case "C":
            transporteC.push(precastElements[i]);
            break;

            case "E":
            transporteE.push(precastElements[i]);
            break;
            // default:
            // break;
        }
    }
    buscaMaxTransporte(transporteA);
    buscaMaxTransporte(transporteC);
    buscaMaxTransporte(transporteE);

}

function buscaMaxTransporte(transporteA){
    let camionMaximo = null;
    let camionMaximoValor = 0;
    for (let i = 0; i < transporteA.length; i++) {
        let objetoActual = transporteA[i];
        let camionActualValor = parseInt(objetoActual.Camion);

        if (camionActualValor > camionMaximoValor) {
            camionMaximoValor = camionActualValor;
            camionMaximo = objetoActual;
        }
    }
    buscaValoresMax(camionMaximo);
}

//recore los array con objetos con transporte A, C o E para obtener los valores mayores (las ultimas cargas generadas)
function buscaValoresMax(camionMaximo){
    if (camionMaximo == null || camionMaximo.tipoTransporte == null) {
        return; // Si la variable es null, no hace nada y sale de la función.
    }
        const tipoTransporte = camionMaximo.tipoTransporte;
        const partesTipoTransporte = tipoTransporte.split("-");
        const numCamMax = parseInt(partesTipoTransporte[0].trim());
        const letraTrans = partesTipoTransporte[1].trim().charAt(0);
        if (letraTrans=== 'A'){
            numA=numCamMax;
            numT=numA;
        }
        if (letraTrans=== 'C'){
            numC=numCamMax;
            numT=numC;
        }
        if (letraTrans==='E'){
            numE=numCamMax;
            numT=numE;

            document.getElementById("numT").textContent =  "" ;
    }
    
}

let camionesUnicos=[];

async function mostrarElementosRestantes(){
    allIDs.splice(0, allIDs.length);
    for (let i = 0; i < precastElements.length; i++) {
        let valorCamion = precastElements[i].Camion;
        // si la propiedad Camion del objeto actual está vacía
        if (precastElements[i].Camion === undefined || precastElements[i].Camion ==='' ) {
            // variable expressID = el valor de la propiedad expressID de ese objeto y lo convertimos a número
            const expressID = parseInt(precastElements[i].expressID);
            // Agregamos el valor al array allIDs
            allIDs.push(expressID);
        }else{
            const expressIDoculto = parseInt(precastElements[i].expressID);
            elementosOcultos.push(expressIDoculto);// Agregamos el valor al array elemenOcultos
        }
    }
    //camionesUnicos es un array numerico con el valor de los diferentes camiones agrupados
    camionesUnicos = obtenerValorCamion(precastElements);
    //genera los botones en HTML con los diferentes camiones cargados
    generaBotonesNumCamion(camionesUnicos);
    viewer.IFC.loader.ifcManager.clearSubset(0,"full-model-subset");
    subset = getWholeSubset(viewer, model, allIDs);
    replaceOriginalModelBySubset(viewer, model, subset);
    await listarOcultos(elementosOcultos);
}

//devuelve los valores de camion agrupados
function obtenerValorCamion(precastElements) {
    const valoresCamion = new Set();
    
    precastElements.forEach(function(elemento) {
        const camion = parseInt(elemento.Camion);
        if (!isNaN(camion)) { // Agregar solo valores numéricos al Set
            valoresCamion.add(camion);
        }
    });
    
    return Array.from(valoresCamion);
}
//crea los botones con la numeracion de los camiones, 
function generaBotonesNumCamion(camionesUnicos, botonSeleccionadoActual) {
    viewer.IFC.selector.unpickIfcItems();
    const btnNumCamiones = document.getElementById("divNumCamiones");
    let botonesActivos = 0; // contador de botones activos
    let maximo = Math.max(...camionesUnicos.filter(num => !isNaN(num))); // filtramos los valores que no son NaN

    for (let i = 0; i < precastElements.length; i++) {
        if (parseInt(precastElements[i].Camion) === maximo) {
            tipoTransporteMaximo = precastElements[i].tipoTransporte;
            break;
        }
    }
    //numCamion=maximo;
    //document.getElementById("numCamion").innerText = numCamion;
    btnNumCamiones.innerHTML = ""; //limpia el div antes de generar los botones
    camionesUnicos.sort((a, b) => a - b); // ordena los nº de camion de menor a mayor
    
    camionesUnicos.forEach(function(camion) {
        const btn = document.createElement("button");
        btn.setAttribute("class","btnNumCamion")
        btn.textContent = camion;
        btnNumCamiones.appendChild(btn);
        btn.addEventListener("click", function() {
            const expressIDs = [];
            precastElements.forEach(function(precastElement) {
                if (parseInt(precastElement.Camion) === camion) {
                    expressIDs.push(precastElement.expressID);
                    
                }
            });
            const isActive = btn.classList.contains("active");
            if (isActive) {
            //, elimina los elementos del visor y desactiva el botón
                viewer.IFC.selector.unpickIfcItems();
                hideAllItems(viewer, expressIDs);
                btn.classList.remove("active");
                btn.style.justifyContent = "center";
                btn.style.color = "";
                eliminarTabla(camion);
                const posicionCamion = document.getElementById("posicionCamion");
                posicionCamion.innerHTML = ""; // limpia el contenido previo del div
                botonesActivos--;
            } else {
                //  muestra los elementos en tabla en el visor y activa el botón
                viewer.IFC.selector.unpickIfcItems();
                hideAllItems(viewer, allIDs);
                showAllItems(viewer, expressIDs);
                btn.classList.add("active");
                btn.style.color = "red";
                generarTabla(expressIDs, camion);
                botonesActivos++;
            }
            if (botonesActivos === 0) { // si las cargas están desactivados muestra elementos que faltan por transportar
                showAllItems(viewer, allIDs);
            }
        });
    });
agregarBotonCero();
}

function agregarBotonCero() {
    viewer.IFC.selector.unpickIfcItems();
    
    const btnCero = document.createElement("button");
    btnCero.setAttribute("class","btnNumCamion")
    
    divNumCamiones.appendChild(btnCero);

    const iconoPlay = document.createElement("i");
    iconoPlay.setAttribute("class", "fas fa-play");

    btnCero.appendChild(iconoPlay);

    btnCero.addEventListener("click", function() {
        const isActive = btnCero.classList.contains("active");
        if (isActive) {
            hideAllItems(viewer, idsTotal);
            showAllItems(viewer, allIDs);
            btnCero.classList.remove("active");
            btnCero.style.justifyContent = "center";
            btnCero.style.color = "";
        } else {
            hideAllItems(viewer, idsTotal);
            btnCero.classList.add("active");
            btnCero.style.justifyContent = "center";
            btnCero.style.color = "";
            showElementsByCamion(viewer, precastElements);
        }
    });
}

function showElementsByCamion(viewer, precastElements) {
    // Crear el div y el label
    const label = document.createElement("label");
    const div = document.createElement("div");
    div.setAttribute("id", "divNumCamion");
    div.appendChild(label);
    document.body.appendChild(div);

    // Filtra los elementos cuyo valor en su propiedad sea distinto a 0 o a undefined
    //O los que no tengan propiedad asiganada en el objeto
    const filteredElements = precastElements.filter((element) => {
        const { Camion } = element;
        return Camion && Camion !== "" && Camion !== "undefined" && Camion !== "0" && "Camion" in element;
    });
    
    // Agrupa los elementos por valor de su propiedad
    const groupedElements = filteredElements.reduce((acc, element) => {
        const { Camion } = element;
        if (!acc[Camion]) {
            acc[Camion] = [];
        }
        acc[Camion].push(element);
        return acc;
    }, {});
    
    // muestra los elementos agrupados en el visor y su etiqueta de num Camion
    let delay = 0;
    Object.keys(groupedElements).forEach((key) => {
        const elements = groupedElements[key];
        setTimeout(() => {
            // Mostrar el valor de Camion en el label
            label.textContent = `Camion: ${key}`;
            showAllItems(viewer, elements.map((element) => element.expressID));
        }, delay);
      delay += 250; // Esperar un segundo antes de mostrar el siguiente grupo
    });
     //ocultar la etiqueta después de mostrar todos los elementos
    setTimeout(() => {
        div.style.display = 'none';
    }, delay);
}

let contenidoCelda;
let tablaResaltada = false;

function generarTabla(expressIDs, camion) {
    const divTabla = document.getElementById("datosCamiones");
    const precastElement = precastElements.find(elem => parseInt(elem.Camion) === camion);
    const cabeceraValor = `${camion} * ${precastElement.tipoTransporte}`;
    const thElemento = document.createElement('th');// Cabecera de la tabla
    thElemento.textContent = cabeceraValor;
    const filaCabecera = document.createElement('tr');
    filaCabecera.appendChild(thElemento);
    const cabecera = document.createElement('thead');
    cabecera.appendChild(filaCabecera);
    const cuerpo = document.createElement('tbody');
    expressIDs.forEach(id => {
        const tdElemento = document.createElement('td');
        tdElemento.textContent = id;
        // Condicion si el elemento está en precastElements y si su propiedad "Posicion" no está vacía
        const precastElem = precastElements.find(elem => elem.expressID === id && elem.Posicion !== "" && elem.Posicion !== undefined);
        if (precastElem) {
            tdElemento.style.backgroundColor = "189,155,194"; 
        }
        tdElemento.addEventListener('contextmenu', function(event) {
            event.preventDefault(); // evita que aparezca el menú contextual del botón derecho
            contenidoCelda = tdElemento.textContent;
            resaltarTabla(tabla, cabeceraValor);
            tablaResaltada=true;
            celdaSeleccionadaColor(event.target);
            //viewer.IFC.selector.defSelectMat.color = new Color(255, 128, 0);
            viewer.IFC.selector.pickIfcItemsByID(0, [parseInt(contenidoCelda)], false);
        });
        const fila = document.createElement('tr');
        fila.appendChild(tdElemento);
        cuerpo.appendChild(fila);
    });
    const tabla = document.createElement('table');// Tabla completa
    tabla.classList.add('tabla');
    tabla.appendChild(cabecera);
    tabla.appendChild(cuerpo);
    const contenedorTabla = document.createElement("div");// Contenedor  agrega estilos CSS
    contenedorTabla.classList.add('contenedor-tabla');
    contenedorTabla.addEventListener("click", function() {
        resaltarTabla(tabla, cabeceraValor);
    });
    contenedorTabla.appendChild(tabla);
    thElemento.classList.add('cabecera-tabla');
    divTabla.appendChild(contenedorTabla);
}

let ultimaCeldaSeleccionada = null;

function celdaSeleccionadaColor(celdaSeleccionada) {
    if (tablaResaltada) {
        if (ultimaCeldaSeleccionada && precastElements.some(elem => elem.expressID === ultimaCeldaSeleccionada.innerText && elem.Posicion)) {
            ultimaCeldaSeleccionada.style.backgroundColor = '#BD9BC2';  
        }
    }celdaSeleccionada.style.backgroundColor = 'cyan';
        ultimaCeldaSeleccionada = celdaSeleccionada;
}

function resaltarTabla(tabla, cabeceraValor) {
    const tablas = document.querySelectorAll("#datosCamiones table");
    tablas.forEach(t => {
        if (t === tabla) {
            t.style.border = "3px solid rgb(135,76,143)";
            t.style.boxShadow = "10px 10px 10px rgba(0, 0, 0, 0.5)";
            tablaResaltada = true;
            posicionesCamion(tabla, cabeceraValor); // argumentos tabla y valor de cabecera a la función posicionesCamion
        } else {
            t.style.border = "1px solid black";
        }
    });
    
    // if (ultimaCeldaSeleccionada && !tabla.contains(ultimaCeldaSeleccionada)) {
    //     ultimaCeldaSeleccionada.style.backgroundColor = '';
    //     ultimaCeldaSeleccionada = null;
    // }
    //actualiza coloreando celdas, para ver los elementos que ya estan asignados en el transporte
    for (let i = 0; i < tabla.rows.length; i++) {// recorre las filas de la tabla
         for (let j = 0; j < tabla.rows[i].cells.length; j++) { // recorre las celdas de cada fila 
            let valorCelda = tabla.rows[i].cells[j].innerText;// Obtiene el valor de la celda actual
            for (let k = 0; k < precastElements.length; k++) { // recorrer el array precastElements 
                let expressID = precastElements[k].expressID; // obtiene el valor de la propiedad expressID del objeto actual
                let posicion = precastElements[k].Posicion; // obtener el valor de la propiedad Posicion del objeto actual 
                if (valorCelda == expressID && posicion) {// cuando el valor de la celda coincide con el valor de la propiedad expressID y hay algún valor en la propiedad Posicion 
                    tabla.rows[i].cells[j].style.backgroundColor = `#BD9BC2`; // Cambiar el fondo de la celda a gris 
                    break; 
                } 
                if (valorCelda == expressID && posicion==="") {// cuando el valor de la celda coincide con el valor de la propiedad expressID y hay algún valor en la propiedad Posicion 
                    tabla.rows[i].cells[j].style.backgroundColor = ``; // Cambiar el fondo de la celda a gris 
                    break; 
                }
            } 
        } 
    }
}

function eliminarTabla(camion) {
    const divTabla = document.getElementById("datosCamiones");
    const thElements = divTabla.getElementsByTagName("th");
    
    for (let i = 0; i < thElements.length; i++) {
        const thElement = thElements[i];
        if (thElement.textContent.startsWith(camion.toString())) {
            const tablaAEliminar = thElement.closest('table');
            const contenedorAEliminar = tablaAEliminar.parentNode;
            contenedorAEliminar.remove();
            break;
        }
    }
    contenidoCelda = null;
}

// Variable global para almacenar la referencia al cajón pulsado más recientemente
let ultimoCajonPulsado = null;

function posicionesCamion(tabla, cabeceraValor) { 
    let expressIdByCamion = [];
    const posicionCamion = document.getElementById("posicionCamion");
    posicionCamion.innerHTML = ""; // limpia el contenido previo del div
    const tablaNueva = document.createElement("table");
    const cabeceraFila = document.createElement("tr");
    const cabeceraCajon = document.createElement("th");
    cabeceraCajon.setAttribute("colspan", "5");
    cabeceraCajon.style.border = "1px solid black";
    cabeceraCajon.style.textAlign = "center";
    cabeceraCajon.style.verticalAlign = "middle";
    cabeceraCajon.innerText = cabeceraValor;
    cabeceraFila.appendChild(cabeceraCajon);
    tablaNueva.appendChild(cabeceraFila);
    
    for (let i = 0; i < tabla.rows.length; i++) { // Recorrer las filas de la tabla
      //  for (let j = 0; j < tabla.rows[i].cells.length; j++) { // Recorrer las celdas de cada fila 
            //let valorCelda = tabla.rows[i].cells[j].innerText;  // Obtener el texto de la celda actual 
            let valorCelda = tabla.rows[i].innerText;
            expressIdByCamion.push(parseInt(valorCelda)); 
       // } 
    }

    for (let i = 1; i <= 3; i++) {
        const fila = document.createElement("tr");
        for (let j = 1; j <= 5; j++) {
            const cajon = document.createElement("td");
            const idCajon = (i - 1) * 5 + j; // Calcular el número del cajón
            cajon.setAttribute("id",  idCajon);
            cajon.setAttribute("data-id", idCajon);
            cajon.classList.add("cajon");
            fila.appendChild(cajon);

            cajon.addEventListener("contextmenu", function(event) {
                event.preventDefault();
                asignaIdCelda(cajon, contenidoCelda, expressIdByCamion);
            });

            cajon.addEventListener("dblclick", function(event) {
                limpiaPosicion(cajon, tabla);
            });

            cajon.addEventListener("click", function(event) {
                viewer.IFC.selector.pickIfcItemsByID(0, [parseInt(cajon.textContent)], false);
            });
        }
        tablaNueva.appendChild(fila);
    }
    posicionCamion.appendChild(tablaNueva);
    actualizaCajones(expressIdByCamion);
}

function limpiaPosicion(cajon, tabla){
    contenidoCelda = cajon.textContent;
    precastElements.forEach(function(obj) {
        if (obj.expressID === parseInt(contenidoCelda)) {
            obj.Posicion = "";
        }
    });
    cajon.innerHTML = "";

    const celdas = tabla.getElementsByTagName("td");

    for (let i = 0; i < celdas.length; i++) {
        if (celdas[i].textContent === contenidoCelda) {
            celdas[i].style.background = "";
        }
    }
}

function actualizaCajones(expressIdByCamion) {
    precastElements.forEach(objeto => {
        if (objeto.expressID && objeto.Posicion) {
            const cajon = document.getElementById(objeto.Posicion);
            if (cajon && expressIdByCamion.includes(objeto.expressID)) {
                const valorAnterior = cajon.innerText;
                cajon.innerText = objeto.expressID;
                if (valorAnterior !== "" && valorAnterior !== objeto.expressID) {
                        precastElements.forEach(obj => {  // Recorrer el array precastElements para buscar el objeto que tiene el valor valorAnterior en su propiedad expressID y establecer su propiedad Posicion a ""
                            if (obj.expressID === parseInt(valorAnterior)) {
                                obj.Posicion = "";
                            }
                        });
                }  
            }
        }
    });
}

function asignaIdCelda(cajon, contenidoCelda, expressIdByCamion){
    if (!expressIdByCamion.includes(parseInt(contenidoCelda))) {// El contenidoCelda no está incluido en el array expressIdByCamion
        return;
    }

    let valorExiste = false;
    if (cajon.innerText !== "") {
        valorExiste = true;
    }
    if (ultimoCajonPulsado) {
        ultimoCajonPulsado.innerText = "";
    }
    cajon.innerText = contenidoCelda;
    ultimoCajonPulsado = cajon;

    // Agregar el valor del ID del cajón pulsado al array precstElements
    const posicionCajon = cajon.id;
    for (let i = 0; i < precastElements.length; i++) {
        if (precastElements[i].expressID === parseInt(contenidoCelda)) {
            precastElements[i].Posicion = posicionCajon;
            ultimaCeldaSeleccionada.style.backgroundColor = '#BD9BC2';
            break;
        }
    }
}