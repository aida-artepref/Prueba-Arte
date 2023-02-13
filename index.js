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
}
//Muestra el nombre del archivo abierto
document.getElementById("file-input").addEventListener("change", function() {
  const file = this.files[0];
  document.getElementById("file-name").innerHTML = file.name;
});

GUI.loader.onclick = () => GUI.input.click();  //al hacer clic al boton abre cuadro de dialogo para cargar archivo

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

    const ifcProject = await viewer.IFC.getSpatialStructure(model.modelID); //ifcProyect parametro necesario para obtener los elementos de IFC del modelo
    setIfcPropertiesContent(ifcProject, viewer, model);
    document.getElementById("checktiposIfc").style.display = "block"; //hace visible el divCheck 

    const subset = getWholeSubset(viewer, model, allIDs);
    replaceOriginalModelBySubset(viewer, model, subset); //reemplaza el modelo original por el subconjunto.

    //Carga las propiedades/psets al array
     precastElements.forEach(precast => {
        if (precast.ifcType !='IFCBUILDING'){
             precastProperties(precast, 0, precast.expressID);
        }
     }); 
     
 }

//*********************************************************************************** */
//---------------------Funciones para extraer categorias-------------------------------//
// function getName(category) {
//       const names = Object.keys(categories);
//       console.log(names);
//       return names.find((name) => categories[name] === category);
// }
//   // toma una categoría como entrada y devuelve todos los elementos de esa categoría
// async function getAll(category) {
//     const manager = Loader.ifcManager;
//     return manager.getAllItemsOfType(0, category, false);
// }

// //crear un nuevo subconjunto para cada categoría de elementos en el objeto categories
// async function setupAllCategories() {
//     const allCategories = Object.values(categories);
//     for (let i = 0; i < allCategories.length; i++) {
//       const category = allCategories[i];
//       await setupCategory(category);
//     }
// }

// // // Crea un nuevo subconjunto y configura el checkbox
// async function setupCategory(category) {
//     subsets[category] = await newSubsetOfType(category);
//     setupCheckBox(category);
// }
  
// // // Configura el evento checkbox para ocultar/mostrar elementos
// function setupCheckBox(category) {
//     const name = getName(category);
//     const checkbox = document.getElementById(name);
//     checkbox.addEventListener("change", () => {
//     const subset = subsets[category];
//         if (checkbox.checked) {
//             scene.add(subset);
//             togglePickable(subset, true);
//         } else {
//             subset.removeFromParent();
//             togglePickable(subset, false);
//         }
//         updatePostproduction();
//     });

//     function updatePostproduction() {
//       viewer.context.renderer.postProduction.update();
//   }

// }

// //   // Crea un nuevo subconjunto que contiene todos los elementos de una categoría
// async function newSubsetOfType(category) {
//     const ids = await getAll(category);
//     return Loader.ifcManager.createSubset({
//       modelID: 0,
//       scene,
//       ids,
//       removePrevious: true,
//       customID: category.toString(),
//     });
// }

  //******************************************************************************************************************* */
 /// ---------------estas tres funciones son necesarias para obtener solo las categorias de IFC cargado------------------------
 //-------------extrae todos los tipos de elementos del modelo y los agrupa en un objeto llamado categories.
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
      html += `<input type="checkbox" checked>${uniqueClasses}<br>`;
    });

    // Agrega el evento click a todos los checkbox
    const checkboxes = document.querySelectorAll('.checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('click', function() {
            const category = this.dataset.category;
            const isChecked = this.checked;
            const ids = getIdsForCategory(category, viewer, model);
            if (isChecked) {
                showElements(ids, viewer);
            } else {
                hideElements(ids, viewer);
            }
        });
    });
    return html;
}

function toggleVisibility(category) {
    // Obtener todos los ids de los elementos de la categoría específica
    const ids = getIdsByCategory(category);

    // Obtener el estado actual del checkbox
    const checkbox = document.querySelector(`input[type='checkbox'][value='${category}']`);
    const isChecked = checkbox.checked;

    // Mostrar u ocultar los elementos correspondientes
    if (isChecked) {
        viewer.IFC.loader.ifcManager.addToSubset(0, ids, 'full-model-subset');
    } else {
        viewer.IFC.loader.ifcManager.removeFromSubset(0, ids, 'full-model-subset');
    }
}

function getIdsByCategory(categoryName, ifcProject) {
    let ids = [];
    return getIdsByCategory_base(categoryName, ifcProject, ids);
}

function getIdsByCategory_base(categoryName, ifcProject, ids) {
    const children = ifcProject.children;
    if (children.length === 0) {
        if (ifcProject.type === categoryName) {
            ids.push(ifcProject.object.id);
        }
    } else {
        for (const obj of children) {
            getIdsByCategory_base(categoryName, obj, ids);
        }
    }
    return ids;
}
function hideCategory(categoryName, viewer) {
    const ifcProject = viewer.IFC.getSpatialStructure(model.modelID);
    const ids = getIdsByCategory(categoryName, ifcProject);
    viewer.IFC.loader.ifcManager.removeFromSubset(0, ids, 'full-model-subset');
}

function showCategory(categoryName, viewer) {
    const ifcProject = viewer.IFC.getSpatialStructure(model.modelID);
    const ids = getIdsByCategory(categoryName, ifcProject);
    viewer.IFC.loader.ifcManager.addToSubset(0, ids, 'full-model-subset');
}

function getIdsForCategory(category, model, allIDs) {
    let categoryIDs = [];
    for (let i = 0; i < allIDs.length; i++) {
      let element = model.getObjectById(allIDs[i]);
      if (element.type === category) {
        categoryIDs.push(allIDs[i]);
      }
    }
    return categoryIDs;
  }
  
 ////-----------------------------------------------------------------------------------------------------------------------------------


 // reemplaza cualquier subconjunto anterior con el mismo ID personalizado ('full-model-subset').
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


window.ondblclick = () => hideClickedItem(viewer);
window.oncontextmenu=()=> hideClickedItemBtnDrch(viewer);

window.onkeydown = (event) => {  //cuando se presiona esc, incluye todos los elementos ocultos con el BtnDrch de nuevo al visor, ademas de limpiar arrays donde se almacenan los datos expressId y elemnrosOcultos 
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
}


let numCamion=1;
const nuevoCamionBtn = document.getElementById("nuevoCamion");
nuevoCamionBtn.addEventListener("click", function() {
  numCamion += 1;
});

function hideClickedItem(viewer) {
  const divCargas = document.querySelector('.divCargas');
  divCargas.style.display = 'block'; //hace visible el div de la tabla en HTML
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
//---------------------Elimina por completo un elemneto pulsado con boton derecho
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
    thead.innerHTML = "<tr><th>expressID</th><th>GlobalId</th><th>Camion</th></tr>";
    table.appendChild(thead);
    
    const tbody = document.createElement("tbody");
    for (const id of elementosOcultos) {
        const elemento = precastElements.find(elemento => elemento.expressID === id);
        if (!elemento) {
            throw new Error(`No se encontró el elemento con expressID = ${id}`);
        }
      
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${elemento.expressID}</td><td>${elemento.GlobalId}</td><td>${elemento.Camion}</td>`;
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    itemList.appendChild(table);
}

//devuelve todos los elementos del modelo
function getAllIds(ifcModel) {
    return Array.from(
      new Set(ifcModel.geometry.attributes.expressID.array),
    );
}



// ACCEDER A PROPIEDADES
//al mover el raton por el 3D va preselleccionando los elemnetos que lo componen,
//para darle otro aspecto en **const viewer = new IfcViewerAPI({container, backgroundColor: new Color(255,255,255)}); se puede modificar su aspecto                                           
container.onmousemove = () => viewer.IFC.selector.prePickIfcItem();

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
    const props = await viewer.IFC.getProperties(modelID, precastID, true, true)
    const mats =props.mats;
    const psets =props.psets;
    const type= props.type;
    
    delete props.mats;
    delete props.psets;
    delete props.type;
    
    precast['GlobalId'] = props['GlobalId'].value; //establece propiedad GlobalId en obj precast y le asigna un valor
    
    let properties2= psets[0].HasProperties
   
  //Buscamos dentro de las psest propiedades por su campo nombre y asignamos propiedad al obj precast
    //campo transporte
    let resultTransporte = properties2.find(element => element.Name.value === 'Transporte');
    if (resultTransporte) {
       precast[resultTransporte.Name.value] = resultTransporte.NominalValue.value;
    }
    
    //campo Nombre del objeto--->P, W3, J...
    let resultNombreObjeto = properties2.find(element => element.Name.value=== 'Nombre del objeto');
    if (resultNombreObjeto) {
        precast[resultNombreObjeto.Name.value] = resultNombreObjeto.NominalValue.value;
    }

    let resultCamion = properties2.find(element => element.Name.value.startsWith('Cami'));
    if (resultCamion) {
        precast['Camion'] = resultCamion.NominalValue.value;
    }

    addPropEstructura();
}

// recorre el array precastElement y añade campos de propiedades(con valores vacios) a los objetos que no los tenian
// conseguimos que todos los elementos tengan la misma estructura de propiedades
function addPropEstructura(){
      const propertiesAdd = ['expressID', 'ifcType', 'GlobalId', 'Transporte', 'Camion'];

      for (let i = 0; i < precastElements.length; i++) {
        for (let j = 0; j < propertiesAdd.length; j++) {
          if (!precastElements[i].hasOwnProperty(propertiesAdd[j])) {
            precastElements[i][propertiesAdd[j]] = '';
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
    
    for(let propertyName in props){
        const propValue=props[propertyName];
        createPropertyEntry(propertyName, propValue);
    }

    // console.log(props['GlobalId'].value);  // accede al valor almacenado en globalId--->3VX9Eyxg96qxDKLIczH0KT
    // console.log(props['Name'].value); // accede al valor almacenado en Name ---> Panel
    // console.log(psets);
  
    // console.log(psets[0].HasProperties);

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

            // if (precast[ekey]==undefined){
            //     csvContent += ','
            // } else {
            //     csvContent += precast[ekey] + ','; 
            // }
        });

        csvContent += '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,'});
    const objUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', objUrl);
    link.setAttribute('download', 'File.csv');
    link.textContent = 'Click to Download';
    document.querySelector(".toolbar").append(link);
    
}
