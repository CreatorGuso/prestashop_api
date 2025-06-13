
// const fs = require('fs');
// const path = require('path');

// const axios = require("axios");
// const xml2js = require("xml2js");
// const parser = new xml2js.Parser({ explicitArray: false });

// const sql = require("mssql");

// async function buscarRazonSocialPorDNIRUC(numero) {
//     try {
//       let apiUrl = '';
//       let tipoConsulta = '';
//       let headers = {};
  
//       // Validar que el número solo contenga dígitos
//       if (!/^\d+$/.test(numero)) {
//         throw new Error('Número no válido');
//       }
  
//       if (numero.length === 8) {
//         tipoConsulta = 'dni';
//       } else if (numero.length === 11) {
//         tipoConsulta = 'ruc';
//       } else {
//         throw new Error('Número no válido');
//       }
  
//       if (tipoConsulta === 'dni') {
//         const tokenDNI = 'apis-token-4761.8i-67B5lTexuXTijVwxpPqh-hjNAYJLn';
//         apiUrl = `https://api.apis.net.pe/v1/reniec/dni?numero=${numero}`;
//         headers = {
//           'Authorization': `Bearer ${tokenDNI}`
//         };
//       } else if (tipoConsulta === 'ruc') {
//         const tokenRUC = 'apis-token-4761.8i-67B5lTexuXTijVwxpPqh-hjNAYJLn';
//         apiUrl = `https://api.apis.net.pe/v1/sunat/ruc?numero=${numero}`;
//         headers = {
//           'Referer': 'http://apis.net.pe/api-ruc',
//           'Authorization': `Bearer ${tokenRUC}`
//         };
//       }
  
//       const response = await axios.get(apiUrl, { headers });
//       const resultado = response.data;
  
//       console.log(resultado);
      
//       if (tipoConsulta === 'dni') {
//         return `${resultado.nombres} ${resultado.apellidoPaterno} ${resultado.apellidoMaterno}`;
//       } else if (tipoConsulta === 'ruc') {
//         return resultado.razonSocial; // Ajusta según lo que necesites
//       }
//     } catch (error) {
//       console.error(`Error al consultar el número ${numero}: ${error.message}`);
//       return 'Número no encontrado';
//     }
//   }
  
//   // Ejemplo de uso
//   // buscarRazonSocialPorDNIRUC('20508195584'); // Reemplaza con el DNI o RUC que desees consultar
  
//   buscarRazonSocialPorDNIRUC('40377679'); // Reemplaza con el DNI o RUC que desees consultar


const axios = require("axios");

const TOKEN_API = 'apis-token-10146.-iP93tkFs1uyuG-L7y08xzNiqHhWwxlL';

async function buscarRazonSocialPorDNIRUC(numero) {
  if (!/^\d+$/.test(numero)) {
    console.error('❌ El número debe contener solo dígitos');
    return 'Número no válido';
  }

  const tipoConsulta = numero.length === 8 ? 'dni' : numero.length === 11 ? 'ruc' : null;

  if (!tipoConsulta) {
    console.error('❌ El número debe tener 8 dígitos (DNI) o 11 dígitos (RUC)');
    return 'Número no válido';
  }

  let apiUrl = '';
  let headers = {
    'Authorization': `Bearer ${TOKEN_API}`
  };


  // -----> https://api.apis.net.pe/v1/dni?numero=40377679


  if (tipoConsulta === 'dni') {
    apiUrl = `https://api.apis.net.pe/v1/dni?numero=${numero}`;
    console.log('🔍 Consultando DNI...');
  } else {
    apiUrl = `https://api.apis.net.pe/v2/sunat/ruc?numero=${numero}`;
    headers['Referer'] = 'http://apis.net.pe/api-ruc';
    console.log('🔍 Consultando RUC...');
  }
  
  // -----> https://api.apis.net.pe/v1/ruc?numero=

  try {
    const response = await axios.get(apiUrl, { headers });

    const data = response.data;
    console.log('✅ Resultado:', data);

    if (tipoConsulta === 'dni') {
      return `${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`;
    } else {
      return data.razonSocial;
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        console.warn(`⚠️ El número ${numero} no fue encontrado en la API (${tipoConsulta.toUpperCase()})`);
      } else {
        console.error(`❌ Error HTTP ${error.response.status}:`, error.response.data);
      }
    } else {
      console.error(`❌ Error en la solicitud: ${error.message}`);
    }

    return 'Número no encontrado';
  }
}

// 🧪 Ejemplo de uso
buscarRazonSocialPorDNIRUC('20454443765').then((resultado) => {
  console.log('Resultado final:', resultado);
});


