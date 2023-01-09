import { Color, Loader,MeshBasicMaterial,
    LineBasicMaterial } from 'three';
import{ IfcViewerAPI } from 'web-ifc-viewer';

 
const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({container, backgroundColor: new Color(255,255,255)});
viewer.clipper.active = true;
viewer.grid.setGrid();
viewer.axes.setAxes();

viewer.context.renderer.usePostproduction = true;

//
const GUI={
    input: document.getElementById("file-input"),
    loader: document.getElementById("loader-button"),
    props: document.getElementById("property-menu"),
    tree: document.getElementById("tree-root"),
    
}

GUI.loader.onclick = () => GUI.input.click();  //al hacer clic al boton abre cuadro de dialogo para cargar archivo

let allIDs;
//--------------HIDEN
let enableHide = false;
//const hideButton = document.getElementById("hidebutton");
const toolbar = document.getElementById("toolbar");
const hideButton= document.getElementById("hidebutton");







//cada vez elemento imput cambia, genera uURL y lo pasa a la lib IFC
GUI.input.onchange = async (event) => {
    const file=event.target.files[0];
    const url=URL.createObjectURL(file);
    loadModel(url);
}



//si el Ifc ya esta cargado por defecto y no selecciona atraves del input
async function loadModel(url){
   const model= await viewer.IFC.loadIfcUrl(url); 
   createTreeMenu(model.modelID);
   tree= await viewer.IFC.getSpatialStructure(model.modelID);
   allIDs = getAllIds(model);
   console.log(allIDs);
   
   //console.log(tree);
   //carga el modelo indicado y nos da el arbol del entidades
}


 

//devuelve todos los elementos del modelo
function getAllIds(ifcModel) {
	return Array.from(
		new Set(ifcModel.geometry.attributes.expressID.array),
	);
}

//#region HIDE
//2. Hide geometry


container.ondblclick=() =>{
   const result = viewer.context.castRayIfc();
	if (!result) return;
	const manager = viewer.IFC.loader.ifcManager;
	const id = manager.getExpressId(result.object.geometry, result.faceIndex);
	viewer.IFC.loader.ifcManager.removeFromSubset(
		0,
		[id],
		'full-model-subset',
	);

}





// ACCEDER A PROPIEDADES
//al mover el raton por el 3D va preselleccionando los elemnetos que lo componen,
//para darle otro aspecto en **const viewer = new IfcViewerAPI({container, backgroundColor: new Color(255,255,255)}); se puede modificar su aspecto                                           
container.onmousemove = () => viewer.IFC.selector.prePickIfcItem();

//onclick y selecciona elemento
container.onclick = async()=>{
    const found=await viewer.IFC.selector.pickIfcItem(true);
    if(found === null || found === undefined) return; //elemnto no seleccionado no hace nada
    //y para acceder a propiedades de ese elemnto
    const props = await viewer.IFC.getProperties (found.modelID, found.id, true);
    console.log(props);
    updatePropertyMenu(props);
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
}

//para construir un menu de propiedades 
function createPropertyEntry(key,propertyValue){
    const root=document.createElement ('div');  //crea elemento div contenedor
    root.classList.add('property-root');// y este div le asignamos la clase

    if (propertyValue ===null || propertyValue === undefined) propertyValue = "Vacio";
    else if (propertyValue.value) propertyValue=propertyValue.value

    //nombre de la propiedad e introducido dentro de property-root
    const keyElement=document.createElement ('div');  //crea elemento div
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
    //console.log(children);
    if(children.length === 0){
        createSimpleChild(parent, node);
        return;    
    }
    const nodeElement =createNestedChildren(parent,node);
    children.forEach(child => {
        constructTreeMenuNode (nodeElement, child);
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
        const props = await viewer.IFC.getProperties (0, node.expressID, true);
        updatePropertyMenu(props);
     }
}

//+++++++++convertir los nodos en inf-texto que vemos en pantalla
function nodeToString(node){
    return `${node.type} - ${node.expressID}`;
}
