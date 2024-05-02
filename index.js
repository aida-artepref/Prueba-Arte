import { Color, Loader, MeshBasicMaterial, BoxHelper, WebGLRenderer, Vector3, MeshDepthMaterial, LineBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, BackSide, MeshPhongMaterial,MultiMaterial, EdgesGeometry, Mesh, BufferGeometry, MeshLambertMaterial} from 'three';
import{ IfcViewerAPI } from 'web-ifc-viewer';
import { IFCELEMENTASSEMBLY, IfcElementQuantity } from 'web-ifc';
import { NavCube } from './NavCube/NavCube.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { IFCBUILDINGSTOREY } from "web-ifc";
import { SelectionWindowMode } from 'web-ifc-viewer/dist/components/selection/selection-window.js';
import { SelectionBox } from 'three/examples/jsm/interactive/SelectionBox.js';
import { SelectionHelper } from 'three/examples/jsm/interactive/SelectionHelper.js';

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs,  addDoc, doc, setDoc, query, updateDoc, where, runTransaction, getDoc  } from "firebase/firestore";

//let rutaServidor="10.20.20.85"
let rutaServidor="10.20.20.52"

//CONEXION A FIREBASE *************************************

// const firebaseConfig = {
//     apiKey: "AIzaSyDTlGsBq7VwlM3SXw2woBBqHsasVjXQgrc",
//     authDomain: "cargas-917bc.firebaseapp.com",
//     projectId: "cargas-917bc",
//     storageBucket: "cargas-917bc.appspot.com",
//     messagingSenderId: "996650908621",
//     appId: "1:996650908621:web:b550fd82697fc26933a284"
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app); // Obtén una referencia a la base de datos Firestore

// async function insertaModeloFire() {
//     try {
//         const refColeccion = collection(db, projectName);
//         const consulta = query(refColeccion);
//         await coleccionExistente(refColeccion, precastElements);
//         //descargarDatosFirestore(refColeccion)
//     } catch (error) {
//         console.error('Error al agregar los documentos:', error);
//     }  
// }

// async function coleccionExistente(refColeccion, precastElements) {
//     const querySnapshot = await getDocs(refColeccion); // Obtener una instantánea de la colección
//     const cantidadDocsExistente = querySnapshot.size;
//     const documentosExistentes = {};

//     querySnapshot.forEach(doc => {
//         documentosExistentes[doc.data().GlobalId] = doc.data();
//     });

//     const documentosFaltantes = [];
//     const documentosAgregados = [];

//     if (cantidadDocsExistente > 0) {
//         precastElements.forEach(matchingObject => {
//             const existingDoc = documentosExistentes[matchingObject.GlobalId];

//             if (!existingDoc) {
//                 console.log('Documento faltante:', matchingObject.GlobalId);
//                 documentosFaltantes.push(matchingObject);
//             } else {
//                 Object.assign(matchingObject, existingDoc);
//             }
//         });
//         for (const docId in documentosExistentes) {
//             if (!precastElements.some(obj => obj.GlobalId === docId)) {
//                 documentosAgregados.push(documentosExistentes[docId]);
//             }
//         }
//         if (documentosFaltantes.length === 0 && documentosAgregados.length === 0) {
//             console.log('La colección tiene los mismos documentos y actualiza precastElements');
//         } else {
//             console.log('La colección tiene diferencias en documentos o campos.');
//             if (documentosFaltantes.length > 0) {
//                 console.log('Documentos faltantes:', documentosFaltantes);
//             }
//             if (documentosAgregados.length > 0) {
//                 console.log('Documentos agregados:', documentosAgregados);
//             }
//         }
//         mostrarElementosRestantes();
//         clasificarPorTipoTransporte();
//         actualizaDesplegables();
//         nuevoCamionEstructuraBtn.click();
//     } else {
//         // Si la colección no existe en Firebase, crea la colección y añade los documentos
//         console.log('La colección está vacía. Agregando documentos...');
//         await agregarDocumentosAColeccion(refColeccion, precastElements);
//     }
// }

// async function agregarDocumentosAColeccion(refColeccion, precastElements) {
//     try {
//         const existingDocsQuery = query(refColeccion);
//         const existingDocsSnapshot = await getDocs(existingDocsQuery);

//         const existingDocIds = new Set();
//         existingDocsSnapshot.forEach((docSnapshot) => {
//             existingDocIds.add(docSnapshot.id);
//         });

//         const transactionOperations = [];
//         let documentosAgregados = 0;

//         precastElements.forEach((objeto) => {
//             const globalId = objeto.GlobalId;

//             if (!existingDocIds.has(globalId)) {
//                 const refDocumento = doc(refColeccion, globalId);
//                 transactionOperations.push(setDoc(refDocumento, objeto));
//                 //console.log('Documento agregado:', objeto);
//                 existingDocIds.add(globalId); // Agregar el nuevo ID a la lista de existentes
//                 documentosAgregados++;
//             } else {
//                 console.log('El documento ya existe:', objeto);
//             }
//         });

//         // if (transactionOperations.length > 0) {
//         //     await runTransaction(refColeccion.firestore, async (transaction) => {
//         //         transactionOperations.forEach((operation) => {
//         //             operation(transaction);
//         //         });
//         //     });
//         // }
//         console.log(`Total de documentos agregados a la colección ${refColeccion.id}:`, documentosAgregados);

//     } catch (error) {
//         console.error('Error al agregar los documentos:', error);
//     }
// }

// async function descargarDatosFirestore(refColeccion) {
//     try {
//         const querySnapshot = await getDocs(refColeccion);
//         const data = [];

//         querySnapshot.forEach((doc) => {
//             data.push(doc.data());
//         });

//         const jsonData = JSON.stringify(data, null, 2);

//         const blob = new Blob([jsonData], { type: 'application/json' });
//         const link = document.createElement('a');
//         link.href = URL.createObjectURL(blob);
//         link.download = 'datos_firestore.json';
//         link.click();

//         console.log('Datos de Firestore descargados y guardados en datos_firestore.json');
//     } catch (error) {
//         console.error('Error al descargar datos de Firestore:', error);
//     }
// }

// async function actualizaFireExpress(expressId) {

//     // obj axiliar para almacenar el resultado
//     let objetoAux = null;

//     for (const objeto of precastElements) {
//         if (objeto.expressID === expressId) {
//             objetoAux = objeto; // almacena el objeto (pieza que cambia sus propiedades) encontrado en objetoAux
//             break; 
//         }
//     }

//     if (objetoAux) {
//         try {
//             const docRef = doc(db, projectName, objetoAux.GlobalId);
//             // Obtener el documento actual
//             const docSnapshot = await getDoc(docRef);

//             if (docSnapshot.exists()) {
//                 const currentData = docSnapshot.data();  // obtiene los datos actuales del documento
//                 const newData = { ...currentData, ...objetoAux };// conbina los datos actuales con los nuevos valores de objetoAux
//               // Actualizar el documento con los nuevos datos
//                 await setDoc(docRef, newData);
//                // console.log("Documento actualizado con éxito:", docSnapshot.id);
//             } else {
//                 console.log("Documento no encontrado en la colección.");
//             }
//         } catch (error) {
//             console.error("Error al actualizar el documento:", error);
//         }
//     } else {
//         console.log("Objeto no encontrado en el array precastElements.");
//     }
// }
// *********************************************************** 


const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({container, backgroundColor: new Color("#E8E8E8")});

const scene = viewer.context.scene.scene;
const renderer=viewer.context.renderer.renderer;

viewer.clipper.active = true;
// viewer.grid.setGrid(100,100);
// viewer.axes.setAxes();
viewer.context.renderer.usePostproduction = true;
viewer.IFC.selector.defSelectMat.color = new Color(127, 255, 0);


document.addEventListener("keydown", function(event) {
    if (event.keyCode === 116) { // keyCode 116 es la tecla F5
      event.preventDefault(); // evita que se procese 
    }
});


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

async function loadModel(url) {
    model = await viewer.IFC.loadIfcUrl(url);
    getPlantas(model);
    //viewer.shadowDropper.renderShadow(model.modelID);
    viewer.context.renderer.usePostproduction.active=true;
    createTreeMenu(model.modelID);
    tree= await viewer.IFC.getSpatialStructure(model.modelID);
    allIDs = getAllIds(model); 
    idsTotal=getAllIds(model); 
    await obtieneNameProject(url);
    
    // const ifcProject = await viewer.IFC.getSpatialStructure(model.modelID); //ifcProyect parametro necesario para obtener los elementos de IFC del modelo
    document.getElementById("checktiposIfc").style.display = "block"; //hace visible el divCheck 
    let subset = getWholeSubset(viewer, model, allIDs);
    replaceOriginalModelBySubset(viewer, model, subset);
    viewer.context.fitToFrame();
    await cargaGlobalIdenPrecast();
    await  crearBotonPrecas(); 
    const divCargas = document.querySelector('.divCargas');
    divCargas.style.display = "block";
    
    buscaCentroModelo();
    buscaJSONmodelo()
    .then(() => {
        obtenerIdentificadores();
        
        //atributoARTPieza(Transporte);
        
    })
    .catch(error => {
        console.error('Error en buscaJSONmodelo:', error);
        // container.style.backgroundColor = "#FF0000";
        // container.style.height = "100%";
    });
    
}
let idAlveolar;
let idEstruCerra;

async function obtenerIdentificadores() {
    const url = `http://${rutaServidor}:8000/identificadores/${encodeURIComponent(nombreObra)}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const idTTE = data.find(item => item.tabla === 'tte');
        if (idTTE) {
            idEstruCerra = idTTE.identificador;
        } else {console.error('No se encontró el identificador de tte en la respuesta de la API.');}
        const idAlveolarItem = data.find(item => item.tabla === 'alv');
        if (idAlveolarItem) {
            idAlveolar = idAlveolarItem.identificador;
        } //else {console.log('La tabla "alv" no está presente en la respuesta de la API.');}
        console.log("ID estructura y cerramiento: "+idEstruCerra);
        console.log("ID alveolar: "+idAlveolar);
    } catch (error) {
        console.error('Error al obtener identificadores:', error);
    }
}

function buscaCentroModelo(){
    // Obtener el centro del edificio
    boxHelper = new BoxHelper(model, 0xff0000);
    geometry = boxHelper.geometry;
    centro = geometry.boundingSphere.center;
}

function atributoARTPieza(transporteArray) {
    if(transporteArray){
        if (transporteArray.length > 0  ) {
            Transporte.forEach(objeto => {
                // Extrae la parte antes del guion y las cifras después del guion
            // const match = objeto.ART_Pieza.match(/^([A-Z]+)(\d{3})-(\d{3})$/);
                const match = objeto.ART_Pieza.match(/^([A-Z]{1,2})(\d{3})-(\d{3})$/);
                if (match) {
                // Obtiene la letra y las cifras
                    const [, letra, cifras1] = match;
                // Procesa las cifras según las reglas especificadas
                    const cifrasProcesadas = cifras1.replace(/^0+/, '') || '0';
                // Construye el nuevo valor y agrégalo al objeto
                    objeto.ART_PiezaT = letra + cifrasProcesadas;
                } else {
                    const partes = objeto.ART_Pieza.split('-');
                    objeto.ART_PiezaT = partes[0];
                }
            });
            ordenarValoreArrayTrans(Transporte)  
        } else {
        console.log('El array de transporte está vacío.');
        }
    }
}

function ordenarValoreArrayTrans(transporteArray) {
    // Verificar si el array tiene al menos un objeto
    if (transporteArray.length > 0) {
        transporteArray.forEach(objeto => {
            const temp = objeto.ART_Pieza;
            objeto.ART_Pieza = objeto.ART_PiezaT;
            objeto.ART_PiezaT = temp;
        });
    } else {
        console.log('El array de transporte está vacío.');
    }
}



let nombreObra='';
let nombreObraSelect='';
let Transporte;
let Produccion;
function buscaJSONmodelo() {
    return new Promise((resolve, reject) => {
        const requestURL = `http://${rutaServidor}:8000/transporte/` + encodeURIComponent(projectName);
        const requestURLPro = `http://${rutaServidor}:8000/produccion/` + encodeURIComponent(projectName);

        function hacerPeticionBDCargas(url, callback) {
            const request = new XMLHttpRequest();
            request.open("GET", url);
            request.responseType = "json";
            request.onload = function () {
                if (request.status === 200) {
                    const data = request.response;
                    callback(data);
                    nombreObra=projectName;
                    //console.log("NOMBRE DE LA OBRA CUANDO cargamodelo: "+nombreObra)
                    if (nombreObraSelect!=''){
                        nombreObra=nombreObraSelect;
                        //console.log("NOMBRE DE LA OBRA despues de selct: "+nombreObra)
                    }
                } else {
                    alert("NO HAY RESPUESTA DEL SERVIDOR");
                    reject("Error en la conexión a la base de datos");
                }
            };
            request.onerror = function () {
                alert("NO HAY CONEXIÓN A BD");
                container.style.backgroundColor = "#FF0000";
                container.style.height = "100%";
                reject("Error en la conexión a la base de datos");
            };
            request.send();
        }
        let selectedObra;
        function hacerPeticionBDProduccion() {
            hacerPeticionBDCargas(requestURLPro, function (produccionData) {
                if (produccionData.length === 0) {
                    // Si no hay datos en array Produccion, debes buscar el nombre de la obra a través de la lista
                    // const obrasList = document.getElementById("obrasList");
                    // selectedObra = obrasList.value;
                    const nuevaRequestURL = `http://${rutaServidor}:8000/produccion/` + encodeURIComponent(selectedObra);
        
                    hacerPeticionBDCargas(nuevaRequestURL, function (nuevaProduccionData) {
                        Produccion = nuevaProduccionData;
                        closeModal();
                        resolve();
                    }, function (error) {
                        console.error('Error en la segunda solicitud:', error);
                        alert('Error en la segunda solicitud.');
                        reject(error);
                    });
                } else {
                    Produccion = produccionData;
                    resolve();
                }
            }, function (error) {
                console.error('Error en la primera solicitud:', error);
                alert('Error en la primera solicitud.');
                reject(error);
            });
        }
    
        function ordenarListaAlfabeticamente() {
            const opciones = Array.from(obrasList.options);
            opciones.sort((a, b) => a.text.localeCompare(b.text));
            obrasList.innerHTML = ""; // Limpiar la lista actual
            opciones.forEach(opcion => obrasList.appendChild(opcion));
        }

        function createModal(obrasData) {
            const modal = document.createElement("div");
            modal.classList.add("modal");
        
            const modalContent = document.createElement("div");
            modalContent.classList.add("modal-content");
        
            const leftContent = document.createElement("div");
            leftContent.style.float = "left";
            leftContent.style.width = "50%";
        
            const rightContent = document.createElement("div");
            rightContent.style.float = "right";
            rightContent.style.width = "50%";
        
            const header = document.createElement("h2");
            header.innerText = "Selecciona una obra";
        
            const obrasList = document.createElement("select");
            obrasList.id = "obrasList";
        
            const selectButton = document.createElement("button");
            selectButton.classList.add("selectButton");
            selectButton.innerText = "Seleccionar";
            selectButton.id="btnSelecionObraModal";
            selectButton.onclick = selectObra;
            selectButton.style.borderRadius = "5px";
            selectButton.style.boxShadow="solid 2px 2"
        
            
            const sortButton = document.createElement("button");
            sortButton.classList.add("sort-button");
            sortButton.onclick = ordenarListaAlfabeticamente;

            const sortIcon = document.createElement("i");
            sortIcon.classList.add("fas", "fa-sort-alpha-up");  
            sortButton.appendChild(sortIcon);
        
        
            const closeButton = document.createElement("span");
            closeButton.classList.add("close");
            closeButton.innerHTML = "×";
            closeButton.onclick = closeModal;
            closeButton.style.position = "absolute";
            closeButton.style.right = "10px";
            closeButton.style.top = "10px";
        
            leftContent.appendChild(header);
            leftContent.appendChild(obrasList);
            leftContent.appendChild(selectButton);
            leftContent.appendChild(sortButton); 

            const newObraHeader = document.createElement("h2");
            newObraHeader.innerText = "Crear nueva";
            const newObraButton = document.createElement("button");
            newObraButton.classList.add("newObraButton");
            newObraButton.innerText = "Crear nueva obra";
            newObraButton.style.borderRadius = "5px";
            newObraButton.onclick= creaNuevaObra;
            
            rightContent.appendChild(newObraHeader);
            rightContent.appendChild(newObraButton);
            
            modalContent.appendChild(closeButton);
            modalContent.appendChild(leftContent);
            modalContent.appendChild(rightContent);
            modal.appendChild(modalContent);
        
            document.body.appendChild(modal);
        
            obrasData.forEach(obra => {
                const option = document.createElement("option");
                option.value = obra.obra;
                option.text = obra.obra;
                obrasList.appendChild(option);
            });
        
            modal.style.display = "block";
            modal.style.zIndex = "9999";
        }
        

        function closeModal() {
            const modal = document.querySelector(".modal");
            if(modal && modal.style.display == "block"){
                modal.style.display = "none";
                modal.remove();
            }
            
            
        }

        function creaNuevaObra() {
            
            solicitaDatosNuevaObra(); 
            closeModal();
        }


        function solicitaDatosNuevaObra() {
            var modal = document.createElement('div');
            modal.id = 'modalDatosNuevaObra';
        
            var modalContent = document.createElement('div');
            modalContent.id = 'modal-contentDatosNuevaObra';
        
            var modalTitle = document.createElement('h2');
            modalTitle.textContent = 'Datos de la Nueva Obra';
            modalContent.appendChild(modalTitle);
            
            var fields = ['ref_obra', 'nombre', 'localidad', 'direccion'];
            fields.forEach(function (field) {
                var label = document.createElement('label');
                label.setAttribute('for', field);
                label.textContent = field.charAt(0).toUpperCase() + field.slice(1) + ':';
                label.style.display='block'
                var input = document.createElement('input');
                input.type = 'text';
                input.id = field;
                input.required = true;
                input.style.width='100%';
                input.style.marginBottom='1rem';
            
                modalContent.appendChild(label);
                modalContent.appendChild(input);
            });
            var crearBtn = document.createElement('button');
            crearBtn.id="btnCrearObra"
            crearBtn.textContent = 'Crear';
            crearBtn.onclick = crearObra;
            modalContent.appendChild(crearBtn);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            modal.style.display = 'flex';
        }

        function crearObra() {
            var ref_obra = document.getElementById('ref_obra').value;
            var nombre = document.getElementById('nombre').value.toUpperCase();
            var localidad = document.getElementById('localidad').value;
            var direccion = document.getElementById('direccion').value;
        
            // Realizar la solicitud para obtener el listado de obras
            fetch(`http://${rutaServidor}:8000/obrastransporte`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(obras => {
                const obrasEnMayusculas = obras.map(obra => obra.obra.toUpperCase());
        
                if (obrasEnMayusculas.includes(nombre)) {
                    alert('El nombre de la obra ya existe. Por favor, elige otro nombre.');
                    const modal = document.getElementById('modalDatosNuevaObra');
                    modal.remove();
                    fetch(`http://${rutaServidor}:8000/obrastransporte`, {
                        method: 'GET',
                        headers: {
                            'accept': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        createModal(data);
                    });
                } else {
                    var obraData = {
                        idobra: 0,
                        refobra: ref_obra,
                        nombre: nombre,
                        localidad: localidad,
                        direccion: direccion,
                        terminada: false
                    };
                    nombreObra=nombre;
                    fetch(`http://${rutaServidor}:8000/creaobrastransporte/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(obraData)
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Respuesta de la API:', data);
                        
                        // Llama a obtenerIdentificadores() y buscaJSONmodelo() después de que la obra se ha creado correctamente
                        obtenerIdentificadores();
                        buscaJSONmodelo();
                        
                        document.getElementById('modalDatosNuevaObra').style.display = 'none';
                    })
                    .catch(error => {
                        console.error('Error al enviar datos a la API:', error);
                    });
                }
            })
            .catch(error => {
                console.error('Error al obtener el listado de obras:', error);
            });
        }
        
        function selectObra() {
            const obrasList = document.getElementById("obrasList");
            selectedObra = obrasList.value;
            const nuevaRequestURL = `http://${rutaServidor}:8000/transporte/` + encodeURIComponent(selectedObra);
            const nuevaRequestURLProd = `http://${rutaServidor}:8000/produccion/` + encodeURIComponent(selectedObra);
            nombreObraSelect=selectedObra;
            hacerPeticionBDCargas(nuevaRequestURL, function (transporteData) {
                Transporte = transporteData;
                closeModal();
                resolve();
            }, function (error) {
                console.error('Error en la solicitud de la obra seleccionada:', error);
                alert('Error en la solicitud de la obra seleccionada.');
                reject(error);
            });
            hacerPeticionBDProduccion(nuevaRequestURLProd, function (produccionData) {
                Produccion = produccionData;
                obtenerIdentificadores();
                closeModal();
                resolve();
            }, function (error) {
                console.error('Error en la solicitud de la obra seleccionada:', error);
                alert('Error en la solicitud de la obra seleccionada.');
                reject(error);
            });
        }

        hacerPeticionBDCargas(requestURL, function (transporteData) {
            if (transporteData.length === 0) {
                fetch(`http://${rutaServidor}:8000/obrastransporte`, {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    createModal(data);
                })
                .catch(error => {
                    console.error('Error en la solicitud de nombres de obras:', error);
                    alert('Error en la solicitud de nombres de obras.');
                    reject(error);
                });
            } else {
                console.log("Modelo válido encontrado:", transporteData);
                Transporte = transporteData;
                resolve();
                hacerPeticionBDProduccion();
            }
        });
    });
}

function asignarTipoCamion(tabla, obra, nCamion, tipoCamion) {
    const url = `http://${rutaServidor}:8000/camionesupdatetipo/`;

    const data = {
        tabla: tabla,
        obra: obra,
        n_camion: nCamion,
        tipo_camion: tipoCamion
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch(url, options)
        .then(response => response.json())
        .then(jsonResponse => {
            console.log('Respuesta del servidor:', jsonResponse);
            // Puedes manejar la respuesta del servidor aquí si es necesario
        })
        .catch(error => {
            console.error('Error al realizar la solicitud:', error.message);
        });
}

function seleccionarTipoCamion(jsonResponse, jsonData) {
    const obra = jsonData.obra;
    const tabla = jsonData.tabla;
    const nCamion = jsonData.n_camion;
    console.log('El valor de "tabla" es:', tabla);
    let tipoCamion = 'NORMAL';

    if (tabla === 'estructura') {
        let tieneMedidaLongitud18 = false;
        for (const medida in jsonResponse) {
            if (jsonResponse.hasOwnProperty(medida)) {
                const valorMedida = parseFloat(jsonResponse[medida]);
                if (jsonResponse[medida] ) {
                    if (!isNaN(valorMedida) && valorMedida > 18) {
                        tieneMedidaLongitud18 = true;
                        break;  // Salir del bucle tan pronto como encuentre una medida superior a 280
                    } else if (valorMedida >= 13.60 && valorMedida  < 18) {
                        tipoCamion = 'EXTENSIBLE';
                    }
                }
            }
        }
        if (tieneMedidaLongitud18) {
            tipoCamion = 'ESPECIAL';
        }
    }
    if (tabla === 'alveolar') {
        let tieneMedidaLongitud18 = false;
        for (const medida in jsonResponse) {
            if (jsonResponse.hasOwnProperty(medida)) {
                if (jsonResponse[medida] && jsonResponse[medida].includes(' X ')) {
                    const valorDespuesDeX = jsonResponse[medida].split(' X ')[0];
        
                    const valorNumerico = parseFloat(valorDespuesDeX) / 100;
                    console.log("Longitud de alveolar: " + valorNumerico)
        
                    if (!isNaN(valorNumerico) && valorNumerico > 18) {
                        tieneMedidaLongitud18 = true;
                        break;  // Salir del bucle tan pronto como encuentre una medida superior a 280
                    } else if (valorNumerico >= 13.60 && valorNumerico < 18) {
                        tipoCamion = 'EXTENSIBLE';
                    }
                }
            }
        }
        if (tieneMedidaLongitud18) {
            tipoCamion = 'ESPECIAL';
        }
    }
    
    if (tabla === 'cerramiento') {
        let tieneMedidaSuperiorA280 = false;
        for (const medida in jsonResponse) {
            if (jsonResponse.hasOwnProperty(medida)) {
                if (jsonResponse[medida] && jsonResponse[medida].includes(' X ')) {
                    const valorDespuesDeX = jsonResponse[medida].split(' X ')[1];
        
                    const valorNumerico = parseFloat(valorDespuesDeX) / 100;
                    console.log("Altura de cerramiento: " + valorNumerico)
        
                    if (!isNaN(valorNumerico) && valorNumerico > 2.80) {
                        tieneMedidaSuperiorA280 = true;
                        break;  // Salir del bucle tan pronto como encuentre una medida superior a 280
                    } else if (valorNumerico > 2.59 && valorNumerico < 2.80) {
                        tipoCamion = 'ALTURA ESPECIAL';
                    }
                }
            }
        }
        if (tieneMedidaSuperiorA280) {
            tipoCamion = 'GÓNDOLA';
        }
    }
    console.log('Tipo de camión:', tipoCamion);
    asignarTipoCamion(tabla, obra,nCamion,tipoCamion)
}

function solicitarMedidas(jsonData) {
    const url = `http://${rutaServidor}/medidaselementoscamion/`;

    const { tabla, obra, n_camion } = jsonData;
    const data = JSON.stringify({ tabla, obra, n_camion });

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        body: data
    };

    fetch(url, options)
        .then(response => response.json())
        .then(jsonResponse => {
            
            console.log('Respuesta del servidor medidas elementos camion:', jsonResponse);
            seleccionarTipoCamion(jsonResponse, jsonData);
        })
        .catch(error => {
            console.error('Error al realizar la solicitud:', error.message);
        });
}

async function enviarDatosUpdatePosicion(camionId, jsonData) {
    const url = `http://${rutaServidor}:8000/camiones/${camionId}`;
    const opciones = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
    };
    try {
        const respuesta = await fetch(url, opciones);
        if (!respuesta.ok) {
            throw new Error('Error en la solicitud: ' + respuesta.statusText);
        }
        const datos = await respuesta.json();
        console.log('Respuesta del servidor:', datos);
        //Solicitar medidas de piezas actuales
        solicitarMedidas(jsonData)
    } catch (error) {
        console.error('Error al enviar la solicitud:', error);
    }
}

function creaJsonPosicionNueva(expressID, toneladadTotalesBD) {
    const elementoEnPrecast = precastElements.find(elemento => elemento.expressID === expressID);
    if (elementoEnPrecast) {
        let tipoTabla;
        let longitud = parseFloat(elementoEnPrecast.ART_Longitud).toFixed(2);
        longitud = parseFloat(longitud);
        let altura = parseFloat(elementoEnPrecast.ART_Alto).toFixed(2);
        altura = parseFloat(altura);

        const letraTransporte= elementoEnPrecast.letraTransporte;
            if (letraTransporte === 'E') {
                tipoTabla = 'estructura';
            } else if (letraTransporte === 'A') {
                tipoTabla = 'alveolar';
            } else if (letraTransporte === 'C') {
                tipoTabla = 'cerramiento';
            } 
        let obra;
            if(letraTransporte === 'E'||letraTransporte === 'C'){
                    obra=idEstruCerra
            } else if(letraTransporte === 'A'){
                obra=idAlveolar
            }
        
        const camion = elementoEnPrecast.numTransporte;
        const idproduccion = elementoEnPrecast.idproduccion;
        const posicionNumero = parseInt(elementoEnPrecast.Posicion);
        const peso = parseFloat(elementoEnPrecast.ART_Peso)
        let toneladasTotales= toneladadTotalesBD+peso;
        const jsonDatos = {
            tabla: tipoTabla,
            obra:obra,
            n_camion:camion,
            posicion_anterior: 0,
            posicion_final:posicionNumero,
            valor_final: idproduccion,
            toneladastotales:toneladasTotales,
        };
        console.log("Nueva Posicion: ");
        console.log(jsonDatos);
        enviarDatosUpdatePosicion(camion, jsonDatos)
    }
}

function creaJsonEliminaPosicion(expressID, toneladasTotalesBD,  posicionAntiguaBorrar, idObra, camion, tabla) {
    const elementoEnPrecast = precastElements.find(elemento => elemento.expressID === expressID);
    //console.log(posicionAntiguaBorrar+" AntiguaPos")
    if (elementoEnPrecast) {
        let longitud = parseFloat(elementoEnPrecast.ART_Longitud).toFixed(2);
        longitud = parseFloat(longitud);
        let altura = parseFloat(elementoEnPrecast.ART_Alto).toFixed(2);
        altura = parseFloat(altura);
        const idproduccion = elementoEnPrecast.idproduccion;
        const posicionNumero = parseInt(elementoEnPrecast.Posicion);
        const posicionFinal= 'posicion'+posicionAntiguaBorrar;
        const peso= parseFloat(elementoEnPrecast.ART_Peso);
        let toneladastotales=toneladasTotalesBD-peso;
        posicionAntigua='';

        const jsonDatos = {
            tabla: tabla,
            obra:idObra,
            n_camion:camion,
            posicion_anterior: posicionAntiguaBorrar,
            posicion_final:0,
            valor_final: idproduccion,
            toneladastotales: toneladastotales
        };

        console.log("Elimina Posicion: ");
        console.log(jsonDatos);
        enviarDatosUpdatePosicion(camion, jsonDatos)
    }    
}


function creaJsonCambiaPosicion(expressID, posicionAntiguaCambio,toneladasTotalesBD) {
    console.log(posicionAntiguaCambio)
    if (!isNaN(posicionAntiguaCambio)) {
        numeroExtraidoPosicionAntigua = parseInt(posicionAntiguaCambio);
    } else {
        const matchResult = posicionAntiguaCambio.match(/\d+$/);
        numeroExtraidoPosicionAntigua = matchResult ? parseInt(matchResult[0]) : null;
    }
    const elementoEnPrecast = precastElements.find(elemento => elemento.expressID === parseInt(expressID));
    if (elementoEnPrecast) {
        let tipoTabla;
        const letraTransporte= elementoEnPrecast.letraTransporte;
            if (letraTransporte === 'E') {
                tipoTabla = 'estructura';
            } else if (letraTransporte === 'A') {
                tipoTabla = 'alveolar';
            } else if (letraTransporte === 'C') {
                tipoTabla = 'cerramiento';
            } 
        let obra;
            if(letraTransporte === 'E'||letraTransporte === 'C'){
                    obra=idEstruCerra
            } else if(letraTransporte === 'A'){
                obra=idAlveolar
            }

        const camion = elementoEnPrecast.numTransporte;
        const idproduccion = elementoEnPrecast.idproduccion;
        const posicionNumero = parseInt(elementoEnPrecast.Posicion);
        let posicionFinal= 'posicion'+posicionNumero;
        posicionAntigua=posicionFinal;
        const posicionInicial=posicionAntiguaCambio
            
        const jsonDatos = {
            tabla: tipoTabla,
            obra:obra,
            n_camion:camion,
            posicion_anterior: numeroExtraidoPosicionAntigua,
            posicion_final:posicionNumero,
            valor_final: idproduccion,
            toneladastotales: toneladasTotalesBD
        };
        console.log("Cambia de posicion");
        console.log(jsonDatos);
        enviarDatosUpdatePosicion(camion, jsonDatos)
    }
    
}

async function Eliminar(expressID, posicionAntiguaEliminar) {
    let camion;
    let letraTransporte;
    let idObra;
    let tabla;
    let toneladasTotalesBD;

    for (let i = 0; i < precastElements.length; i++) {
        const elemento = precastElements[i];
        if (elemento.expressID === expressID) {
            //posicionAntigua=parseInt(elemento.Posicion)
            posicionAntigua=parseInt(posicionAntiguaEliminar)
            camion = elemento.numTransporte;
            letraTransporte = elemento.letraTransporte;
            if(letraTransporte==='E' || letraTransporte=='C'){
                idObra=idEstruCerra
                if(letraTransporte==='E'){
                    tabla='estructura'
                }
                if(letraTransporte==='C'){
                    tabla='cerramiento'
                }
            }
            if(letraTransporte==='A' ){
                idObra=idAlveolar
                tabla='alveolar'
            }
            //console.log("Hacer peticion de camion: "+camion+" tipo: "+tabla+" identificador de obra: "+idObra)
            
            toneladasTotalesBD = await peticionPesoTotalCamion(tabla, idObra, camion);
            //console.log(toneladasTotales+' TT')
            posicionAntigua=parseInt(posicionAntiguaEliminar)
            creaJsonEliminaPosicion(expressID, toneladasTotalesBD, posicionAntigua, idObra, camion, tabla);
            break;
        }
    }
}

async function obtenerPesoTotalBD(expressID) {
    let camion;
    let letraTransporte;
    let idObra;
    let tabla;
    let toneladasTotalesBD;

    for (let i = 0; i < precastElements.length; i++) {
        const elemento = precastElements[i];
        if (elemento.expressID === expressID) {
            
            camion = elemento.numTransporte;
            letraTransporte = elemento.letraTransporte;
            if(letraTransporte==='E' || letraTransporte=='C'){
                idObra=idEstruCerra
                if(letraTransporte==='E'){
                    tabla='estructura'
                }
                if(letraTransporte==='C'){
                    tabla='cerramiento'
                }
            }
            if(letraTransporte==='A' ){
                idObra=idAlveolar
                tabla='alveolar'
            }
            console.log("Hacer peticion de camion: "+camion+" tipo: "+tabla+" identificador de obra: "+idObra)
            //Hacer peticion del pesototal 
            toneladasTotalesBD = await peticionPesoTotalCamion(tabla, idObra, camion);
            creaJsonPosicionNueva(expressID, toneladasTotalesBD);
            break;
        }
    }
}

async function CambiaPosicion(expressID, posicionAntigua) {
    let camion;
    let letraTransporte;
    let numTransporte;
    let idObra;
    let tabla;
    let toneladasTotalesBD;

    for (let i = 0; i < precastElements.length; i++) {
        const elemento = precastElements[i];
        if (elemento.expressID === parseInt(expressID)) {
            
            camion = elemento.Camion;
            letraTransporte = elemento.letraTransporte;
            numTransporte=elemento.numTransporte;
            if(letraTransporte==='E' || letraTransporte=='C'){
                idObra=idEstruCerra
                if(letraTransporte==='E'){
                    tabla='estructura'
                }
                if(letraTransporte==='C'){
                    tabla='cerramiento'
                }
            }
            if(letraTransporte==='A' ){
                idObra=idAlveolar
                tabla='alveolar'
            }
            console.log("Hacer peticion de camion: "+camion+" tipo: "+tabla+" identificador de obra: "+idObra)

            toneladasTotalesBD = await peticionPesoTotalCamion(tabla, idObra, numTransporte);
            
            creaJsonCambiaPosicion(expressID, posicionAntigua,toneladasTotalesBD);
            break;
        }
    }
}

async function peticionPesoTotalCamion(tabla, obra, nCamion) {
    const url = `http://${rutaServidor}:8000/pesocamiones`;

    const datos = {
        tabla: tabla,
        obra: obra,
        n_camion: nCamion
    };

    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    try {
        // Realizar la petición POST
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(datos)
        });

        // Verificar si la respuesta es exitosa (código de estado 2xx)
        if (respuesta.ok) {
            const datosRespuesta = await respuesta.json();
            console.log('Respuesta de la API:', datosRespuesta);
            return datosRespuesta.toneladastotales;
        } else {
            console.error('Error en la petición:', respuesta.statusText);
        }
    } catch (error) {
        // Manejar errores en la petición
        console.error('Error en la petición:', error.message);
    }
}

function ordenarArrayproduccionNueva(Produccion){
    Produccion.forEach((item) => {
        if (item && item.pieza) {
            const piezaOriginal = item.pieza;

            if (piezaOriginal.length > 3) {
                const indiceGuion = piezaOriginal.indexOf('-');

                if (indiceGuion !== -1) {
                    const primeraParte = piezaOriginal.slice(0, indiceGuion);
                    
                    const letra = primeraParte[0];
                    const segundaLetra = primeraParte[1];
                    
                    if (letra === 'V') {
                        
                        const numero = parseInt(primeraParte.slice(2), 10);
                        item.pieza = letra + segundaLetra+ (isNaN(numero) ? '' : numero);
                    } else {
                        const numero = parseInt(primeraParte.slice(1), 10);
                        item.pieza = letra + (isNaN(numero) ? '' : numero);
                    }

                } else {
                    const matchResult = piezaOriginal.match(/^([A-Za-z]+)(\d+)$/);

                    if (matchResult && matchResult.length >= 3) {
                        const letras = matchResult[1];
                        const numero = parseInt(matchResult[2], 10);
                        item.pieza = letras[0] + (isNaN(numero) ? '' : numero);
                    } else {
                        console.error('Error: El formato de pieza no coincide:', piezaOriginal);
                    }
                }
            }
        }
    });
    console.log(`Produccion tiene ${Produccion.length} objetos`);

    // Produccion.forEach((obj) => {
    //     console.log(JSON.stringify(obj, null, 2));
    // });
   // console.log("PRODUCC NUEVA von datos tratados: "+Produccion)
    rellenaPrecastDatosArrayProduccionNueva();
    solicitaOrdenViajes(projectName)
    solicitaOrdenViajes(nombreObraSelect)
}

let elementViajes;
function solicitaOrdenViajes(projectName){
    if(projectName!=''){
        const url = `http://${rutaServidor}:8000/viajes/` + encodeURIComponent(projectName);

        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Procesar los datos recibidos y almacenarlos en el array elementViajes
            elementViajes = data;
            console.log('Datos de viajes obtenidos:', elementViajes);
            agregarCamionAPrecastElements( elementViajes)
        })
        .catch(error => {
            console.error('Hubo un problema con la solicitud:', error);
        });
    }
}
    
function agregarCamionAPrecastElements( elementViajes) {
    elementViajes.forEach(viaje => {
        const idPiezaViaje = viaje.idpieza;
        
        // Buscar el elemento en precastElements que tiene el mismo idproducto
        const elementoEncontrado = precastElements.find(elemento => elemento.idproduccion === idPiezaViaje);
        
        if (elementoEncontrado) {
            elementoEncontrado.Camion = viaje.orden;
            elementoEncontrado.letraTransporte=viaje.tabla;
            elementoEncontrado.numTransporte=viaje.n_camion;
            elementoEncontrado.idproduccion=viaje.idpieza;
            elementoEncontrado.Posicion=viaje.posicion
            elementoEncontrado.tipoTransporte=viaje.n_camion + ' - ' +viaje.tabla
        }
    });
        mostrarElementosRestantes();
        clasificarPorTipoTransporte();
        actualizaDesplegables();
        creaTablaTransporte();
        
        nuevoCamionEstructuraBtn.click();
}


function rellenaPrecastDatosArrayProduccionNueva() {
    // console.log(precastElements);
    // console.log(Produccion);

    for (let i = 0; i < precastElements.length; i++) {
        let precastElement = precastElements[i];

        if (precastElement.hasOwnProperty('pieza')) {
            continue;
        }

        for (let j = 0; j < Produccion.length; j++) {
            let produccionElemento = Produccion[j];
            if (precastElement.ART_Pieza && produccionElemento.pieza && precastElement.ART_Pieza.trim().toUpperCase() === produccionElemento.pieza.trim().toUpperCase()) {
                if (precastElement.ART_Pieza.trim().toUpperCase() === produccionElemento.pieza.trim().toUpperCase()) {
                    Object.assign(precastElement, produccionElemento);
                    Produccion.splice(j, 1); 
                    break; 
                }
            }
        }
    }
    if (Produccion.length > 0) {
        var mensaje = "Hay algún elemento en producción que no se han asignado al modelo:\n";
        Produccion.forEach(function(elemento) {
            mensaje += "- idproduccion: * " + elemento.idproduccion + " *, pieza: * " + elemento.pieza + " *\n";
        });
        alert(mensaje);
    }
    
}


let projectName = null;
async function obtieneNameProject(url){
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
        if (line.includes('IFCPROJECT')) {
        const fields = line.split(',');
        projectName = fields[2].replace(/'/g, '');
        break;
        }
    }

    if (projectName) {
        console.log('Nombre del proyecto:', projectName);
        //precastCollectionRef = collection(db, projectName);
    } else {
        
        console.log('No se encontró el nombre del proyecto');
    }
}

const camera = viewer.context.getCamera();
const scena2=viewer.context.getScene();
let selectionBox = null;
let helper = null;
let keyCtrl = false;

document.addEventListener("keydown", function(event) {
    if (event.key === "Control") {
        keyCtrl = true;
        viewer.context.ifcCamera.cameraControls.enabled = false;
        createSelectionBoxAndHelper();
        toggleSelectionBoxVisibility(true);
    }
});

document.addEventListener("keyup", function(event) {
    if (event.key === "Control") {
        keyCtrl = false;
        viewer.context.ifcCamera.cameraControls.enabled = true;
        toggleSelectionBoxVisibility(false);
        removeSelectionBoxAndHelper();
        
    }
});

function toggleSelectionBoxVisibility(visible) {
    if (helper) {
        const selectionBoxElement = helper.element;
        if (visible) {
            selectionBoxElement.classList.remove("selectBoxInvisible");
            selectionBoxElement.classList.add("selectBox");
        } else {
            selectionBoxElement.classList.remove("selectBox");
            selectionBoxElement.classList.add("selectBoxInvisible");
        }
    }
}

function createSelectionBoxAndHelper() {
    if (!selectionBox && keyCtrl) {
        selectionBox = new SelectionBox(camera, scena2);
        helper = new SelectionHelper(selectionBox, renderer, 'selectBox');
    }
}

function removeSelectionBoxAndHelper() {
    if (selectionBox !== null) {
        selectionBox = null;
        helper = null;
        
    }
}

document.addEventListener("pointerdown", function(event) { 
    if (keyCtrl && selectionBox) { 
        selectionBox.startPoint.set( 
            viewer.context.mouse.position.x, 
            viewer.context.mouse.position.y, 
            0.5 
        ); 
    } 
}); 

document.addEventListener("pointerup", function(event) { 
    if (keyCtrl && selectionBox) { 
        selectionBox.endPoint.set( 
            (event.clientX / window.innerWidth) * 2 - 1, 
            -(event.clientY / window.innerHeight) * 2 + 1, 
            0.5 
        ); 
        const allSelected = selectionBox.select(scene, camera, selectionBox); 
        console.log(allSelected);
    } 
});

const btnModifica = document.getElementById('modificaProp');
let isClickedModifica = false;
btnModifica.addEventListener('click', async function() {
    isClickedModifica = !isClickedModifica;
    if (isClickedModifica) {
        viewer.IFC.selector.unpickIfcItems();
        btnModifica.style.backgroundColor = 'gray';
        const textoMod = document.getElementById("textoModifica");
        textoMod.style.display = "block";
    }else {
        btnModifica.style.backgroundColor = 'transparent';
    }
});

function findNodeWithExpressID(node, expressID) {
    if (node.expressID === expressID) {
        return node;
    }

    for (const childNode of node.children) {
        const foundNode = findNodeWithExpressID(childNode, expressID);
        if (foundNode) {
            return foundNode;
        }
    }
    return null;
}

let elementsArray = [];
async function getPlantas(model) {
    await viewer.plans.computeAllPlanViews(model.modelID);

    const lineMaterial = new LineBasicMaterial({ color: 'black' });
    const baseMaterial = new MeshBasicMaterial({
        polygonOffset: true,
        polygonOffsetFactor: 1, 
        polygonOffsetUnits: 1,
    });

    viewer.edges.create('example', model.modelID, lineMaterial, baseMaterial);
    
    const containerForPlans = document.getElementById('button-containerP');
    const buttonGroup = document.createElement('div'); // nuevo div para agrupar botones
    containerForPlans.appendChild(buttonGroup);
    buttonGroup.style.flexDirection = 'column'; // Establecer la dirección a columna
    buttonGroup.style.flexWrap = 'wrap'; // Permitir el ajuste de contenido en varias líneas

    const allPlans = viewer.plans.getAll(model.modelID);

    for (const plan of allPlans) {
    
        const currentPlan = viewer.plans.planLists[model.modelID][plan]; //Información  de cada planta

        const divBotonesPlantas = document.createElement('div'); //contenedor para cada fila de botones
        buttonGroup.appendChild(divBotonesPlantas);
        divBotonesPlantas.style.display = 'flex'; 
        divBotonesPlantas.style.alignItems = 'center';
        
        const button = document.createElement('button');
        divBotonesPlantas.appendChild(button); 
        button.textContent = currentPlan.name; 
        button.setAttribute('data-express-id', currentPlan.expressID);

        const btnLabelPlantas = document.createElement('button');
        divBotonesPlantas.appendChild(btnLabelPlantas); 
        btnLabelPlantas.textContent = 'N';
        btnLabelPlantas.style.width = '30px'; 
        btnLabelPlantas.style.marginLeft = '5px'; 
        btnLabelPlantas.style.visibility = 'hidden';
        btnLabelPlantas.classList.add('btnLabelPlanta');


        const btn2DPlantas = document.createElement('button');
        divBotonesPlantas.appendChild(btn2DPlantas); 
        btn2DPlantas.textContent = '2D';
        btn2DPlantas.style.width = '30px'; 
        btn2DPlantas.style.marginLeft = '5px'; 
        btn2DPlantas.style.visibility = 'hidden';
        btn2DPlantas.classList.add('btn2DPlanta');
        

        button.onclick = async () => {
            ocultarLabels();
            viewer.IFC.selector.unpickIfcItems();
            const expressIDplanta = parseInt(button.dataset.expressId);
            console.log("ExpressId: " + expressIDplanta + " de la planta: " + button.textContent);
        
            //comprueba si algun btn2D está pulsado
            var container = document.querySelector('.button-containerP');
            var elementos = container.querySelectorAll('.activoBtn2DPlanta');
        
            // Verificar si alguno de los elementos contiene la clase deseada
            var contieneClase = false;
            for (var i = 0; i < elementos.length; i++) {
                if (elementos[i].classList.contains('activoBtn2DPlanta')) {
                    contieneClase = true;
                    break;
                }
            }
        
            if (contieneClase) {
                viewer.context.ifcCamera.toggleProjection();
                viewer.context.ifcCamera.cameraControls.setLookAt(posicionInicial.x, posicionInicial.y, posicionInicial.z, centro.x, centro.y, centro.z);
            }
        
            //elementsArray = elementsArraysByPlan[currentPlan.name] || []; // Obtén el array existente o recién creado
            try {
                const ifcProject = await viewer.IFC.getSpatialStructure(model.modelID);
        
                function findElementsInChildren(node) {
                    for (const childNode of node.children) {
                        if (!elementsArray.includes(childNode.expressID)) {
                            elementsArray.push(childNode.expressID);
                        }
                        findElementsInChildren(childNode);
                    }
                }
                function removeElementsInChildren(node) {
                    for (const childNode of node.children) {
                        // Eliminar el expressID del nodo hijo actual del array
                        const index = elementsArray.indexOf(childNode.expressID);
                        if (index !== -1) {
                            elementsArray.splice(index, 1);
                        }
                        removeElementsInChildren(childNode);
                    }
                }
        
                // busca el nodo de la planta deseada en la estructura 
                const plantaNode = findNodeWithExpressID(ifcProject, expressIDplanta);
                console.log(plantaNode)
        
                if (plantaNode) {
                    
                    hideAllItems(viewer, idsTotal);
                    if (button.classList.contains('activo')) {
                        button.classList.remove('activo');
                        removeElementsInChildren(plantaNode);
                    }
                    else{
                        button.classList.add('activo');
                        findElementsInChildren(plantaNode);
                    }
                    showAllItems(viewer, elementsArray);
        
                    const btnLabelPlantasList = document.querySelectorAll('.btnLabelPlanta');
                    btnLabelPlantasList.forEach((btnLabel) => {
                        btnLabel.style.visibility = 'hidden';
                    });
        
                    btnLabelPlantas.style.visibility = 'visible';
                    const btn2DPlantasList = document.querySelectorAll('.btn2DPlanta');
                    btn2DPlantasList.forEach((btn2D) => {
                        btn2D.style.visibility = 'hidden';
                        btn2D.classList.remove('activoBtn2DPlanta');
                    });
        
                    btn2DPlantas.style.visibility = 'visible';
        
                } else {
                    console.log('No se encontró el nodo de la planta');
                }
            } catch (error) {
                console.log('Error al obtener la estructura espacial:', error);
            }
        };

        btnLabelPlantas.onclick = async () => {
        const activeBtnLabelPlanta = document.querySelector('.btnLabelPlanta.activoBtnLabelPlanta');
        
        // Si hay un botón activo y es el mismo que se hizo clic, quitar la clase
        if (activeBtnLabelPlanta === btnLabelPlantas) {
            btnLabelPlantas.classList.remove('activoBtnLabelPlanta');
            removeLabels(elementsArray);
        } else {
            // Si hay un botón activo y no es el mismo que se hizo clic, eliminar la clase
            if (activeBtnLabelPlanta) {
            activeBtnLabelPlanta.classList.remove('activoBtnLabelPlanta');
            }
            btnLabelPlantas.classList.add('activoBtnLabelPlanta');
            generateLabels(elementsArray);
        }
        }
        
        let plantaActivo = false;
        
        btn2DPlantas.onclick = () => {
        if (btn2DPlantas.classList.contains('activoBtn2DPlanta')) {
            btn2DPlantas.classList.remove('activoBtn2DPlanta');
            plantaActivo = false;
            generatePlanta2D(plantaActivo);
        } else {
            btn2DPlantas.classList.add('activoBtn2DPlanta');
            plantaActivo = true;
            if (!posicionInicial) {
            // Almacenar la posición actual de la cámara antes de cambiarla
            const camera = viewer.context.getCamera();
            posicionInicial = {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z
            };
            }
            generatePlanta2D(plantaActivo);
        }
        };
        
    }

    
    let posicionInicial = null;
    function generatePlanta2D(plantaActivo) {
        //const screenShot = viewer.context.renderer.newScreenshot(camera);
        // CREA UN IMAGEN DE LA CAMARA EN ESA POSICION

        if (plantaActivo) {
            viewer.context.ifcCamera.cameraControls.setLookAt(0, 50, 0, 0, 0, 0);
            viewer.context.ifcCamera.toggleProjection();
            
        } else {
            if (posicionInicial) {
            viewer.context.ifcCamera.cameraControls.setLookAt(posicionInicial.x, posicionInicial.y, posicionInicial.z, 0, 0, 0);
            viewer.context.ifcCamera.toggleProjection();
            posicionInicial=null;
            }
        }
    }

    const button = document.createElement('button');
    containerForPlans.appendChild(button);
    button.textContent = 'Exit floorplans';
    button.onclick = () => {

        ocultarLabels();
        const activeButtons = containerForPlans.querySelectorAll('button.activo');
        activeButtons.forEach((activeButton) => {
            activeButton.classList.remove('activo');
        });
        ocultaBtnRemoveClass();
        const buttonContainer = document.getElementById('button-containerP');
        buttonContainer.style.visibility = 'hiden';
        const btnLateralPlantas = document.getElementById('btn-lateral-plantas');

        btnLateralPlantas.click();
    };
}

// Floorplans button
let floorplansActive = false;
const floorplanButton = document.getElementById('btn-lateral-plantas');
let floorplansButtonContainer = document.getElementById('button-containerP');
floorplanButton.onclick = () => {
    const divNumCamiones = document.getElementById("divNumCamiones");
    if (divNumCamiones) {
        const elementosHijos = divNumCamiones.children;
        for (let i = 0; i < elementosHijos.length; i++) {
            const elemento = elementosHijos[i];
            if (elemento.classList.contains("active")) {
                elemento.click();
            }
        }
    } 
    const btnFiltraTipos = document.getElementById('filtraTipos');
    const backgroundColor = window.getComputedStyle(btnFiltraTipos).backgroundColor;
    if (backgroundColor === 'rgb(128, 128, 128)' || backgroundColor === 'gray') {
        btnFiltraTipos.click();
    }
    const btnExt = document.getElementById('elementosExternos');
    const backgroundColorExt = window.getComputedStyle(btnExt).backgroundColor;
    if (backgroundColorExt === 'rgb(128, 128, 128)' || backgroundColorExt === 'gray') {
        btnExt.click();
    }

    if(floorplansActive) {
        floorplansActive = !floorplansActive;
        floorplanButton.style.backgroundColor = 'transparent';
        floorplansButtonContainer.classList.remove('visible');            elementsArray=[];
        
        hideAllItems(viewer, idsTotal );
        showAllItems(viewer, idsTotal);
        floorplansButtonContainer.style.visibility = 'hidden';
        
        hideAllItems(viewer, idsTotal );
        showAllItems(viewer, allIDs);
            //desactiva los botones de plantas cuando se apaga el boton que genera los planos
        const containerForButtons = document.getElementById('button-containerP');
        const buttons = containerForButtons.querySelectorAll('button');
        for (const button of buttons) {
            if (button.classList.contains('activo')) {
                button.classList.remove('activo');
            }
        }
        ocultaBtnRemoveClass();
        ocultarLabels();
        } else {
            floorplansActive = !floorplansActive;
            floorplanButton.style.backgroundColor = 'gray';
            floorplansButtonContainer = document.getElementById('button-containerP');
            floorplansButtonContainer.style.visibility = 'visible';
        };
};

let modelCopyCompleto = null; 
const btnIfcCompleto=document.getElementById('ifcCompleto');
let ifcCompletoClicked = false;
btnIfcCompleto.addEventListener('click', async function(){
    ifcCompletoClicked=!ifcCompletoClicked;
    if(ifcCompletoClicked){
        btnIfcCompleto.style.background='gray';
        if (modelCopyCompleto) {
            scene.remove(modelCopyCompleto); 
        }
        // modelCopyCompleto = new Mesh(
        // model.geometry,
        //     new MeshLambertMaterial({
        //         transparent: true,
        //         opacity: 0.5,
        //         color: 0x54a2c4,
        //     })
        // );
        // modelCopyCompleto = new Mesh(
        //     model.geometry,
        //         new MeshBasicMaterial({
        //             transparent: true,
        //         opacity: 0.5,
        //         color: 0x54a2c4,
        //             wireframe: true,

        //         })
        //     );
        const materialSolid = new MeshLambertMaterial({
            
            transparent: true,
            opacity: 0.3,
            color: 0x54a2c4,
        });
        
        // const materialLine = new LineBasicMaterial({ color: 0x000000 });
        
        // const multiMaterial = new MultiMaterial([materialSolid, materialLine]);
        
        modelCopyCompleto = new Mesh(model.geometry, materialSolid);
        scene.add(modelCopyCompleto);
    }else{
        btnIfcCompleto.style.background='';
        scene.remove(modelCopyCompleto); 
    }
})

function ocultaBtnRemoveClass(){
    const btnLabelPlantasList = document.querySelectorAll('.btnLabelPlanta');
    btnLabelPlantasList.forEach((btnLabel) => {
        btnLabel.style.visibility = 'hidden';
        btnLabel.classList.remove('activoBtnLabelPlanta');  
            
    });
    const btn2DPlantasList = document.querySelectorAll('.btn2DPlanta');
        btn2DPlantasList.forEach((btn2D) => {
        btn2D.style.visibility = 'hidden';
        btn2D.classList.remove('activoBtn2DPlanta');  
    });
  //viewer.context.ifcCamera.cameraControls.setLookAt(posicionInicial.x, posicionInicial.y, posicionInicial.z, 0, 0, 0);
}

function ocultarLabels() {
    const piezaLabels = document.querySelectorAll('.pieza-label');
    const expressIDsOcultar = [];
    
    piezaLabels.forEach((element) => {
        if (element.style.visibility !== 'hidden') {
            const id = parseInt(element.id);
                if (!isNaN(id)) {
                    expressIDsOcultar.push(id);
                }
            }
        });
    removeLabels(expressIDsOcultar);
}

let expressIDsUniones = []; 
const btnFiltrarUnion = document.getElementById('filtraUniones');
let isButtonClickedUniones = false;
btnFiltrarUnion.addEventListener('click', async function() {
    isButtonClickedUniones = !isButtonClickedUniones;
    if (isButtonClickedUniones) {
        btnFiltrarUnion.style.backgroundColor = 'gray';

        if (expressIDsUniones.length === 0) {
            const filteredElements = precastElements.filter(obj => obj.ifcType === 'IFCBUILDINGELEMENTPROXY');
            expressIDsUniones = filteredElements.map(obj => obj.expressID);
        }

        hideAllItems(viewer, expressIDsUniones);
    } else {
        btnFiltrarUnion.style.backgroundColor = 'transparent';
        showAllItems(viewer, expressIDsUniones);
    }
});

const btnBuscar = document.getElementById('buscarButton');
let isButtonClicked = false;
const divInputText= document.getElementById("inputARTP");
const inputText = document.querySelector("#inputARTP input[type='text']");
const checkBox = document.getElementById('checkLabels'); 
const infoBusquedas = document.getElementById("infoBusquedas");

btnBuscar.addEventListener('click', async function() {
    isButtonClicked = !isButtonClicked;
    if (isButtonClicked) {
        divInputText.style.display = "block";
        btnBuscar.style.backgroundColor = 'gray';
        inputText.focus();
    } else {
        if (numBusquedas!==0){
            hideAllItems(viewer, idsTotal);
            showAllItems(viewer, allIDs);
        }
        btnBuscar.style.backgroundColor = 'transparent';
        divInputText.style.display = "none";
        inputText.value="";
        
        removeLabels(expressIDsInput);
        expressIDsInput=[];
        numBusquedas=0;
        infoBusquedas.querySelector("p").textContent = "";
        if (listaElementosEncontrados) {
            infoBusquedas.removeChild(listaElementosEncontrados);
            listaElementosEncontrados = null;
        }
        if (modelCopy) {
            scene.remove(modelCopy); 
            modelCopy = null;
        }
        return;
    }
});

let numBusquedas = 0;
let expressIDsInput;
let modelCopy = null; 
let listaElementosEncontrados = null;

inputText.addEventListener('change', function() {
    infoBusquedas.querySelector("p").textContent = "";
    removeLabels(expressIDsInput);
    if (isButtonClicked) {
        const elementoBuscado = inputText.value.trim().toUpperCase();
        numBusquedas++;
        if (elementoBuscado) {
            const elementosEncontrados = [];
            for (let i = 0; i < precastElements.length; i++) {
                if (precastElements[i].ART_Pieza === elementoBuscado) {
                    elementosEncontrados.push(precastElements[i]);
                }
            }
            expressIDsInput = elementosEncontrados.map(elemento => elemento.expressID);
            if (elementosEncontrados.length > 0) {
                const nuevaListaElementosEncontrados = document.createElement("ul");
                nuevaListaElementosEncontrados.classList.add("elementos-encontrados");
                elementosEncontrados.sort((a, b) => a.Camion - b.Camion);

                elementosEncontrados.forEach((elemento) => {
                    const listItem = document.createElement("li");
                    const nombreElemento = elemento.ART_Pieza;
                    const camionPertenece = elemento.Camion ? elemento.Camion : "-----";
    
                    listItem.textContent = `Elemento: ${nombreElemento}, Camión: ${camionPertenece}`;
                    nuevaListaElementosEncontrados.appendChild(listItem);
                });

                if (listaElementosEncontrados) {
                    infoBusquedas.replaceChild(nuevaListaElementosEncontrados, listaElementosEncontrados);
                } else {
                    infoBusquedas.appendChild(nuevaListaElementosEncontrados);
                }

                listaElementosEncontrados = nuevaListaElementosEncontrados;

                hideAllItems(viewer, idsTotal);
                if (modelCopy) {
                    scene.remove(modelCopy); 
                }
                
                
                showAllItems(viewer, expressIDsInput);
            } else {
                infoBusquedas.querySelector("p").textContent = "";
                infoBusquedas.querySelector("p").textContent = "No existe el elemento: " + elementoBuscado;
            }
            if (checkBox.checked) {
                generateLabels(expressIDsInput);
            } else {
                removeLabels(expressIDsInput);
            }
        } else {
            btnBuscar.style.backgroundColor = 'transparent';
            hideAllItems(viewer, idsTotal);
            showAllItems(viewer, allIDs);
            removeLabels(expressIDsInput);
            divInputText.style.display = "none";
        }
    }
});

checkBox.addEventListener('change', function() {
    const textoInput = inputText.value.trim();
    if (textoInput) {
        const checkBox = document.getElementById('checkLabels'); 
        if (checkBox.checked) {
            generateLabels(expressIDsInput);
        } else {
            removeLabels(expressIDsInput);
        }
    }
});

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

async function crearBotonPrecasFuisonados(){
    // Crea un nuevo botón
    var btnCreaPrecastFusionados= document.createElement("button");
    btnCreaPrecastFusionados.classList.add("button");
    btnCreaPrecastFusionados.id = "btnCreaPrecastFusionados";
    btnCreaPrecastFusionados.className;
    btnCreaPrecastFusionados.textContent = "Fusiona";

    //  referencia al último botón existente
    var ultimoBoton = document.querySelector(".button-container .button:last-of-type");

    var contenedorBotones = document.querySelector(".button-container");
    contenedorBotones.insertBefore(btnCreaPrecastFusionados, ultimoBoton.nextSibling);
    btnCreaPrecastFusionados.addEventListener("click", async function() {
        btnCreaPrecastFusionados.remove();
        
            agregarPropiedadesElementPart();
            eliminarElementosAssembly();
            generateCheckboxes(precastElements);
        
        const btnFiltros=document.getElementById('filtraTipos');
        btnFiltros.style.display="block";
        const divFiltros = document.getElementById('checktiposIfc');

        const btnFiltrosUnion=document.getElementById('filtraUniones');
        btnFiltrosUnion.style.display="block";
        
        //addAtributosBDCargasPrecast();
        ordenarArrayproduccionNueva(Produccion);
        addAtributosBDProduccionPrecast();

        btnFiltros.addEventListener('click', function() {

            const btnExt=document.getElementById("elementosExternos")
            if(btnExt.classList.contains('active')){
                btnExt.classList.remove('active');
                btnExt.style.backgroundColor = 'transparent';
                const divCheckFiltros=document.getElementById("checktiposIfc")
                divCheckFiltros.innerHTML=""
                generateCheckboxes(precastElements);
        
            }

        if (btnFiltros.classList.contains('active')) {
            btnFiltros.classList.remove('active');
            btnFiltros.style.backgroundColor = 'transparent';
            divFiltros.style.display = 'none';
        } else {
            btnFiltros.classList.add('active');
            btnFiltros.style.backgroundColor = 'gray';
            divFiltros.style.display = 'block';
            const btnPlantas = document.getElementById('btn-lateral-plantas');
            const backgroundColor = window.getComputedStyle(btnPlantas).backgroundColor;
            if (backgroundColor === 'rgb(128, 128, 128)' || backgroundColor === 'gray') {
                btnPlantas.click();
                btnFiltros.click();
            }
        }
        });
        const btnBuscar=document.getElementById('buscarButton');
        btnBuscar.style.display="block";
        const ifcCompleto=document.getElementById('ifcCompleto');
        ifcCompleto.style.display="block";
        const btnModifica= document.getElementById("modificaProp")
        btnModifica.style.display = "block";
        const btnPlantas=document.getElementById('btn-lateral-plantas');
        btnPlantas.style.display="block";
        });    
}

function addAtributosBDProduccionPrecast() {
    // console.log(precastElements)
    // console.log(Produccion)
    let updatedElements = {};

    for (let i = 0; i < precastElements.length; i++) {
        let precastElement = precastElements[i];

        if (updatedElements[precastElement.ART_Pieza]) continue;

        let matchFound = false;
        for (let j = 0; j < Produccion.length; j++) {
            let produccion = Produccion[j];

            if (precastElement.ART_Pieza === produccion.pieza) {
                for (let key in produccion) {
                    precastElement[key] = produccion[key];
                }

                updatedElements[precastElement.ART_Pieza] = true;
                matchFound = true;
                break;
            }
        }

        // if (!matchFound) {
        //     console.log(`No se encontró una coincidencia para el elemento con ART_Pieza = ${precastElement.ART_Pieza}`);
        // }
    }

    let expressIDsinProduccion = precastElements .filter(element => !element.hasOwnProperty('idproduccion')).map(element => element.expressID);

    console.log(expressIDsinProduccion)
    console.log("Elementos sin producción: "+expressIDsinProduccion.length)
    if(expressIDsinProduccion.length>0){
        const btnElementoExterno= document.getElementById("elementosExternos")
        btnElementoExterno.style.display="block"
        btnElementoExterno.addEventListener('click', function() {
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                btnElementoExterno.style.background=""
                showAllItems(viewer,expressIDsinProduccion)
                const divCheckTiposIfc = document.getElementById('checktiposIfc');
                divCheckTiposIfc.innerHTML = '';
                generateCheckboxes(precastElements)
            } else {
                this.classList.add('active');
                btnElementoExterno.style.background="grey"
                hideAllItems(viewer,expressIDsinProduccion)
                const divCheckTiposIfc = document.getElementById('checktiposIfc');
                divCheckTiposIfc.innerHTML = '';

                idsTotal = idsTotal.filter(id => !expressIDsinProduccion.includes(id));
                const precastElementsConProduccion = precastElements.filter(elemento => idsTotal.some(id => id === elemento.expressID));
                generateCheckboxes(precastElementsConProduccion)
                divCheckTiposIfc.style.display="block"

                const btnFiltrarTipos= document.getElementById("filtraTipos")
                if(btnFiltrarTipos.style.backgroundColor==="gray"){
                    btnFiltrarTipos.style.background=""
                    btnFiltrarTipos.classList.remove("active");
                }

            }
        });
    }
}

async function addAtributosBDCargasPrecast() {
    const objetosUsados = {};
    const precastElementsSinAsignar = [];

   // Verificar si Transporte está definido y no es null
    if ( Transporte.length > 0) {
        // Iterar sobre cada elemento de precastElements
        precastElements.forEach((precastElement, index) => {
            const ART_PiezaActual = precastElement.ART_Pieza;
            // Buscar el índice del elemento en Transporte
            const indexTransporte = Transporte.findIndex(transporte => transporte && transporte.ART_Pieza === ART_PiezaActual);
            
            // Verificar si se encontró el elemento en Transporte
            if (indexTransporte !== -1) {
                const objetoTransporte = Transporte[indexTransporte];
                
                // Asignar las propiedades de objetoTransporte a precastElement
                Object.assign(precastElement, objetoTransporte);
                objetosUsados[objetoTransporte.ART_Pieza] = true;
        
                // Eliminar el objeto de Transporte
                Transporte.splice(indexTransporte, 1);
            } else {
                // Agregar a precastElementsSinAsignar si no se encontró en Transporte
                precastElementsSinAsignar.push(precastElement.expressID);
            }
        });
    } else {
        console.error("La variable Transporte está indefinida o no tiene elementos.");
    }
}

function modalPiezasImagen(message, image) {
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal';
    document.body.appendChild(modalContainer);

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContainer.appendChild(modalContent);

    const closeButton = document.createElement('span');
    closeButton.className = 'close';
    closeButton.innerHTML = '&times;';
    modalContent.appendChild(closeButton);

    const modalMessage = document.createElement('p');
    modalMessage.id = 'modal-message';
    modalMessage.innerHTML = message;
    modalContent.appendChild(modalMessage);

    // Agregar la imagen de la captura del visor
    modalContent.appendChild(image);

    modalContainer.style.display = 'block';

    closeButton.onclick = function() {
        modalContainer.style.display = 'none';
    };
}

function mensajeNoConexion(message) {
    // Crear el elemento de la ventana modal
    var modal = document.createElement("div");
    modal.className = "modal";
    
    var modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    
    var closeButton = document.createElement("span");
    closeButton.className = "close";
    closeButton.innerHTML = "&times;";
    closeButton.onclick = function() {
    document.body.removeChild(modal);
    };
    
    var errorText = document.createElement("p");
    errorText.innerText = message;
    
    modalContent.appendChild(closeButton);
    modalContent.appendChild(errorText);
    modal.appendChild(modalContent);
    
    // Agregar la ventana modal al cuerpo del documento
    document.body.appendChild(modal);
}


function eliminarElementosAssembly() {
    precastElements = precastElements.filter(element => element.ifcType !== 'IFCELEMENTASSEMBLY');
    console.log("TOTAL DE ELEMNTOS EN PRECAST: "+precastElements.length);
    // insertar array precastEleemt en firebase
    //insertaModeloFire();
    
}

async function crearBotonPrecas(){
    var btnCreaPrecast = document.createElement("button");
    btnCreaPrecast.classList.add("button");
    // Agrega un ID y una clase al nuevo botón
    btnCreaPrecast.id = "btnCreaPrecast";
    btnCreaPrecast.className;
    btnCreaPrecast.textContent = "Añade Prop";
    var ultimoBoton = document.querySelector(".button-container .button:last-of-type");

    var contenedorBotones = document.querySelector(".button-container");
    contenedorBotones.insertBefore(btnCreaPrecast, ultimoBoton.nextSibling);

    btnCreaPrecast.addEventListener("click", async function() {
        await cargaProp();
        btnCreaPrecast.remove();
        crearBotonPrecasFuisonados()
    });
}

async function cargaProp() {
    await new Promise(resolve => {
        // Carga las propiedades/psets al array
        precastElements.forEach(precast => {
            if (precast.ifcType != 'IFCBUILDING' && precast.ifcType != 'IFCBUILDINGELEMENTPART' &&  precast.ifcType != 'IFCBUILDINGELEMENTPROXY' ) {
                precastProperties(precast, 0, precast.expressID);
            }
        });
        resolve();
    });
}

async function agregarPropiedadesElementPart() {
    for (let i = 1; i < precastElements.length; i++) {
        const currentElement = precastElements[i];
        const previousElement = precastElements[i - 1];
    
        if (currentElement.ifcType === 'IFCBUILDINGELEMENTPART') {
            for (const prop in previousElement) {
                if (previousElement.hasOwnProperty(prop)) {
                    const prefixedProp = 'BEP_' + prop;
                    if (!currentElement.hasOwnProperty(prop)) {
                    currentElement[prop] = previousElement[prop];
                    } else {
                    currentElement[prefixedProp] = previousElement[prop];
                    }
                }
            }
        }
    }
}

function cargaGlobalIdenPrecast(){
    //Carga la propiedade GlobalId al array precastElements
        precastElements.forEach(precast => {
            if (precast.ifcType !='IFCBUILDING'){
                precastPropertiesGlobalId(precast, 0, precast.expressID);
            }
        }); 
        
}

function addBotonCheckboxListeners() {
    const buttons = document.querySelectorAll('.btnCheck');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const letter = this.dataset.artPieza;
            const isChecked = this.checked;
            const artPieza = this.getAttribute('data-art-pieza');
            const visibleIds = [];

            precastElements.forEach(function(el, index) {
                if (allIDs.includes(el.expressID)) {
                    const firstLetters = getFirstLetters(el.ART_Pieza);

                    // Comparar si las dos primeras letras son iguales
                    if (firstLetters === artPieza) {
                        visibleIds.push(el.expressID);
                    }
                }
            });

            if (this.classList.contains('pulsado')) {
    this.classList.remove('pulsado');
    removeLabels(visibleIds);
} else {
    this.classList.add('pulsado');
    generateLabels(visibleIds);
}
        });
    });
}

function getFirstLetters(artPieza) {
    if (artPieza === undefined || artPieza === null) {
        return ""; // Devolver una cadena vacía para valores undefined o null
    }

    const trimmedArtPieza = artPieza.trim();
    if (trimmedArtPieza.length >= 2 && isNaN(trimmedArtPieza.charAt(1))) {
        return trimmedArtPieza.substring(0, 2).toUpperCase();
    } else if (trimmedArtPieza.length >= 1) {
        return trimmedArtPieza.charAt(0).toUpperCase();
    } else {
        return "";
    }
}

let groupedElements;

function generateCheckboxes(precastElements) {
    groupedElements = precastElements.reduce((acc, el) => {
        if (el.ART_Pieza === 0 || el.ART_Pieza === "0" || el.ART_Pieza === "" || el.ART_Pieza === undefined) {
            return acc;
        }
    
        const firstLetters = getFirstLetters(el.ART_Pieza);
        if (!acc[firstLetters]) {
            acc[firstLetters] = [];
        }
        acc[firstLetters].push(el);
        return acc;
    }, {});

    const checktiposIfcContainer = document.getElementById('checktiposIfc');
    checktiposIfcContainer.style.display = 'none';

    Object.entries(groupedElements).forEach(([artPieza, elements]) => {
        const checkboxContainer = document.createElement('div');
        checkboxContainer.classList.add('checkbox-container');

        const button = document.createElement('button');
        button.classList.add('btnCheck');
        button.setAttribute('data-art-pieza', artPieza);
        button.textContent = artPieza;
        checkboxContainer.appendChild(button);

        const checkboxGroup = document.createElement('div');
        checkboxGroup.classList.add('checkbox-group');

        const checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('checked', 'true');
        checkbox.setAttribute('data-art-pieza', artPieza);
        checkbox.style.marginLeft = '8px';
        checkboxGroup.appendChild(checkbox);

        const checkboxLabel = document.createElement('label');
        checkboxLabel.textContent = `${artPieza} (${elements.length})`;
        checkboxGroup.appendChild(checkboxLabel);

        const elementsWithCamion = elements.filter(el => el.Camion !== undefined && el.Camion !== "");
        const missingCamionCount = elements.length - elementsWithCamion.length;

        const missingCamionLabel = document.createElement('label');
        missingCamionLabel.textContent = ` / ${missingCamionCount}`;
        checkboxGroup.appendChild(missingCamionLabel);

        checkboxContainer.appendChild(checkboxGroup);
        checktiposIfcContainer.appendChild(checkboxContainer);
    });

    // setTimeout(() => {
        addCheckboxListeners();
        addBotonCheckboxListeners();
    // }, 0);
}

function updateMissingCamionCount() {
    const checkboxGroups = document.getElementsByClassName('checkbox-group');

    Array.from(checkboxGroups).forEach((checkboxGroup) => {
        const artPieza = checkboxGroup.querySelector('input[type="checkbox"]').getAttribute('data-art-pieza');
        const elements = groupedElements[artPieza];
    
        const elementsWithCamion = elements.filter(el => el.Camion !== undefined && el.Camion !== "");
        const missingCamionCount = elements.length - elementsWithCamion.length;
    
        const missingCamionLabel = checkboxGroup.querySelector('label:last-child');
    
        if (missingCamionLabel) {
            missingCamionLabel.textContent = ` / ${missingCamionCount}`;
        }
    });
}

function removeLabels(expressIDs) {
    const labels = document.querySelectorAll('.pieza-label'); // Buscar todos los elementos con la clase "pieza-label"
    for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const labelID = parseInt(label.id);
        const labelART_Pieza = label.getAttribute('data-art-pieza');
        
        if (expressIDs.includes(labelID) || expressIDs.includes(labelART_Pieza)) {
            label.style.visibility = 'hidden';
        }
    }
}

function removeLabel(labelIDToRemove) {
    const labels = document.querySelectorAll('[id="' + labelIDToRemove+ '"]');

    for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        label.style.visibility = 'hidden';
    }
}

async function generateLabels(expressIDs) {
    // var divEtiquetas = document.querySelector('[style="overflow: hidden; position: absolute; top: 0px; pointer-events: none; height: 771px;"]');

    // divEtiquetas.style.top = '45px';
    // Obtener el elemento padre
    var viewerContainer = document.getElementById("viewer-container");

    // Obtener todos los div hijos de viewer-container
    var divsHijos = viewerContainer.getElementsByTagName("div");

    // Obtener el penúltimo div hijo
    var penultimoDiv = divsHijos[divsHijos.length - 2];
    penultimoDiv.style.top = '45px';

    for (const expressID of expressIDs) {
        let ART_Pieza, ART_CoordX, ART_CoordY, ART_CoordZ;
        
        for (const precast of precastElements) {
            if (precast.expressID === expressID) {
            ART_Pieza = precast['ART_Pieza'];
            ART_CoordX = precast['ART_cdgX'];
            ART_CoordY = precast['ART_cdgY'];
            ART_CoordZ = precast['ART_cdgZ'];
            break;
            }
        }
        muestraNombrePieza(ART_Pieza, ART_CoordX, ART_CoordY, ART_CoordZ, expressID);
    }
    
}

function muestraNombrePieza(ART_Pieza, ART_CoordX, ART_CoordY, ART_CoordZ, expressID) {

    
    if (ART_Pieza === undefined || ART_CoordX === undefined || ART_CoordY === undefined || ART_CoordZ === undefined) {
        return;
    } else {
        const elements = document.getElementsByTagName('p');
        let count = 0;
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element.textContent.startsWith(ART_Pieza) && element.expressID ===expressID) {
                if (element.style.visibility === 'hidden') {
                    element.style.visibility = 'visible';
                }
            count++;
            }
        }
        if (count === 0) {
            const label = document.createElement('p');
            label.textContent = ART_Pieza;
            label.classList.add('pieza-label');
            label.id = expressID;
            const labelObject = new CSS2DObject(label);
            const adjustedX = parseFloat(ART_CoordX) / 1000;
            const adjustedY = -parseFloat(ART_CoordY) / 1000;
            const adjustedZ = parseFloat(ART_CoordZ) / 1000;
            labelObject.position.set(adjustedX, adjustedZ, adjustedY); // Ajustar coordenadas Y debido a la conversión de ejes
        
            //  console.log("Coordenadas ajustadas:", adjustedX, adjustedY, adjustedZ);
            // console.log(labelObject.scale);
            // console.log(labelObject.rotation);
            scene.add(labelObject);
        }
    }
}

function addCheckboxListeners() {
    const checkboxesContainer = document.getElementById('checktiposIfc');
    const checkboxes = checkboxesContainer.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(function(checkbox) {
        const container = document.createElement('label');
        container.className = 'checkbox-container';
    
        checkbox.parentNode.insertBefore(container, checkbox);
        const eyeIcon = document.createElement('span');
        eyeIcon.className = 'eye-icon2';
        eyeIcon.innerHTML = '👁️'; 
        const artPiezaValue = checkbox.getAttribute('data-art-pieza');
    
        eyeIcon.setAttribute('data-art-pieza-ojo', artPiezaValue);
        container.appendChild(eyeIcon);
    
        checkbox.addEventListener('change', function() {
            viewer.IFC.selector.unpickIfcItems();
            const isChecked = this.checked;
            const artPieza = this.getAttribute('data-art-pieza');
            const matchingIds = [];
    
            precastElements.forEach(function(element) {
                if (element.ART_Pieza === 0 || element.ART_Pieza === "0" || element.ART_Pieza === "" || element.ART_Pieza === undefined) {
                    return;
                }
        
                if (element.ART_Pieza.substring(0, artPieza.length).toUpperCase() === artPieza.toUpperCase()) {
                    if (!element.hasOwnProperty('Camion') || element.Camion === "") {
                    matchingIds.push(element.expressID);
                    }
                }
                });
            if (isChecked) {
                showAllItems(viewer, matchingIds);
            } else {
                hideAllItems(viewer, matchingIds);
            }
        });
        const eyeIcons = document.querySelectorAll('.eye-icon2');
        let activeIcon = null;
        
        eyeIcons.forEach(function (icon) {
            icon.addEventListener('click', function () {
            if (activeIcon === icon) {
                icon.classList.remove('active-ojo');
                activeIcon = null;
                const activeEyeIcon = document.querySelector('.eye-icon2.active-ojo');
                if (!activeEyeIcon) {
                    checkboxes.forEach(function (cb) {
                        cb.disabled = false;
                    });
                    // console.log('Checkboxes enabled');
        
                    let expressCheck=expressCheckActivos();
                    hideAllItems(viewer, allIDs);
                    const checkExpressNoCargados = [];

                    for (let i = 0; i < expressCheck.length; i++) {
                        const element = expressCheck[i];
                        if (allIDs.includes(element)) {
                            checkExpressNoCargados.push(element);
                    
                        }
                    }

                    showAllItems(viewer, checkExpressNoCargados);
                }
            } else {
                if (activeIcon) {
                    activeIcon.classList.remove('active-ojo');
                }
                icon.classList.add('active-ojo');
                activeIcon = icon;
        
                const artPiezaOjoValue = icon.getAttribute('data-art-pieza-ojo');
                const expressOjo = [];
        
                precastElements.forEach(function (element) {
                    if (element.ART_Pieza === 0 || element.ART_Pieza === "0" || element.ART_Pieza === "" || element.ART_Pieza === undefined) {
                        return;
                    }
                    
                    if (element.ART_Pieza.substring(0, artPiezaOjoValue.length).toUpperCase() === artPiezaOjoValue.toUpperCase()) {
                        if (!element.hasOwnProperty('Camion') || element.Camion === "") {
                            expressOjo.push(element.expressID);
                        }
                    }
                });
                hideAllItems(viewer, allIDs);
                showAllItems(viewer, expressOjo);
                const activeEyeIcon = document.querySelector('.eye-icon2.active-ojo');
                if (activeEyeIcon) {
                    // Si hay un icono ojo activo, desactivar todos los checkboxes
                    checkboxes.forEach(function (cb) {
                    cb.disabled = true;
                    });
                } 
                }
            });
        });
    });
}

function expressCheckActivos() {
    const divChecktiposIfc = document.getElementById('checktiposIfc');
    if (divChecktiposIfc) {
        const checkboxes = divChecktiposIfc.querySelectorAll('input[type="checkbox"]');
        const matchingExpress = [];
        checkboxes.forEach(function (checkbox) {
            if (checkbox.checked) {
            const dataClassValue = checkbox.getAttribute('data-art-pieza');
            for (let i = 0; i < precastElements.length; i++) {
                const element = precastElements[i];
                if (element.hasOwnProperty('ART_Pieza')) {
                    if (element.ART_Pieza.charAt(0) === dataClassValue) {
                        matchingExpress.push(element.expressID);
                    }
                }
            }
            }
        });
        return matchingExpress;
    }
}

 ////-----------------------------------------------------------------------------------------------------------------------------------

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

// Remplaza un modelo original (model) por un subconjunto previamente creado (subset).
function replaceOriginalModelBySubset(viewer, model, subset) {
	const items = viewer.context.items;  //obtiene el objeto "items" del contexto del visor y lo almacena en una variable local.
	items.pickableIfcModels = items.pickableIfcModels.filter(model => model !== model);  //Filtra las matrices y elimina cualquier referencia al modelo original
	items.ifcModels = items.ifcModels.filter(model => model !== model);
	model.removeFromParent();  //Elimina el modelo original de su contenedor principal
	items.ifcModels.push(subset);
	items.pickableIfcModels.push(subset); 
}

window.onclick = async () => {
    const found = await viewer.IFC.selector.pickIfcItem(false);
    if (found==null){return;}
    const id=found.id;
    const foundElement = precastElements.find(element => element.expressID === id);
    if(foundElement.idproduccion){
        if (foundElement.ifcType !== "IFCBUILDINGELEMENTPROXY") {
            const nuevoCamionCerramiento = document.getElementById("nuevoCamionCerramiento");
            if (foundElement.ART_Pieza.startsWith("T") && !nuevoCamionCerramiento.classList.contains("seleccionado")) {
                alert("Panel, SOLO en camion de cerramiento C.");
                return; 
            }
            const nuevoCamionAlveolar = document.getElementById("nuevoCamionAlveolar");
            if (foundElement.ART_Pieza.startsWith("Y") && !nuevoCamionAlveolar.classList.contains("seleccionado")) {
                alert("Placa Alveolar, SOLO en camion A.");
                return; 
            }
            hideClickedItem(viewer);
            let idString =id.toString();
            removeLabels(idString);
            const numCamionElement = document.getElementById("numCamion");
            let numCamion = numCamionElement.textContent.trim();
            const expressIDs = obtenerExpressIDsDelCamion(numCamion);
            const pesoTotal = calcularPesoTotal(expressIDs);
            const pesoCamion = document.getElementById("pesoCamion");
            pesoCamion.textContent = pesoTotal.toString();
        }
    }else{
        alert("pieza externa")
    }
    
};
window.onclick = async () => {
    const found = await viewer.IFC.selector.pickIfcItem(false);
    if (found == null) { return;}
    const id = found.id;
    const foundElement = precastElements.find(element => element.expressID === id);
    if (foundElement.idproduccion) {
        if (foundElement.ifcType !== "IFCBUILDINGELEMENTPROXY") {
            const nuevoCamionCerramiento = document.getElementById("nuevoCamionCerramiento");
            if (foundElement.ART_Pieza.startsWith("T") && !nuevoCamionCerramiento.classList.contains("seleccionado")) {
                alert("Panel, SOLO en camion de cerramiento C.");
                return;
            }
            const nuevoCamionAlveolar = document.getElementById("nuevoCamionAlveolar");
            if (foundElement.ART_Pieza.startsWith("Y") && !nuevoCamionAlveolar.classList.contains("seleccionado")) {
                alert("Placa Alveolar, SOLO en camion A.");
                return;
            }
            hideClickedItem(viewer);
            let idString = id.toString();
            removeLabels(idString);
            const numCamionElement = document.getElementById("numCamion");
            let numCamion = numCamionElement.textContent.trim();
            const expressIDs = obtenerExpressIDsDelCamion(numCamion);
            const pesoTotal = calcularPesoTotal(expressIDs);
            const pesoCamion = document.getElementById("pesoCamion");
            pesoCamion.textContent = pesoTotal.toString();
        }
    } else {
        
        alert("pieza externa");
    }
};


   //evento Clic carga al camion elementos
const divNumCamiones = document.getElementById('divNumCamiones');
let btnsCamionActivo = false;
for (let i = 0; i < divNumCamiones.children.length; i++) {
    if (divNumCamiones.children[i].classList.contains("active")) {
        btnsCamionActivo = true;
        break;
    }
}

// window.oncontextmenu = () => {
//     if (!btnsCamionActivo) {
//         hideClickedItemBtnDrch(viewer); // Ocultar elemento del visor
//     }
// };

window.onkeydown = (event) => {  //evento esc, incluye todos los elementos ocultos con el BtnDrch de nuevo al visor
    if (!btnsCamionActivo) {
        if (event.code === 'Escape') {
            showAllItems(viewer, allIDs);
            // Buscar los checkbox en elemento con id="checktiposIfc" y los activa
            const checkboxes = document.querySelectorAll('#checktiposIfc input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
        }
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

function hideAllItems(viewer, ids) {
    viewer.IFC.loader.ifcManager.removeFromSubset(
        0,
        ids,
        'full-model-subset',
    );
}


let numCamion=1;
let letraTransporte = 'E';
let numT=1;
let numE = 1; 
let numA = 1;
let numC = 1;
let numTu = 1;

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
}

function crearMenuDesplegable(numElementos, target) { // menú desplegable dinámico
    const select = document.createElement('select'); // controlador de eventos en el elemento select.
    select.setAttribute('data-target', target);

    select.addEventListener('change', function() {
        const botonPadre = this.parentNode; //  botón padre del elemento select

        botonPadre.classList.add('active');
        botonPadre.classList.add('seleccionado');

        // desactiva otros botones si es necesario
        const botones = document.querySelectorAll('button');
        for (let boton of botones) {
            if (boton !== botonPadre && boton.classList.contains('seleccionado')) {
            boton.classList.remove('active');
            boton.classList.remove('seleccionado');
            }
        }
        numCamActual = parseInt(this.value); //numCamActual  valor entero del elemento select
        numT=numCamActual;
        
        const targetButton = document.getElementById(this.getAttribute('data-target')); //activa el boton correspondiente al desplegable seleccionado
        targetButton.classList.add('active');
        targetButton.classList.add('seleccionado');
        activarBoton(this.getAttribute('data-target'), numCamActual);

        letraTransporte = '';
        // const botonPadre = this.parentNode;
        if (botonPadre.id === 'menosA') {
            letraTransporte = 'A';
        } else if (botonPadre.id === 'menosC') {
            letraTransporte = 'C';
        } else if (botonPadre.id === 'menosE') {
            letraTransporte = 'E';
        }else if (botonPadre.id === 'menosTu') {
            letraTransporte = 'Tu';
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
        //numCamion=camSeleccionado;
        numCamion = parseInt(document.getElementById("numCamion").innerHTML);
    });

    for (let i = 0; i <= numElementos; i++) {
        const option = document.createElement('option');
        option.text = i;

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
    while (menosTu.lastChild) {
        menosTu.removeChild(menosTu.lastChild);
    }
    menosE.appendChild(crearMenuDesplegable(numE, 'nuevoCamionEstructura'));
    menosA.appendChild(crearMenuDesplegable(numA, 'nuevoCamionAlveolar'));
    menosC.appendChild(crearMenuDesplegable(numC, 'nuevoCamionCerramiento'));
    menosTu.appendChild(crearMenuDesplegable(numTu, 'nuevoCamionTubular'));
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
const nuevoCamionTubularBtn = document.getElementById("nuevoCamionTubular");

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
    //console.log(tablaTransporte);
}


nuevoCamionEstructuraBtn.addEventListener("click", function() {
    setProjectionMode("perspective");
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
        numT = numE;
        numLetra = numT + " - E";
        document.getElementById("numT").innerHTML = numLetra;
        funcTablaTransporte(numCamion, numLetra);
        actualizaDesplegables();
    } else if (numCamion !== maxCamion && elementoExistente !== undefined ) {
       // numCamion=parseInt(buscaNumCamionMaximo())+1;
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
        if (document.activeElement.tagName.toLowerCase() === 'input' && document.activeElement.type === 'text') {
            return; // No hacer nada si el <input> tiene el foco
        }
        setProjectionMode("perspective");
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
    setProjectionMode("perspective");
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
    if (document.activeElement.tagName.toLowerCase() === 'input' && document.activeElement.type === 'text') {
        return; // No hacer nada si el <input> tiene el foco
    }
    if (event.key === 'a' || event.key === 'A') {
        setProjectionMode("perspective");
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
    setProjectionMode("perspective");
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
    if (document.activeElement.tagName.toLowerCase() === 'input' && document.activeElement.type === 'text') {
        return; // No hacer nada si el <input> tiene el foco
    }
    if (event.key === 'c' || event.key === 'C') {
        setProjectionMode("perspective");
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

let boxHelper;
let geometry;
let centro;
nuevoCamionTubularBtn.addEventListener("click", function() {
    setProjectionMode("orthographic");
        
        // Obtener el centro del edificio
        // boxHelper = new BoxHelper(model, 0xff0000);
        // geometry = boxHelper.geometry;
        // centro = geometry.boundingSphere.center;

        //  cámara en el punto centro desplazada 50 unidades en el eje Y
        const camera = viewer.context.ifcCamera.cameraControls;
        camera.setLookAt(centro.x, centro.y + 50, centro.z, centro.x, centro.y, centro.z);
    
    seleccionarBoton(nuevoCamionTubularBtn);
    numCamion=buscaNumCamionMaximo();
    var maxCamion = 0;

    letraTransporte = "Tu";
    numT = numTu;
    numLetra = numT + " - Tu";
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
        numTu++;
        document.getElementById("numCamion").innerHTML = numCamion;
        letraTransporte = "Tu";
        numT = numTu;
        numLetra = numT + " - Tu";
        document.getElementById("numT").innerHTML = numLetra;
        funcTablaTransporte(numCamion, numLetra);
        actualizaDesplegables();
    } else if (numCamion === maxCamion && elementoExistente === undefined) {
        numCamion=maxCamion+1;
        document.getElementById("numCamion").innerHTML = numCamion;
        //numE++;
        numT = numTu;
        numLetra = numT + " - Tu";
        document.getElementById("numT").innerHTML = numLetra;
        funcTablaTransporte(numCamion, numLetra);
        actualizaDesplegables();
    } else if (numCamion !== maxCamion && elementoExistente !== undefined ) {
        // numCamion=maxCamion+1;
        document.getElementById("numCamion").innerHTML = numCamion;
        numTu++;
        numT = numTu;
        numLetra = numT + " - Tu";
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
        numT = numTu;
        numLetra = numT + " - Tu";
        document.getElementById("numT").innerHTML = numLetra;
        funcTablaTransporte(numCamion, numLetra);
        actualizaDesplegables();
    } 
});

document.addEventListener('keydown', function(event) {
    
    if (document.activeElement.tagName.toLowerCase() === 'input' && document.activeElement.type === 'text') {
        return; // No hacer nada si el <input> tiene el foco
    }
    if (event.key === 'x' || event.key === 'X') {
        setProjectionMode("orthographic");
        const boxHelper = new BoxHelper(model, 0xff0000);
        const geometry = boxHelper.geometry;
        const centro = geometry.boundingSphere.center;

        //  cámara en el punto centro desplazada 50 unidades en el eje Y
        const camera = viewer.context.ifcCamera.cameraControls;
        camera.setLookAt(centro.x, centro.y + 50, centro.z, centro.x, centro.y, centro.z);
        seleccionarBoton(nuevoCamionTubularBtn);
        numCamion=buscaNumCamionMaximo();
        var maxCamion = 0;

        letraTransporte = "Tu";
        numT = numTu;
        numLetra = numT + " - Tu";
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
            numTu++;
            document.getElementById("numCamion").innerHTML = numCamion;
            letraTransporte = "Tu";
            numT = numTu;
            numLetra = numT + " - Tu";
            document.getElementById("numT").innerHTML = numLetra;
            funcTablaTransporte(numCamion, numLetra);
            actualizaDesplegables();
        } else if (numCamion === maxCamion && elementoExistente === undefined) {
            numCamion=maxCamion+1;
            document.getElementById("numCamion").innerHTML = numCamion;
            //numE++;
            numT = numTu;
            numLetra = numT + " - Tu";
            document.getElementById("numT").innerHTML = numLetra;
            funcTablaTransporte(numCamion, numLetra);
            actualizaDesplegables();

        } else if (numCamion !== maxCamion && elementoExistente !== undefined ) {
            // numCamion=maxCamion+1;
            document.getElementById("numCamion").innerHTML = numCamion;
            numTu++;
            numT = numTu;
            numLetra = numT + " - Tu";
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
            numT = numTu;
            numLetra = numT + " - Tu";
            document.getElementById("numT").innerHTML = numLetra;
            funcTablaTransporte(numCamion, numLetra);
            actualizaDesplegables();
        } 
    }
});

function setProjectionMode(mode) {
    var currentMode = viewer.context.ifcCamera.cameraControls._camera.type;
    
    if (mode === "orthographic" && currentMode !== "OrthographicCamera") {    // Si el modo es 'orthographic' y la vista no está en proyección ortográfica, cambia a ortográfica
        viewer.context.ifcCamera.toggleProjection();  
    } else if (mode === "perspective" && currentMode !== "PerspectiveCamera") {    // Si el modo es 'perspective' y la vista no está en proyección perspectiva, cambia a perspectiva
        viewer.context.ifcCamera.toggleProjection();
    }
}

function seleccionarBoton(boton) {
    const botonesTipoCarga = document.querySelectorAll('#tipoCarga button');
    const botonesIconoOjo = document.querySelectorAll('.icono-ojo');
    botonesTipoCarga.forEach((boton) => {
        boton.classList.remove('seleccionado');
    });
    botonSeleccionado = boton;
    botonSeleccionado.classList.add("seleccionado");
}

// seleccion de botones de la tercera fila - icono
let ultimoBotonClicadojo = null;
const iconosOjo = document.querySelectorAll('.icono-ojo');
iconosOjo.forEach(boton => {
    boton.addEventListener('click', function () {
        generarTablaPorLetra(boton.dataset.letra);
        if (ultimoBotonClicadojo && ultimoBotonClicadojo !== boton) {
            ultimoBotonClicadojo.style.border = '';
            ultimoBotonClicadojo.querySelector('i').classList.remove('fa-eye');
            ultimoBotonClicadojo.querySelector('i').classList.add('fa-eye-slash');
            ultimoBotonClicadojo.style.backgroundColor = ''; 
        }
        if (boton.style.border === "1px solid red") {
            boton.style.border = '';
            boton.querySelector('i').classList.remove('fa-eye');
            boton.querySelector('i').classList.add('fa-eye-slash');
            boton.style.backgroundColor = '';
            boton.querySelector('i').style.color = '';
            ultimoBotonClicadojo = null;
        }  else {
            boton.style.border = "1px solid red";
            boton.style.borderRadius = "5px";
            boton.querySelector('i').classList.remove('fa-eye-slash');
            boton.querySelector('i').classList.add('fa-eye');
            
            // Agregar el color de fondo del botón superior al botón clickeado
            const tipoCarga = document.getElementById('tipoCarga');
            const botonesFila1 = tipoCarga.querySelectorAll('.boton-carga');
            const letra = boton.dataset.letra.toUpperCase();
            const botonFila1 = Array.from(botonesFila1).find(boton => boton.innerText === letra);
            if (botonFila1) {
                const colorFondo = botonFila1.dataset.color;
                boton.style.backgroundColor = colorFondo;
                botonFila1.click();
            }
        ultimoBotonClicadojo = boton;
    }
    const botonesConBordeRojo = document.querySelectorAll('.icono-ojo[style="border: 1px solid red;"]');
    if (botonesConBordeRojo.length === 0 && !ultimoBotonClicadojo) {
        listarOcultos(elementosOcultos);
    } 
    });
});

function generarTablaPorLetra(letra) {
    const itemList = document.querySelector(".item-list-elementos-cargados");
    itemList.innerHTML = "";
    const table = document.createElement("table");
    table.classList.add("table");
    const thead = document.createElement("thead");
    thead.innerHTML ="<tr><th>ID</th><th>Trans</th><th>Nombre</th><th>Peso</th><th>Alto</th><th>Ancho</th><th>Longitud</th></tr>";
    table.appendChild(thead);

    const filteredElements = precastElements.filter((elemento) => {
        if (elemento.hasOwnProperty("tipoTransporte")) {
            return elemento.tipoTransporte.includes(letra);
        }
        return false;
    });
    
    const tbody = document.createElement("tbody");
    for (let i = filteredElements.length - 1; i >= 0; i--) {
        const id = filteredElements[i].expressID;
        const elemento = precastElements.find((elemento) => elemento.expressID === id);
        if (!elemento) {
            throw new Error(`No se encontró el elemento con expressID = ${id}`);
        }
        const tr = document.createElement("tr");
        tr.classList.add("item-list-elemento");
        tr.innerHTML = `<td>${elemento.expressID}</td><td>${elemento.tipoTransporte}</td><td>${elemento.ART_Pieza}</td><td>${parseFloat(elemento.ART_Peso).toFixed(2)}</td><td>${parseFloat(elemento.ART_Alto).toFixed(2)}</td><td>${parseFloat(elemento.ART_Ancho).toFixed(2)}</td><td>${parseFloat(elemento.ART_Longitud).toFixed(2)}</td>`;
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    itemList.appendChild(table);
    $(table).tablesorter();
}

function peticionElementosCaminon(elementoEnPrecast) {
    const url = `http://${rutaServidor}:8000/cargacamion/`;
    let tipoTabla;
    let idObra;
    let numeroCamion;
    if(elementoEnPrecast.letraTransporte==='A'){
        tipoTabla='alveolar';
        idObra=idAlveolar;
        numeroCamion=elementoEnPrecast.numTransporte;
    }
    if(elementoEnPrecast.letraTransporte==='C'){
        tipoTabla='cerramiento';
        idObra=idEstruCerra;
        numeroCamion=elementoEnPrecast.numTransporte;
    }
    if(elementoEnPrecast.letraTransporte==='E'){
        tipoTabla='estructura';
        idObra=idEstruCerra;
        numeroCamion=elementoEnPrecast.numTransporte;
    }
    const datos = {
      tabla: tipoTabla,
      obra: idObra,
      n_camion: numeroCamion
    };
    console.log("DATOS enviados a peticionELEMNETOS")
    console.log(JSON.stringify(datos))
    function realizarPeticion() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('accept', 'application/json');
    
            xhr.onload = function () {
            if (xhr.status === 200) {
                const respuesta = JSON.parse(xhr.responseText);
                resolve(respuesta);
            } else {
                reject(xhr.status);
            }
            };
    
            xhr.onerror = function () {
            reject(xhr.status);
            };
    
            const datosJSON = JSON.stringify(datos);
    
            xhr.send(datosJSON);
        });
    }

    realizarPeticion()
        .then(respuesta => {
        console.log(respuesta);

    })
    .catch(error => {

        console.error('Error en la petición:', error);
    });
}

//Lógica para eliminar de la tabla HTML los elementos cargados, volver a visualizarlos
//los elementos que borra de la tabla HTML los devuelve al array allIDs
// los elimina de la lista elementosOcultos
//y vuelve a colocar el valor de la prop Camion ''
const divCargas = document.querySelector('.divCargas');
let listaElementos = divCargas.querySelector('.item-list-elementos-cargados');
listaElementos.addEventListener('dblclick', function(event) {
    // const target = event.target;
    // let elementoEliminadoTabla;
    // let elementoEnPrecast;
    // if (target.tagName === 'TD') {
    //     elementoEliminadoTabla = target.parentNode.firstChild.textContent;
    //     let elementoEliminadoTablaEntero=parseInt(elementoEliminadoTabla)
    //     elementoEnPrecast = precastElements.find(elemento => elemento.expressID === parseInt(elementoEliminadoTabla));
        
        
        
    //     if(elementoEnPrecast.Posicion){
    //         let posicionEliminar=elementoEnPrecast.Posicion;
    //         Eliminar(elementoEliminadoTablaEntero, posicionEliminar)
    //         peticionElementosCaminon(elementoEnPrecast)
    //     }

    //     target.parentNode.remove();
    //     let indexToRemove = elementosOcultos.indexOf(parseInt(elementoEliminadoTabla));
    //     if (indexToRemove !== -1) {  //elimina de ambos array el elemento deseado a traves del indice
    //         elementosOcultos.splice(indexToRemove, 1);
    //         globalIds.splice(indexToRemove, 1);
    //     }
    //     allIDs.push(parseInt(elementoEliminadoTabla));
    //     if (document.querySelector(".btnNumCamion.active")) {
    //         removeLabels(elementoEliminadoTabla);
    //         hideAllItem(viewer, parseInt(elementoEliminadoTabla));
            
    //         const objetoEncontrado = precastElements.find((elemento) => elemento.expressID === parseInt(elementoEliminadoTabla));
    //         const objetoEncontradoCamion=objetoEncontrado.Camion;

    //         const elementosTabla = document.querySelectorAll(".tabla-estilo");
    //         const idCorrecto = objetoEncontradoCamion.toString();
    //         let tablaConEstilo = false; 

    //         elementosTabla.forEach(tabla => {
    //             if (tabla.getAttribute('data-id') === idCorrecto) {
    //                 if (tabla.style.border === "3px solid red") {
    //                     tablaConEstilo = true; 
    //                 }
    //                 eliminarTabla(objetoEncontradoCamion);
    //                 const expressIDs = [];
    //                 precastElements.forEach((elemento) => {
    //                     if (elemento.Camion === objetoEncontradoCamion) {
    //                         expressIDs.push(elemento.expressID);
    //                     }
    //                 });
    //                 const expressIDsNuevaTabla = expressIDs.filter((elemento) => elemento !== parseInt(elementoEliminadoTabla));
    //                 generarTabla(expressIDsNuevaTabla, objetoEncontradoCamion);
    //                 if(tablaConEstilo === true){
    //                     const divPosicionesCamion = document.getElementById("posicionCamion");
    //                     divPosicionesCamion.innerHTML = "";
    //                     tablaConEstilo = false;
    //                 }
    //             }
    //         });
            
    //     }
    //     let elEliminado=parseInt(elementoEliminadoTabla) 
    //     actualizaFireExpress(elEliminado) ;
    // }
    // let numCamion=parseInt(document.getElementById("numCamion").textContent);
    // const actValorCamion = precastElements.find(element => element.expressID === (parseInt(elementoEliminadoTabla)));
    //     if(actValorCamion.Camion===parseInt(numCamion)){
    //         const expressIDs = obtenerExpressIDsDelCamion(numCamion);
    //         const pesoTotal = calcularPesoTotal(expressIDs);
    //         const pesoCamion = document.getElementById("pesoCamion");
    //         pesoCamion.textContent =  pesoTotal.toString();
    //     }
        
        
    //     if (actValorCamion) {
    //         actValorCamion.Camion = "";
    //         actValorCamion.tipoTransporte = "";
    //         actValorCamion.Posicion = "";
    //         actValorCamion.numTransporte = "";
    //         actValorCamion.letraTransporte = "";
    //     }
        
    // const expressIDs = obtenerExpressIDsDelCamion(numCamion);
    // const pesoTotal = calcularPesoTotal(expressIDs);
    // const pesoCamion = document.getElementById("pesoCamion");
    // pesoCamion.textContent =  pesoTotal.toString();
    // updateMissingCamionCount();
    // updateElementVisor();
});

function updateElementVisor() {
    const matchingIds = [];
    const checkedArtPiezas = [];
    const divCheck = document.getElementById("checktiposIfc");
    const checkboxes = divCheck.querySelectorAll("input[type='checkbox']");
    
    checkboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
            checkedArtPiezas.push(checkbox.getAttribute('data-art-pieza'));
        }
        });
    
        precastElements.forEach(function (element) {
            if (element.ART_Pieza === 0 || element.ART_Pieza === "0" || element.ART_Pieza === "" || element.ART_Pieza === undefined) {
                return;
            }
            // if (checkedArtPiezas.includes(element.ART_Pieza.charAt(0).toUpperCase())) {
                // if (checkedArtPiezas.includes(element.ART_Pieza.slice(0, 2).toUpperCase())) {
            if (checkedArtPiezas.includes(element.ART_Pieza.charAt(0).toUpperCase()) ||checkedArtPiezas.includes(element.ART_Pieza.slice(0, 2).toUpperCase())) {
                if (!element.hasOwnProperty('Camion') || element.Camion === "") {
                matchingIds.push(element.expressID);
                }
            }
        });
    
        showAllItems(viewer, matchingIds);
    }
let camionesActuales = [];
let coloresCamiones = {};

async function listarOcultos(elementosOcultos) {
    const itemList = document.querySelector(".item-list-elementos-cargados");
    itemList.innerHTML = "";
    const table = document.createElement("table");
    table.classList.add("table");

    const thead = document.createElement("thead");
    thead.innerHTML = "<tr><th>ID</th><th>C</th><th>Trans</th><th>Nombre</th><th>Peso</th><th>Alto</th><th>Ancho</th><th>Long</th></tr>";
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const groupedRows = {};

    for (let i = elementosOcultos.length - 1; i >= 0; i--) {
        const id = elementosOcultos[i];
        const elemento = precastElements.find((elemento) => elemento.expressID === id);
        if (!elemento) {
        throw new Error(`No se encontró el elemento con expressID = ${id}`);
        }
        const trans = elemento.tipoTransporte;
        const peso = parseFloat(elemento.ART_Peso).toFixed(2);
        const altura = parseFloat(elemento.ART_Alto).toFixed(2);
        const ancho = parseFloat(elemento.ART_Ancho).toFixed(2);
        const longitud = parseFloat(elemento.ART_Longitud).toFixed(2);

        const tr = document.createElement("tr");
        tr.classList.add("item-list-elemento");
        const alturaCell = document.createElement("td");
        alturaCell.classList.add("altura");
        if (parseFloat(altura) > 2.60) {
        alturaCell.style.color = "red";
        }
        alturaCell.textContent = altura;

        const longitudCell = document.createElement("td");
        longitudCell.classList.add("longitud");
        if (parseFloat(longitud) > 13.60) {
        longitudCell.style.color = "red";
        }
        longitudCell.textContent = longitud;

        tr.innerHTML = `<td>${elemento.expressID}</td><td>${elemento.Camion}</td><td>${trans}</td><td>${elemento.ART_Pieza}</td><td>${peso}</td>`;
        tr.appendChild(alturaCell);
        tr.innerHTML += `<td>${ancho}</td>`;
        tr.appendChild(longitudCell);

        let backgroundColor;
        if (camionesActuales.includes(elemento.Camion)) {
        backgroundColor = coloresCamiones[elemento.Camion];
        } else {
        const newColor = getRandomColor();
        coloresCamiones[elemento.Camion] = newColor;
        camionesActuales.push(elemento.Camion);
        backgroundColor = newColor;
        }
        tr.style.backgroundColor = backgroundColor;

        if (!groupedRows[trans]) {
        groupedRows[trans] = [];
        }
        groupedRows[trans].push(tr);
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    itemList.appendChild(table);
    $(table).tablesorter();

    updateMissingCamionCount();
}


function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 3; i++) {
        const index = Math.floor(Math.random() * 3); // Seleccionar un canal de color (R, G o B)
        const value = Math.floor(Math.random() * 128) + 128; // Generar un valor claro (128-255)
        color += letters[value >> 4]; // Primer dígito hexadecimal
        color += letters[value & 0x0F]; // Segundo dígito hexadecimal
    }
    return color;
}


function obtenerExpressIDsDelCamion(numCamion) {
    const expressIDs = [];
    for (const elem of precastElements) {
        if (elem.Camion === parseInt(numCamion) || elem.Camion===numCamion.toString()) {
            expressIDs.push(elem.expressID);
        }
        }
    return expressIDs;
}

function obtenerExpressIDsDelCamionCSV(numCamion) {
    const expressIDs = [];
    for (const elem of precastElements) {
        if (elem.Camion == numCamion || elem.Camion === numCamion.toString()) {
            expressIDs.push(elem.expressID);
        }
    }
    return expressIDs;
}

function hideClickedItem(viewer) {
    const divCargas = document.querySelector('.divCargas');
    divCargas.style.display = 'block'; //hace visible el div de la tabla en HTML
    let generarCamionesUnicos = true;
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
                //removeBordes(id);
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
                    actValorCamion.letraTransporte=letraTransporte;
                    actValorCamion.numTransporte=numT;
                    actValorCamion.Posicion="";
                }
                listarOcultos(elementosOcultos);
                let indexToRemove = allIDs.indexOf(id);
                if (indexToRemove !== -1) {
                    allIDs.splice(indexToRemove, 1);
                } 
            } else {
                generarCamionesUnicos = false;
                break;
                // alert("El elemento "+precastElements[i].expressID+"  "+ precastElements[i].ifcType +" ya está cargado en el camion: "+precastElements[i].Camion);
                // document.getElementById("datosCamiones").innerHTML = "";
                // document.getElementById("posicionCamion").innerHTML = "";
                // hideAllItems(viewer, elementosOcultos);
                // showAllItems ( viewer, allIDs);
            }
            break; 
        }
    }
    if (generarCamionesUnicos) {
        camionesUnicos = obtenerValorCamion(precastElements);
        generaBotonesNumCamion(camionesUnicos, botonSeleccionadoActual);
    }
}

//Elimina de visor un elemento pulsado con boton derecho
// function hideClickedItemBtnDrch(viewer) {
//     const result = viewer.context.castRayIfc();
//         if (!result) return;
//         const manager = viewer.IFC.loader.ifcManager;
//         const id = manager.getExpressId(result.object.geometry, result.faceIndex);
//         viewer.IFC.loader.ifcManager.removeFromSubset(
//             0,
//             [id],
//             'full-model-subset',
//         );
//         viewer.IFC.selector.unpickIfcItems();
// }

// **************************************************
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

function getAllIds(ifcModel) {
    return Array.from(
        new Set(ifcModel.geometry.attributes.expressID.array),
    );
}

// ACCEDER A PROPIEDADES
//al mover el raton por el 3D, va preseleccionando los elemnetos que lo componen,
container.onmousemove = () => viewer.IFC.selector.prePickIfcItem();
viewer.IFC.selector.unpickIfcItems();
let globalIds=[];
let globalId;


async function getPropSetExpressID(expressID) {
    const properties = await viewer.IFC.getProperties(0, expressID, true, true);
    const propertySets = properties.psets;
    const propertySetsArray = Object.values(propertySets);

    if (propertySetsArray.length > 0) {
        const ultimaPropertySet = propertySetsArray[propertySetsArray.length - 1];
        const atributesPropertySet = propertySetsArray[propertySetsArray.length - 2];

        return {
            ultimaPropertySet: ultimaPropertySet,
            atributesPropertySet: atributesPropertySet
        };
    }

    return null; 
}

async function edita2( expressID ) {
    
    let nombreAntiguo = null;
    for (const precast of precastElements) {
        if (precast.expressID === expressID) {
            nombreAntiguo = precast.ART_Pieza;
            break;
        }
    }
    let nombreMod = prompt(`El nuevo número que se asignará a: ${nombreAntiguo}`);
    const nombreModValido=validaNombreMod(nombreMod);
    if (!nombreModValido){
        alert("Nuevo nombre asigando a la pieza no valido. Solo debes introducir el nuevo numero de tres cifras");
        return;
    }
    if(nombreMod===null || nombreMod===''|| nombreMod== undefined){
        return;
    }

    const resultadoNombreAntiguo = separaLetrasNum(nombreAntiguo)
    const letraNombreAntiguo=resultadoNombreAntiguo.letras;
    const nombreNuevoNL=letraNombreAntiguo+nombreMod;
    const respuesta = confirm(`¿Desea cambiar el nombre de ${nombreAntiguo} por ${nombreNuevoNL}?`);
            if (respuesta) {
                
                console.log(`El usuario seleccionó Sí/Yes para cambiar el nombre de ${expressID} por ${nombreMod}`);
            } else {
                    console.log(`El usuario seleccionó No/Cancel para cambiar el nombre de ${expressID} por ${nombreMod}`);
                    return;
            } 
    const manager = viewer.IFC.loader.ifcManager;
    
    const assemblyIDs = await manager.getAllItemsOfType(0, IFCELEMENTASSEMBLY, false);
    let foundElement = null;
    const foundObject = precastElements.find(obj => obj.expressID === expressID);
    if (foundObject) {
        foundElement = foundObject.BEP_expressID;
    }
    const position = assemblyIDs.indexOf(foundElement);
    const assemblyID = assemblyIDs[position];
    const propertySetsTotal = await getPropSetExpressID(assemblyID);
    const propertySets=propertySetsTotal.ultimaPropertySet;
    const propertySetsPrecast=propertySetsTotal.atributesPropertySet;

    // console.log(propertySets)
    // console.log(propertySetsPrecast)

    for (let i = 0; i < propertySetsPrecast.HasProperties.length; i++) {
        if (propertySetsPrecast.HasProperties[i].Name.value === "ElementNumber") {
            let numMod=parseInt(nombreMod);
            propertySetsPrecast.HasProperties[i].NominalValue.value = numMod;
            break;
        }
    } 
    for (let i = 0; i < propertySets.HasProperties.length; i++) {
        if (propertySets.HasProperties[i].Name.value === "ART_Pieza") {

            propertySets.HasProperties[i].NominalValue.value = nombreNuevoNL;
            break;
        }
    }
    // if (propertySets.HasProperties.length >= 11) {
    //     const artPiezaProperty = propertySets.HasProperties[9].NominalValue;
    //     artPiezaProperty.value = nombreNuevoNL;
    // }
    const assembly =  await manager.getItemProperties(0, assemblyID, true, true);
    assembly.Name.value = nombreNuevoNL ;
    manager.ifcAPI.WriteLine(0, assembly);
    manager.ifcAPI.WriteLine(0, propertySets);
    manager.ifcAPI.WriteLine(0, propertySetsPrecast);

    updatePrecastElementsBeforeEdita(nombreNuevoNL, expressID);

    const label = document.getElementById("file-name");
    const fileName = label.innerText;
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0]; // Formato YYYY-MM-DD
    const modifiedFileName = fileName.substring(0, fileName.indexOf(".ifc")) + "Mod_" + formattedDate + ".ifc";

    const data = await manager.ifcAPI.ExportFileAsIFC(0);
    const blob = new Blob([data]);
    const file = new File([blob], modifiedFileName);

    const link = document.createElement('a');
    link.download = modifiedFileName;
    link.href = URL.createObjectURL(file);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
}

function updatePrecastElementsBeforeEdita(nombreNuevoNL, expressID) {
    const foundObject = precastElements.find(obj => obj.expressID === expressID);
    if (foundObject) {
        foundObject.ART_Pieza = nombreNuevoNL;
    }
}

function validaNombreMod(nombreMod) {
    const regex = /^\d{1,3}$/;
    return regex.test(nombreMod);
}

function separaLetrasNum(nombreMod){
    const letras = nombreMod.match(/[a-zA-Z]{1,2}/); //  una o dos letras
    const numeros = nombreMod.match(/\d{1,2,3}/g); //  uno  dos o tres dígitos
    
    const parteLetras = letras ? letras[0] : '';
    const parteNumeros = numeros ? numeros.join('') : '';
    return {
        letras: parteLetras,
        numeros: parteNumeros
    };
}


container.onclick = async () => {
    
    if(isClickedModifica){
        const foundM = await viewer.IFC.selector.pickIfcItem(false);
            if (foundM === null || foundM === undefined) {
                const container = document.getElementById('propiedades-container');
                container.style.visibility = "hidden";
                viewer.IFC.selector.unpickIfcItems();
                return;
            }
            const expressID = foundM.id;
            const textoMod = document.getElementById("textoModifica");
            textoMod.style.display = "none";
            edita2( expressID )
    }
    const found = await viewer.IFC.selector.pickIfcItem(false);
    if (found === null || found === undefined) {
        const container = document.getElementById('propiedades-container');
        container.style.visibility = "hidden";
        viewer.IFC.selector.unpickIfcItems();
        return;
    }
    const expressID = found.id;

    let ART_Pieza = null;
    let ART_Longitud = null;
    let ART_Volumen = null;
    let ART_Ancho = null;

    for (const precast of precastElements) {
        if (precast.expressID === expressID) {
            ART_Pieza = precast['ART_Pieza'];
            ART_Longitud = precast['ART_Longitud'];
            ART_Ancho = precast['ART_Ancho'];
            ART_Alto = precast['ART_Alto'];
            ART_Peso = precast['ART_Peso'];
            console.log(precast.ART_Pieza)
            console.log(precast.idproduccion)
            
            break;
        }
    }
    
    muestraPropiedades(ART_Pieza, ART_Longitud, ART_Ancho, ART_Alto, ART_Peso);

};

function muestraPropiedades(ART_Pieza, ART_Longitud, ART_Ancho, ART_Alto, ART_Peso) {
    const container = document.getElementById('propiedades-container');
    container.style.visibility = "visible";

    const propiedadesDiv = document.createElement('div');
    propiedadesDiv.classList.add('propiedades');
    
    const piezaLabel = document.createElement('p');
    piezaLabel.innerHTML = `Pieza: <strong>${ART_Pieza}</strong>`;
    
    const longitudLabel = document.createElement('p');
    const longitudNum=parseFloat(ART_Longitud);
    const longitudFormatted= longitudNum.toFixed(2);
    longitudLabel.innerHTML = `Longitud: <strong>${longitudFormatted}</strong>`;

    const anchoLabel = document.createElement('p');
    const anchoNum = parseFloat(ART_Ancho);
    const anchoFormatted = anchoNum.toFixed(2);
    anchoLabel.innerHTML = `Ancho: <strong>${anchoFormatted}</strong>`;

    const altoLabel = document.createElement('p');
    const altoNum = parseFloat(ART_Alto);
    const altoFormatted = altoNum.toFixed(2);
    altoLabel.innerHTML = `Alto: <strong>${altoFormatted}</strong>`;
    
    const pesoLabel = document.createElement('p');
    const pesoNum = parseFloat(ART_Peso);
    const pesoFormatted = pesoNum.toFixed(2);
    pesoLabel.innerHTML = `Peso: <strong>${pesoFormatted}</strong>`;
    
    propiedadesDiv.appendChild(piezaLabel);
    propiedadesDiv.appendChild(longitudLabel);
    propiedadesDiv.appendChild(anchoLabel);
    propiedadesDiv.appendChild(altoLabel);
    propiedadesDiv.appendChild(pesoLabel);
    
    const propiedadesContainer = document.getElementById('propiedades-container');
    propiedadesContainer.innerHTML = ''; // Limpia el contenido existente
    propiedadesContainer.appendChild(propiedadesDiv);
}


function muestraPropiedadesExpressId(expressID) {
    const container=document.getElementById('propiedades-container');
    container.style.visibility="visible";
    
    let ART_Pieza, ART_Longitud, ART_Volumen;
    for (const precast of precastElements) {
        if (precast.expressID ===parseInt(expressID) ) {
            ART_Pieza = precast['ART_Pieza'];
            ART_Longitud = precast['ART_Longitud'];
            ART_Ancho = precast['ART_Ancho'];
            ART_Alto = precast['ART_Alto'];
            ART_Peso = precast['ART_Peso'];
            break;
        }
    }
    const propiedadesDiv = document.createElement('div');
    propiedadesDiv.classList.add('propiedades');
    
    const piezaLabel = document.createElement('p');
    piezaLabel.innerHTML = `Pieza: <strong>${ART_Pieza}</strong>`;
    
    const longitudLabel = document.createElement('p');
    const longitudNum=parseFloat(ART_Longitud);
    const longitudFormatted= longitudNum.toFixed(2);
    longitudLabel.innerHTML = `Longitud: <strong>${longitudFormatted}</strong>`;

    const anchoLabel = document.createElement('p');
    const anchoNum = parseFloat(ART_Ancho);
    const anchoFormatted = anchoNum.toFixed(2);
    anchoLabel.innerHTML = `Ancho: <strong>${anchoFormatted}</strong>`;

    const altoLabel = document.createElement('p');
    const altoNum = parseFloat(ART_Alto);
    const altoFormatted = altoNum.toFixed(2);
    altoLabel.innerHTML = `Alto: <strong>${altoFormatted}</strong>`;
    
    const pesoLabel = document.createElement('p');
    const pesoNum = parseFloat(ART_Peso);
    const pesoFormatted = pesoNum.toFixed(2);
    pesoLabel.innerHTML = `Peso: <strong>${pesoFormatted}</strong>`;
    
    propiedadesDiv.appendChild(piezaLabel);
    propiedadesDiv.appendChild(longitudLabel);
    propiedadesDiv.appendChild(anchoLabel);
    propiedadesDiv.appendChild(altoLabel);
    propiedadesDiv.appendChild(pesoLabel);
    
    const propiedadesContainer = document.getElementById('propiedades-container');
    propiedadesContainer.innerHTML = ''; // Limpia el contenido existente
    propiedadesContainer.appendChild(propiedadesDiv);
}
// **************************************************

// TODO: AÑADE Name +GlobalID
async function precastPropertiesGlobalId(precast,modelID, precastID){
    const props = await viewer.IFC.getProperties(modelID, precastID, true, false);
    precast['GlobalId'] = props['GlobalId'].value; //establece propiedad GlobalId en obj precast y le asigna un valor
    precast['Name'] = props['Name'].value; //establece propiedad Name en obj precast y le asigna un valor
    
}

async function precastProperties(precast,modelID, precastID){
    const props = await viewer.IFC.getProperties(modelID, precastID, true, true);

    const mats =props.mats;
    // console.log("PROPS MATS "+mats)
    const psets =props.psets;
    const type= props.type;
    // for (let mat in mats){
        
    //     getName = mats[mat].Name.value;
        
    //     let properties = mats[mat].HasProperties;
    //     if (mats[mat] !== IfcElementQuantity){
    //         for (let property in properties){
    //             console.log("MATS "+properties[property].Name.value, properties[property].NominalValue.value, true);
    //         }
    //     }
    // }

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
                createPropertyEntry(properties[property].Name.value, properties[property].NominalValue.value, true);
            }
        }
    }
    //let properties2= psets[2].HasProperties;
    //console.log(properties2);
}

// construye un menu de propiedades 
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
    //console.log(ifcProject);
    
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

    if (!exists && node.type !== "IFCBUILDING" && node.type !== "IFCSITE" && node.type !== "IFCBUILDINGSTOREY" && node.type !== "IFCBUILDINGELEMENTPROXY") {
        let objetoAtributo = { expressID: node.expressID, ifcType: node.type };
        precastElements.push(objetoAtributo);
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
        // const props = await viewer.IFC.getProperties (0, node.expressID, true, true);
        // updatePropertyMenu(props);
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
    const fileNameLabel = document.getElementById('file-name');
    const fileName = fileNameLabel.textContent.trim();
    const fileNameWithoutExtension = fileName.split(/\.ifc/i)[0];

    
    link.setAttribute('download', fileNameWithoutExtension + '.csv');
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
        precastElements.forEach(dato => {
            if (dato.Camion) {
                dato.Camion = parseInt(dato.Camion, 10); 
            }
            
        });
        mostrarElementosRestantes();
        clasificarPorTipoTransporte();
        actualizaDesplegables();
        creaTablaTransporte();
        
        nuevoCamionEstructuraBtn.click();
    })
    .catch(error => console.error(error));

    
});

const numCamionElement = document.getElementById("numCamion");


const observer = new MutationObserver(function (mutationsList) {
    for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.target === numCamionElement) {
        handleNumCamionChange();
        }
    }
});
const config = { childList: true };// Configurar las opciones de observación
observer.observe(numCamionElement, config);//  observa los cambios en el elemento

function handleNumCamionChange() {
    const numCamion = numCamionElement.textContent.trim();
    const expressIDs = obtenerExpressIDsDelCamionCSV(numCamion);
    const pesoTotal = calcularPesoTotal(expressIDs);
    const pesoCamion = document.getElementById("pesoCamion");
    pesoCamion.textContent = pesoTotal.toString();
}

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
let transporteTu = [];

function clasificarPorTipoTransporte() {
    const transporteA = [];
    const transporteC = [];
    const transporteE = [];
    const transporteTu = [];

    for (let i = 0; i < precastElements.length; i++) {
        const tipoTransporte = precastElements[i].tipoTransporte;

        if (tipoTransporte) {
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

                case "Tu":
                    transporteTu.push(precastElements[i]);
                    break;
            }
        } else {
            // Código para manejar el caso en que no existe la propiedad tipoTransporte en el objeto
            // Por ejemplo, puedes ignorar este objeto o realizar alguna otra acción adecuada
            // console.warn('El objeto en la posición', i, 'no tiene la propiedad tipoTransporte');
        }
    }

    buscaMaxTransporte(transporteA);
    buscaMaxTransporte(transporteC);
    buscaMaxTransporte(transporteE);
    buscaMaxTransporte(transporteTu);
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
    // if (letraTrans=== 'Tu'){
    //     numTu=numCamMax;
    //     numT=numTu;
    // }
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
        if (precastElements[i].Camion === undefined || precastElements[i].Camion ==='' ) {
            const expressID = parseInt(precastElements[i].expressID);
            allIDs.push(expressID);
        }else{
            const expressIDoculto = parseInt(precastElements[i].expressID);
            elementosOcultos.push(expressIDoculto);// Agregamos el valor al array elemenOcultos
        }
    }
    camionesUnicos = obtenerValorCamion(precastElements);
    
    generaBotonesNumCamion(camionesUnicos);
    viewer.IFC.loader.ifcManager.clearSubset(0,"full-model-subset");
    subset = getWholeSubset(viewer, model, allIDs);
    replaceOriginalModelBySubset(viewer, model, subset);
    await listarOcultos(elementosOcultos);
}

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

let activeExpressIDs = [];
function generaBotonesNumCamion(camionesUnicos) {
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
    btnNumCamiones.innerHTML = ""; //limpia el div antes de generar los botones
    agregarBotonCero();
    camionesUnicos.sort((a, b) => a - b); // ordena los nº de camion de menor a mayor
    const checkboxGroup = document.getElementsByClassName("checkbox-group");
    camionesUnicos.forEach(function(camion) {
        const btn = document.createElement("button");
        btn.setAttribute("class", "btnNumCamion");
        
        // Obtener el tipo de transporte correspondiente al camión actual
        const tipoTransporte = precastElements.find(elemento => parseInt(elemento.Camion) === camion)?.tipoTransporte;
        
        // Crear un elemento <div> para contener los textos
        const divContenedor = document.createElement("div");
        
        // Crear un elemento <span> para el texto del camión
        const spanCamion = document.createElement("span");
        spanCamion.textContent = camion;
        
        // Crear un elemento <br> para el salto de línea
        const br = document.createElement("br");
        
        // Crear un elemento <span> para el texto del tipo de transporte
        const spanTipoTransporte = document.createElement("span");
        spanTipoTransporte.textContent = tipoTransporte;
        
        // Agregar los elementos al contenedor
        divContenedor.appendChild(spanCamion);
        divContenedor.appendChild(br);
        divContenedor.appendChild(spanTipoTransporte);
        
        // Agregar el contenedor al botón
        btn.appendChild(divContenedor);
        
        // Agregar el botón al contenedor de botones
        btnNumCamiones.appendChild(btn);

        let todosTienenPosicion = precastElements.filter(function(precastElement) { 
                return parseInt(precastElement.Camion) === camion;
            }).every(function(precastElement) {
                // verifica si todos los elementos cumplen qeu existe valor en posicion
                return precastElement.hasOwnProperty('Posicion') && precastElement.Posicion !== "";
            });
        if (todosTienenPosicion) {
            btn.style.border = "2px solid blue";
            btn.style.boxShadow = "0 0 5px blue";
        }

        precastElements.forEach(function(precastElement) {
            if (parseInt(precastElement.Camion) === camion) {
                const tipoTransporte = precastElement.tipoTransporte;
                if (tipoTransporte.includes("E")) {
                    btn.style.backgroundColor = "#6d4c90";
                } else if (tipoTransporte.includes("A")) {
                    btn.style.backgroundColor = "#4c7a90";
                } else if (tipoTransporte.includes("C")) {
                    btn.style.backgroundColor = "#90834c";
                }else if (tipoTransporte.includes("Tu")) {
                    btn.style.backgroundColor = "#9e9e9e";
                }
            }
        });
        btnNumCamiones.appendChild(btn);
        btn.addEventListener("click", function() {

            const btnCero= document.getElementById("botonCero")
            if(btnCero.classList.contains("active")){
                btnCero.click();
               // botonesActivos--;
            }


            let checkboxStates = {};
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(function (checkbox) {
                checkboxStates[checkbox.id] = checkbox.checked;
            });
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
                activeExpressIDs = activeExpressIDs.filter(id => !expressIDs.includes(id));
                // hideAllItems(viewer, expressIDs);
                btn.classList.remove("active");
                btn.style.justifyContent = "center";
                btn.style.color = "";
                botonesActivos--;
                eliminarTabla(camion);
                const posicionCamion = document.getElementById("posicionCamion");
                posicionCamion.innerHTML = ""; // limpia el contenido previo del div
                
                btnsCamionActivo = false;
                removeLabels(expressIDs);
                hideAllItems(viewer, expressIDs);
                verificarPosicionYAsignarColor(camion, btn);
            } else {
                const btnCheckPulsado = document.querySelectorAll('.btnCheck.pulsado');
                btnCheckPulsado.forEach(function(btn) {
                    btn.classList.remove('pulsado');
                });

                // Ocultar los elementos de la clase "PIEZA-LABEL"
                const piezaLabels = document.querySelectorAll('.pieza-label');
                piezaLabels.forEach(function(label) {
                    label.style.visibility = 'hidden';
                });

                activeExpressIDs = activeExpressIDs.concat(expressIDs);
                viewer.IFC.selector.unpickIfcItems();
                hideAllItems(viewer, allIDs);
                showAllItems(viewer, expressIDs);
                btn.classList.add("active");
                btn.style.color = "red";
                generarTabla(expressIDs, camion);
                botonesActivos++;
                btnsCamionActivo = true;
                generateLabels(expressIDs);
            }
            if (botonesActivos === 0) {
                enableCheckboxes();
                const checkedArtPiezas = []; 
                checkboxes.forEach(function (checkbox) {
                    if (checkbox.checked) {
                        checkedArtPiezas.push(checkbox.getAttribute('data-art-pieza'));
                    }
                });
                const matchingIds = []; // Almacenar los IDs de los elementos que coinciden con los checkboxes seleccionados
                
                precastElements.forEach(function (element) {
                    if (element.ART_Pieza === 0 || element.ART_Pieza === "0" || element.ART_Pieza === "" || element.ART_Pieza === undefined) {
                        return;
                    }
                    if (
                        checkedArtPiezas.includes(element.ART_Pieza.charAt(0).toUpperCase()) ||
                        checkedArtPiezas.includes(element.ART_Pieza.slice(0, 2).toUpperCase())
                    ) {
                        if (!element.hasOwnProperty('Camion') || element.Camion === "") {
                            matchingIds.push(element.expressID);
                        }
                    }
                });
                showAllItems(viewer, matchingIds);
            }else {
                disableCheckboxes();
                // generateLabels(expressIDs);
            }
        });
    });

    function verificarPosicionYAsignarColor(numCamion, btn) {
        const elementosCamion = precastElements.filter(function(precastElement) {
            return parseInt(precastElement.Camion) === numCamion;
        });
        const todosTienenPosicion = elementosCamion.every(function(precastElement) {
            return precastElement.hasOwnProperty('Posicion') && precastElement.Posicion !== "";
        });
        if (todosTienenPosicion) {
            // Asignar el color verde a los elementos del camión
            btn.style.border = "2px solid blue";
            btn.style.boxShadow = "0 0 5px blue";
        }else{
            btn.style.border = "";
            btn.style.boxShadow ="";
        }
    }

    function disableCheckboxes() {
        for (let i = 0; i < checkboxGroup.length; i++) {
            const checkboxes = checkboxGroup[i].querySelectorAll('input[type="checkbox"]');
            
            for (let j = 0; j < checkboxes.length; j++) {
                checkboxes[j].disabled = true;
            }
        }
        
    }
    
    function enableCheckboxes() {
        for (let i = 0; i < checkboxGroup.length; i++) {
            const checkboxes = checkboxGroup[i].querySelectorAll('input[type="checkbox"]');
            for (let j = 0; j < checkboxes.length; j++) {
                checkboxes[j].disabled = false;
            }
        }
    }
}

function  agregarBotonCero() {
    viewer.IFC.selector.unpickIfcItems();
    const btnCero = document.createElement("button");
    btnCero.setAttribute("class","btnNumCamion")
    btnCero.setAttribute("id","botonCero")
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
            
            // Obtener el div con id "divNumCamiones"
            const divNumCamiones = document.getElementById("divNumCamiones");

            // Verificar si el div existe
            if (divNumCamiones) {
                // Obtener todos los elementos hijos del div
                const elementosHijos = divNumCamiones.children;

                // Iterar sobre los elementos hijos
                for (let i = 0; i < elementosHijos.length; i++) {
                    const elemento = elementosHijos[i];

                    // Verificar si el elemento tiene la clase "active"
                    if (elemento.classList.contains("active")) {
                        // Hacer clic en el elemento
                        elemento.click();
                    }
                }
            } 
            hideAllItems(viewer, idsTotal);
            removeLabels(idsTotal);
            const botones = document.querySelectorAll('#divNumCamiones button');
            botones.forEach(function(boton) {
                boton.classList.remove('active');
                boton.style.border = '1px solid white';
                boton.style.color="white";
            });
            document.getElementById("datosCamiones").innerHTML = "";
            document.getElementById("posicionCamion").innerHTML = "";
            btnCero.classList.add("active");
            btnCero.style.justifyContent = "center";
            removeLabels(idsTotal);
            showElementsByCamion(viewer, precastElements);
            //btnCero.classList.remove('active');
        }
    });
}

function showElementsByCamion(viewer, precastElements) {
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
    setTimeout(() => {
        div.style.display = 'none';
    }, delay);
}

function calcularPesoTotal(expressIDs) {
    let pesoTotal = 0;
    for (const id of expressIDs) {
        const precastElem = precastElements.find(elem => elem.expressID === id);
        if (precastElem && precastElem.ART_Peso) {
            const peso = parseFloat(precastElem.ART_Peso);
            pesoTotal += peso;
        }
    }
    return pesoTotal.toFixed(2);
}
let usableExpress=false;
let  posicionAntigua='';
let expressIDCambioPosicion;
let contenidoCelda;
let tablaResaltada = false;
function generarTabla(expressIDs, camion) {
    const divTabla = document.getElementById("datosCamiones");
    const precastElement = precastElements.find(elem => parseInt(elem.Camion) === camion);
    const cabeceraValor = `${camion} || ${precastElement.tipoTransporte}`;
    let pesoTotal = calcularPesoTotal(expressIDs); 
    const actualizarCabecera = (nuevoPesoTotal) => {
        pesoTotal = nuevoPesoTotal;
        const cabeceraCompleta = `${cabeceraValor}\nPeso: ${parseFloat(pesoTotal).toFixed(2)}`;
        thElemento.textContent = cabeceraCompleta;
        thElemento.style.color = (pesoTotal > 25) ? "red" : ""; 
    };
    const thElemento = document.createElement("th"); 
    actualizarCabecera(pesoTotal); 
    const tabla = document.createElement('table');
    tabla.classList.add('tabla-estilo');
    tabla.setAttribute('data-id', camion);
    const cabecera = document.createElement('thead');
    const filaCabecera = document.createElement('tr');
    filaCabecera.appendChild(thElemento);
    cabecera.appendChild(filaCabecera);
    const cuerpo = document.createElement('tbody');
    expressIDs.forEach(id => {
        const tdElemento = document.createElement('td');
    const precastElem = precastElements.find(elem => elem.expressID === id && elem.Posicion !== "" && elem.Posicion !== undefined);
    if (precastElem) {
        tdElemento.style.backgroundColor = "#BD9BC2"; 
    }
    const precastElemPieza = precastElements.find(elem => elem.expressID === id );
    tdElemento.textContent = `${id} - ${precastElemPieza && precastElemPieza.ART_Pieza ? precastElemPieza.ART_Pieza : ''}`;
        tdElemento.addEventListener('contextmenu', async function(event) {
            event.preventDefault(); 
            const tdElemento = event.target;

            const colorFondo = window.getComputedStyle(tdElemento).getPropertyValue('background-color');
            usableExpress=true;
            if(colorFondo==='rgb(189, 155, 194)'){
                const contenidoCelda = tdElemento.textContent;
                const expresionRegular = /^(\d+) -/i;
                const coincidencias = contenidoCelda.match(expresionRegular);

                expressIDCambioPosicion = coincidencias ? coincidencias[1] : null;
                const elementoEnPrecast = precastElements.find(elem => elem.expressID === parseInt(expressIDCambioPosicion));
                posicionAntigua = parseInt(elementoEnPrecast.Posicion); 
            
            }else{
                posicionAntigua="";
               // (contenidoCelda)
                
            }

            contenidoCelda = tdElemento.textContent;
            resaltarTabla(tabla, cabeceraValor);
            tablaResaltada=true;
            celdaSeleccionadaColor(event.target);
            viewer.IFC.selector.pickIfcItemsByID(0, [parseInt(contenidoCelda)], false);
            muestraPropiedadesExpressId(contenidoCelda);
            
        });
        const fila = document.createElement('tr');
        fila.appendChild(tdElemento);
        cuerpo.appendChild(fila);
    });
    
    tabla.appendChild(cabecera);
    tabla.appendChild(cuerpo);
    const contenedorTabla = document.createElement("div");// Contenedor  agrega estilos CSS
    contenedorTabla.classList.add('contenedor-tabla');
    contenedorTabla.addEventListener("click", function() {
        resaltarTabla(tabla, cabeceraValor);
    });
    contenedorTabla.addEventListener("dblclick", function(event) {
        const target = event.target;
        let numeroCamion;
        let letraCamion;
        let elementoEliminadoTabla;
        let elementoEliminadoCelda;
        if (target.tagName === 'TD') {
            elementoEliminadoTabla = target.parentNode.firstChild.textContent;
            elementoEliminadoCelda = target.parentNode.firstChild;
            
            const backgroundColor = elementoEliminadoCelda.style.backgroundColor;
            if (backgroundColor === 'rgb(189, 155, 194)') {
                const numerosExtraidos = elementoEliminadoTabla.match(/\d+/g);
                let expressIDeliminado=parseInt(numerosExtraidos[0]);
                const elementoEnPrecast = precastElements.find(elemento => elemento.expressID === expressIDeliminado);
                let posicionAntiguaBorrar=parseInt(elementoEnPrecast.Posicion)
                //console.log(expressIDeliminado, posicionAntiguaBorrar)
                //creaJsonEliminaPosicion(expressIDeliminado, posicionAntiguaBorrar);
                Eliminar(expressIDeliminado, posicionAntiguaBorrar);

            }
            target.parentNode.remove();
            let indexToRemove = elementosOcultos.indexOf(parseInt(elementoEliminadoTabla));
            if (indexToRemove !== -1) {
                elementosOcultos.splice(indexToRemove, 1);
                globalIds.splice(indexToRemove, 1);
                const indexToRemoveEX = expressIDs.indexOf(parseInt(elementoEliminadoTabla));
                if (indexToRemove !== -1) {
                    expressIDs.splice(indexToRemoveEX, 1);
                }
            }
            allIDs.push(parseInt(elementoEliminadoTabla));
            removeLabels(elementoEliminadoTabla);
        }
        listarOcultos(elementosOcultos);
        viewer.IFC.selector.unpickIfcItems();
        hideAllItems(viewer, allIDs);
        showAllItems(viewer, expressIDs);
            const eventoClick = new Event('click', {
            bubbles: true, 
            cancelable: true 
        });
        contenedorTabla.dispatchEvent(eventoClick);
        var spanNumCamion = document.getElementById("numCamion");
        var valorSpanNumCamion = parseInt(spanNumCamion.innerHTML);
        if(valorSpanNumCamion===camion){
            const nuevoPesoTotal = calcularPesoTotal(expressIDs);
            actualizarCabecera(nuevoPesoTotal);
            const labelPesoList = document.getElementById("pesoCamion");
            labelPesoList.textContent=nuevoPesoTotal;
        }
        const recogeValorElemento= precastElements.find(element => element.expressID === (parseInt(elementoEliminadoTabla)));
        if(recogeValorElemento){
            numeroCamion=recogeValorElemento.numTransporte;
            letraCamion=recogeValorElemento.letraTransporte
        }
        const actValorCamion = precastElements.find(element => element.expressID === (parseInt(elementoEliminadoTabla)));
        if (actValorCamion) {
            actValorCamion.Camion = "";
            actValorCamion.tipoTransporte = "";
            actValorCamion.Posicion = "";
            actValorCamion.numTransporte = "";
            actValorCamion.letraTransporte = "";
        }
        updateMissingCamionCount();
        const nuevoPesoTotal = calcularPesoTotal(expressIDs);
        actualizarCabecera(nuevoPesoTotal);
        let elEliminado= parseInt(elementoEliminadoTabla);
        //actualizaFireExpress(elEliminado)
        //actualizarBaseDeDatos();
        const celdasConColor = contenedorTabla.querySelectorAll('td[style="background-color: rgb(189, 155, 194);"]');
    
    if (celdasConColor.length === 0) {
        console.log("N0000000000000000o hay más celdas con el color de fondo especificado.");
        let tipoTabla;
        let idObra;
        if(letraCamion==='A'){
            tipoTabla='alveolar';
            idObra=idAlveolar;
        }
        if(letraCamion==='C'){
            tipoTabla='cerramiento';
            idObra=idEstruCerra
        }
        if(letraCamion==='E'){
            tipoTabla='estructura';
            idObra=idEstruCerra
        }
        eliminarCamion(numeroCamion, tipoTabla, idObra)
    } 
    });
    contenedorTabla.appendChild(tabla);
    thElemento.classList.add('cabecera-tabla');
    divTabla.appendChild(contenedorTabla);

    // const celdasConColor = contenedorTabla.querySelectorAll('td[style="background-color: rgb(189, 155, 194);"]');
    // if (celdasConColor.length === 0) {
    //     console.log("N0000000000000000o hay más celdas con el color de fondo especificado.");
    //     // Aquí puedes realizar acciones adicionales si no hay celdas con el color de fondo.
    // } 
}



let ultimaCeldaSeleccionada = null;
async function creaCamion(celdaSeleccionada) {
    //console.log(celdaSeleccionada)
    //await obtenerIdentificadores();
    
    const contenidoCelda = celdaSeleccionada.textContent;
    const expressIDseleccionado = parseInt(contenidoCelda.match(/\d+/)[0]);
    const objetoSeleccionado = precastElements.find(elemento => elemento.expressID === expressIDseleccionado);
    const camion_n = objetoSeleccionado.numTransporte;
    const tipoTrans= objetoSeleccionado.letraTransporte;
    const nOrden=objetoSeleccionado.Camion;
    let proyecto_id;

    if (tipoTrans === 'E' || tipoTrans === 'C') {
        proyecto_id = idEstruCerra;
    } else if (tipoTrans === 'A') {
        proyecto_id = idAlveolar;
    }

    if (tipoTrans === 'E' ) {
        tabla = 'estructura';
    } else if (tipoTrans === 'C') {
        tabla = 'cerramiento';
    } else if (tipoTrans === 'A') {
        tabla = 'alveolar';
    }
   // Crea Camion

    const url = `http://${rutaServidor}:8000/camiones/`;

    try {
        const requestBody = {
            tabla: tabla,
            obra: proyecto_id,
            n_camion: camion_n
        };
    
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(requestBody)
        });
    
        console.log('JSON enviado a la API:', JSON.stringify(requestBody));
    
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Camión creado exitosamente:', data);
    } catch (error) {
        console.error('Error al crear el camión:', error);
    }

    //Crea registro camion y orden
    const urlOrden = `http://${rutaServidor}:8000/viajes/`;

    try {
        const requestBodyOrden = {
            idobra: proyecto_id,
            n_camion: camion_n,
            tabla: tipoTrans,
            n_orden:nOrden
        };
    
        const response = await fetch(urlOrden, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(requestBodyOrden)
        });
    
        console.log('JSON enviado a viajes:', JSON.stringify(requestBodyOrden));
    
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('ViajeOrden creado exitosamente:', data);
    } catch (error) {
        console.error('Error al crear el camión:', error);
    }
}


function celdaSeleccionadaColor(celdaSeleccionada) {
    const algunaCeldaConColor = Array.from(celdaSeleccionada.parentNode.parentNode.querySelectorAll('td')).some(celda => celda.style.backgroundColor);

    if (!algunaCeldaConColor) {
        creaCamion(celdaSeleccionada); 
    }
    if (ultimaCeldaSeleccionada) {
        const ultimoContenidoCelda = ultimaCeldaSeleccionada.textContent;
        const elementoAnterior = precastElements.find(elem => parseInt(ultimoContenidoCelda.split(' ')[0]) === elem.expressID);
        if (elementoAnterior) {
            if (elementoAnterior.Posicion) {
                ultimaCeldaSeleccionada.style.backgroundColor = '#BD9BC2'; // Morado
            } else {
                ultimaCeldaSeleccionada.style.backgroundColor = ''; // Sin color de fondo
            }
        }
    }
    const contenidoCelda = celdaSeleccionada.textContent;
    const tienePosicion = precastElements.some(elem => parseInt(contenidoCelda.split(' ')[0]) === elem.expressID && elem.Posicion);
    const isRightClick = event.button === 2; 
    if (tienePosicion) {
        if (isRightClick) {
            celdaSeleccionada.style.backgroundColor = '#c8c445'; 
        } else {
            celdaSeleccionada.style.backgroundColor = '#BD9BC2';
        }
    } else {
        celdaSeleccionada.style.backgroundColor = '#c8c445'; 
    }
    ultimaCeldaSeleccionada = celdaSeleccionada;
}

function resaltarTabla(tabla, cabeceraValor) {
    const tablas = document.querySelectorAll("#datosCamiones table");
    tablas.forEach(t => {
        if (t === tabla) {
            t.style.border = "3px solid red";
            tablaResaltada = true;
            posicionesCamion(tabla, cabeceraValor); // argumentos tabla y valor de cabecera a la función posicionesCamion
            actualizarTablaDerecha();
        } else {
            t.style.border = "1px solid black";
        }
    });
    //actualiza coloreando celdas, para ver los elementos que ya estan asignados en el transporte
    for (let i = 0; i < tabla.rows.length; i++) {
        for (let j = 0; j < tabla.rows[i].cells.length; j++) { 
            let valorCelda = tabla.rows[i].cells[j].innerText;
            for (let k = 0; k < precastElements.length; k++) { 
                let expressID = precastElements[k].expressID; 
                let posicion = precastElements[k].Posicion; 
                if (valorCelda == expressID && posicion) {
                    tabla.rows[i].cells[j].style.backgroundColor = `#BD9BC2`; 
                    break; 
                } 
                if (valorCelda == expressID && posicion==="") {
                    tabla.rows[i].cells[j].style.backgroundColor = ``; 
                    break; 
                }
            } 
        } 
    }
}

function resaltarTablaNueva(tabla) {
    const tablas = document.querySelectorAll("#datosCamiones table");
    tablas.forEach(t => {
        if (t === tabla) {
            t.style.border = "3px solid red";
            tablaResaltada = true;
            posicionesCamion(tabla, cabeceraValor); // argumentos tabla y valor de cabecera a la función posicionesCamion
            actualizarTablaDerecha();
        } else {
            t.style.border = "1px solid black";
        }
    });
    //actualiza coloreando celdas, para ver los elementos que ya estan asignados en el transporte
    for (let i = 0; i < tabla.rows.length; i++) {
        for (let j = 0; j < tabla.rows[i].cells.length; j++) { 
            let valorCelda = tabla.rows[i].cells[j].innerText;
            for (let k = 0; k < precastElements.length; k++) { 
                let expressID = precastElements[k].expressID; 
                let posicion = precastElements[k].Posicion; 
                if (valorCelda == expressID && posicion) {
                    tabla.rows[i].cells[j].style.backgroundColor = `#BD9BC2`; 
                    break; 
                } 
                if (valorCelda == expressID && posicion==="") {
                    tabla.rows[i].cells[j].style.backgroundColor = ``; 
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

function posicionesCamion(tabla, cabeceraValor) {
    const expressIdByCamion = [];
    const posicionCamion = document.getElementById("posicionCamion");
    posicionCamion.innerHTML = ""; // limpia el contenido previo del div

    const tablaNueva = document.createElement("table");
    tablaNueva.setAttribute("id", "tabla-izquierda")
    tablaNueva.style.marginTop = "5px";
    tablaNueva.style.marginLeft = "10px";
    tablaNueva.style.borderCollapse = "collapse";
    tablaNueva.style.border = "2px solid";
    tablaNueva.style.height = "95%";
    let cantidadFilas, cantidadColumnas;

    if (cabeceraValor.includes("E")) {
        cantidadFilas = 3;
        cantidadColumnas = 5;
        tablaNueva.style.borderColor = "#874c8f";
    } else if (cabeceraValor.includes("A")) {
        cantidadFilas = 4;
        cantidadColumnas = 4;
        tablaNueva.style.borderColor = "#4c7a90";
    } else if (cabeceraValor.includes("C")) {
        cantidadFilas = 1;
        cantidadColumnas = 13;
        tablaNueva.style.borderColor = "#90834c";
    } else {// Si el cabeceraValor no incluye ninguna de las letras especificadas
        console.error("CabeceraValor no válido");
        return;
    }
    const cabeceraFila = document.createElement("tr");
    const cabeceraCajon = document.createElement("th");
    cabeceraCajon.setAttribute("colspan", cantidadColumnas);
    cabeceraCajon.style.textAlign = "center";
    cabeceraCajon.style.verticalAlign = "middle";
    cabeceraCajon.innerText = cabeceraValor;
    cabeceraFila.appendChild(cabeceraCajon);
    tablaNueva.appendChild(cabeceraFila);
    
    for (let i = 0; i < tabla.rows.length; i++) {
        let valorCelda = tabla.rows[i].innerText;
        expressIdByCamion.push(parseInt(valorCelda));
    }
    for (let i = 0; i < cantidadFilas; i++) {
        const fila = document.createElement("tr");
            if (cantidadFilas === 1) {
                fila.style.height = "95%";
            }
            for (let j = 0; j < cantidadColumnas; j++) {
                const cajon = document.createElement("td");
                
                if(cantidadFilas===4){
                    cajon.style.height = "38px";
                    
                    if (j === 1) {
                        cajon.style.borderRight = "3px solid #4c7a90"; //  borde derecho 
                    }
                }
                if(cantidadFilas===1){
                    if (j === 6) {
                        cajon.style.borderRight = "3px solid #90834c"; //  borde derecho 
                        cajon.style.borderLeft = "3px solid #90834c";
                    }
                }
                const idCajon = i * cantidadColumnas + j + 1;
                cajon.setAttribute("id", idCajon);
                cajon.setAttribute("data-id", idCajon);
                cajon.classList.add("cajon");
                fila.appendChild(cajon);
                
                cajon.addEventListener("contextmenu", function (event) { 
                    event.preventDefault();
                   // if(event.button === 2) {
                       
                        cajon.blur();
                        if(usableExpress===true){
                            
                            if (cajon.innerText === "") {
                            
                            //const expressID=parseInt(contenidoCelda)
                            
                            
                                posicionAntiguaBorrar=cajon.id;
                                asignaIdCelda(cajon, contenidoCelda, expressIdByCamion);
                                actualizarTablaDerecha();
                                simularEventoClic();
                                let elAsignadaPosicion = parseInt(contenidoCelda);
                                //actualizaFireExpress(elAsignadaPosicion);
                                if(posicionAntigua===''){
                                    obtenerPesoTotalBD(elAsignadaPosicion)
                                    //creaJsonPosicionNueva(elAsignadaPosicion);
                                }
                                else{
                                    posicionAntiguaBorrar=parseInt(cajon.id);
                                    CambiaPosicion(expressIDCambioPosicion, posicionAntigua)
                                }
                                usableExpress=false;
                            }
                        }
                   // }
                });
                
                cajon.addEventListener("dblclick", function (event) {

                    const tablaIzq = document.getElementById('tabla-izquierda');

                    // Obtiene el contenido de la celda de la cabecera
                    const numCamionCabecera = obtenerNumeroCabecera(tablaIzq);
                    const letraCamionCabecera = obtenerLetraCabecera(tablaIzq);
                    const ordenCamion= obtenerOrden(tablaIzq)
                    // console.log(numCamionCabecera)
                    // console.log(cajon.id)
                    posicionAntiguaEliminar=cajon.id;
                    
                    limpiaPosicion(cajon, tabla);
                    actualizarTablaDerecha(numCamionCabecera);


                    let elAsignadaPosicion = parseInt(contenidoCelda);
                    Eliminar(elAsignadaPosicion, posicionAntiguaEliminar)
                    //actualizaFireExpress(elAsignadaPosicion);
                    verificarCeldasVacias(numCamionCabecera, letraCamionCabecera, ordenCamion )
                });
                
                cajon.addEventListener("click", async function (event) {
                    viewer.IFC.selector.pickIfcItemsByID(
                        0,
                        [parseInt(cajon.textContent)],
                        false
                    );
                    let id=parseInt(cajon.textContent);
                    muestraPropiedadesExpressId(id);
                    actualizarTablaDerecha();
                });
            }
            tablaNueva.appendChild(fila);
        }
        if (cabeceraValor.includes("A")) {
            cambiarIdsTablaA(tablaNueva);
        }
        posicionCamion.appendChild(tablaNueva);
        actualizaCajones(expressIdByCamion);
        crearTablaDerecha(tabla, cabeceraValor)
}

function obtenerOrden(tablaIzq) {
    const filaCabecera = tablaIzq.querySelector('tr:first-child');
    if (filaCabecera) {
        const celdaCabecera = filaCabecera.querySelector('th');

        // Utiliza una expresión regular para extraer el primer número
        const regex = /\| (\d+)/;
        const coincidencia = celdaCabecera.textContent.trim().match(regex);

        // Verificar si se encontró una coincidencia y devolver el número extraído
        if (coincidencia && coincidencia.length > 1) {
            return coincidencia[1];
        }
    }

    return null;
}

function obtenerLetraCabecera(tabla) {
    const filaCabecera = tabla.querySelector('tr:first-child');
    if (filaCabecera) {
        const celdaCabecera = filaCabecera.querySelector('th');
        
        // Utiliza una expresión regular para extraer el número y la letra entre | y -
        const regex = /\| (\d+) - (\w+)/;
        const coincidencia = celdaCabecera.textContent.trim().match(regex);

        // Verificar si se encontró una coincidencia y devolver la letra extraída
        if (coincidencia && coincidencia.length > 2) {
            return coincidencia[2];
        }
    }

    return null;
}

function obtenerNumeroCabecera(tabla) {
    const filaCabecera = tabla.querySelector('tr:first-child');
    if (filaCabecera) {
        const celdaCabecera = filaCabecera.querySelector('th');
        
        const regex = /\| (\d+) -/;
        const coincidencia = celdaCabecera.textContent.trim().match(regex);

        if (coincidencia && coincidencia.length > 1) {
            return coincidencia[1];
        }
    }
    return null;
}

function verificarCeldasVacias(numCamionCabecera, letraCamionCabecera, ordenCamion) {
    var celdas = document.querySelectorAll('.cajon');
    var celdaVaciaEncontrada = false;

    for (var i = 0; i < celdas.length; i++) {
        if (celdas[i].innerHTML.trim() !== "") {
            celdaVaciaEncontrada = true;
            break; 
        }
    }

    if (!celdaVaciaEncontrada) {
        console.log("Celdas vacias. Peticion al servidor para eliminar camion");
        let tipoTabla;
        let idObra;
        if(letraCamionCabecera==='A'){
            tipoTabla="alveolar"
            idObra=idAlveolar
        }
        if(letraCamionCabecera==='C'){
            tipoTabla="cerramiento"
            idObra=idEstruCerra
        }
        if(letraCamionCabecera==='E'){
            tipoTabla="estructura"
            idObra=idEstruCerra
        }
        eliminarCamion(numCamionCabecera, tipoTabla, idObra)
        eliminaOrdenViaje(numCamionCabecera, letraCamionCabecera, idObra, ordenCamion)
    } 
}
function eliminaOrdenViaje(numCamionCabecera, letraCamionCabecera, idObra, ordenCamion) {
    const url = `http://${rutaServidor}:8000/viajes/`;

    const datosJsonEliminaViajeOrden = {
        tabla: letraCamionCabecera,
        idobra: idObra,
        n_camion: parseInt(numCamionCabecera),
        n_orden:parseInt(ordenCamion)
    };
    console.log("JSON BORRA VIAJE-ORDEN", JSON.stringify(datosJsonEliminaViajeOrden, null, 2));
    
    const opciones = {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosJsonEliminaViajeOrden)
    };

    fetch(url, opciones)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Camión eliminado:', data);
        })
        .catch(error => {
            console.error('Error al eliminar el camión:', error);
        });
}

function eliminarCamion(numCamionCabecera, tipoTabla, idObra) {
    const url = `http://${rutaServidor}:8000/camiones/`;
    console.log('URL de la solicitud DELETE:', url);

    const datosJsonEliminaCamion = {
        tabla: tipoTabla,
        obra: idObra,
        n_camion: parseInt(numCamionCabecera)
    };
    console.log("JSON BORRA CAMION", JSON.stringify(datosJsonEliminaCamion, null, 2));
    // Configuración de la solicitud
    const opciones = {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosJsonEliminaCamion)
    };

    fetch(url, opciones)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Camión eliminado:', data);
        })
        .catch(error => {
            console.error('Error al eliminar el camión:', error);
        });
}

function simularEventoClic() {
    var elementoClic = document.querySelector('.tabla-estilo[style="border: 3px solid red;"]');
    if (elementoClic) {
        elementoClic.click();
    }
}

let cantidadFilas, cantidadColumnas;
function crearTablaDerecha(tabla, cabeceraValor) {
    const expressIdByCamion = [];
    const tablaDerecha = document.createElement("table");
    tablaDerecha.setAttribute("id", "tabla-derecha");
    tablaDerecha.style.marginTop = "5px";
    tablaDerecha.style.marginLeft = "10px";
    tablaDerecha.style.borderCollapse = "collapse";
    tablaDerecha.style.border = "2px solid";
    tablaDerecha.style.height = "95%";  

    if (cabeceraValor.includes("E")) {
        cantidadFilas = 3;
        cantidadColumnas = 5;
        tablaDerecha.style.borderColor = "#874c8f";
    } else if (cabeceraValor.includes("A")) {
        cantidadFilas = 4;
        cantidadColumnas = 4;
        tablaDerecha.style.borderColor = "#4c7a90";
    } else if (cabeceraValor.includes("C")) {
        cantidadFilas = 1;
        cantidadColumnas = 13;
        tablaDerecha.style.borderColor = "#90834c";
    } else {// Si el cabeceraValor no incluye ninguna de las letras especificadas
        console.error("CabeceraValor no válido");
        return;
    }
    const cabeceraFila = document.createElement("tr");
    const cabeceraCajon = document.createElement("th");
    cabeceraCajon.setAttribute("colspan", cantidadColumnas);
    cabeceraCajon.style.textAlign = "center";
    cabeceraCajon.style.verticalAlign = "middle";
    cabeceraCajon.innerText = cabeceraValor;
    cabeceraFila.appendChild(cabeceraCajon);
    tablaDerecha.appendChild(cabeceraFila);
    for (let i = 0; i < cantidadFilas; i++) {
        const fila = document.createElement("tr");
        if (cantidadFilas === 1) {
            fila.style.height = "95%";
        }
        for (let j = 0; j < cantidadColumnas; j++) {
            const cajon = document.createElement("td");
    
            if (cantidadFilas === 4) {
                cajon.style.height = "38px";
        
                if (j === 1) {
                    cajon.style.borderRight = "3px solid #4c7a90"; 
                }
            }
            if (cantidadFilas === 1) {
                if (j === 6) {
                    cajon.style.borderRight = "3px solid #90834c"; 
                    cajon.style.borderLeft = "3px solid #90834c";
                }
            }
        const idCajon = i * cantidadColumnas + j + 1;
        cajon.setAttribute("id", idCajon);
        cajon.setAttribute("data-id", idCajon);
        cajon.classList.add("cajon");
        fila.appendChild(cajon);
        }
        
        tablaDerecha.appendChild(fila);
    }
    if (cabeceraValor.includes("A")) {
        cambiarIdsTablaA(tablaDerecha);
    }
    posicionCamion.appendChild(tablaDerecha);
    actualizaCajones(expressIdByCamion);
}

function actualizarTablaDerecha() {
    const tablaIzquierda = document.getElementById('tabla-izquierda');
    const tablaDerecha = document.getElementById('tabla-derecha');
    let pesoTotal = 0;

    const numFilas = tablaIzquierda.rows.length;
    const numColumnas = cantidadColumnas;

    for (let i = 1; i < numFilas; i++) {
        for (let j = 0; j < numColumnas; j++) {
            const cajonIzquierda = tablaIzquierda.rows[i].cells[j];
            const cajonDerecha = tablaDerecha.rows[i].cells[j];
            const idCajon = cajonIzquierda.innerText;

            const elemento = precastElements.find((e) => e.expressID === parseInt(idCajon));
            if (elemento) {
                const peso = parseFloat(elemento.ART_Peso);
                const pieza = elemento.ART_Pieza;
                const longitud = parseFloat(elemento.ART_Longitud);
                const ancho = parseFloat(elemento.ART_Ancho);

                const textoPieza = document.createElement('span');
                textoPieza.style.fontSize = '14px'; 
                textoPieza.style.fontWeight = 'bold'; 
                textoPieza.innerText = ` ${pieza}`;
                cajonDerecha.innerHTML = '';

                const textoLongitud = document.createElement('span');
                textoLongitud.style.fontSize = '12px';
                textoLongitud.innerText = `L: ${longitud.toFixed(2)}`;

                
                const textoAncho = document.createElement('span');
                textoAncho.style.fontSize = '12px';
                textoAncho.innerText = `A: ${ancho.toFixed(2)}`;

                const textoPeso = document.createElement('span');
                textoPeso.style.fontSize = '12px'; 
                textoPeso.innerText = ` P: ${peso.toFixed(2)}`;
                
                cajonDerecha.style.lineHeight = '0.8'; 
                cajonDerecha.appendChild(textoPieza);
                cajonDerecha.appendChild(document.createElement('br'));
                cajonDerecha.appendChild(textoLongitud);
                cajonDerecha.appendChild(document.createElement('br'));
                cajonDerecha.appendChild(textoAncho);
                cajonDerecha.appendChild(document.createElement('br')); 
                cajonDerecha.appendChild(textoPeso);
                cajonDerecha.appendChild(document.createElement('br')); 
                

                pesoTotal += peso;
            } else {
                cajonDerecha.innerText = ''; // si no hay elemento, dejar la celda en blanco
            }
        }
    }

    const cabeceraTablaDerecha = tablaDerecha.getElementsByTagName('th')[0];
    cabeceraTablaDerecha.innerText = `Peso Total: ${pesoTotal.toFixed(2)}`;
}

function cambiarIdsTablaA(tabla) {
    const nuevosIds = [1, 2, 9, 10, 3, 4, 11, 12, 5, 6, 13, 14, 7, 8, 15, 16];
    let indiceNuevoId = -1;

    for (let i = 0; i < tabla.rows.length; i++) {
        for (let j = 0; j < tabla.rows[i].cells.length; j++) {
            let cajon = tabla.rows[i].cells[j];
            cajon.setAttribute("id", nuevosIds[indiceNuevoId]);
            indiceNuevoId++;
        }
    }
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
        if (celdas[i].textContent.includes(contenidoCelda)) {
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

function asignaIdCelda(cajon, contenidoCelda, expressIdByCamion) {
    if (!expressIdByCamion.includes(parseInt(contenidoCelda))) {
        return;
    }
    let cajones = document.querySelectorAll(".cajon");
    for (let i = 0; i < cajones.length; i++) {
        if (cajones[i] !== cajon && cajones[i].innerText === contenidoCelda) {
            cajones[i].innerText = "";
            break;
        }
    }
    cajon.innerText = contenidoCelda;
    ultimoCajonPulsado = cajon;

    // Agregar el valor del ID del cajón pulsado al array precastElements
    const posicionCajon = cajon.id;
    for (let i = 0; i < precastElements.length; i++) {
        if (precastElements[i].expressID === parseInt(contenidoCelda)) {
            precastElements[i].Posicion = posicionCajon;
            ultimaCeldaSeleccionada.style.backgroundColor = '#BD9BC2';
            break;
        }
    }
}
