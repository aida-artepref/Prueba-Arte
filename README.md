
VARIABLES GLOBALES

'''javascript'''

let idsTotal; --- array con los ids, de todos los elementos del IFC

let allIDs; --- array con los ids, de los elementos que no han sido asignados en transporte

let elementosOcultos=[]; ---- array con ids, que ya tienen asignado un transporte, 

let uniqueTypes=[];
let precastElements=[];
let model;

let numCamion=1;// cuenta los camiones totales, todos E A C
let letraTransporte = 'E';
let numT=1;
let numE = 1; 
let numA = 1;
let numC = 1;

let transporteA = [];
let transporteC = [];
let transporteE = [];


let globalIds=[];
let globalId;
let camionesUnicos=[];

let contenidoCelda;
let tablaResaltada = false;

let ultimaCeldaSeleccionada = null;
let ultimoCajonPulsado = null;


  viewer.IFC.selector.pickIfcItemsByID

  viewer.IFC.selector.unpickIfcItems();





function calcularPesoTotal(expressIDs) {
    let pesoTotal = 0;
    for (const id of expressIDs) {
      const precastElem = precastElements.find(elem => elem.expressID === id);
      if (precastElem && precastElem.ART_Volumen) {
        const volumen = parseFloat(precastElem.ART_Volumen);
        const peso = parseFloat((volumen * 2.5).toFixed(2));
        pesoTotal += peso;
      }
    }
    return pesoTotal;
  }


  
    const numCamionElement = document.getElementById("numCamion");
    const numCamion = numCamionElement.textContent.trim();

    const expressIDs = obtenerExpressIDsDelCamion(numCamion);

    const pesoTotal = calcularPesoTotal(expressIDs);
    const pesoCamionElement = document.getElementById("pesoCamion");
    pesoCamionElement.textContent = pesoTotal.toString();


    #c8c445--Amarillo


    const divElement = document.querySelector('div#datosCamiones div.tabla-estilo[style*="border: 3px solid red;"]');
                        if (divElement) {
                            divElement.click();

                            

const checktiposIfcContainer = document.getElementById('checktiposIfc');
checktiposIfcContainer.style.display = 'block';



 const ifcCompleto=document.getElementById('ifcCompleto');
        ifcCompleto.style.display="block";


        const btnModifica= document.getElementById("modificaProp")
        btnModifica.style.display = "block";
