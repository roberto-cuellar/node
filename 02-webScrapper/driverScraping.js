///Este modulo se utilizará para establecer el tipo de scraping que se desea, en este caso se tendrán las siguientes opciones:
///Scrape por artículo, Scrape por Volumen, Scrape Total
///El scrape por artículo como su nombre lo indica, recibe una URL donde se encuentra un artículo específico y la bandera de almacenamiento y retorna un objeto con el scraping hecho
/// El scrape por volumen, regresa un arreglo en el cual estarán los objetos en cada posición, siendo título y URL de cada artículo, si se le especifica, procedera a llamar la función scrape por artículo
/// para cada uno de los artículos que encontró, por lo tanto recibe 3 parámetros: URL del volumen, bandera scrap articulos, bandera almacenar en la base de datos
/// El scrape Total, recibirá la URL de la página en donde se alojan todos los volumenes, luego llamará a la función volumen para hacer el scraping por volumen
/// posteriormente se llamará a la función scrape por artículo que se encargará de scrapear cada uno de los artículos scrapeados por la función scrapear por volumen



// Modulos Propios
const scrapingArticuloModule = require('./scrapingArticulo');
const scrapingVolumenModule = require('./scrapingVolumen');

// En el driver se tendrá el acceso a la base de datos, aquí se tendrá la configuración, y la conexión solo se hará 
// cuando sea requerida por el usuario
const mongoose = require("mongoose");
const mongoUrl = "mongodb://localhost:27017/articulosUrlDB";
const Schema = scrapingArticuloModule.Schema;
const articuloSchema = new mongoose.Schema(Schema);
const ArticuloDB = mongoose.model('testarticulo',articuloSchema); 



/// Configuración de entrada

const posiblesScraping = ['articulo','volumen','total']; /// Posibles scraping realizables
const tipoScrap = posiblesScraping[1]; /// Selección del tipo de scraping a realizar
const flagAlmacenamiento = true; /// Selección del flag de almacenamiento
const flagScrapArticulosVolumen = true; /// Selección del flag de scraping de los artículos encontrados en el scraping tipo volumen
const flagImprimirArticulo = false; /// Bandera Mostrar artículo por consola
const url = 'https://ojs.unipamplona.edu.co/ojsviceinves/index.php/bistua/issue/view/82'; /// URL a scrapear, tenga cuidado, esta URL aún no tiene validación, por lo que debe ser
// la url adecuada para el tipo de scrap seleccionado

console.log('\x1b[36m%s\x1b[0m','+++----------------- Configuración del Scraping ------------------+++');
console.log('\x1b[36m%s\x1b[0m','Tipo de Scraping Seleccionado : ',tipoScrap);
console.log('\x1b[36m%s\x1b[0m','Almacenamiento : ', flagAlmacenamiento);
console.log('\x1b[36m%s\x1b[0m','URL : ', url);
if(tipoScrap !== 'articulo'){
    console.log('\x1b[36m%s\x1b[0m',`Scraping por artículos al ${tipoScrap} : `,flagScrapArticulosVolumen);
}

let almacenamientoIniciado = false; // Bandera para validar si ya se activó el almacenamiento por artículos

switch(tipoScrap){
    case 'articulo':
        scrapArticulo(url,flagAlmacenamiento,flagImprimirArticulo);
        break;

    case 'volumen':
        scrapVolumen(url,flagAlmacenamiento,flagScrapArticulosVolumen);
        break;

    case 'total':
        /// Por hacer
        break;
}



async function scrapArticulo(url,flagAlmacenamiento,flagImprimirArticulo){ /// Scrap por artículo function
    let articuloResponse =  await scrapingArticuloModule.scrapingArticulo(url);
    if(articuloResponse[0] == false){
        console.error('\x1b[31m%s\x1b[0m','Error en el Scraping, log :',articuloResponse[1]);
        return false
    }else{        
        if(flagImprimirArticulo){ /// Impresión del artículo
            console.log('\x1b[35m%s\x1b[0m','+++--------------------------------- Scrap Artículo Respuesta ----------------------------------+++');
            console.log(articuloResponse[1]);
        }else{
            console.log('\x1b[32m%s\x1b[0m','>>>>>>>>>>>>>>>>>> Artículo Scrapeado Correctamente');
        }
        if(flagAlmacenamiento){
            !almacenamientoIniciado&&mongoose.connect(mongoUrl,function (e) {   // Si no se ha establecido la conexión se inicia
                if(e){
                    console.log('\x1b[31m%s\x1b[0m','Error en la conexión con la DB ',e);
                }else{
                    console.log('\x1b[32m%s\x1b[0m','Conexión establecida correctamente');
                    almacenamientoIniciado = !almacenamientoIniciado; /// Cambia el estado de la conexión
                }
            });
            // const Schema = scrapingArticuloModule.Schema;
            // const articuloSchema = new mongoose.Schema(Schema);
            // const ArticuloDB = mongoose.model('testarticulo',articuloSchema);             
            const articulo = new ArticuloDB(articuloResponse[1]);
            await articulo.save(function (e) {  
                    if(e){
                    console.log('\x1b[31m%s\x1b[0m','Error en el guardado del artículo en la BD: ',e)
                }else{
                    console.log('\x1b[32m%s\x1b[0m','Artículo guardado correctamente')
                }
            });            
        }        
    }
    return true
}


async function scrapVolumen(url,flagAlmacenamiento,flagScrapArticulosVolumen,flagImprimirArticulo){ /// Scrap por volumen function
    let volumenResponse = await scrapingVolumenModule.scrapingVolumen(url);
    if(volumenResponse[0] == false){
        console.error('\x1b[31m%s\x1b[0m','Error en el Scraping, log :',volumenResponse[1]);
    }else{
        console.log('\x1b[35m%s\x1b[0m','+++--------------------------------- Scrap Volumen Respuesta ----------------------------------+++');
        console.log('\x1b[32m%s\x1b[0m','>>>>>>>>>>>>>>>>>> Volumen Scrapeado Correctamente');
        console.log('\x1b[33m%s\x1b[0m',volumenResponse[1].titulos);
    }
    /// En caso de requerirse el scraping de todos los elementos encontrados:
    if(flagScrapArticulosVolumen){
        const urlsArticulos = volumenResponse[1].urls;
        const cantidad = urlsArticulos.length;
        if(cantidad!==0){ /// En caso de que la longitud no sea nula
            let conteo = 0; /// Constante para llevar la cuenta de los artículos que se les ha hecho scraping
            console.log('\x1b[37m%s\x1b[0m','||||||--------------Número de artículos para scraping: ',cantidad)
            let scrapearArticulos = urlsArticulos.forEach((url,idx )=>{
                let result = scrapArticulo(url,flagAlmacenamiento,flagImprimirArticulo) /// Retorna una promesa
                .then(result => { /// Al resolverse esa promesa
                    console.log('\x1b[33m%s\x1b[0m','Resultado scraping artículo # ',idx,', Resultado: ', result);
                    if(result){
                        conteo++;
                        console.log(conteo, ' Artículos Scrapeados de ',cantidad);
                    }else{
                        console.error('\x1b[31m%s\x1b[0m','NO SE PUDO COMPLETAR EL SCRAPING DEL ARTÍCULO ',idx);            
                    }
                });
               
            });

        }else{
            console.error('\x1b[31m%s\x1b[0m','NO SE RECIBIÓ NINGÚN ARTÍCULO PARA SCRAPING');
        }    
    }  
}