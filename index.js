import { Color, Loader,MeshBasicMaterial,
    LineBasicMaterial } from 'three';
import{ IfcViewerAPI } from 'web-ifc-viewer';
import { IfcElementQuantity } from 'web-ifc';

 
const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({container, backgroundColor: new Color(255,255,255)});

viewer.clipper.active = true;
viewer.grid.setGrid();
viewer.axes.setAxes();

viewer.context.renderer.usePostproduction = true;

const GUI={
    input: document.getElementById("file-input"),
    loader: document.getElementById("loader-button"),
    props: document.getElementById("property-menu"),
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

const categories = {};//genera objeto con las categorias extraidas del IFC

const toolbar = document.getElementById("toolbar");
const hideButton= document.getElementById("hidebutton");


//cada vez elemento imput cambia, genera uURL y lo pasa a la lib IFC
GUI.input.onchange = async (event) => {
    const file=event.target.files[0];
    const url=URL.createObjectURL(file);
    loadModel(url); 
}


let model;
//si el Ifc ya esta cargado por defecto y no selecciona atraves del input
async function loadModel(url){
    model= await viewer.IFC.loadIfcUrl(url); 
    // let modelID= model.modelID;
    // console.log(typeof(modelID));
    createTreeMenu(model.modelID);
    tree= await viewer.IFC.getSpatialStructure(model.modelID);
    allIDs = getAllIds(model); 
    idsTotal=getAllIds(model); 
    const ifcProject = await viewer.IFC.getSpatialStructure(model.modelID); //ifcProyect parametro necesario para obtener los elementos de IFC del modelo
    setIfcPropertiesContent(ifcProject, viewer, model);
    document.getElementById("checktiposIfc").style.display = "block"; //hace visible el divCheck 

    let subset = getWholeSubset(viewer, model, allIDs);
    replaceOriginalModelBySubset(viewer, model, subset); //reemplaza el modelo original por el subconjunto.
   
    crearBotonPrecas();   
}

function crearBotonPrecas(){
    // Crea un nuevo botón
    var btnCreaPrecast = document.createElement("button");
    btnCreaPrecast.classList.add("button");
    // Agrega un ID y una clase al nuevo botón
    btnCreaPrecast.id = "btnCreaPrecast";
    btnCreaPrecast.className

    // Agrega el texto que deseas que aparezca en el botón
    btnCreaPrecast.textContent = "Pulsa";

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
  //******************************************************************************************************************* */
 /// ---------------estas tres funciones son necesarias para obtener solo las categorias de IFC cargado------------------------
 //-------------extrae todos los tipos de elementos del modelo y los agrupa en un objeto llamado categorias.
function setIfcPropertiesContent(ifcProject, viewer, model) {
    const ifcClass = getIfcClass(ifcProject); //obtiene todos los Tipos de ifc de cada elemento que carga en el visor, ej: si hay 80 elemen obtiene 80 tipos 
    let uniqueClasses = [...new Set(ifcClass)];  // agrupa los tipos de elementos 
    generateCheckboxes(uniqueClasses)
    document.getElementById('checktiposIfc').innerHTML = generateCheckboxes(uniqueClasses);

    for (let i = 0; i < uniqueClasses.length; i++) {   //genero el obj categories 
        categories[uniqueClasses[i]] = {};
     }
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

// Crea automaticamente los check con las categorias del IFC cargado
function generateCheckboxes(uniqueClasses) {
    let html = '';
  
    uniqueClasses.forEach(function(uniqueClasses) {
      html += `<input type="checkbox" checked>${uniqueClasses} <br>`;
    });
   
    return html;
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
}hideClickedItem

//boton de HTML que pulsandolo crea un nuevo camion
let numCamion=1;
document.getElementById("numCamion").innerHTML = numCamion;
const nuevoCamionBtn = document.getElementById("nuevoCamion");
nuevoCamionBtn.addEventListener("click", function() {
    numCamion += 1;
    document.getElementById("numCamion").innerHTML = numCamion;
});
//evento teclaC añade un nuevo camion
document.addEventListener("keydown", function(event) {
    if (event.key === "c" || event.key === "C") {
        numCamion += 1;
        document.getElementById("numCamion").innerHTML = numCamion;
    }
});


function hideClickedItem(viewer) {
  const divCargas = document.querySelector('.divCargas');
  divCargas.style.display = 'block'; //hace visible el div de la tabla en HTML
    const result = viewer.context.castRayIfc();
    console.log(result);
    if (!result) return;
    const manager = viewer.IFC.loader.ifcManager;
    const id = manager.getExpressId(result.object.geometry, result.faceIndex);
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
          actValorCamion.Camion = numCamion;
      }
    listarOcultos(elementosOcultos);

    //indexOf se utiliza para encontrar el índice del elemento que quieres eliminar.
    // Si el elemento no se encuentra en el array, indexOf devuelve -1. Por lo tanto, antes de llamar a splice, debes verificar que el elemento exista en el array.
    let indexToRemove = allIDs.indexOf(id);
    if (indexToRemove !== -1) {
        allIDs.splice(indexToRemove, 1);
    }   
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
  const actValorCamion = precastElements.find(element => element.expressID === (parseInt(elementoEliminadoTabla)));
      if (actValorCamion) {
          actValorCamion.Camion = "";
      }
      
});


//muestra en HTML a través de una tabla los elemntos no visibles en visor
async function listarOcultos(elementosOcultos) {
    const itemList = document.querySelector(".item-list-elementos-cargados");
    itemList.innerHTML = "";

    const table = document.createElement("table");
    table.classList.add("table");
    
    const thead = document.createElement("thead");
    thead.innerHTML = "<tr><th>expressID</th><th>GlobalId</th><th>Camion</th><th>Volumen</th></tr>";
    table.appendChild(thead);
    
    const tbody = document.createElement("tbody");
    
    for (let i = elementosOcultos.length - 1; i >= 0; i--) {  //Muestra los elementos en orden inverso
        const id = elementosOcultos[i];
        const elemento = precastElements.find(elemento => elemento.expressID === id);
        if (!elemento) {
            throw new Error(`No se encontró el elemento con expressID = ${id}`);
        }
      
        const tr = document.createElement("tr");
        //tr.innerHTML = `<td>${elemento.expressID}</td><td>${elemento.GlobalId}</td><td>${elemento.Camion}</td><td>${(elemento.Volumen_real)*2.5}</td>`;
        tr.innerHTML = `<td>${elemento.expressID}</td><td>${elemento.GlobalId}</td><td>${elemento.Camion}</td><td>${elemento.Volumen_real.toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 9 })}</td>`;

        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    itemList.appendChild(table);
}

//devuelve todos los ID de los elementos del modelo
function getAllIds(ifcModel) {
    return Array.from(
      new Set(ifcModel.geometry.attributes.expressID.array),
    );
}



// ACCEDER A PROPIEDADES
//al mover el raton por el 3D, va preseleccionando los elemnetos que lo componen,
                                      
container.onmousemove = () => viewer.IFC.selector.prePickIfcItem();
//para darle otro aspecto en **const viewer = new IfcViewerAPI({container, backgroundColor: new Color(255,255,255)}); se puede modificar su aspecto     
let globalIds=[];
let globalId;
//onclick y selecciona elemento
container.onclick = async()=>{
    const found=await viewer.IFC.selector.pickIfcItem(false);
    if(found === null || found === undefined) return; //elemento no seleccionado no hace nada
    //y para acceder a propiedades de ese elemento, con doble true es recursivo y arrastra todas las props->psets incluidas
    const props = await viewer.IFC.getProperties (found.modelID, found.id, true,true);
    globalId=props['GlobalId'].value;
    updatePropertyMenu(props);  
}

async function precastProperties(precast,modelID, precastID){
    const props = await viewer.IFC.getProperties(modelID, precastID, true, true);

    const mats =props.mats;
    const psets =props.psets;
    const type= props.type;
    
    delete props.mats;
    delete props.psets;
    delete props.type;
    
    precast['GlobalId'] = props['GlobalId'].value; //establece propiedad GlobalId en obj precast y le asigna un valor
    precast
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
   // addPropEstructura();
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
    
    for(let propertyName in props){
        const propValue=props[propertyName];
        createPropertyEntry(propertyName, propValue);
    }

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
    // console.log(properties2[0].Name.value);
    // console.log(properties2[0].NominalValue.value);

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
    document.getElementById("property-menu").innerHTML = "";
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
    if (!exists) {uniqueTypes.push(node.type)};
    
    precastElements.push({expressID: node.expressID, ifcType: node.type})
    
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
        this.parentNode.removeChild(this); // Eliminar el enlace del DOM
      });
    
}


GUI.importer.addEventListener("change", function(e) {
    e.preventDefault();
    const input = e.target.files[0];
    const reader = new FileReader();
    let headers = [];

    const readCsvFile = new Promise((resolve, reject) => {
        reader.onload = function (e) {
            const text = e.target.result;
            let lines = text.split(/[\r\n]+/g);
            lines.forEach(line => {
                if (headers.length===0){
                    headers = line.split(',');
                } else {
                    let mline = line.split(',');
                    if(!mline[0]==''){
                        let dato = precastElements.find(dato => dato[headers[0]] === parseInt(mline[0]));
                        for(let i=1; i<headers.length; i++){
                            if(mline[i]===undefined){
                                dato[headers[i]]='';
                            } else {
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
        // Aquí se ejecuta el código que utiliza los datos actualizados
        console.log(precastElements);
        mostrarElementosRestantes();
    })
    .catch(error => console.error(error));
    
}
);

// document.addEventListener('DOMContentLoaded', () => {
//     mostrarElementosRestantes();
// });

async function mostrarElementosRestantes(){
    
    allIDs.splice(0, allIDs.length);
 
    for (let i = 0; i < precastElements.length; i++) {
        let valorCamion = precastElements[i].Camion;
    
        // si la propiedad Camion del objeto actual está vacía
        if (precastElements[i].Camion === undefined || precastElements[i].Camion ==='' ) {
          // variable expressID = el valor de la propiedad expressID de ese objeto y lo convertimos a número
          const expressID = parseInt(precastElements[i].expressID);
          console.log(expressID +" elemento VISIBLE, no está en transporte");
          // Agregamos el valor al array allIDs
          allIDs.push(expressID);
        }else{
            const expressIDoculto = parseInt(precastElements[i].expressID);
             // Agregamos el valor al array elemenOcultos
             elementosOcultos.push(expressIDoculto);
             //console.log(expressIDoculto+ "esta en camion "+precastElements[i].Camion);

        }
    }
    
    //camionesUnicos es un array numerico con el valor de los diferentes camiones agrupados
    const camionesUnicos = obtenerValorCamion(precastElements);

    //genera los botones en HTML con los diferentes camiones cargados
    generaBotonesNumCamion(camionesUnicos);

    console.log(camionesUnicos);
    console.log(camionesUnicos.length);


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
      valoresCamion.add(camion);
    });
  
    return Array.from(valoresCamion);
  }
  

function generaBotonesNumCamion(camionesUnicos) {

    camionesUnicos.sort((a, b) => a - b); // ordena los elementos de menor a mayor
    const btnNumCamiones = document.getElementById("btnNumCamiones");
   
    camionesUnicos.forEach(function(camion) {
        const btn = document.createElement("button");
        btn.textContent = camion;
        btnNumCamiones.appendChild(btn);


        btn.addEventListener("click", function() {
            let expressIDs = [];
            precastElements.forEach(function(precastElement) {
                if (parseInt(precastElement.Camion) === camion) {
                    expressIDs.push(precastElement.expressID);
                }
            });
            // Aquí puedes colocar la acción que deseas realizar cuando se haga clic en el botón
            console.log("Hiciste clic en el camión " + camion +" con los elementos: "+expressIDs);
            showAllItems(viewer, expressIDs);
        });
        btnNumCamiones.appendChild(btn);
    });

    btnNumCamiones.style.height = "auto";

}








