import { Color, Loader, MeshBasicMaterial, LineBasicMaterial, MeshStandardMaterial } from 'three';
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


    cargaGlobalIdenPrecast();
    crearBotonPrecas();  
    
    addCheckboxListeners() ;

    verNumPrecast();


}

function verNumPrecast(){
    var divNumPrecast = document.createElement("div"); // se crea el div que va  a mostrar la info del num de elementos en precastElements
    divNumPrecast.innerHTML =  precastElements.length; //muestra cantidad en HTML
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
    btnCreaPrecast.textContent = "Pulsa";// Agrega el texto que deseas que aparezca en el botón

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
                console.log("Has pulsado el botón : " + classValue);
                //notaElementos(precastElements, viewer);
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
        html += `<button class="btn-notacion" data-id="${uniqueClass}"> </button>`;
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
let numCamion=1;
document.getElementById("numCamion").innerHTML = numCamion;
const nuevoCamionBtn = document.getElementById("nuevoCamion");
nuevoCamionBtn.addEventListener("click", function() {
    numCamion =parseInt(document.getElementById("numCamion").innerHTML) + 1;  
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
    if (!result) return;
    const manager = viewer.IFC.loader.ifcManager;
    const id = manager.getExpressId(result.object.geometry, result.faceIndex);
    

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
                    actValorCamion.Camion = numCamion;
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
             break; // Terminar el bucle una vez que se encuentra el primer objeto con el expressID correspondiente
        }
    
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
        tr.classList.add("item-list-elemento");
        tr.innerHTML = `<td>${elemento.expressID}</td><td>${elemento.GlobalId}</td><td>${elemento.Camion}</td><td>${(elemento.Volumen_real)}</td>`;
        //tr.innerHTML = `<td>${elemento.expressID}</td><td>${elemento.GlobalId}</td><td>${elemento.Camion}</td><td>${elemento.Volumen_real.toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 9 })}</td>`;
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    itemList.appendChild(table);

    $(table).tablesorter();//para ordenar la tabla si pulsamos en sus encabezados

}
// **************************************************
//evento que crea boton reduceDiv cuando se genera la tabla
//y evento para expandir la tabla de cargas
const reduceDivBtn = document.createElement("button");
reduceDivBtn.id = "reduceDivBtn";
reduceDivBtn.classList.add("cargas-btn");
divCargas.insertBefore(reduceDivBtn, divCargas.childNodes[0]);

reduceDivBtn.addEventListener("click", () => {
    divCargas.style.width = "30px";
    reduceDivBtn.style.display = "none";
    const expandDivBtn = document.createElement("button");

    expandDivBtn.innerHTML = '<span style="display: inline-block; vertical-align: middle; width: 30px; line-height: 30px;"></span>';

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
    //viewer.IFC.selector.unpickIfcItems();
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
    
    // precast['GlobalId'] = props['GlobalId'].value; //establece propiedad GlobalId en obj precast y le asigna un valor
    // precast
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
    if (!exists && node.type !== "IFCBUILDING" && node.type !== "IFCSITE") {
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
            let numLinesCsv = lines.length - 1;
            console.log(numObjectosPre);
            console.log(numLinesCsv);

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
    })
    .catch(error => console.error(error));
});




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
            // Agregamos el valor al array elemenOcultos
            elementosOcultos.push(expressIDoculto);
        }
    }
    
    //camionesUnicos es un array numerico con el valor de los diferentes camiones agrupados
    const camionesUnicos = obtenerValorCamion(precastElements);
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
function generaBotonesNumCamion(camionesUnicos) {
    viewer.IFC.selector.unpickIfcItems();
    const btnNumCamiones = document.getElementById("divNumCamiones");
    let botonesActivos = 0; // contador de botones activos

    let maximo = Math.max(...camionesUnicos.filter(num => !isNaN(num))); // filtramos los valores que no son NaN
    document.getElementById("numCamion").innerText = maximo +1;
    numCamion=maximo+1;

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
            //botón activo, elimina los elementos del visor y desactiva el botón
                viewer.IFC.selector.unpickIfcItems();
                hideAllItems(viewer, expressIDs);
                btn.classList.remove("active");
                btn.style.justifyContent = "center";
                btn.style.color = "";
                eliminarTabla(camion);
                botonesActivos--;
            } else {
                // botón no activo, muestra los elementos en tabla en el visor y activa el botón
                viewer.IFC.selector.unpickIfcItems();
                hideAllItems(viewer, allIDs);
                showAllItems(viewer, expressIDs);
                btn.classList.add("active");
                btn.style.color = "red";
                generarTabla(expressIDs, camion);
                botonesActivos++;
            }
            if (botonesActivos === 0) { // si las cargas están desactivados muestra lementos que faltan por transportar
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
           // limpiarDiv();
            hideAllItems(viewer, idsTotal);
            showAllItems(viewer, allIDs);
            btnCero.classList.remove("active");
            btnCero.style.justifyContent = "center";
            btnCero.style.color = "";
        } else {
            console.log("EN BOTON 0");
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

    // Filtrar los elementos cuyo valor en su propiedad sea distinto a 0 o a undefined
    const filteredElements = precastElements.filter((element) => {
        const { Camion } = element;
        return Camion !== "" && Camion !== "undefined" && Camion !== "0";
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

function generarTabla(expressIDs, camion) {
    var divTabla = document.getElementById("datosCamiones");
    const tabla = document.createElement('table');

    //cabecera de la tabla
    const cabecera = document.createElement('thead');
    const filaCabecera = document.createElement('tr');
    const thElemento = document.createElement('th');
    thElemento.textContent = camion;
    filaCabecera.appendChild(thElemento);
    cabecera.appendChild(filaCabecera);
    tabla.appendChild(cabecera);

    //cuerpo de la tabla
    const cuerpo = document.createElement('tbody');
    expressIDs.forEach(id => {
        const fila = document.createElement('tr');
        const tdElemento = document.createElement('td');
        tdElemento.textContent = id;
        fila.appendChild(tdElemento);
        cuerpo.appendChild(fila);
    });
    tabla.appendChild(cuerpo);

    // contenedor para la tabla y agregar estilos CSS
    var contenedorTabla = document.createElement("div");
    contenedorTabla.style.margin="20px";
    contenedorTabla.style.display = "inline-block";
    contenedorTabla.style.maxWidth = "50%";
    contenedorTabla.appendChild(tabla);
// Establecer los estilos de la tabla y agregarla al div
tabla.style.border = "1px solid black";

tabla.style.verticalAlign = "top";
divTabla.style.display = "flex";
divTabla.style.flexDirection = "row";
divTabla.appendChild(tabla);

    divTabla.appendChild(contenedorTabla);
}

function eliminarTabla(camion) {
    var divTabla = document.getElementById("datosCamiones");
    var thElements = divTabla.getElementsByTagName("th");
    
    for (var i = 0; i < thElements.length; i++) {
        if (thElements[i].textContent === camion.toString()) {
            var tablaAEliminar = thElements[i].parentNode.parentNode.parentNode;
            tablaAEliminar.parentNode.removeChild(tablaAEliminar);
        break;
        }
    }
}


