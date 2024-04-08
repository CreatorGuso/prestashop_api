// const express = require("express");
// const readline = require('readline');
const fs = require('fs');
const path = require('path');

const axios = require("axios");
const xml2js = require("xml2js");
const parser = new xml2js.Parser({ explicitArray: false });

// const app = express();
// const port = 3099;

// //////////////////////////////
// const http = require("http");
const sql = require("mssql");

// Configuración de la conexión a la base de datos
const config = {
  user: "kuky",
  password: "Kf123456",
  server: "3.144.237.208",
  database: "prueba_kflor", //prueba_
  options: {
    encrypt: false, // Si estás utilizando Azure, establece esto en true
  },
};


// var productosNoEncontrados = {};


// async function insertarProductoSiNoExiste(producto) {
//   try {
//     // Conectar a la base de datos
//     await sql.connect(config);

//     // Verificar si el producto ya existe en la base de datos por su código alterno
//     const existeProducto = await sql.query(
//       `SELECT COUNT(*) AS count FROM producto WHERE CodigoAlterno = '${producto.CodigoAlterno}'`
//     );

//     // Si existe el producto, mostrar un mensaje y continuar
//     if (existeProducto.recordset[0].count > 0) {
//       console.log(
//         `El producto con código alterno ${producto.CodigoAlterno} ya existe en la base de datos. Continuando con el siguiente.`
//       );
//       return;
//     }

//     // Si no existe el producto, insertarlo en la base de datos
//     const result = await sql.query(
//       `INSERT INTO producto (EmpresaID, Descripcion, Abreviatura, Codigo, GrupoID, UMUnitarioID, StockMaximo, StockMinimo, MarcaID, Modelo, Peso, Ubicacion, Area, CodigoBarra, CodigoAlterno, Estado, UsuarioID, FechaCreacion, FechaModificacion, Idodoo, Precio, Habilitado) 
//        VALUES (${producto.EmpresaId}, '${producto.Descripcion}', '${producto.Abreviatura}', '${producto.Codigo}', '${producto.GrupoId}', ${producto.UMUnitarioId}, ${producto.StockMaximo}, ${producto.StocMinimo}, ${producto.MarcaId}, '${producto.Modelo}', ${producto.Peso}, '${producto.Ubicacion}', ${producto.Area}, '${producto.CodigoBarra}', '${producto.CodigoAlterno}', '${producto.Estado}', ${producto.UsuarioID}, '${producto.FechaCreacion}', '${producto.FechaModificacion}', ${producto.Idodoo}, ${producto.Precio}, ${producto.Habilitado})`
//     );

//     console.log(
//       `Producto con código alterno ${producto.CodigoAlterno} insertado correctamente.`
//     );

//   } catch (error) {
//     console.log(error);
//     throw error;
//   } finally {
//     // Cerrar la conexión
//     await sql.close();
//   }
// }

//----------------------------------------------------------------
// Endpoint para obtener productos desde PrestaShop
// Endpoint para obtener los primeros 10 productos desde PrestaShop
// app.get("/api/products", async (req, res) => {
//   try {
//     const response = await axios.get(
//       "https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/products",
//       {
//         params: {
//           display: "full",
//           output_format: "JSON",
//           // limit: 10,
//         },
//         headers: {
//           Authorization: "ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T",
//         },
//       }
//     );

//     // Extraer la información específica de cada producto
//     const productsInfo = response.data.products.map((product) => {
//       return {
//         EmpresaId: 1,
//         //ProductoId: product.reference,
//         Descripcion: product.meta_title[0].value,
//         Abreviatura: product.reference,
//         Codigo: "",
//         GrupoId: "050101",
//         // id: 050101 es PRESTASHOP
//         // guardar por nombre no por id
//         UMUnitarioId: 138.00015,
//         StockMaximo: 0,
//         StocMinimo: 0,
//         MarcaId: 124,
//         Modelo: "",
//         Peso: 0,
//         Ubicacion: "",
//         Area: 0,
//         CodigoBarra: "",
//         CodigoAlterno: product.reference,
//         Estado: "1",
//         UsuarioID: 1,
//         FechaCreacion: product.date_add,
//         FechaModificacion: product.date_upd,
//         Idodoo: null,
//         Precio: 0,
//         Habilitado: 1,
//       };
//     });

//     // Insertar cada producto si no existe en la base de datos
//     // for (const producto of productsInfo) {
//     //   await insertarProductoSiNoExiste(producto);
//     // }

//     res.json(productsInfo);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: "Error al obtener los primeros 10 productos de PrestaShop",
//     });
//   }
// });

// Endpoint para obtener los clientes desde PrestaShop
// app.get("/api/customers", async (req, res) => {
//   try {
//     const response = await axios.get(
//       "https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/customers",
//       {
//         params: {
//           display: "full",
//           output_format: "JSON",
//           limit: 3,
//         },
//         headers: {
//           Authorization: "ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T",
//         },
//       }
//     );

//     // Extraer la información específica de cada cliente
//     const customersInfo = response.data.customers.map((customer) => {
//       return {
//         //TipoIdentidadId: "buscar en otra tabla",
//         //NroIdentidad: "Sacar de la tabla address",
//         GrupoPersoneria: 1,
//         Personeria: `${customer.name ? customer.name : ""}`,
//         NombreComercial: `${customer.name ? customer.name : ""}`,
//         Domiciliado: 1,
//         TipoContribuyente: "1",
//         FamiliaID: 143,
//         NegocioID: 179,
//         CtaDetraccion: "",
//         Codigo: "",
//         Estado: 1,
//         UsuarioID: "1",
//         FechaCreacion: `${customer.date_add ? customer.date_add : ""}`,
//         FechaModificacion: `${customer.date_upd ? customer.date_add : ""}`,
//         ConvenioID: 902.00001,
//         MedioRegistroID: 900.00001,
//         MedioInformacionID: 901.00001,
//         Referencia: "",
//         //Telefonos: "sacar de la tabla address",
//         email: `${customer.email ? customer.email : ""}`,
//       };
//     });

//     // Mostrar la información por consola
//     customersInfo.forEach((customer) => {
//       console.log(
//         `
//         TipoIdentidadId: *buscar en otra tabla*,
//         NroIdentidad: *Sacar de la tabla address*,
//         GrupoPersoneria: 1,
//         Personeria: ${customer.name ? customer.name : ""}, 
//         NombreComercial: ${customer.name ? customer.name : ""}, 
//         Domiciliado: 1, 
//         TipoContribuyente: "1", 
//         FamiliaID: 143, 
//         NegocioID: 179, 
//         CtaDetraccion: "", 
//         Codigo: "", 
//         Estado: 1, 
//         UsuarioID: "1", 
//         FechaCreacion: ${customer.date_add ? customer.date_add : ""}, 
//         FechaModificacion: ${customer.date_upd ? customer.date_add : ""}, 
//         ConvenioID: 902.00001, 
//         MedioRegistroID: 900.00001, 
//         MedioInformacionID: 901.00001, 
//         Referencia: "", 
//         Telefonos: *sacar de la tabla address*, 
//         email: ${customer.email ? customer.email : ""}, 
//         `
//       );
//       console.log("---");
//     });

//     res.json(response.data);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "Error al obtener los clientes de PrestaShop" });
//   }
// });


// Desarrollo de enlaces para la api de prestashop


// app.get("/api/orders", async (req, res) => {
//   try {
//     const response = await axios.get(
//       "https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/orders",
//       {
//         params: {
//           display: "full",
//           output_format: "XML",
//           limit: 30, // Obtener siempre los últimos 20 pedidos
//           sort: "[id_DESC]", // Ordenar por ID de forma descendente (los últimos primero)
//         },
//         headers: {
//           Authorization: "ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T",
//         },
//       }
//     );
//     // Parsear la respuesta XML
//     parser.parseString(response.data, (err, result) => {
//       if (err) {
//         console.error(err);
//         return res
//           .status(500)
//           .json({ error: "Error al parsear la respuesta XML" });
//       }
//       // Extraer los elementos <order>
//       const orders = result.prestashop.orders.order;
//       // Extraer la información específica de cada cliente
//       const ordersInfo = result.prestashop.orders.order.map((order) => {
//         return {
//           Orden: order.id,
//           PersoneriaID: order.id_customer,
//           // OficinaAlmacenID: 1,
//           // DireccionID: 1, //en la db hay 1 y 2
//           // MonedaID: "102.00001",
//           // ListaPrecioID: "108.00001",
//           // estado: order.current_state,
//           // ContadoEstado: 0,
//           // VendedorId: "1",
//           // TipoEntrega: 2,
//           // FechaEntrega: order.delivery_date,
//           // DireccionEntrega: order.id_address_delivery,
//           // OficinaAlmacenEntregaID: "1",
//           // referencia: order.reference,
//           // Observaciones: "",
//           // cliente: "",
//           // Contacto: "",
//           // ContactoTelefono: "",
//           // tipoventa: 0,
//           // HabilitarFecha: "0",
//           // MotivoID: "190.00062", //por defecto
//           // CondicionVtaID: "113.00001", //por defecto
//           // DeliveryTipoID: "193.00001", //por defecto
//           // DeliveryTurnoID: "192.00002", //por defecto
//           // TipoDocID: "", // se jalara por address
//           // ValorPedido: order.total_paid,
//           // PrecioPedido: order.total_paid,
//           // FacturarSwitch: 0,
//           // ConvenioID: "902.00002", //por defecto
//           // firstname: order.firstname,
//           // lastname: order.lastname,
//           // addres1: order.addres1,
//           // addres2: order.addres2,
//           // id_state: order.id_state,
//           // phone: order.phone,
//           // dniORUC: order.company,
//         };
//       });
//       res.json(ordersInfo);
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "Error al obtener los pedidos de PrestaShop" });
//   }
// });

// app.get("/api/orders", async (req, res) => {
//   try {
//     // Obtener el valor máximo de la base de datos
//     const maxWebID = await BuscarOrdenMaxima();

//     const response = await axios.get(
//       "https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/orders",
//       {
//         params: {
//           display: "full",
//           output_format: "XML",
//           limit: 200, // Obtener siempre los últimos 20 pedidos
//           sort: "[id_DESC]", // Ordenar por ID de forma descendente (los últimos primero)
//         },
//         headers: {
//           Authorization: "ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T",
//         },
//       }
//     );
//     // Parsear la respuesta XML
//     parser.parseString(response.data, (err, result) => {
//       if (err) {
//         console.error(err);
//         return res
//           .status(500)
//           .json({ error: "Error al parsear la respuesta XML" });
//       }
//       // Extraer los elementos <order>
//       const orders = result.prestashop.orders.order;
//       // Filtrar solo las órdenes con WebID mayor al máximo de la base de datos
//       const ordersInfo = result.prestashop.orders.order.map((order) => {
//         if (parseInt(order.id) > maxWebID) {
//           return {
//             Orden: order.id,
//             PersoneriaID: order.id_customer,
//             // Resto de las propiedades...
//           };
//         }
//         return null;
//       }).filter(Boolean); // Filtrar elementos nulos

//       res.json(ordersInfo);
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "Error al obtener los pedidos de PrestaShop" });
//   }
// });

// async function ApiOrders() {
//   try {
//     // Obtener el valor máximo de la base de datos
//     // const maxWebID = await BuscarOrdenMaxima();

//     const response = await axios.get(
//       "https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/orders",
//       {
//         params: {
//           display: "full",
//           output_format: "XML",
//           limit: 50, // Obtener siempre los últimos 20 pedidos
//           sort: "[id_DESC]", // Ordenar por ID de forma descendente (los últimos primero)
//         },
//         headers: {
//           Authorization: "ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T",
//         },
//       }
//     );

//     // Parsear la respuesta XML
//     const result = await new Promise((resolve, reject) => {
//       parser.parseString(response.data, (err, result) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(result);
//         }
//       });
//     });

//     // Extraer los elementos <order>
//     const orders = result.prestashop.orders.order;

//     // Filtrar solo las órdenes con WebID mayor al máximo de la base de datos
//     const ordersInfo = orders
//       // .filter(order => parseInt(order.id) > maxWebID)
//       .map(order => ({
//         Orden: order.id,
//         PersoneriaID: order.id_customer,
//         FechadeOrden: order.date_upd,
//         // Resto de las propiedades...
//       }));

//     return ordersInfo;
//   } catch (error) {
//     console.error(error);
//     throw new Error("Error al obtener los pedidos de PrestaShop");
//   }
// }


async function ApiOrders() {
  try {
    const response = await axios.get(
      "https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/orders",
      {
        params: {
          display: "full",
          output_format: "XML",
          limit: 100, // Obtener siempre los últimos 20 pedidos
          sort: "[id_DESC]", // Ordenar por ID de forma descendente (los últimos primero)
        },
        headers: {
          Authorization: "ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T",
        },
      }
    );

    // Parsear la respuesta XML
    const result = await new Promise((resolve, reject) => {
      parser.parseString(response.data, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    const fechaActual = new Date();
    const dia = fechaActual.getDate() < 10 ? '0' + fechaActual.getDate() : fechaActual.getDate();
    const mes = (fechaActual.getMonth() + 1) < 10 ? '0' + (fechaActual.getMonth() + 1) : (fechaActual.getMonth() + 1);
    const fechaFormateada = fechaActual.getFullYear() + '-' + mes + '-' + dia;
    
    // Extraer los elementos <order> y filtrar por fecha de hoy
    const orders = result.prestashop.orders.order.filter(order => {
      const orderDate = new Date(order.date_upd);
      const orderDia = orderDate.getDate() < 10 ? '0' + orderDate.getDate() : orderDate.getDate();
      const orderMes = (orderDate.getMonth() + 1) < 10 ? '0' + (orderDate.getMonth() + 1) : (orderDate.getMonth() + 1);
      const orderFechaFormateada = orderDate.getFullYear() + '-' + orderMes + '-' + orderDia;
      return orderFechaFormateada === fechaFormateada;
    });
    

    // Mapear las órdenes filtradas
    const ordersInfo = orders.map(order => ({
      Orden: order.id,
      OrdenDeRegistro: parseInt(order.id),
      PersoneriaID: order.id_customer,
      FechadeOrden: order.date_upd,
      // Resto de las propiedades...
    })).sort((a, b) => a.OrdenDeRegistro - b.OrdenDeRegistro);

    return ordersInfo;
  } catch (error) {
    console.error(error);
    throw new Error("Error al obtener los pedidos de PrestaShop");
  }
}


// async function HistorialOrden(orden) {
//   try {
//     // Obtener el valor máximo de la base de datos
//     const maxWebID = await BuscarOrdenMaxima();

//     const response = await axios.get(
//       `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/order_histories/${orden}`,
//       {
//         params: {
//           display: "full",
//           output_format: "XML",
//           limit: 200, // Obtener siempre los últimos 20 pedidos
//           sort: "[id_DESC]", // Ordenar por ID de forma descendente (los últimos primero)
//         },
//         headers: {
//           Authorization: "ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T",
//         },
//       }
//     );

//     // Parsear la respuesta XML
//     const result = await new Promise((resolve, reject) => {
//       parser.parseString(response.data, (err, result) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(result);
//         }
//       });
//     });

//     // Extraer los elementos <order>
//     const orders = result.prestashop.orders.order;

//     // Filtrar solo las órdenes con WebID mayor al máximo de la base de datos
//     const ordersInfo = orders
//       .filter(order => parseInt(order.id) > maxWebID)
//       .map(order => ({
//         Orden: order.id,
//         PersoneriaID: order.id_customer,
//         // Resto de las propiedades...
//       }));

//     return ordersInfo;
//   } catch (error) {
//     console.error(error);
//     throw new Error("Error al obtener los pedidos de PrestaShop");
//   }
// }

async function HistorialOrden(orderId) {
  try {
    const response = await axios.get(
      `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/order_histories/${orderId}`
    );

    var EstadoHistorial = {};
    // Parsear la respuesta XML
    parser.parseString(response.data, (err, result) => {
      if (err) {
        console.error(err);
        throw new Error("Error al parsear la respuesta XML");
      }
      const order = result.prestashop.order_history;
      // Crear un nuevo objeto JSON con la data de las URLs
      EstadoHistorial = {
        estadodeOrden : order.id_order_state._,
      };
    });
    return EstadoHistorial;
  } catch (error) {
    console.error(error);
    throw new Error("Error al obtener el historial de la orden");
  }
}

// Uso de la función
// ApiOrders().then(ordersInfo => {
//   console.log(ordersInfo);
// }).catch(error => {
//   console.error(error);
// });


// app.get("/api/orders/:id", async (req, res) => {
//   const orderId = req.params.id;

//   try {
//     const response = await axios.get(
//       `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/orders/${orderId}`
//     );

//     var Pedido = {};
//     // Parsear la respuesta XML
//     parser.parseString(response.data, (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Error al parsear la respuesta XML" });
//       }
//       // Extraer la orden con el ID especificado
//       const order = result.prestashop.order;
//       // Crear un nuevo objeto JSON con la data de las URLs
//       Pedido = {
//         id: order.id,
//         // id_address_delivery: order.id_address_delivery,
//         // id_address_invoice: order.id_address_invoice,
//         // id_cart: order.id_cart,
//         // id_currency: order.id_currency,
//         // id_lang: order.id_lang,
//         // id_customer: order.id_customer,
//         // id_carrier: order.id_carrier,
//         // current_state: order.current_state,
//         módulo: order.module,
//         invoice_number: order.invoice_number,
//         invoice_date: order.invoice_date,
//         delivery_number: order.delivery_number,
//         delivery_date: order.delivery_date,
//         valid: order.valid,
//         date_add: order.date_add,
//         date_upd: order.date_upd,
//         shipping_number: order.shipping_number,
//         ddw_order_date: order.ddw_order_date,
//         ddw_order_time: order.ddw_order_time,
//         id_shop_group: order.id_shop_group,
//         id_shop: order.id_shop,
//         secure_key: order.secure_key,
//         payment: order.payment,
//         recyclable: order.recyclable,
//         gift: order.gift,
//         gift_message: order.gift_message,
//         mobile_theme: order.mobile_theme,
//         total_discounts: order.total_discounts,
//         total_discounts_tax_incl: order.total_discounts_tax_incl,
//         total_discounts_tax_excl: order.total_discounts_tax_excl,
//         total_paid: order.total_paid,
//         total_paid_tax_incl: order.total_paid_tax_incl,
//         total_paid_tax_excl: order.total_paid_tax_excl,
//         total_paid_real: order.total_paid_real,
//         total_products: order.total_products,
//         total_products_wt: order.total_products_wt,
//         total_shipping: order.total_shipping,
//         total_shipping_tax_incl: order.total_shipping_tax_incl,
//         total_shipping_tax_excl: order.total_shipping_tax_excl,
//         carrier_tax_rate: order.carrier_tax_rate,
//         total_wrapping: order.total_wrapping,
//         total_wrapping_tax_incl: order.total_wrapping_tax_incl,
//         total_wrapping_tax_excl: order.total_wrapping_tax_excl,
//         round_mode: order.round_mode,
//         round_type: order.round_type,
//         conversion_rate: order.conversion_rate,
//         reference: order.reference,
//         productos: order.associations,
//         address_delivery: order.id_address_delivery._,
//         address_invoice: order.id_address_invoice._,
//         cart: order.id_cart._,
//         currency: order.id_currency._,
//         lang: order.id_lang._,
//         customer: order.id_customer._,
//         carrier: order.id_carrier._,
//         state: order.current_state._,
//       };
//     });



//     // Axios estaticos para la obtencion de todos los datos
//     const responseAddresDelivery = await axios.get(
//       `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/addresses/${Pedido.address_delivery}`
//     );

//     var DireccionEntrega = {};
//     parser.parseString(responseAddresDelivery.data, (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Error al parsear la respuesta XML" });
//       }
//       // Extraer la orden con el ID especificado
//       const direccionEntrega = result.prestashop;
//       DireccionEntrega = {
//         id_adress_Entrega: direccionEntrega.address.id,
//         id_direccion: direccionEntrega.address.id_state._,
//         direccion_1: direccionEntrega.address.address1,
//         Referencia: direccionEntrega.address.address2,
//         PesonaEntrega: direccionEntrega.address.firstname + ' ' + direccionEntrega.address.lastname,
//         Telefono: direccionEntrega.address.phone,
//       };
//     });

//     // Obtencion de Direccion
//     const responseDireccionOrden = await axios.get(
//       `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/states/${DireccionEntrega.id_direccion}`
//     );

//     var IDEntrega_Direccion = {};
//     parser.parseString(responseDireccionOrden.data, (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Error al parsear la respuesta XML" });
//       }
//       // Extraer la orden con el ID especificado
//       const DatosEntregaDireccion = result.prestashop;
//       IDEntrega_Direccion = {
//         id: DatosEntregaDireccion.state.id,
//         iso_code: DatosEntregaDireccion.state.iso_code,
//         name: DatosEntregaDireccion.state.name,
//         active: DatosEntregaDireccion.state.active,
//       };
//     });

//     const responseAddresinvoice = await axios.get(
//       `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/addresses/${Pedido.address_delivery}`
//     );

//     var DireccionFacturacion = {};
//     parser.parseString(responseAddresinvoice.data, (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Error al parsear la respuesta XML" });
//       }
//       // Extraer la orden con el ID especificado
//       const direccionFacturacion = result.prestashop;
//       DireccionFacturacion = {
//         id_adress_Entrega: direccionFacturacion.address.id,
//       };
//     });

//     const responseAddresinvoice2 = await axios.get(
//       `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/addresses/${Pedido.address_invoice}`
//     );

//     var SerieDePedido = {};
//     parser.parseString(responseAddresinvoice2.data, (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Error al parsear la respuesta XML" });
//       }
//       // Extraer la orden con el ID especificado
//       const SeriedeFacturaEnvoice2 = result.prestashop;
//       SerieDePedido = {
//         id_adress_Entrega: SeriedeFacturaEnvoice2.address.alias,
//       };
//     });



//     const responseCard = await axios.get(
//       `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/carts/${Pedido.cart}`
//     );

//     var Card = {};
//     parser.parseString(responseCard.data, (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Error al parsear la respuesta XML" });
//       }
//       // Extraer la orden con el ID especificado
//       const Carrito = result.prestashop;
//       Card = {
//         id: Carrito.cart.id,
//       };
//     });

//     const responseEstado = await axios.get(
//       `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/order_states/${Pedido.state}`
//     );

//     var Estado = {};
//     parser.parseString(responseEstado.data, (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Error al parsear la respuesta XML" });
//       }
//       // Extraer la orden con el ID especificado
//       const estado = result.prestashop;
//       Estado = {
//         id: estado.order_state.id,
//         Estado: estado.order_state.name.language
//       };
//     });

//     const responseCustomer = await axios.get(
//       `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/customers/${Pedido.customer}`
//     );

//     var Customer = {};
//     parser.parseString(responseCustomer.data, (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Error al parsear la respuesta XML" });
//       }
//       // Extraer la orden con el ID especificado
//       const customer = result.prestashop;
//       Customer = {
//         id: customer.customer.id,
//         documentoIdentidad: customer.customer.company,
//         lastname: customer.customer.lastname,
//         firstname: customer.customer.firstname,
//         email: customer.customer.email,
//       };
//     });

//     const ArrayCompleto = {
//       Estado,
//       SerieDePedido,
//       DireccionFacturacion,
//       DireccionEntrega,
//       IDEntrega_Direccion,
//       Card,
//       Customer,
//       Pedido
//     };

//     res.json(ArrayCompleto);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error al obtener la orden de PrestaShop" });
//   }

// });


async function BuscarORdenPorID(orderId) {
  try {
    const response = await axios.get(
      `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/orders/${orderId}`
    );

    var Pedido = {};
    // Parsear la respuesta XML
    parser.parseString(response.data, (err, result) => {
      if (err) {
        console.error(err);
        throw new Error("Error al parsear la respuesta XML");
      }
      // Extraer la orden con el ID especificado
      const order = result.prestashop.order;
      // Crear un nuevo objeto JSON con la data de las URLs
      Pedido = {
        id: order.id,
        // id_address_delivery: order.id_address_delivery,
        // id_address_invoice: order.id_address_invoice,
        // id_cart: order.id_cart,
        // id_currency: order.id_currency,
        // id_lang: order.id_lang,
        // id_customer: order.id_customer,
        // id_carrier: order.id_carrier,
        // current_state: order.current_state,
        módulo: order.module,
        invoice_number: order.invoice_number,
        invoice_date: order.invoice_date,
        delivery_number: order.delivery_number,
        delivery_date: order.delivery_date,
        valid: order.valid,
        date_add: order.date_add,
        date_upd: order.date_upd,
        shipping_number: order.shipping_number,
        ddw_order_date: order.ddw_order_date,
        ddw_order_time: order.ddw_order_time,
        id_shop_group: order.id_shop_group,
        id_shop: order.id_shop,
        secure_key: order.secure_key,
        payment: order.payment,
        recyclable: order.recyclable,
        gift: order.gift,
        gift_message: order.gift_message,
        mobile_theme: order.mobile_theme,
        total_discounts: order.total_discounts,
        total_discounts_tax_incl: order.total_discounts_tax_incl,
        total_discounts_tax_excl: order.total_discounts_tax_excl,
        total_paid: order.total_paid,
        total_paid_tax_incl: order.total_paid_tax_incl,
        total_paid_tax_excl: order.total_paid_tax_excl,
        total_paid_real: order.total_paid_real,
        total_products: order.total_products,
        total_products_wt: order.total_products_wt,
        total_shipping: order.total_shipping,
        total_shipping_tax_incl: order.total_shipping_tax_incl,
        total_shipping_tax_excl: order.total_shipping_tax_excl,
        carrier_tax_rate: order.carrier_tax_rate,
        total_wrapping: order.total_wrapping,
        total_wrapping_tax_incl: order.total_wrapping_tax_incl,
        total_wrapping_tax_excl: order.total_wrapping_tax_excl,
        round_mode: order.round_mode,
        round_type: order.round_type,
        conversion_rate: order.conversion_rate,
        reference: order.reference,
        productos: order.associations,
        address_delivery: order.id_address_delivery._,
        address_invoice: order.id_address_invoice._,
        cart: order.id_cart._,
        currency: order.id_currency._,
        lang: order.id_lang._,
        customer: order.id_customer._,
        carrier: order.id_carrier._,
        state: order.current_state._,
      };
    });

    // Axios estaticos para la obtencion de todos los datos
    const responseAddresDelivery = await axios.get(
      `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/addresses/${Pedido.address_delivery}`
    );

    var DireccionEntrega = {};
    parser.parseString(responseAddresDelivery.data, (err, result) => {
      if (err) {
        console.error(err);
        throw new Error("Error al parsear la respuesta XML");
      }
      // Extraer la orden con el ID especificado
      const direccionEntrega = result.prestashop;
      DireccionEntrega = {
        id_adress_Entrega: direccionEntrega.address.id,
        id_direccion: direccionEntrega.address.id_state._,
        direccion_1: direccionEntrega.address.address1,
        Referencia: direccionEntrega.address.address2,
        PesonaEntrega: direccionEntrega.address.firstname + ' ' + direccionEntrega.address.lastname,
        Telefono: direccionEntrega.address.phone,
      };
    });

    // Obtencion de Direccion
    const responseDireccionOrden = await axios.get(
      `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/states/${DireccionEntrega.id_direccion}`
    );

    var IDEntrega_Direccion = {};
    parser.parseString(responseDireccionOrden.data, (err, result) => {
      if (err) {
        console.error(err);
        throw new Error("Error al parsear la respuesta XML");
      }
      // Extraer la orden con el ID especificado
      const DatosEntregaDireccion = result.prestashop;
      IDEntrega_Direccion = {
        id: DatosEntregaDireccion.state.id,
        iso_code: DatosEntregaDireccion.state.iso_code,
        name: DatosEntregaDireccion.state.name,
        active: DatosEntregaDireccion.state.active,
      };
    });

    const responseAddresDeliveryEnvoice = await axios.get(
      `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/addresses/${Pedido.address_delivery}`
    );

    var DireccionFacturacion = {};
    parser.parseString(responseAddresDeliveryEnvoice.data, (err, result) => {
      if (err) {
        console.error(err);
        throw new Error("Error al parsear la respuesta XML");
      }
      // Extraer la orden con el ID especificado
      const direccionFacturacion = result.prestashop;
      DireccionFacturacion = {
        id_adress_Entrega: direccionFacturacion.address.id,
      };
    });

    const responseAddresinvoice2 = await axios.get(
      `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/addresses/${Pedido.address_invoice}`
    );

    var SerieDePedido = {};
    parser.parseString(responseAddresinvoice2.data, (err, result) => {
      if (err) {
        console.error(err);
        throw new Error("Error al parsear la respuesta XML");
      }
      // Extraer la orden con el ID especificado
      const SeriedeFacturaEnvoice2 = result.prestashop;
      SerieDePedido = {
        id_adress_Entrega: SeriedeFacturaEnvoice2.address.alias,
        company: SeriedeFacturaEnvoice2.address.company,
      };
    });


    const responseCard = await axios.get(
      `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/carts/${Pedido.cart}`
    );

    var Card = {};
    parser.parseString(responseCard.data, (err, result) => {
      if (err) {
        console.error(err);
        throw new Error("Error al parsear la respuesta XML");
      }
      // Extraer la orden con el ID especificado
      const Carrito = result.prestashop;
      Card = {
        id: Carrito.cart.id,
      };
    });

    const responseEstado = await axios.get(
      `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/order_states/${Pedido.state}`
    );

    var Estado = {};
    parser.parseString(responseEstado.data, (err, result) => {
      if (err) {
        console.error(err);
        throw new Error("Error al parsear la respuesta XML");
      }
      // Extraer la orden con el ID especificado
      const estado = result.prestashop;
      Estado = {
        id: estado.order_state.id,
        Estado: estado.order_state.name.language
      };
    });

    const responseCustomer = await axios.get(
      `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/customers/${Pedido.customer}`
    );

    var Customer = {};
    parser.parseString(responseCustomer.data, (err, result) => {
      if (err) {
        console.error(err);
        throw new Error("Error al parsear la respuesta XML");
      }
      // Extraer la orden con el ID especificado
      const customer = result.prestashop;
      Customer = {
        id: customer.customer.id,
        documentoIdentidad: customer.customer.company,
        lastname: customer.customer.lastname,
        firstname: customer.customer.firstname,
        email: customer.customer.email,
      };
    });

    const ArrayCompleto = {
      Estado,
      SerieDePedido,
      DireccionFacturacion,
      DireccionEntrega,
      IDEntrega_Direccion,
      Card,
      Customer,
      Pedido
    };

    return ArrayCompleto;

  } catch (error) {
    console.error(error);
    throw new Error("Error al obtener la orden de PrestaShop");
  }
}
// Funciones del modelo para la creacion de el pedido

async function BuscarOrdenMaxima() {
  try {
    await sql.connect(config);
    const request = new sql.Request();
    const result = await request.query('select MAX(WebID) AS MaxValue from VentaPedidoCabecera where EmpresaID = 1 ');
    if (result.recordset.length === 0) {
      return null;
    }
    return result.recordset[0].MaxValue;
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await sql.close();
  }
}


async function buscarClientePorDNI(dni) {
  try {
    await sql.connect(config);
    const request = new sql.Request();
    request.input('NroIdentidad', sql.VarChar, dni);
    const result = await request.query('SELECT * FROM Personeria WHERE NroIdentidad = @NroIdentidad');
    if (result.recordset.length === 0) {
      return null; // Devolver null si el cliente no se encuentra
    }
    return result.recordset[0]; // Devolver el primer cliente encontrado
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await sql.close();
  }
}

async function BuscarOrden(Orden) {
  try {
    await sql.connect(config);
    const request = new sql.Request();
    request.input('Orden', sql.VarChar, Orden);
    const result = await request.query('select * from VentaPedidoCabecera where WebID = @Orden');
    if (result.recordset.length === 0) {
      return null; // Devolver null si la orden no se encuentra
    }
    return result.recordset[0]; // Devolver la orden si se ha encontrado
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await sql.close();
  }
}

// async function GenerarComprobante(newPedidoID, variablesSesion, tipoDocID) {
//   try {
//     const query2 = `
//       EXEC spPyOPedidoGeneraComprobante 1, @OficinaAlmacenID, @PedidoID, @tipoDocID;`;
//       await sql.connect(config);
//       const request = new sql.Request();
//       request.input('OficinaAlmacenID', sql.Decimal(6, 3), variablesSesion.OficinaAlmacenID);
//     console.log("Este es mi newPedidoID para el procedimiento:: ", newPedidoID);
//     request.input('PedidoID', sql.Int, newPedidoID);
//     request.input('tipoDocID', sql.Decimal(9, 5), tipoDocID);
//     await request.query(query2);
//   } catch (error) {
//     console.log(error);
//     throw error;
//   } finally {
//     await sql.close();
//   }
// }

// async function GenerarComprobante(newPedidoID, variablesSesion, tipoDocID) {
//   try {
//     const pool = await sql.connect(config);
//     const request = pool.request();
//     const query = `
//       EXEC spPyOPedidoGeneraComprobante 1, @OficinaAlmacenID, @PedidoID, @tipoDocID;`;
//     request.input('OficinaAlmacenID', sql.Decimal(6, 3), variablesSesion.OficinaAlmacenID);
//     console.log("Este es mi newPedidoID para el procedimiento:: ", newPedidoID);
//     request.input('PedidoID', sql.Int, newPedidoID);
//     request.input('tipoDocID', sql.Decimal(9, 5), tipoDocID);
//     await request.query(query);
//   } catch (error) {
//     console.log(error);
//     throw error;
//   } finally {
//     await sql.close();
//   }
// }

// const query2 = `
//                     exec spPyOPedidoGeneraComprobante 1,@OficinaAlmacenID,@PedidoID,@tipoDocID;`;
//     const request3 = pool.request();
//     request3.input('OficinaAlmacenID', sql.Decimal(6, 3), variablesSesion.OficinaAlmacenID);
//     request3.input('PedidoID', sql.Int, newPedidoID);
//     request3.input('tipoDocID', sql.Decimal(9, 5),103.00048);

//     await request3.query(query2);

async function buscarRazonSocialPorDNIRUC(numero) {
  try {
    let apiUrl = '';
    let tipoConsulta = '';
    let headers = {};
    if (numero.length === 8) {
      tipoConsulta = 'dni';
    } else if (numero.length >= 11) {
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
    } else {
      throw new Error('Tipo de consulta no válido');
    }
    const response = await axios.get(apiUrl, { headers });
    const resultado = response.data;

    if (tipoConsulta === 'dni') {
      // resultado.nombres + ' ' + resultado.apellidoPaterno + ' ' + resultado.apellidoMaterno
      return resultado
    } else if (tipoConsulta === 'ruc') {
      // return resultado.razonSocial;
      // Personalizar reestructuracion de archivos-
      return resultado;
    }
  } catch (error) {
    console.error(error);
    return 'Número no encontrado';
  }
}

async function crearCliente(params) {
  console.log("Estos son mis parametros de lciente",params);
  let pool;
  let transaction;
  try {
    pool = await sql.connect(config);
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const query = `
          INSERT INTO dbo.Personeria
          (TipoIdentidadID, NroIdentidad, GrupoPersoneria, Personeria, NombreComercial, Domiciliado, TipoContribuyente, FamiliaID, NegocioID, CtaDetraccion, Codigo, Estado, UsuarioID, ConvenioID, MedioRegistroID, MedioInformacionID, Referencia, Telefonos, email)
          VALUES 
          (@TipoIdentidadID, @NroIdentidad, @GrupoPersoneria, @Personeria, @NombreComercial, @Domiciliado, @TipoContribuyente, @FamiliaID, @NegocioID, @CtaDetraccion, @Codigo, @Estado, @UsuarioID, @ConvenioID, @MedioRegistroID, @MedioInformacionID, @Referencia, @Telefonos, @Email);
          SELECT @@IDENTITY AS LastId;
      `;

    const request = new sql.Request(transaction);
    request.input('TipoIdentidadID', sql.Decimal(9, 5), params.tipoDocumento == '1' ? 203.00001 : 203.00002);//Funcionalidad para dni o ruc
    request.input('NroIdentidad', sql.NVarChar, params.numeroDocumento);
    request.input('GrupoPersoneria', sql.NVarChar, '1');
    request.input('Personeria', sql.NVarChar, params.tipoDocumento == '1' ? (params.nombres + ' ' + params.apellidoPaterno + ' ' + params.apellidoMaterno) : params.razonSocial);
    request.input('NombreComercial', sql.NVarChar, params.tipoDocumento == '1' ? (params.nombres + ' ' + params.apellidoPaterno + ' ' + params.apellidoMaterno) : params.razonSocial);
    request.input('Domiciliado', sql.NVarChar, '1');
    request.input('TipoContribuyente', sql.NVarChar, '1');
    request.input('FamiliaID', sql.Decimal(9, 5), 143.00000);
    request.input('NegocioID', sql.Decimal(9, 5), 179.00000);
    request.input('CtaDetraccion', sql.NVarChar, '');
    request.input('Codigo', sql.NVarChar, '');
    request.input('Referencia', sql.VarChar, '');
    request.input('Estado', sql.NVarChar, '1');
    request.input('UsuarioID', sql.Int, 1);
    request.input('ConvenioID', sql.Decimal(9, 5), 902.00001);
    request.input('MedioRegistroID', sql.Decimal(9, 5), 900.00001);
    request.input('MedioInformacionID', sql.Decimal(9, 5), 901.00001);
    request.input('Telefonos', sql.NVarChar, '');
    request.input('Email', sql.NVarChar, '');

    const result = await request.query(query);
    const PersoneriaID = result.recordset[0].LastId;
    const query2 = `
          INSERT INTO [dbo].[PersoneriaDireccion]
              ([PersoneriaID], [DireccionID], [PaisID], [UbicacionID], [ViaID], [NombreVia], [NumeroVia], [InteriorVia], [ZonaID], [NombreZona], [Direccion], [Telefonos], [Email], [ZonaRutaID], [Secuencia], [Coordenada], [Estado], [UsuarioID])
          VALUES
              (@PersoneriaID, @DireccionID, @PaisID, @UbicacionID, @ViaID, @NombreVia, @NumeroVia, @InteriorVia, @ZonaID, @NombreZona, @Direccion, @Telefonos, @Email, @ZonaRutaID, @Secuencia, @Coordenada, @Estado, @UsuarioID);
      `;

    const request2 = new sql.Request(transaction);

    if (params.tipoDocumento == '1') {
      request2.input('PersoneriaID', sql.Int, PersoneriaID);
      request2.input('DireccionID', sql.Int, 1);
      request2.input('PaisID', sql.Decimal(9, 5), 204.00193);
      request2.input('UbicacionID', sql.NVarChar, '000000');
      request2.input('ViaID', sql.Decimal, 135.00000);
      request2.input('NombreVia', sql.NVarChar, '');
      request2.input('NumeroVia', sql.NVarChar, '');
      request2.input('InteriorVia', sql.NVarChar, '');
      request2.input('ZonaID', sql.Decimal(9, 5), 136.00000);
      request2.input('NombreZona', sql.NVarChar, '');
      request2.input('Direccion', sql.NVarChar, '');
      request2.input('Telefonos', sql.NVarChar, '');
      request2.input('Email', sql.NVarChar, '');
      request2.input('ZonaRutaID', sql.Decimal(9, 5), 180.00000);
      request2.input('Secuencia', sql.Int, 0);
      request2.input('Coordenada', sql.NVarChar, '');
      request2.input('Estado', sql.NVarChar, '1');
      request2.input('UsuarioID', sql.Int, 1);
    } else {
      // Generacion de direccion por RUC.
      request2.input('PersoneriaID', sql.Int, PersoneriaID);
      request2.input('DireccionID', sql.Int, 1);
      request2.input('PaisID', sql.Decimal(9, 5), 204.00193);
      request2.input('UbicacionID', sql.NVarChar, params.ubigeo);
      request2.input('ViaID', sql.Decimal, 135.00000);
      request2.input('NombreVia', sql.NVarChar, '');
      request2.input('NumeroVia', sql.NVarChar, '');
      request2.input('InteriorVia', sql.NVarChar, '');
      request2.input('ZonaID', sql.Decimal(9, 5), 136.00000);
      request2.input('NombreZona', sql.NVarChar, '');
      request2.input('Direccion', sql.NVarChar, params.direccion);
      request2.input('Telefonos', sql.NVarChar, '');
      request2.input('Email', sql.NVarChar, '');
      request2.input('ZonaRutaID', sql.Decimal(9, 5), 180.00000);
      request2.input('Secuencia', sql.Int, 0);
      request2.input('Coordenada', sql.NVarChar, '');
      request2.input('Estado', sql.NVarChar, '1');
      request2.input('UsuarioID', sql.Int, 1);
    }
    await request2.query(query2);
    await transaction.commit();
    return { success: true, message: 'Cliente creado exitosamente.' };
  } catch (error) {
    console.error(error);
    if (transaction) {
      await transaction.rollback();
    }
    return { success: false, message: 'Error al crear el cliente.', error: error.message };
  } finally {
    if (pool) {
      pool.close();
    }
  }
}

// Variables necesarias para la creacion de pedidos
const variablesSesion = {
  EmpresaID: 1,
  UsuarioID: 58,
  OficinaAlmacenID: 17,
};

const PlanillaID = '834';


async function createPedido(paramsOrden, ParamsPersona, variablesSesion, PlanillaID) {
  console.log("Entramos al modelo de pedidos");
  let pool, result, error = '';
  let nuevoIDpedido = 0;
  try {
    pool = await sql.connect(config);

    //Obtenemos el maximo valor de nuestro Pedido para uno nuevo
    // const query_count2 = `
    //   SELECT COALESCE(MAX(NumeroPedido), 0) + 1 AS IDPedido
    //   FROM VentaPedidoCabecera;`;

    // const result_count = await pool.request().query(query_count2);
    // nuevoIDpedido = result_count.recordset[0].IDPedido;
    // console.log(nuevoIDpedido);


    var seriePedido = 0;
    const partes = paramsOrden.SerieDePedido.id_adress_Entrega.split("-");
    // Obtener la primera parte que corresponde al tipo de serie
    const tipoSerie = partes[0];

    if (tipoSerie == 'BO') {
      seriePedido = 103.00003;
    } else if (tipoSerie == 'FA') {
      seriePedido = 103.00001;
    }
    //Extraccion de numero de serie // --> F-B Serie o boleta
    const queryDocRelativo = `
      SELECT *
      FROM documentocorrelativo 
      WHERE EmpresaID = ${parseFloat(variablesSesion.EmpresaID)} 
      AND OficinaAlmacenID = ${parseFloat(variablesSesion.OficinaAlmacenID)} 
      AND TipoDocID = 103.00048 `;

    const result_Serie = await pool.request().query(queryDocRelativo);
    const SerieCorrelativo = result_Serie.recordset[0].SerieDoc;
    let ConsecutivoActual = result_Serie.recordset[0].Consecutivo;

    const query = `
      INSERT INTO VentaPedidoCabecera
        (EmpresaID, OficinaAlmacenID, SeriePedido, NumeroPedido, PersoneriaID, DireccionID, VendedorID, CondicionVtaID, MonedaID, ListaPrecioID, Fecha, TipoEntrega, FechaEntrega, DireccionEntrega, OficinaAlmacenEntregaID, Referencia, Observaciones, Cliente, Contacto, Contactotelefono, MotivoID, DeliveryTipoID, DeliveryTurnoID, TipoDocID, ValorPedido, PrecioPedido, TipoCambio, Estado, UsuarioID, FechaCreacion, FechaModificacion, TipoVenta, Gratuita, PlanillaID, ConvenioID, WebID)
        VALUES
        (1, @OficinaAlmacenID, @SerieCorrelativo, @NumeroPedido, @PersoneriaID, @DireccionID, @Vendedor, @CondicionVtaID, @MonedaID, @ListaPrecioID, @Fecha, @TipoEntrega, @FechaEntrega, @DireccionEntrega, @OficinaAlmacenEntregaID, @Referencia, @Observaciones, '', @Contacto, @Contactotelefono, @MotivoID, @DeliveryTipoID, @DeliveryTurnoID, @TipoDocID, @ValorPedido, @PrecioPedido, 0.00000, '1', @UsuarioID, @FechaEntrega, @FechaEntrega, @TipoVenta, @HabilitarFecha, @IDPlanilla, @ConvenioID, @WebID);
      SELECT SCOPE_IDENTITY() AS LastInsertedID;`;

    const request = pool.request();
    request.input('OficinaAlmacenID', sql.Decimal(6, 3), variablesSesion.OficinaAlmacenID);
    request.input('NumeroPedido', sql.Int, (parseInt(ConsecutivoActual) + 1));
    request.input('SerieCorrelativo', sql.VarChar, SerieCorrelativo);
    request.input('PersoneriaID', sql.Int, ParamsPersona.PersoneriaID);
    request.input('DireccionID', sql.Int, 1);
    request.input('MonedaID', sql.Decimal(9, 5), 102.00001);
    request.input('ListaPrecioID', sql.Decimal(9, 5), 108.00001);
    request.input('TipoEntrega', sql.Int, 2);
    request.input('FechaEntrega', sql.DateTime, paramsOrden.Pedido.ddw_order_date); //new Date(paramsOrden.Pedido.ddw_order_date.split(" ")[0])
    request.input('FechaCreacion', sql.DateTime, paramsOrden.Pedido.date_add);
    request.input('FechaEdicion', sql.DateTime, paramsOrden.Pedido.date_upd);
    request.input('Fecha', sql.DateTime, paramsOrden.Pedido.date_add);
    request.input('DireccionEntrega', sql.VarChar, paramsOrden.DireccionEntrega.direccion_1);
    request.input('OficinaAlmacenEntregaID', sql.Decimal(6, 3), 1);
    request.input('Referencia', sql.VarChar, paramsOrden.Pedido.gift_message);
    request.input('Observaciones', sql.VarChar, paramsOrden.DireccionEntrega.Referencia + ' , Entro en el siguiente rando de hora ' + paramsOrden.Pedido.ddw_order_time);
    request.input('Contacto', sql.VarChar, paramsOrden.DireccionEntrega.PesonaEntrega);
    request.input('Contactotelefono', sql.VarChar, paramsOrden.DireccionEntrega.Telefono);
    request.input('MotivoID', sql.Decimal(9, 5), 190.00062);
    request.input('CondicionVtaID', sql.Decimal(9, 5), 113.00001);
    request.input('DeliveryTipoID', sql.Decimal(9, 5), 193.00001);

    function obtenerTurno(ddw_order_time) {
      // Dividir el valor de ddw_order_time para obtener la hora de inicio y fin del turno
      let [inicio, fin] = ddw_order_time.split(' - ');
      inicio = parseInt(inicio.split(':')[0]);
      fin = parseInt(fin.split(':')[0]);
  
      // Definir los horarios de inicio y fin de cada turno , Ojo deberia ser automatico segun tablaempresa
      const turnos = [
          { numero: '192.00002', inicio: 9, fin: 14 },
          { numero: '192.00003', inicio: 14, fin: 18 },
          { numero: '192.00005', inicio: 17, fin: 20 }
      ];
  
      // Calcular la distancia al turno más cercano
      let distanciaMinima = Number.MAX_SAFE_INTEGER;
      let turnoCercano = 'No se encontró un turno válido';
  
      for (let turno of turnos) {
          let distanciaInicio = Math.abs(inicio - turno.inicio);
          let distanciaFin = Math.abs(fin - turno.fin);
          let distancia = distanciaInicio + distanciaFin;
  
          if (distancia < distanciaMinima) {
              distanciaMinima = distancia;
              turnoCercano = turno.numero;
          }
      }
      // Retornar el turno más cercano
      return turnoCercano;
  }

    request.input('DeliveryTurnoID', sql.Decimal(9, 5), obtenerTurno(paramsOrden.Pedido.ddw_order_time)); //192.00002 iba por defecto
    request.input('TipoDocID', sql.Decimal(9, 5), seriePedido);
    request.input('UsuarioID', sql.Int, variablesSesion.UsuarioID);
    request.input('Vendedor', sql.Int, variablesSesion.UsuarioID);
    request.input('TipoVenta', sql.Int, 0);
    request.input('HabilitarFecha', sql.Int, 0);
    request.input('IDPlanilla', sql.NVarChar, PlanillaID);
    request.input('ConvenioID', sql.Decimal(9, 5), 902.00001);
    request.input('WebID', sql.Int, paramsOrden.Pedido.id);
    request.input('ValorPedido', sql.Decimal(9, 5), paramsOrden.Pedido.total_paid);
    request.input('PrecioPedido', sql.Decimal(9, 5), paramsOrden.Pedido.total_paid);

    result = await request.query(query);
    const newPedidoID = result.recordset[0].LastInsertedID;
    console.log("Este es mi pedido Id ::::::::::::::::::::::::", newPedidoID);
    // console.log("Este es el numero de pedido", newPedidoID);
    let ConsecutivoProducto = 0;
    // const orderRows = paramsOrden.Pedido.productos.order_rows.order_row;
    // for (let i = 0; i < orderRows.length; i++) {
    //   console.log("Entramos al procedimiento de agregar productos");
    //   const producto = orderRows[i];
    //   const requestPrecio = pool.request();
    //   const precioQuery = `
    //     SELECT PP.* 
    //     FROM ProductoPrecio PP
    //     LEFT JOIN Producto P ON PP.ProductoID = P.ProductoID
    //     WHERE P.CodigoAlterno = @CodigoAlterno;`;

    //   requestPrecio.input('CodigoAlterno', sql.VarChar, producto.referencia);
    //   const resultPrecio = await requestPrecio.query(precioQuery);
    //   const precioProducto = resultPrecio.recordset[0].Contado;
    //   const ProductoID = resultPrecio.recordset[0].ProductoID;
    //   const UMContenidoID = resultPrecio.recordset[0].UMContenidoID;

    //   const request2 = pool.request();
    //   const query1 = `
    //     INSERT INTO VentaPedidoDetalle
    //       (EmpresaID, OficinaAlmacenID, PedidoID, Consecutivo, ProductoID, cantidad, valorunitario, preciounitario, PorcentajeDescuento, descuento, FechaEntrega, UMUnitarioID, observaciones, Estado, UsuarioID, FechaCreacion, FechaModificacion)
    //       VALUES
    //       (1, @OficinaAlmacenID,
    //         @PedidoID, @Consecutivo, @ProductoID, @cantidad, 0.0, @preciounitario, 0.0, @descuento, @FechaEntrega, @UMUnitarioID, '', 1, @UsuarioID, GETDATE(), GETDATE());`;

    //   request2.input('OficinaAlmacenID', sql.Decimal(6, 3), variablesSesion.OficinaAlmacenID);
    //   request2.input('PedidoID', sql.Int, newPedidoID);
    //   request2.input('Consecutivo', sql.Int, i + 1);
    //   ConsecutivoProducto = i + 1 ;
    //   request2.input('ProductoID', sql.Int, ProductoID);
    //   request2.input('cantidad', sql.Decimal(12, 4), producto.product_quantity);
    //   request2.input('preciounitario', sql.Decimal(18, 9), precioProducto);
    //   request2.input('descuento', sql.Decimal(18, 9), 0.00);
    //   request2.input('FechaEntrega', sql.Date, new Date(paramsOrden.Pedido.delivery_date.split(" ")[0]));
    //   request2.input('UMUnitarioID', sql.Decimal(9, 5), UMContenidoID);
    //   request2.input('UsuarioID', sql.Int, variablesSesion.UsuarioID);
    //   await request2.query(query1);
    // }
    const orderRows = paramsOrden.Pedido.productos.order_rows.order_row;

    let cantidadProductos;
    if (Array.isArray(orderRows)) {
      cantidadProductos = orderRows.length;
    } else {
      cantidadProductos = 1;
    }

    for (let i = 0; i < cantidadProductos; i++) {
      console.log("Entramos al procedimiento de agregar productos");

      let producto;
      if (Array.isArray(orderRows)) {
        producto = orderRows[i];
      } else {
        // Si orderRows no es un array, asumimos que es un objeto con un solo elemento
        producto = orderRows;
      }
      console.log(producto); // Muestra el producto actual para verificar

      const requestPrecio = pool.request();
      const precioQuery = `
        SELECT PP.* 
        FROM ProductoPrecio PP
        LEFT JOIN Producto P ON PP.ProductoID = P.ProductoID
        WHERE P.CodigoAlterno = @CodigoAlterno;`;

      const referenciaPura = producto.product_reference.includes('-D')
        ? producto.product_reference.split('-D')[0]
        : producto.product_reference;
      // Sin -D
      requestPrecio.input('CodigoAlterno', sql.VarChar, referenciaPura);
      console.log("Este es el producto referencia");
      console.log(producto.product_reference);
      const resultPrecio = await requestPrecio.query(precioQuery);
      const precioProducto = resultPrecio.recordset[0].Contado;
      const ProductoID = resultPrecio.recordset[0].ProductoID;
      const UMContenidoID = resultPrecio.recordset[0].UMContenidoID;

      const request2 = pool.request();
      const query1 = `
    INSERT INTO VentaPedidoDetalle
      (EmpresaID, OficinaAlmacenID, PedidoID, Consecutivo, ProductoID, cantidad, valorunitario, preciounitario, PorcentajeDescuento, descuento, FechaEntrega, UMUnitarioID, observaciones, Estado, UsuarioID, FechaCreacion, FechaModificacion)
      VALUES
      (1, @OficinaAlmacenID,
        @PedidoID, @Consecutivo, @ProductoID, @cantidad, 0.0, @preciounitario, 0.0, @descuento, @FechaEntrega, @UMUnitarioID, '', 1, @UsuarioID, @FechaEntrega, @FechaEntrega);`;

      request2.input('OficinaAlmacenID', sql.Decimal(6, 3), variablesSesion.OficinaAlmacenID);
      request2.input('PedidoID', sql.Int, newPedidoID);
      request2.input('Consecutivo', sql.Int, i + 1);
      ConsecutivoProducto = i + 1;
      request2.input('ProductoID', sql.Int, ProductoID);
      request2.input('cantidad', sql.Decimal(12, 4), producto.product_quantity);
      request2.input('preciounitario', sql.Decimal(18, 9), precioProducto);
      request2.input('descuento', sql.Decimal(18, 9), 0.00);
      request2.input('FechaEntrega', sql.Date, new Date(paramsOrden.Pedido.ddw_order_date.split(" ")[0]));
      request2.input('UMUnitarioID', sql.Decimal(9, 5), UMContenidoID);
      request2.input('UsuarioID', sql.Int, variablesSesion.UsuarioID);
      await request2.query(query1);
    }

    // Insertar el delivery como producto
    const requestPrecioDelivery = pool.request();
    const precioQueryDelivery = `
            SELECT PP.*
            FROM ProductoPrecio PP
            LEFT JOIN Producto P ON PP.ProductoID = P.ProductoID
            WHERE P.CodigoAlterno = @CodigoAlterno;`;

    requestPrecioDelivery.input('CodigoAlterno', sql.VarChar, paramsOrden.IDEntrega_Direccion.id);
    const resultPrecioDelivery = await requestPrecioDelivery.query(precioQueryDelivery);
    console.log("Este es el resultado de mi Delivery");
    console.log(resultPrecioDelivery);
    const precioProductoDelivery = resultPrecioDelivery.recordset[0].Contado;
    const ProductoIDDelivery = resultPrecioDelivery.recordset[0].ProductoID;
    const UMContenidoIDDelivery = resultPrecioDelivery.recordset[0].UMContenidoID;

    const request5 = pool.request();
    const query5 = `
            INSERT INTO VentaPedidoDetalle
              (EmpresaID, OficinaAlmacenID, PedidoID, Consecutivo, ProductoID, cantidad, valorunitario, preciounitario, PorcentajeDescuento, descuento, FechaEntrega, UMUnitarioID, observaciones, Estado, UsuarioID, FechaCreacion, FechaModificacion)
              VALUES
              (1, @OficinaAlmacenID, @PedidoID, @Consecutivo, @ProductoID, @cantidad, 0.0, @preciounitario, 0.0, @descuento, @FechaEntrega, @UMUnitarioID, '', 1, @UsuarioID, GETDATE(), GETDATE());`;

    request5.input('OficinaAlmacenID', sql.Decimal(6, 3), variablesSesion.OficinaAlmacenID);
    request5.input('PedidoID', sql.Int, newPedidoID);
    request5.input('Consecutivo', sql.Int, ConsecutivoProducto + 1);
    request5.input('ProductoID', sql.Int, ProductoIDDelivery);
    request5.input('cantidad', sql.Decimal(12, 4), 1);
    request5.input('preciounitario', sql.Decimal(18, 9), precioProductoDelivery);
    request5.input('descuento', sql.Decimal(18, 9), 0.00);
    request5.input('FechaEntrega', sql.Date, new Date(paramsOrden.Pedido.ddw_order_date.split(" ")[0]));
    request5.input('UMUnitarioID', sql.Decimal(9, 5), UMContenidoIDDelivery);
    request5.input('UsuarioID', sql.Int, variablesSesion.UsuarioID);
    await request5.query(query5);

    // Insertar información de TablaEmpresa
    const requestMPago = pool.request();
    console.log(paramsOrden.Pedido);
    console.log("Este es mi modulo", paramsOrden.Pedido['módulo']);
    const queryMPago = `
            SELECT * FROM TablaEmpresa WHERE Abreviatura = @referencia;`;
    requestMPago.input('referencia', sql.VarChar, paramsOrden.Pedido['módulo']);
    const resultMPago = await requestMPago.query(queryMPago);
    console.log("Este es mi resul medio pago");
    console.log(resultMPago);
    if (resultMPago.recordset.length > 0) {
      console.log("Entramos al registro del medio de pago");
      const tablaEmpresaInfo = resultMPago.recordset[0];
      const request4 = pool.request();
      const query4 = `
              INSERT INTO VentaPedidoPago
                (EmpresaID, OficinaAlmacenID, PedidoID, FormaPagoID, MontoPago, UsuarioID, FechaCreacion, FechaModificacion, NroOperacion, PlanillaID)
                VALUES
                (1, @OficinaAlmacenID, @PedidoID, @FormaPagoID, @MontoPago, @UsuarioID, GETDATE(), GETDATE(), @NroOperacion, @PlanillaID);`;

      request4.input('OficinaAlmacenID', sql.Decimal(6, 3), variablesSesion.OficinaAlmacenID);
      request4.input('PedidoID', sql.Int, newPedidoID);
      request4.input('FormaPagoID', sql.Decimal(9, 5), tablaEmpresaInfo.CodigoID);
      request4.input('MontoPago', sql.Decimal(12, 2), paramsOrden.Pedido.total_paid);
      request4.input('UsuarioID', sql.Int, variablesSesion.UsuarioID);
      request4.input('NroOperacion', sql.NVarChar, ''); //paramsOrden.Pedido.reference
      request4.input('PlanillaID', sql.NVarChar, PlanillaID);
      await request4.query(query4);
    } else {
      console.log("No entra al if");
    }

    const queryConsecutivoCorrelativo = `
          UPDATE documentoCorrelativo
          SET Consecutivo = @Consecutivo
          WHERE EmpresaID = @Empresa
          AND OficinaAlmacenID = @OficinaAlmacenID
          AND TipoDocID = 103.00048;`;

          const requestConsecutivo = pool.request();
          requestConsecutivo.input('Empresa', sql.Int, variablesSesion.EmpresaID);
          requestConsecutivo.input('OficinaAlmacenID', sql.Decimal(6, 3), variablesSesion.UsuarioOficina);
          requestConsecutivo.input('Consecutivo', sql.Int, parseInt(ConsecutivoActual) + 1));
    result = await requestConsecutivo.query(queryConsecutivoCorrelativo);

    console.log("Ejecutamos el procedimiento de facturacion");

    const query2 = `
            EXEC spPyOPedidoGeneraComprobante 1, @OficinaAlmacenID, @PedidoID, @tipoDocID.'E';`;

    const request3 = pool.request();
    request3.input('OficinaAlmacenID', sql.Decimal(6, 3), variablesSesion.OficinaAlmacenID);
    console.log("Esta es la OficinaAlmacen :", variablesSesion.OficinaAlmacenID)
    console.log("Este es mi newPedidoID para el procedimiento:: ", newPedidoID);
    request3.input('PedidoID', sql.Int, newPedidoID);
    request3.input('tipoDocID', sql.Decimal(9, 5), seriePedido);

    await request3.query(query2);

  } catch (err) {
    error = err.toString();
  } finally {
    if (pool) {
      pool.close();
    }
  }
  return {
    result,
    error
  };
}

// app.get("/api/BuscarDNI/:id", async (req, res) => {
//   const orderId = req.params.id;
//   try {
//     const cliente = await buscarClientePorDNI(orderId);
//     console.log(cliente);
//     res.status(200).json(cliente); // Devolver el cliente encontrado
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error al obtener el cliente" });
//   }
// });


// app.get("/api/BuscarRUCoDNISunat/:numero", async (req, res) => {
//   const numero = req.params.numero;
//   try {
//     const razonSocial = await buscarRazonSocialPorDNIRUC(numero);
//     console.log(razonSocial);
//     res.status(200).json({ razonSocial }); // Devolver la razón social encontrada
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error al obtener la razón social" });
//   }
// });


// app.get('/api/CrearCliente/:numero', async (req, res) => {
//   try {
//     console.log("Entramos al controlador");
//     const numero = req.params.numero;
//     const razonSocial = await buscarRazonSocialPorDNIRUC(numero);
//     const resultadoCreacion = await crearCliente(razonSocial);
//     if (resultadoCreacion.success) {
//       res.status(200).json("El cliente se creo correctamente");
//     } else {
//       res.status(200).json("El cliente no se creo");
//       throw new Error(resultadoCreacion.message);
//     }
//   } catch (error) {
//     console.error(error);
//     return { success: false, message: 'Error al registrar el cliente.', error: error.message };
//   }
// });

// Ejecutamos proceso de verificacion de cliente y orden
// async function procesarOrden(orden) {
//   try {
//     // Conectar a la base de datos
//     await sql.connect(config);

//     // Verificar si el estado de la orden es "procesado" (id=14)
//     if (orden.Estado.Id !== '14') {
//       console.log('La orden no está procesada. No se puede crear el pedido.');
//       return;
//     }
//     // Paso 1: Revisar el DNI y buscar o crear al cliente
//     let clienteId = '00000001'; // Cliente general por defecto
//     if (orden.Customer.documentoIdentidad !== '') {
//       const cliente = await buscarClientePorDNI(orden.DNI);
//       if (cliente) {
//         clienteId = cliente.NroIdentidad; //Obtenemos el numero de Identidad del Cliente 
//       } else {
//         // Ser crea el cliente 
//         clienteId = await crearClientePorDNI(orden.DNI);
//       }
//     }
//     // Paso 2: Crear el pedido
//     await crearPedido(orden, clienteId);
//     console.log('Pedido creado correctamente.');

//   } catch (error) {
//     console.log(error);
//     throw error;
//   } finally {
//     // Cerrar la conexión
//     await sql.close();
//   }
// }

// Inicia el servidor


// async function procesarOrden() {
//   try {
//     //obtenemos las ultimas 100 ordenes 
//     const response = await axios.get("http://localhost:3099/api/orders");
//     console.log(response);
//     // Procesar la respuesta
//     const ordersInfo = response.data;
//     console.log("Datos de las ordenes:", ordersInfo);
//     return ordersInfo;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

// async function procesarOrdenPrestashop() {
//   try {
//     //obtenemos las ultimas 100 ordenes 
//     const ordenes = await axios.get("http://localhost:3099/api/orders");
//     // Procesar la respuesta
//     const ordersInfo = ordenes.data;
//     console.log("Datos de las ordenes:", ordersInfo);
//     // Iterar sobre cada orden y llamar a la función BuscarOrden
//     for (let i = 0; i < ordersInfo.length; i++) {
//       const orden = ordersInfo[i].Orden;
//       const resultadoOrdenes = await BuscarOrden(orden);
//       if (resultadoOrdenes) {
//         console.log(`Orden ${orden} encontrada:`, resultadoOrdenes);
//       } else {
//         console.log(`Orden ${orden} no encontrada`);
//         const ordenPorID = await axios.get(`http://localhost:3099/api/orders/${orden}`);
//         console.log(ordenPorID.data);
//         var DatosDeOrden = ordenPorID.data;
//         if (DatosDeOrden.Estado.id == '14' || DatosDeOrden.Estado.id == '5') {
//           // Buscamos que el cliente tenga DNI si es igual a '' se usara el 00000001
//           if (DatosDeOrden.Customer.documentoIdentidad == '') {
//             const cliente = await buscarClientePorDNI('00000001');
//             // Se procede con la creacion del pedido
//             await createPedido(orden, cliente);
//           } else {
//             const cliente = await buscarClientePorDNI(DatosDeOrden.Customer.documentoIdentidad);
//             // si el cliente no se encuentra se crea el cliente
//             if (cliente === null) {
//               const razonSocial = await buscarRazonSocialPorDNIRUC(DatosDeOrden.Customer.documentoIdentidad);
//               const resultadoCreacion = await crearCliente(razonSocial);
//               if (resultadoCreacion.success) {
//                 console.log("El cliente se creo correctamente");
//               } else {
//                 console.log("El cliente no se creo");
//               }
//               const clienteNuevo = await buscarClientePorDNI(DatosDeOrden.Customer.documentoIdentidad);
//               if (clienteNuevo != null) {
//                 // Procedemos con la creacion del pedido
//                 await createPedido(orden, clienteNuevo);
//               }
//             }
//           }

//         }
//       }
//     }
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

async function procesarOrdenPrestashop() {
  try {
    // Obtener las últimas 100 órdenes
    // const ordenes = await axios.get("http://localhost:3099/api/orders");
    const ordenes = await ApiOrders();
    const ordersInfo = ordenes;
    console.log("Datos de las órdenes:", ordersInfo);
    for (let i = 0; i < ordersInfo.length; i++) {
      const orden = ordersInfo[i].Orden;
      const resultadoOrdenes = await BuscarOrden(orden);
      if (resultadoOrdenes) {
        console.log(`Orden ${orden} encontrada:`, resultadoOrdenes);
      } else {
        console.log(`Orden ${orden} no encontrada`);
        // const ordenPorID = await axios.get(`http://localhost:3099/api/orders/${orden}`);
        const ordenPorID = await BuscarORdenPorID(orden);
        console.log(ordenPorID);
        var DatosDeOrden = ordenPorID;
        const EstadoOrden = await HistorialOrden(orden); 
        console.log(EstadoOrden);
        const VerificacionEstado = EstadoOrden.estadodeOrden;
        if (VerificacionEstado == '5' || VerificacionEstado == '2' || VerificacionEstado == '14') {
          console.log("Entramos al if");
          let cliente = null;
          if (DatosDeOrden.SerieDePedido.company == '') {
            console.log("el cliente no tiene DNI");
            cliente = await buscarClientePorDNI('00000001');
            console.log(cliente);
            if (cliente != null) {
              // Procedemos con la creacion del pedido
              console.log("Creamos el pedido");
              const pedidoCreado = await createPedido(DatosDeOrden, cliente, variablesSesion, PlanillaID);
              console.log(pedidoCreado);
            }
          } else {
            console.log("El cliente si tiene DNI");
            console.log("este es el DNI", DatosDeOrden.SerieDePedido.company);
            // Se verifica que si o si tenga 8 y 11.
            if (DatosDeOrden.SerieDePedido.company.length === 8 || DatosDeOrden.SerieDePedido.company.length === 11) {
              console.log("Paso verificacion de DNI o RUC");
              cliente = await buscarClientePorDNI(DatosDeOrden.SerieDePedido.company);
              if (cliente === null) {
                const razonSocial = await buscarRazonSocialPorDNIRUC(DatosDeOrden.SerieDePedido.company);
                const resultadoCreacion = await crearCliente(razonSocial);
                if (resultadoCreacion.success) {
                  console.log("El cliente se creó correctamente");
                } else {
                  console.log("El cliente no se creó");
                }
                cliente = await buscarClientePorDNI(DatosDeOrden.SerieDePedido.company);
                if (cliente != null) {
                  // Procedemos con la creacion del pedido
                  const pedidoCreado = await createPedido(DatosDeOrden, cliente, variablesSesion, PlanillaID);
                  console.log(pedidoCreado);
                }
              }else{
                  const pedidoCreado = await createPedido(DatosDeOrden, cliente, variablesSesion, PlanillaID);
                  console.log(pedidoCreado);
              }
            } else {
              console.log("El numero de identidad no cumple con los requisitos");
              console.log("DNI fallido se creara con Cliente Ventas Dia");
              cliente = await buscarClientePorDNI('00000001');
              console.log(cliente);
              if (cliente != null) {
                // Procedemos con la creacion del pedido
                console.log("Creamos el pedido");
                const pedidoCreado = await createPedido(DatosDeOrden, cliente, variablesSesion, PlanillaID);
                console.log(pedidoCreado);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}


async function verificacionControlCaja(OficinaID, userId) {
  let pool;
  let result;
  let error = '';
  try {
    pool = await sql.connect(config);
    const query = `exec spPyOConsultaDatosPlanilla @empresaid, @oficinaid, @usuarioid, @fecha`;
    const request = pool.request();
    const hoy = new Date();
    const dia = hoy.getDate() < 10 ? '0' + hoy.getDate() : hoy.getDate();
    const mes = hoy.getMonth() + 1 < 10 ? '0' + (hoy.getMonth() + 1) : hoy.getMonth() + 1;
    const fechaFormateada = hoy.getFullYear() + '-' + mes + '-' + dia;
    request.input('empresaid', sql.Int, 1);
    request.input('oficinaid', sql.Int, OficinaID);
    request.input('usuarioid', sql.Int, userId);
    request.input('fecha', sql.VarChar, fechaFormateada)
    result = await request.query(query);
  } catch (err) {
    error = err;
  }
  finally {
    if (pool) {
      pool.close();
    }
  }
  return {
    result,
    error
  }
}

async function AperturaCaja(OficinaID, userId, Serie,Fecha) {
  let pool;
  let result;
  let error = '';
  try {
      pool = await sql.connect(config);
      const query = `exec spPyOAperturaCierrePlanilla @empresaid, @oficinaid, @usuarioid, @fecha , @Serie`;
      const request = pool.request();
      request.input('empresaid', sql.Int, 1);//por sesion
      request.input('oficinaid', sql.Int, OficinaID);
      request.input('usuarioid', sql.Int, userId);
      request.input('fecha', sql.VarChar, Fecha);
      request.input('Serie', sql.VarChar, Serie);
      result = await request.query(query);
  } catch (err) {
      error = err;
  }
  finally {
      if (pool) {
          pool.close();
      }
  }
  return {
      result,
      error
  }
}

async function CierreCaja(OficinaID, userId, Serie, IDplantilla, fecha) {
  let pool;
  let result;
  let error = '';
  try {
      pool = await sql.connect(config);
      const query = `exec spPyOAperturaCierrePlanilla @empresaid, @oficinaid, @usuarioid, @fecha , @Serie , @IDplantilla`;
      const request = pool.request();
      request.input('empresaid', sql.Int, 1);//po sesion 
      request.input('oficinaid', sql.Int, OficinaID);
      request.input('usuarioid', sql.Int, userId);
      request.input('fecha', sql.VarChar, fecha);   //new Date().toISOString().split('T')[0]);
      request.input('Serie', sql.VarChar, Serie);
      request.input('IDplantilla', sql.VarChar, IDplantilla);
      result = await request.query(query);
  } catch (err) {
      error = err;
  }
  finally {
      if (pool) {
          pool.close();
      }
  }
  return {
      result,
      error
  }
}

async function UltimaPlanillaCaja() {
  try {
    await sql.connect(config);
    const request = new sql.Request();
    const result = await request.query(`SELECT TOP 1 * FROM PlanillaCajaDetalle
                                        WHERE OficinaAlmacenID = 17
                                        ORDER BY PlanillaID DESC;`);
    // console.log(result);
    if (result.recordset.length === 0) {
      return null; 
    }
    return result.recordset[0]; 
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await sql.close();
  }
}

async function UpdatePlanilla(EmpresaID,oficinaAlmacenID,PlanillaID,nuevoEstado) {
  let pool;
  let result;
  let error = '';
  try {
      pool = await sql.connect(config);
      const query = `
          UPDATE [dbo].[PlanillaCaja]
          SET 
              [Estado] = @nuevoEstado,
              [FechaModificacion] = GETDATE()
          WHERE 
              [EmpresaID] = @Empresa AND
              [OficinaAlmacenID] = @oficinaAlmacenID AND
              [PlanillaID] = @PlanillaID
      `;
      const request = pool.request();
      request.input('Empresa', sql.Int, EmpresaID);
      request.input('oficinaAlmacenID', sql.Decimal(6,3), oficinaAlmacenID);
      request.input('PlanillaID', sql.Int,PlanillaID);
      request.input('nuevoEstado', sql.Int, nuevoEstado);
      result = await request.query(query);
      console.log(result);
  } catch (err) {
      error = err;
  } finally {
      if (pool) {
          pool.close();
      }
  }
  return {
      result,
      error
  };
};

// async function Inicializador() {
//   console.log('Inicializando...');
//   // console.log(await procesarOrdenPrestashop());
//   console.log('Ejecutando procedimiento');
//   const controlCaja = await verificacionControlCaja(variablesSesion.OficinaAlmacenID, variablesSesion.UsuarioID);
//   const controlCajaData = controlCaja.result.recordset
//   const orden0 = controlCajaData.filter(elemento => elemento.orden === 0);
//   var planilla = 0;
//   var SeriePlanilla = '';
//   // Obtenemos la fecha correcta
//   const dia = ((new Date()).getDate()) < 10 ? '0' + ((new Date()).getDate()) : ((new Date()).getDate());
//   const mes = ((new Date()).getMonth() + 1) < 10 ? '0' + ((new Date()).getMonth() + 1) : ((new Date()).getMonth() + 1);
//   const fechaFormateada = (new Date()).getFullYear() + '-' + mes + '-' + dia;
//   // Obtenemos la fecha Correcta
//   console.log(orden0);
//   if (orden0.some(elemento => elemento.estado == '3')) {
//     const planillaID = orden0.find(elemento => elemento.estado === '3').planillaID;
//     console.log("Si se tiene una Planilla Habilitada");
//     // Guardamos la planilla
//     planilla = PlanillaID;
//     console.log("Esta es la planilla", planillaID);
//     const SeriePlanilla = orden0.find(elemento => elemento.estado === '3').nombre;
//     const serieNombreCompleto = SeriePlanilla.split('/')[0].trim();
//     SeriePlanilla = serieNombreCompleto.split('-')[0];
//     console.log(await procesarOrdenPrestashop());
//   } else {
//     console.log("no se tiene una planilla habilitada");
//     if (orden0.some(elemento => elemento.estado == '9')) {
//       console.log("La planilla esta para apertura");
//       const SeriePlanilla = orden0.find(elemento => elemento.estado === '9').nombre;
//       const serieNombreCompleto = SeriePlanilla.split('/')[0].trim();
//       SeriePlanilla = serieNombreCompleto.split('-')[0];
//       await AperturaCaja(variablesSesion.OficinaAlmacenID, variablesSesion.UsuarioID,SeriePlanilla,fechaFormateada);
//     }else if (orden0.some(elemento => elemento.estado == 'S') || orden0.some(elemento => elemento.estado == 'N')){
//       console.log("Se cierra planilla de Ayer");
//       await CierreCaja(variablesSesion.OficinaAlmacenID, variablesSesion.UsuarioID, SeriePlanilla, planilla, fechaFormateada)
//     }
//   }
//   console.log('Procedimiento de ordenes completado.');
// }


async function obtenerSeriePlanilla(orden) {
  return orden.nombre.split('/')[0].trim().split('-')[0];
}

async function Inicializador() {
  // const logFilePath = path.join(__dirname, 'logs.txt');
  // const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

  // const originalConsoleLog = console.log;
  // console.log = function (...args) {
  //   const now = new Date();
  //   const dateString = now.toISOString().replace('T', ' ').replace('Z', '');
  //   args.forEach(arg => {
  //     if (typeof arg === 'object') {
  //       logStream.write(`${dateString} - ${JSON.stringify(arg, null, 2)}\n`);
  //     } else {
  //       logStream.write(`${dateString} - ${arg}\n`);
  //     }
  //   });
  //   originalConsoleLog(...args);
  // };
  console.log('Inicializando...');
  console.log('Ejecutando procedimiento');

  const controlCaja = await verificacionControlCaja(variablesSesion.OficinaAlmacenID, variablesSesion.UsuarioID);
  const controlCajaData = controlCaja.result.recordset
  const orden0 = controlCajaData.filter(elemento => elemento.orden === 0);
  const dia = ((new Date()).getDate()) < 10 ? '0' + ((new Date()).getDate()) : ((new Date()).getDate());
  const mes = ((new Date()).getMonth() + 1) < 10 ? '0' + ((new Date()).getMonth() + 1) : ((new Date()).getMonth() + 1);
  const fechaFormateada = (new Date()).getFullYear() + '-' + mes + '-' + dia;

  console.log(orden0);

  if (orden0.some(elemento => elemento.estado === '3')) {
    console.log("Si se tiene una Planilla Habilitada");
    const ordenPlanilla = orden0.find(elemento => elemento.estado === '3');
    const planillaID = ordenPlanilla.planillaID;
    const SeriePlanilla = await obtenerSeriePlanilla(ordenPlanilla);
    console.log("Esta es la planilla", planillaID);
    console.log(await procesarOrdenPrestashop());
  } else {
    console.log("no se tiene una planilla habilitada");

    if (orden0.some(elemento => elemento.estado === '9')) {
      console.log("La planilla esta para apertura");
      const ordenApertura = orden0.find(elemento => elemento.estado === '9');
      const SeriePlanilla = await obtenerSeriePlanilla(ordenApertura);
      await AperturaCaja(variablesSesion.OficinaAlmacenID, variablesSesion.UsuarioID, SeriePlanilla, fechaFormateada);
      await Inicializador();
    } else if (orden0.some(elemento => elemento.estado === 'S') || orden0.some(elemento => elemento.estado === 'N')) {
      console.log("Se cierra planilla de Ayer");
      const ordenCierre = orden0.find(elemento => elemento.estado === 'S' || elemento.estado === 'N');
      const SeriePlanilla = await obtenerSeriePlanilla(ordenCierre);
      console.log('Esta es la serie',SeriePlanilla);
      const ulimaPlanilla = await UltimaPlanillaCaja();
      if (ulimaPlanilla) {
        console.log("Procedemos a cerrar la planilla de caja con estado N o S");
        // await CierreCaja(variablesSesion.OficinaAlmacenID, variablesSesion.UsuarioID, SeriePlanilla, ulimaPlanilla.PlanillaID, ulimaPlanilla.FechaCreacion);
        await UpdatePlanilla(variablesSesion.EmpresaID,variablesSesion.OficinaAlmacenID,ulimaPlanilla.PlanillaID,2)
      } else {
        console.log("No se encontró ninguna planilla de caja.");
      }      
      await Inicializador();
    }
  }
  console.log('Procedimiento de ordenes completado.');
}


Inicializador();



// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// rl.question('Presiona Enter para salir...', () => {
//   rl.close();
// });



// Media  Hora.

// app.get("/api/ordenesDEfuncion", async (req, res) => {
//   try {
//     const ordersInfo = await procesarOrdenPrestashop();
//     res.status(200).json(ordersInfo); // Devolver la información de las ordenes
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error al obtener las ordenes" });
//   }
// });


// Inicializacion de bucle de Proceso de Prestashop
// async function procesarOrdenesCada30Minutos() {
//   while (true) {
//       const ordersInfo = await procesarOrdenPrestashop();
//       console.log('Procesado: ', ordersInfo);
//       await esperar(30 * 60 * 1000); // Esperar 30 minutos
//   }
// }

// function esperar(ms) {
//   return new Promise(resolve => {
//       setTimeout(resolve, ms);
//   });
// }

// // Iniciar el bucle
// procesarOrdenesCada30Minutos().catch(error => {
//   console.error('Error:', error);
// });



// app.listen(port, () => {
//   console.log(`Servidor escuchando en http://localhost:${port}`);
// });


