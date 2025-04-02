
const fs = require('fs');
const path = require('path');

const axios = require("axios");
const xml2js = require("xml2js");
const parser = new xml2js.Parser({ explicitArray: false });

const sql = require("mssql");

async function buscarRazonSocialPorDNIRUC(numero) {
    try {
      let apiUrl = '';
      let tipoConsulta = '';
      let headers = {};
  
      // Validar que el número solo contenga dígitos
      if (!/^\d+$/.test(numero)) {
        throw new Error('Número no válido');
      }
  
      if (numero.length === 8) {
        tipoConsulta = 'dni';
      } else if (numero.length === 11) {
        tipoConsulta = 'ruc';
      } else {
        throw new Error('Número no válido');
      }
  
      if (tipoConsulta === 'dni') {
        const tokenDNI = 'apis-token-4761.8i-67B5lTexuXTijVwxpPqh-hjNAYJLn';
        apiUrl = `https://api.apis.net.pe/v2/reniec/dni?numero=${numero}`;
        headers = {
          'Authorization': `Bearer ${tokenDNI}`
        };
      } else if (tipoConsulta === 'ruc') {
        const tokenRUC = 'apis-token-4761.8i-67B5lTexuXTijVwxpPqh-hjNAYJLn';
        apiUrl = `https://api.apis.net.pe/v2/sunat/ruc?numero=${numero}`;
        headers = {
          'Referer': 'http://apis.net.pe/api-ruc',
          'Authorization': `Bearer ${tokenRUC}`
        };
      }
  
      const response = await axios.get(apiUrl, { headers });
      const resultado = response.data;
  
      console.log(resultado);
      
      if (tipoConsulta === 'dni') {
        return `${resultado.nombres} ${resultado.apellidoPaterno} ${resultado.apellidoMaterno}`;
      } else if (tipoConsulta === 'ruc') {
        return resultado.razonSocial; // Ajusta según lo que necesites
      }
    } catch (error) {
      console.error(`Error al consultar el número ${numero}: ${error.message}`);
      return 'Número no encontrado';
    }
  }
  
  // Ejemplo de uso
  // buscarRazonSocialPorDNIRUC('20508195584'); // Reemplaza con el DNI o RUC que desees consultar
  
  buscarRazonSocialPorDNIRUC('20553519536 '); // Reemplaza con el DNI o RUC que desees consultar


  

