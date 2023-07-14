https://firebase.google.com/docs/hosting/quickstart?hl=es-419 --> guia de inicio firebase oficial

## Paso 1: Instala Firebase CLI
npm install -g firebase-tools

como dio alguna vulnerabilidad, tuve que ejecutar estos comandos 
npm install -g firebase-tools
firebase login


Para iniciar sesión utilizando el siguiente comando: firebase login

Power shell debe tener ejecucion de scripts habilitados en el sistema: si no es asi:
    -Abre PowerShell como administrador. Puedes buscar "PowerShell" en el menú Inicio, hacer clic derecho en "Windows PowerShell" y seleccionar "Ejecutar como administrador".

     Ejecuta el siguiente comando para verificar la política de ejecución actual:
        Get-ExecutionPolicy

    -Si la política actual es "Restricted", ejecuta el siguiente comando para permitir la ejecución de scripts:
        Set-ExecutionPolicy RemoteSigned

Esto permitirá la ejecución de scripts locales firmados y scripts remotos sin firmar.

Si se te solicita confirmación, responde "Sí" o "A" para aplicar los cambios.

 
## Paso 2: Inicializa tu proyecto  https://firebase.google.com/docs/hosting/quickstart?hl=es-419#initialize

    firebase init hosting
    
    te pide donde estan los archivos que necesita para crear la pagina, darle ruta de proyecto
    What do you want to use as your public directory?
    P:\CARGAS\Prueba-Arte - copia



```js
//Para inicializar firebase
import { initializeApp } from "firebase/app";
const firebaseConfig = {
    apiKey: "AIzaSyDTlGsBq7VwlM3SXw2woBBqHsasVjXQgrc",
    authDomain: "cargas-917bc.firebaseapp.com",
    projectId: "cargas-917bc",
    storageBucket: "cargas-917bc.appspot.com",
    messagingSenderId: "996650908621",
    appId: "1:996650908621:web:b550fd82697fc26933a284"
};

const app = initializeApp(firebaseConfig);
```


```js
//Para consctarte a la base de datos
import { getFirestore, collection, getDocs } from "firebase/firestore";

const db = getFirestore(app); // Obtén una referencia a la base de datos Firestore

// Leer datos de una colección
async function obtenerDatos() {
        const querySnapshot = await getDocs(collection(db, "Elementos"));
        querySnapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
    });
}
obtenerDatos();

```