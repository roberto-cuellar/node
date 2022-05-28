const cheerio = require("cheerio");
const puppeteer = require('puppeteer');
const mongoose = require("mongoose");
const mongoUrl = "mongodb://localhost:27017/articulosDB";
mongoose.connect(mongoUrl)


const urls = [
    'https://ojs.unipamplona.edu.co/ojsviceinves/index.php/bistua/article/view/205',
    'https://ojs.unipamplona.edu.co/ojsviceinves/index.php/bistua/article/view/206',
    'https://ojs.unipamplona.edu.co/ojsviceinves/index.php/bistua/article/view/207',
    'https://ojs.unipamplona.edu.co/ojsviceinves/index.php/bistua/article/view/208',
    'https://ojs.unipamplona.edu.co/ojsviceinves/index.php/bistua/article/view/209',
    'https://ojs.unipamplona.edu.co/ojsviceinves/index.php/bistua/article/view/210',
    'https://ojs.unipamplona.edu.co/ojsviceinves/index.php/bistua/article/view/1158',
    'https://ojs.unipamplona.edu.co/ojsviceinves/index.php/bistua/article/view/1125'
]

let html = [];
let articulos = [];
retornar();

async function busqueda(html,urls) {  
    let evol = 0;
    for(let i = 0;i<urls.length;i++){                
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(urls[i]);
        html = await page.content();
        scrape(html);  
        evol = ((i+1)/urls.length)*100;
        console.log("Procesando ... ",evol,"%")
        browser.close();   
        let articulo = new ArticuloDB(
            articulos[i]
        )         
        await articulo.save();

    }
}

async function retornar() {
    const datos = await busqueda(html,urls);
    console.log("Scraping Finished");
    mongoose.connection.close();
}

/// Se debe agregar ahora el acceso a la base de datos básico, datos repetidos

const articuloSchema = new mongoose.Schema({ // Esquema de los elementos
    titulo: String,
    autores: Array,
    afiliacion: Array,
    doi: String,
    keywordsVect: Array,
    resumen: String,
    citaStd: String,
    linkPdf: String,
    linkImg: String,
    year: String,
    vol: String,
    num: String
});

const ArticuloDB = mongoose.model('Articulos',articuloSchema);

const item1 = new ArticuloDB({
    titulo: 'PROBANDO LA FUNCIONALIDAD DE LA BASE DE DATOS'
})

//guardar()
async function guardar(){
    await item1.save()
    mongoose.connection.close();
}





class Articulo{
    constructor(
        titulo,
        autores,
        afiliacion,
        doi,
        keywordsVect,
        resumen,
        citaStd,
        linkPdf,
        linkImg,
        year,
        vol,
        num
        ){
            this.titulo = titulo;
            this.autores = autores;
            this.afiliacion = afiliacion;
            this.doi = doi;
            this.keywordsVect = keywordsVect;
            this.resumen = resumen;
            this.citaStd = citaStd;
            this.linkPdf =linkPdf;
            this.linkImg = linkImg;
            this.year = year;
            this.vol = vol;
            this.num = num;
        
    }
}


function scrape(html) {
    const $ = cheerio.load(html);    
    
    /// Extracción de los autores
    const titulo = $('h1').text().trim();
    // console.log(titulo);

    /// Extracción de los autores
    let autores = []
    $('.authors .name').each(function (idx,el) {
        autores.push($(el).text().trim())
    });
    // console.log('Autores: ',autores);
    
    //// Extracción de la afiliación
    let afiliacion = []
    $('.authors .affiliation').each(function (idx,el) {
        afiliacion.push($(el).text().trim())
    })
    // console.log('Afiliación: ',afiliacion);

    
    /// Extracción del doi
    const doi = $('.doi .value').text().trim();
    // console.log('DOI: ',doi);
    
    /// Extracción de las palabras clave
    let keywordsVect = []
    let keywords = $('.keywords .value').text().trim().split(',');
    keywords.forEach(element => {
        keywordsVect.push(element.trim())
    })
    // console.log('Palabras clave: ',keywordsVect);
    
    /// Extracción del Resumen
    const resumen = $('.abstract p').text().trim();
    // console.log('Resumen: ',resumen);
    
    /// Extracción de la cita standard
    const citaStd = $('.csl-right-inline').text().trim();
    // console.log('Cita Estandar: ',citaStd)
    
    /// Extracción del link del PDF por medio del atributo href de la etiquta a
    const linkPdf = $('.pdf').attr('href');
    // console.log('Link al PDF: ',linkPdf)
    
    /// Extracción del link de la imagen abstract por medio del atributo src de la etiquta img
    const linkImg = $('.cover_image .sub_item img').attr('src');
    // console.log('Link a la imagen: ',linkImg)

    /// Extracción del volumen al que pertenece 
    const issue = $('.issue .sub_item .value .title').text().trim().split(" ");
    const vol = issue[1];
    const num = issue[3];
    //Del año se deben quitar los paréntesis
    const year = issue[4].replace(/["'\(\)]/g, "");
    // console.log('Volumen: ',vol)
    // console.log('Número: ',num)
    // console.log('Año: ',year)
    //console.log("Como clase: -------")
    articulos.push(new Articulo(titulo,autores,afiliacion,doi,keywordsVect,resumen,citaStd,linkPdf,linkImg,year,vol,num));
    //console.log(articulos);
}