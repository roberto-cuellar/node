require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require('express'); // Se debe instalar este módulo
const cors=require("cors"); /// Requiered for connections in local host
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json()) /// Requiere to retrieve JSON coding in the post request
//// For test

const response = {
    name: 'REVISTA BISTUA',
    location: 'Departamento de Física Universidad de Pamplona',
    state: 'Working'
}


emailFrom = process.env.USER_FROM;
emailTo = process.env.USER_TO;


/// CRUD de la API


// GET 
app.get("/",(req,res)=>{
    console.log("Working")
    res.send(JSON.stringify(response));
})

// POST recibe la información en formato JSON (estandar),  envía el correo, una vez hace esto envía la respuesta de que si el envío tuvo éxito o no
app.post("/",(req,res)=>{
    console.log("Petición recibida");
    emailFrom = process.env.USER_FROM;
    emailTo = process.env.USER_TO;

    const transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
            user: emailFrom,
            pass: process.env.USER_KEY
        }
    })

    const mailOptions  = {
        from: emailFrom,
        to: emailFrom,
        subject: 'Respuesta a comentario en blog',
        text: req.body.nombre+" dice: "+req.body.contenido+". Correo de contacto: "+req.body.correo
    }

    transporter.sendMail(mailOptions,(error,info)=>{
        error?(console.log(error)):(console.log('Email sent: '+info.response))
    })    
})

app.listen(3000,()=>{
    console.log('Servidor escuchando en el puerto 3000');
})