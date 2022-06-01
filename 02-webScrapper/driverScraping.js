///Este modulo se utilizará para establecer el tipo de scraping que se desea, en este caso se tendrán las siguientes opciones:
///Scrape por artículo, Scrape por Volumen, Scrape Total
///El scrape por artículo como su nombre lo indica, recibe una URL donde se encuentra un artículo específico y la bandera de almacenamiento y retorna un objeto con el scraping hecho
/// El scrape por volumen, regresa un arreglo en el cual estarán los objetos en cada posición, siendo título y URL de cada artículo, si se le especifica, procedera a llamar la función scrape por artículo
/// para cada uno de los artículos que encontró, por lo tanto recibe 3 parámetros: URL del volumen, bandera scrap articulos, bandera almacenar en la base de datos
/// El scrape Total, recibirá la URL de la página en donde se alojan todos los volumenes, luego llamará a la función volumen para hacer el scraping por volumen
/// posteriormente se llamará a la función scrape por artículo que se encargará de scrapear cada uno de los artículos scrapeados por la función scrapear por volumen

// En el driver se tendrá el acceso a la base de datos
const mongoose = require("mongoose");
const mongoUrl = "mongodb://localhost:27017/articulosUrlDB";
const scrapingArticuloModule = require('./scrapingArticulo');






const posiblesScraping = ['articulo','volumen','total']; /// Posibles scraping realizables
const tipoScrap = posiblesScraping[0]; /// Selección del tipo de scraping a realizar
const flagAlmacenamiento = true; /// Selección del flag de almacenamiento
const flagScrapArticulosVolumen = false; /// Selección del flag de scraping de los artículos encontrados en el scraping tipo volumen
const url = 'https://ojs.unipamplona.edu.co/ojsviceinves/index.php/bistua/article/view/1100'; /// URL a scrapear, tenga cuidado, esta URL aún no tiene validación, por lo que debe ser
// la url adecuada para el tipo de scrap seleccionado

console.log('\x1b[36m%s\x1b[0m','+++----------------- Configuración del Scraping ------------------+++');
console.log('\x1b[36m%s\x1b[0m','Tipo de Scraping Seleccionado : ',tipoScrap);
console.log('\x1b[36m%s\x1b[0m','Almacenamiento : ', flagAlmacenamiento);
console.log('\x1b[36m%s\x1b[0m','URL : ', url);
if(tipoScrap !== 'articulo'){
    console.log(`Scraping por artículos al ${tipoScrap} : `,flagScrapArticulosVolumen);
}


switch(tipoScrap){
    case 'articulo':
        const flagImprimirArticulo = false; /// Bandera Mostrar artículo por consola
        scrapArticulo(url,flagAlmacenamiento,flagScrapArticulosVolumen,flagImprimirArticulo);
        break;

    case 'volumen':
        break;

    case 'total':
        break;
}



async function scrapArticulo(url,flagAlmacenamiento,flagScrapArticulosVolumen,flagImprimirArticulo){
    let articuloResponse =  await scrapingArticuloModule.scrapingArticulo(url);
    if(articuloResponse[0] == false){
        console.error('\x1b[31m%s\x1b[0m','Error en el Scraping, log :',articuloResponse[1]);
    }else{
        
        if(flagImprimirArticulo){ /// Impresión del artículo
            console.log('\x1b[35m%s\x1b[0m','+++--------------------------------- Scrap Artículo Respuesta ----------------------------------+++');
            console.log(articuloResponse[1]);
        }else{
            console.log('\x1b[32m%s\x1b[0m','>>>>>>>>>>>>>>>>>> Artículo Scrapeado Correctamente');
        }
        if(flagAlmacenamiento){
            mongoose.connect(mongoUrl,function (e) {  
                if(e){
                    console.log('\x1b[31m%s\x1b[0m','Error en la conexión con la DB ',e);
                }else{
                    console.log('\x1b[32m%s\x1b[0m','Conexión establecida correctamente')
                }
            });
            const Schema = scrapingArticuloModule.Schema;
            const articuloSchema = new mongoose.Schema(Schema);
            const ArticuloDB = mongoose.model('testarticulo',articuloSchema);
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
}

