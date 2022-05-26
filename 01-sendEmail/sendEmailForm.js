// First the configuration logs are the same as Before
// So, we can recycle this piece of code, but we have to make son modifications
// to use properly

// fisrt prepare the web page to receive the values of the email to send

class Correo{
    constructor(nombre,correo,contenido){
        this.nombre = nombre;
        this.correo = correo;
        this.contenido = contenido;
    }
}


document.querySelector('form').addEventListener('submit',(e)=>{
    e.preventDefault();
    const formData = new FormData(e.target);
    const nombre = formData.get('nameFrom1');
    const correo = formData.get('emailFrom1');    
    const contenido = formData.get('emailContent1');   
    const correoEnviar = new Correo(nombre,correo,contenido);    
    enviarCorreo(correoEnviar);
})

// Ya se tiene la data, ahora se debe enviar el correo, recordar que se estaba utilizando 
// Node, y en este archivo JavaScript no se está utilizando Node, por ende se puede catalogar ese servicio de envío de correos como backend
// por lo tanto se debe utilizar una API en el Medio , utilizaremos fetch API, ya viene lista , antes de ello se debe establecer la REST API
// que reciba la solicitud y proceda a enviar el correo.
// Para ello vamos a utilizar express de node.
// La API recibe la información den formato JSON, por lo que hay que establecer la información en este formato, para ello se utiliza JSON.parse
const enviarCorreo = (parametros)=>{


    fetch("http://localhost:3000/",{ // direction 
        method: 'POST', 
        headers:{'content-type': 'application/json'}, /// specify the encode
        body: JSON.stringify(parametros)
    })
        //.then(response => { return response.json()})
        .then(response => {return response.json()})
        .then(data => console.log(data))
        .catch((error)=>{console.log("Error: ",error);})

}
