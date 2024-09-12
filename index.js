
const fs = require('fs');
const path = require('path');

const axios = require("axios");
const xml2js = require("xml2js");
const parser = new xml2js.Parser({ explicitArray: false });

const sql = require("mssql");

// Configuración de la conexión a la base de datos
const config = {
  user: "kuky",
  password: "Kf123456",
  server: "3.144.237.208",
  database: "kflor", //prueba_
  options: {
    encrypt: false, // Si estás utilizando Azure, establece esto en true
  },
};



async function ApiOrders() {
  try {
    const response = await axios.get(
      "https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/orders",
      {
        params: {
          display: "full",
          output_format: "XML",
          limit: 200, // Obtener siempre los últimos 200 pedidos
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

    // Obtener la fecha del día anterior
    const fechaAnterior = new Date(fechaActual);
    fechaAnterior.setDate(fechaAnterior.getDate() - 1);
    const diaAnterior = fechaAnterior.getDate() < 10 ? '0' + fechaAnterior.getDate() : fechaAnterior.getDate();
    const mesAnterior = (fechaAnterior.getMonth() + 1) < 10 ? '0' + (fechaAnterior.getMonth() + 1) : (fechaAnterior.getMonth() + 1);
    const fechaFormateadaAnterior = fechaAnterior.getFullYear() + '-' + mesAnterior + '-' + diaAnterior;

    // Obtener la hora actual
    const horaActual = fechaActual.getHours();
    // const horaActual = 0;
    // console.log("Hora actual", horaActual);

    // Filtrar órdenes por la fecha de hoy y, si es la primera hora del día, también por la fecha de ayer
    const orders = result.prestashop.orders.order.filter(order => {
      const orderDate = new Date(order.date_upd);
      const orderDia = orderDate.getDate() < 10 ? '0' + orderDate.getDate() : orderDate.getDate();
      const orderMes = (orderDate.getMonth() + 1) < 10 ? '0' + (orderDate.getMonth() + 1) : (orderDate.getMonth() + 1);
      const orderFechaFormateada = orderDate.getFullYear() + '-' + orderMes + '-' + orderDia;
      return orderFechaFormateada === fechaFormateada || (horaActual === 20 && orderFechaFormateada === fechaFormateadaAnterior);
      // return orderFechaFormateada === fechaFormateadaAnterior || (horaActual === 20 && orderFechaFormateada === fechaFormateadaAnterior); 
    });

    // Mapear las órdenes filtradas
    const ordersInfo = orders.map(order => ({
      Orden: order.id,
      OrdenDeRegistro: parseInt(order.id),
      PersoneriaID: order.id_customer,
      FechadeOrden: order.date_upd,
    })).sort((a, b) => a.OrdenDeRegistro - b.OrdenDeRegistro);

    // console.log("ordenes",ordersInfo);
    return ordersInfo;
  } catch (error) {
    console.error(error);
    throw new Error("Error al obtener los pedidos de PrestaShop");
  }
}

async function HistorialOrden(orderId) {
  try {
    // Primera llamada a la API para obtener el id del historial de la orden
    const response1 = await axios.get(
      `https://www.kukyflor.com/api/order_histories?filter[id_order]=[${orderId}]&ws_key=ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T`
    );

    var Estados = [];
    // Parsear la respuesta XML
    await new Promise((resolve, reject) => {
      parser.parseString(response1.data, (err, result) => {
        if (err) {
          console.error(err);
          reject(new Error("Error al parsear la respuesta XML HistorialOrden1"));
        } else {
          const order = result.prestashop.order_histories.order_history;
          Estados = Array.isArray(order) ? order : [order];
          resolve();
        }
      });
    });

    var estadoEncontrado = false;
    const fechaComparacion = new Date('2024-07-01T00:00:00Z');

    // console.log("Estados:", Estados);
    // console.log("Número de estados:", Estados.length);

    if (Estados.length > 0) {
      for (let i = 0; i < Estados.length; i++) {
        const estado = Estados[i];
        var estadodeOrden = estado.$.id;
        // console.log("Este es el estado de orden",estadodeOrden);
        try {
          const response2 = await axios.get(`https://www.kukyflor.com/api/order_histories/${estadodeOrden}?ws_key=ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T`);

          // Parsear la respuesta XML
          await new Promise((resolve, reject) => {
            parser.parseString(response2.data, (err, result) => {
              if (err) {
                console.error(err);
                reject(new Error("Error al parsear la respuesta XML HistorialOrden2"));
              } else {
                const estadoOrden = result.prestashop.order_history;
                // console.log("Estado de Order:", estadoOrden);

                const fechaEstado = new Date(estadoOrden.date_add.replace(' ', 'T') + 'Z');
                //&& fechaEstado >= fechaComparacion solo se usara por fechas exactas.
                if (estadoOrden.id_order_state._ == '2') {
                  estadoEncontrado = true;
                }
                resolve();
              }
            });
          });
        } catch (error) {
          console.error(error);
          console.error("Error al obtener el estado de la orden");
          // throw new Error("Error al obtener el estado de la orden");
          return null;
        }
      }
    }

    const estadoFinal = estadoEncontrado ? 2 : 0;
    return estadoFinal;
  } catch (error) {
    console.error(error);
    console.error("Error al obtener el historial de la orden");
    // throw new Error("Error al obtener el historial de la orden");
    return null;
  }
}

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
        // invoice_number: order.invoice_number,
        // invoice_date: order.invoice_date,
        delivery_number: order.delivery_number,
        delivery_date: order.delivery_date,
        valid: order.valid,
        date_add: order.date_add,
        date_upd: order.date_upd,
        // shipping_number: order.shipping_number,
        ddw_order_date: order.ddw_order_date,
        ddw_order_time: order.ddw_order_time,
        // id_shop_group: order.id_shop_group,
        // id_shop: order.id_shop,
        // secure_key: order.secure_key,
        payment: order.payment,
        // recyclable: order.recyclable,
        // gift: order.gift,
        gift_message: order.gift_message,
        // mobile_theme: order.mobile_theme,
        // total_discounts: order.total_discounts,
        // total_discounts_tax_incl: order.total_discounts_tax_incl,
        // total_discounts_tax_excl: order.total_discounts_tax_excl,
        total_paid: order.total_paid,
        total_paid_tax_incl: order.total_paid_tax_incl,
        // total_paid_tax_excl: order.total_paid_tax_excl,
        // total_paid_real: order.total_paid_real,
        // total_products: order.total_products,
        total_products_wt: order.total_products_wt,
        total_shipping: order.total_shipping,
        total_shipping_tax_incl: order.total_shipping_tax_incl,
        total_shipping_tax_excl: order.total_shipping_tax_excl,
        // carrier_tax_rate: order.carrier_tax_rate,
        // total_wrapping: order.total_wrapping,
        // total_wrapping_tax_incl: order.total_wrapping_tax_incl,
        // total_wrapping_tax_excl: order.total_wrapping_tax_excl,
        // round_mode: order.round_mode,
        // round_type: order.round_type,
        // conversion_rate: order.conversion_rate,
        // reference: order.reference,
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
        city: direccionEntrega.address.city,
        Referencia: direccionEntrega.address.address2,
        phone_mobile: direccionEntrega.address.phone_mobile,
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


    var ProductosOrden;

    function obtenerDetallesOrden(orderId) {
      // Realizar la petición a la API para obtener los datos de la orden
      return axios.get(
        `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/order_details/${orderId}`
      )
        .then(responseOrder => {
          return parser.parseStringPromise(responseOrder.data);
        })
        .then(result => {
          const Producto = result.prestashop.order_detail;
          return Producto;
        })
        .catch(err => {
          console.error(`Error al obtener o parsear la orden ${orderId}:`, err);
        });
    }

    // Extraer el array de order_rows
    const orderRows = Pedido.productos.order_rows.order_row;
    const orderIds = orderRows.map(row => row.id);
    // Crear una promesa que contiene todas las promesas de obtener los detalles de las órdenes
    const productosPromise = Promise.all(orderIds.map(orderId => obtenerDetallesOrden(orderId)));

    // Manejar la promesa resultante
    productosPromise
      .then(productos => {
        ProductosOrden = productos;
      })
      .catch(err => {
        console.error('Error al procesar las órdenes:', err);
      });


    // Solicitudes para traer convenio. y detalles de orden
    const order_cart_rules_ID = await axios.get(
      `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/order_cart_rules/?filter[id_order]=${Pedido.id}` //se pasa el numero de orden 
    );

    var Id_Order_cart_rules = { id: null }; // Inicializamos con un valor predeterminado

    parser.parseString(order_cart_rules_ID.data, (err, result) => {
      if (err) {
        console.error(err);
      }
      const Details = result.prestashop;

      if (Details && Details.order_cart_rules && Details.order_cart_rules.order_cart_rule) {
        Id_Order_cart_rules.id = Details.order_cart_rules.order_cart_rule.$.id;
      } else {
        Id_Order_cart_rules.id = [];
      }
    });

    // Solicitudes para traer 
    var cart_rules = {};
    var OrderDetails_cart_rules = {};

    if (Id_Order_cart_rules.id.length === 0) {
      // console.log("No se encontraron reglas de carrito para esta orden.");
      var OrderDetails_cart_rules = null;
      var cart_rules = null;
    } else {

      const order_Details_cart_rules = await axios.get(
        `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/order_cart_rules/${Id_Order_cart_rules.id}`//se pasa el numero de order_card_rule 
      );

      parser.parseString(order_Details_cart_rules.data, (err, result) => {
        if (err) {
          console.error(err);
          throw new Error("Error al parsear la respuesta XML");
        }
        const Details = result.prestashop.order_cart_rule;
        OrderDetails_cart_rules = {
          id: Details.id,
          id_cart_rule: Details.id_cart_rule,
          id_order_invoice: Details.id_order_invoice,
          name: Details.name,
          value: Details.value,
          value_tax_excl: Details.value_tax_excl,
          free_shipping: Details.free_shipping,
          deleted: Details.deleted
        };
      });

      // obtenemos el tipo de descuendto en cart_rules 
      const Details_cart_rules = await axios.get(
        `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/cart_rules/${OrderDetails_cart_rules.id_cart_rule}`//se pasa el id_cart_rule de OrderDetails_cart_rules
      );

      parser.parseString(Details_cart_rules.data, (err, result) => {
        if (err) {
          console.error(err);
          throw new Error("Error al parsear la respuesta XML");
        }
        const Details = result.prestashop.cart_rule;
        cart_rules = {
          id: Details.id,
          id_customer: Details.id_customer,
          date_from: Details.date_from,
          date_to: Details.date_to,
          description: Details.description,
          quantity: Details.quantity,
          quantity_per_user: Details.quantity_per_user,
          priority: Details.priority,
          partial_use: Details.partial_use,
          code: Details.code,
          minimum_amount: Details.minimum_amount,
          minimum_amount_tax: Details.minimum_amount_tax,
          minimum_amount_currency: Details.minimum_amount_currency,
          minimum_amount_shipping: Details.minimum_amount_shipping,
          country_restriction: Details.country_restriction,
          carrier_restriction: Details.carrier_restriction,
          group_restriction: Details.group_restriction,
          cart_rule_restriction: Details.cart_rule_restriction,
          product_restriction: Details.product_restriction,
          shop_restriction: Details.shop_restriction,
          free_shipping: Details.free_shipping,
          reduction_percent: Details.reduction_percent,
          reduction_amount: Details.reduction_amount,
          reduction_tax: Details.reduction_tax,
          reduction_currency: Details.reduction_currency,
          reduction_product: Details.reduction_product,
          reduction_exclude_special: Details.reduction_exclude_special,
          gift_product: Details.gift_product,
          gift_product_attribute: Details.gift_product_attribute,
          highlight: Details.highlight,
          active: Details.active,
          date_add: Details.date_add,
          date_upd: Details.date_upd,
          // name: Details.name
        };
      });
    }

    const ArrayCompleto = {
      Estado,
      SerieDePedido,
      DireccionFacturacion,
      DireccionEntrega,
      IDEntrega_Direccion,
      Card,
      Customer,
      Pedido,
      OrderDetails_cart_rules,
      cart_rules,
      ProductosOrden
    };

    return ArrayCompleto;

  } catch (error) {
    console.error(error);
    return null;
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
    console.error("Error Numero de documento: " + numero + ' ::: ' + error);
    return 'Número no encontrado';
  }
}

async function crearCliente(params, paramsAPI, Convenio ) {
  // console.log("Estos son mis parametros de lciente",params);
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
    request.input('Email', sql.NVarChar, paramsAPI.email);

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
      request2.input('UbicacionID', sql.NVarChar, params.ubigeo == '-' ? '000000' : params.ubigeo); // '000000'
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
    console.error(`Error al crear el cliente con  DNI :  ${params.numeroDocumento}`, error);
    if (transaction) {
      await transaction.rollback();
    }
    return { success: false, message: `Error al crear el cliente con  DNI :  ${params.numeroDocumento}`, error: error.message };
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

let PlanillaID = '';


async function createPedido(paramsOrden, ParamsPersona, variablesSesion, PlanillaID) {
  let pool, result, error = '';
  let newPedidoID = 0;
  let transaction;

  try {
    pool = await sql.connect(config);
    // transaction = await pool.Transaction();
    transaction = new sql.Transaction(pool);

    await transaction.begin();
    const partes = paramsOrden.SerieDePedido.id_adress_Entrega.split("-");
    // Obtener la primera parte que corresponde al tipo de serie
    const tipoSerie = partes[0];
    // console.log("-----------------------------");
    // console.log("Orden",paramsOrden.Pedido.id);
    // console.log("Serie enviada",tipoSerie);
    // console.log("-----------------------------");
    var seriePedido = 103.00003;
    if (tipoSerie == 'BO') {
      seriePedido = 103.00003;
    } else if (tipoSerie == 'FA') {
      seriePedido = 103.00001;
    }

    //Extraccion de numero de serie
    const queryDocRelativo = `
          select * from documentocorrelativo where EmpresaID = ${parseFloat(variablesSesion.EmpresaID)}
          and OficinaAlmacenID = ${parseFloat(variablesSesion.OficinaAlmacenID)}
          and TipoDocID = 103.00048 ;`;
    // const request9 = pool.request();
    const request9 = new sql.Request(transaction);
    // request9.transaction = transaction;
    result_Serie = await request9.query(queryDocRelativo);
    let SerieCorrelativo = result_Serie.recordset[0].SerieDoc;
    let ConsecutivoActual = result_Serie.recordset[0].Consecutivo;

    const queryConsecutivoCorrelativo = `
        UPDATE documentoCorrelativo
        SET Consecutivo = @Consecutivo
        WHERE EmpresaID = @Empresa
        AND OficinaAlmacenID = @OficinaAlmacenID
        AND TipoDocID = 103.00048 ;`;

    // const requestConsecutivo = pool.request();
    const requestConsecutivo = new sql.Request(transaction);
    // requestConsecutivo.transaction = transaction;
    requestConsecutivo.input('Empresa', sql.Int, variablesSesion.EmpresaID);
    requestConsecutivo.input('OficinaAlmacenID', sql.Decimal(6, 3), variablesSesion.OficinaAlmacenID);
    // console.log("Este es el consecutivo actual", (parseInt(ConsecutivoActual) + 1));
    requestConsecutivo.input('Consecutivo', sql.Int, (parseInt(ConsecutivoActual) + 1));
    result = await requestConsecutivo.query(queryConsecutivoCorrelativo);

    const query = `
      INSERT INTO VentaPedidoCabecera
        (EmpresaID, OficinaAlmacenID, SeriePedido, NumeroPedido, PersoneriaID, DireccionID, VendedorID, CondicionVtaID, MonedaID, ListaPrecioID, Fecha, TipoEntrega, FechaEntrega, DireccionEntrega, OficinaAlmacenEntregaID, Referencia, Observaciones, Cliente, Contacto, Contactotelefono, MotivoID, DeliveryTipoID, DeliveryTurnoID, TipoDocID, ValorPedido, PrecioPedido, TipoCambio, Estado, UsuarioID, FechaCreacion, FechaModificacion, TipoVenta, Gratuita, PlanillaID, ConvenioID, WebID,TookanID
              ,email)
        VALUES
        (1, @OficinaAlmacenID, @SerieCorrelativo, @NumeroPedido, @PersoneriaID, @DireccionID, @Vendedor, @CondicionVtaID, @MonedaID, @ListaPrecioID, CONVERT(datetime,@Fecha, 120), @TipoEntrega, CONVERT(datetime,@FechaEntrega, 120) , @DireccionEntrega, @OficinaAlmacenEntregaID, @Referencia, @Observaciones, @Cliente, @Contacto, @Contactotelefono, @MotivoID, @DeliveryTipoID, @DeliveryTurnoID, @TipoDocID, @ValorPedido, @PrecioPedido, 0.00000, '1', @UsuarioID, CONVERT(datetime,@FechaCreacion, 120), CONVERT(datetime,@FechaEdicion, 120), @TipoVenta, @HabilitarFecha, @IDPlanilla, @ConvenioID, @WebID, null ,@Email);
      SELECT SCOPE_IDENTITY() AS LastInsertedID;
      `;

    // const request = pool.request();
    const request = new sql.Request(transaction);
    // request.transaction = transaction;
    request.input('OficinaAlmacenID', sql.Decimal(6, 3), variablesSesion.OficinaAlmacenID);
    request.input('NumeroPedido', sql.Int, (parseInt(ConsecutivoActual) + 1));
    request.input('SerieCorrelativo', sql.VarChar, SerieCorrelativo);
    request.input('PersoneriaID', sql.Int, ParamsPersona.PersoneriaID);
    request.input('DireccionID', sql.Int, 1);
    request.input('MonedaID', sql.Decimal(9, 5), 102.00001);
    request.input('ListaPrecioID', sql.Decimal(9, 5), 108.00001);
    request.input('TipoEntrega', sql.Int, 2);
    request.input('FechaEntrega', sql.NVarChar, paramsOrden.Pedido.ddw_order_date);
    request.input('FechaCreacion', sql.NVarChar, paramsOrden.Pedido.date_add);
    request.input('FechaEdicion', sql.NVarChar, paramsOrden.Pedido.date_upd);
    request.input('Fecha', sql.NVarChar, paramsOrden.Pedido.date_add);
    request.input('DireccionEntrega', sql.VarChar, paramsOrden.DireccionEntrega.direccion_1);
    request.input('OficinaAlmacenEntregaID', sql.Decimal(6, 3), 1);
    request.input('Referencia', sql.VarChar, paramsOrden.Pedido.gift_message);
    request.input('Observaciones', sql.VarChar, paramsOrden.DireccionEntrega.Referencia + ', ' + paramsOrden.DireccionEntrega.city + ' , Entro en el siguiente rando de hora ' + paramsOrden.Pedido.ddw_order_time);
    request.input('Contacto', sql.VarChar, paramsOrden.DireccionEntrega.PesonaEntrega);
    // lastname: customer.customer.lastname,
    // firstname: customer.customer.firstname,
    request.input('Cliente', sql.VarChar, ParamsPersona.Estado == '2' ? paramsOrden.Customer.firstname + ' ' + paramsOrden.Customer.lastname : ''); // si existe ya no se escribe nada 
    request.input('Contactotelefono', sql.VarChar, paramsOrden.DireccionEntrega.Telefono + ' - ' + paramsOrden.DireccionEntrega.phone_mobile);
    request.input('MotivoID', sql.Decimal(9, 5), 190.00062);
    request.input('CondicionVtaID', sql.Decimal(9, 5), 113.00001);
    request.input('DeliveryTipoID', sql.Decimal(9, 5), 193.00001);

    request.input('Email', sql.NVarChar, ParamsPersona.Estado == '2' ? paramsOrden.Customer.email : ''); // si la persona no tiene correo entoncs pasa el del cliente prestashop 

    function obtenerTurno(ddw_order_time) {

      let FechaOrdenada = ddw_order_time.replace(/\s/g, ''); // Eliminar todos los espacios
      let [inicio, fin] = FechaOrdenada.split('-');
      inicio = parseInt(inicio.split(':')[0]);
      fin = parseInt(fin.split(':')[0]);

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
    newPedidoID = result.recordset[0].LastInsertedID;
    // console.log("Este es mi pedido Id ::::::::::::::::::::::::", newPedidoID);
    // console.log(params);
    let ConsecutivoProducto = 0;

    const orderRows = paramsOrden.Pedido.productos.order_rows.order_row;
    // console.log("Estos son mis productos",orderRows);
    let cantidadProductos;
    if (Array.isArray(orderRows)) {
      cantidadProductos = orderRows.length;
    } else {
      cantidadProductos = 1;
    }

    for (let i = 0; i < cantidadProductos; i++) {
      // console.log("Entramos al procedimiento de agregar productos");
      let producto;
      if (Array.isArray(orderRows)) {
        producto = orderRows[i];
      } else {
        // Si orderRows no es un array, asumimos que es un objeto con un solo elemento
        producto = orderRows;
      }
      // console.log(producto); // Muestra el producto actual para verificar

      // const requestPrecio = pool.request();
      const requestPrecio = new sql.Request(transaction);
      const productoERP = `
        select * from producto WHERE CodigoAlterno = @CodigoAlterno;`;
      const referenciaPura = producto.product_reference.includes('-')
        ? producto.product_reference.split('-')[0]
        : producto.product_reference.trim();

      // requestPrecio.transaction = transaction;
      requestPrecio.input('CodigoAlterno', sql.VarChar, referenciaPura);
      // console.log("Este es el producto referencia");
      // console.log(producto.product_reference);
      const resultPrecio = await requestPrecio.query(productoERP);

      // const precioProducto = resultPrecio.recordset[0].Contado;
      const ProductoID = resultPrecio.recordset[0].ProductoID;
      const UMContenidoID = resultPrecio.recordset[0].UMUnitarioID;

      // if (resultPrecio.recordset.length === 0) {
      //   console.log("Se cancela el proceso no se encontro producto");
      //   await transaction.rollback();
      // } 

      // const request2 = pool.request();
      const request2 = new sql.Request(transaction);
      const query1 = `
          INSERT INTO VentaPedidoDetalle
            (EmpresaID, OficinaAlmacenID, PedidoID, Consecutivo, ProductoID, cantidad, valorunitario, preciounitario, PorcentajeDescuento, descuento, FechaEntrega, UMUnitarioID, observaciones, Estado, UsuarioID, FechaCreacion, FechaModificacion)
            VALUES
            (1, @OficinaAlmacenID,
          @PedidoID, @Consecutivo, @ProductoID, @cantidad, 0.0, @preciounitario, 0.0, @descuento, @FechaEntrega, @UMUnitarioID, '', 1, @UsuarioID, CONVERT(datetime,@FechaCreacion, 120), CONVERT(datetime,@FechaEdicion, 120));`;

      // request2.transaction = transaction;
      request2.input('OficinaAlmacenID', sql.Decimal(6, 3), variablesSesion.OficinaAlmacenID);
      request2.input('PedidoID', sql.Int, newPedidoID);
      request2.input('Consecutivo', sql.Int, i + 1);
      ConsecutivoProducto = i + 1;
      request2.input('ProductoID', sql.Int, ProductoID);
      request2.input('cantidad', sql.Decimal(12, 4), producto.product_quantity);
      request2.input('preciounitario', sql.Decimal(18, 9), producto.unit_price_tax_incl);
      request2.input('descuento', sql.Decimal(18, 9), 0.00);
      request2.input('FechaEntrega', sql.NVarChar, paramsOrden.Pedido.ddw_order_date);
      request2.input('FechaCreacion', sql.NVarChar, paramsOrden.Pedido.date_add);
      request2.input('FechaEdicion', sql.NVarChar, paramsOrden.Pedido.date_upd);
      request2.input('UMUnitarioID', sql.Decimal(9, 5), UMContenidoID);
      request2.input('UsuarioID', sql.Int, variablesSesion.UsuarioID);
      await request2.query(query1);
    }
    // Insertar el delivery como producto
    // const requestPrecioDelivery = pool.request();
    const requestPrecioDelivery = new sql.Request(transaction);
    const productoERPDelivery = `
        select * from producto WHERE CodigoAlterno = @CodigoAlterno;`;
    // requestPrecioDelivery.transaction = transaction;
    requestPrecioDelivery.input('CodigoAlterno', sql.VarChar, paramsOrden.IDEntrega_Direccion.id);
    const resultPrecioDelivery = await requestPrecioDelivery.query(productoERPDelivery);
    // console.log("Este es el resultado de mi Delivery");
    // console.log(resultPrecioDelivery);
    // const precioProductoDelivery = resultPrecioDelivery.recordset[0].Contado;
    const ProductoIDDelivery = resultPrecioDelivery.recordset[0].ProductoID;
    const UMContenidoIDDelivery = resultPrecioDelivery.recordset[0].UMUnitarioID;

    // if (resultPrecioDelivery.recordset.length === 0) {
    //   console.log("Se cancela el proceso no se encontro delivery");
    //   await transaction.rollback();
    // } 

    // const request5 = pool.request();
    const request5 = new sql.Request(transaction);;
    const query5 = `
                INSERT INTO VentaPedidoDetalle
                  (EmpresaID, OficinaAlmacenID, PedidoID, Consecutivo, ProductoID, cantidad, valorunitario, preciounitario, PorcentajeDescuento, descuento, FechaEntrega, UMUnitarioID, observaciones, Estado, UsuarioID, FechaCreacion, FechaModificacion)
                  VALUES
                  (1, @OficinaAlmacenID, @PedidoID, @Consecutivo, @ProductoID, @cantidad, 0.0, @preciounitario, 0.0, @descuento, CONVERT(datetime,@FechaEntrega, 120), @UMUnitarioID, '', 1, @UsuarioID, CONVERT(datetime,@FechaCreacion, 120), CONVERT(datetime,@FechaEdicion, 120));`;

    // request5.transaction = transaction;
    request5.input('OficinaAlmacenID', sql.Decimal(6, 3), variablesSesion.OficinaAlmacenID);
    request5.input('PedidoID', sql.Int, newPedidoID);
    request5.input('Consecutivo', sql.Int, ConsecutivoProducto + 1);
    request5.input('ProductoID', sql.Int, ProductoIDDelivery);
    request5.input('cantidad', sql.Decimal(12, 4), 1);
    request5.input('preciounitario', sql.Decimal(18, 9), paramsOrden.Pedido.total_shipping);
    request5.input('descuento', sql.Decimal(18, 9), 0.00);
    request5.input('FechaEntrega', sql.NVarChar, paramsOrden.Pedido.ddw_order_date);
    request5.input('FechaCreacion', sql.NVarChar, paramsOrden.Pedido.date_add);
    request5.input('FechaEdicion', sql.NVarChar, paramsOrden.Pedido.date_upd);
    request5.input('UMUnitarioID', sql.Decimal(9, 5), UMContenidoIDDelivery);
    request5.input('UsuarioID', sql.Int, variablesSesion.UsuarioID);
    await request5.query(query5);

    // Fin de insersion de el Delivery como producto

    // Insertar información de TablaEmpresa
    const requestMPago = new sql.Request(transaction);
    // console.log(paramsOrden.Pedido);
    // console.log("Este es mi modulo", paramsOrden.Pedido['módulo']);
    const queryMPago = `
                SELECT * FROM TablaEmpresa WHERE Abreviatura = @referencia;`;
    // requestMPago.transaction = transaction;
    requestMPago.input('referencia', sql.VarChar, paramsOrden.Pedido['módulo']);
    const resultMPago = await requestMPago.query(queryMPago);
    // console.log("Este es mi resul medio pago");
    // console.log(resultMPago);
    if (resultMPago.recordset.length > 0) {
      // console.log("Entramos al registro del medio de pago");
      const tablaEmpresaInfo = resultMPago.recordset[0];
      // const request4 = pool.request();
      const request4 = new sql.Request(transaction);
      const query4 = `
                  INSERT INTO VentaPedidoPago
                    (EmpresaID, OficinaAlmacenID, PedidoID, FormaPagoID, MontoPago, UsuarioID, FechaCreacion, FechaModificacion, NroOperacion, PlanillaID)
                    VALUES
                    (1, @OficinaAlmacenID, @PedidoID, @FormaPagoID, @MontoPago, @UsuarioID, GETDATE(), GETDATE(), @NroOperacion, @PlanillaID);`;

      // request4.transaction = transaction;
      request4.input('OficinaAlmacenID', sql.Decimal(6, 3), variablesSesion.OficinaAlmacenID);
      request4.input('PedidoID', sql.Int, newPedidoID);
      request4.input('FormaPagoID', sql.Decimal(9, 5), tablaEmpresaInfo.CodigoID);
      request4.input('MontoPago', sql.Decimal(12, 2), paramsOrden.Pedido.total_paid);
      request4.input('UsuarioID', sql.Int, variablesSesion.UsuarioID);
      request4.input('NroOperacion', sql.NVarChar, ''); //paramsOrden.Pedido.reference
      request4.input('PlanillaID', sql.NVarChar, PlanillaID);
      await request4.query(query4);
    } else {
      console.log("No entra al if y no se agregaron los medios de pago");
    }

    // Fin de Insertar los medios de pago


    // Procediiento de facturacion de pedido
    // console.log("Ejecutamos el procedimiento de facturacion");

    const query2 = `
          EXEC spPyOPedidoGeneraComprobante @Empresa, @OficinaAlmacenID, @PedidoID, @tipoDocID,'E';`;
    // const request3 = pool.request();
    const request3 = new sql.Request(transaction);
    request3.input('Empresa', sql.Int, variablesSesion.EmpresaID);
    request3.input('OficinaAlmacenID', sql.Decimal(6, 3), variablesSesion.OficinaAlmacenID);
    // console.log("Esta es la OficinaAlmacen :", variablesSesion.OficinaAlmacenID)
    // console.log("Este es mi newPedidoID para el procedimiento:: ", newPedidoID);
    request3.input('PedidoID', sql.Int, newPedidoID);
    request3.input('tipoDocID', sql.Decimal(9, 5), seriePedido);
    result = await request3.query(query2);
    //Fin de ejecucion de procedimiento de facturacion 
    await transaction.commit();

  } catch (err) {
    // await transaction.rollback();
    // error = err.toString();
    console.error(`Error en la transacción de crear pedido con orden :${paramsOrden.Pedido.id}`, err);
    await transaction.rollback();
    error = err.toString() + ' - Rollback realizado';
    // logStream.write(`Error en la transacción de crear pedido con orden :${paramsOrden.Pedido.id}`, err)
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

async function AperturaCaja(OficinaID, userId, Serie, Fecha) {
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

// No se encuentra en uso el CierreCaja 
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
    const result = await request.query(`SELECT TOP 1 * FROM PlanillaCaja
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

async function UpdatePlanilla(EmpresaID, oficinaAlmacenID, PlanillaID, nuevoEstado) {
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
    request.input('oficinaAlmacenID', sql.Decimal(6, 3), oficinaAlmacenID);
    request.input('PlanillaID', sql.Int, PlanillaID);
    request.input('nuevoEstado', sql.Int, nuevoEstado);
    result = await request.query(query);
    // console.log(result);
  } catch (err) {
    error = err;
    console.log("UpdatePlanilla", error);
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

async function obtenerSeriePlanilla(orden) {
  return orden.nombre.split('/')[0].trim().split('-')[0];
}

async function procesarOrdenPrestashop() {
  try {
    const ordenes = await ApiOrders();
    const ordersInfo = ordenes;
    // console.log("Datos de las órdenes:", ordersInfo);

    for (let i = 0; i < ordersInfo.length; i++) {
      const orden = ordersInfo[i].Orden;
      let resultadoOrdenes;

      try {
        resultadoOrdenes = await BuscarOrden(orden);
      } catch (error) {
        console.error(`Error al buscar la orden ${orden}:`, error);
        continue; // Continua con la siguiente orden en caso de error
      }

      if (resultadoOrdenes) {
        // console.log(`Orden ${orden} encontrada:`, resultadoOrdenes);
      } else {
        // console.log(`Orden ${orden} no encontrada`);
        let DatosDeOrden;

        try {
          DatosDeOrden = await BuscarORdenPorID(orden);
        } catch (error) {
          console.error(`Error al buscar la orden por ID ${orden}:`, error);
          continue; // Continua con la siguiente orden en caso de error
        }

        if (DatosDeOrden) {
          const EstadoOrden = await HistorialOrden(orden);
          const VerificacionEstado = EstadoOrden;

          if (VerificacionEstado == '2') {
            let cliente = null;
            if (DatosDeOrden.SerieDePedido.company === '' || DatosDeOrden.SerieDePedido.company == '00000000' || DatosDeOrden.SerieDePedido.company == '00000000000') {
              cliente = await buscarClientePorDNI('00000001');
              if (cliente) {
                await createPedido(DatosDeOrden, cliente, variablesSesion, PlanillaID);
              }
            } else {
              if (DatosDeOrden.SerieDePedido.company.length === 8 || DatosDeOrden.SerieDePedido.company.length === 11) {
                cliente = await buscarClientePorDNI(DatosDeOrden.SerieDePedido.company);
                if (cliente === null) {
                  const razonSocial = await buscarRazonSocialPorDNIRUC(DatosDeOrden.SerieDePedido.company);
                  if (razonSocial !== 'Número no encontrado') {
                    await crearCliente(razonSocial, DatosDeOrden.Customer , DatosDeOrden.OrderDetails_cart_rules);
                    cliente = await buscarClientePorDNI(DatosDeOrden.SerieDePedido.company);
                  } else {
                    cliente = await buscarClientePorDNI('00000001');
                  }
                }
                if (cliente) {
                  await createPedido(DatosDeOrden, cliente, variablesSesion, PlanillaID);
                }
              } else {
                cliente = await buscarClientePorDNI('00000001');
                if (cliente) {
                  await createPedido(DatosDeOrden, cliente, variablesSesion, PlanillaID);
                }
              }
            }
          }
        } else {
          console.log(`No se pudo obtener la información de la orden ${orden}`);
        }
      }
    }
  } catch (error) {
    console.error("Error en el procesamiento de órdenes:", error);
  }
}


async function Inicializador() {
  const logFilePath = path.join(__dirname, 'logs.txt');
  const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  console.log = function (...args) {
    const now = new Date();
    const dateString = now.toISOString().replace('T', ' ').replace('Z', '');
    args.forEach(arg => {
      if (typeof arg === 'object') {
        logStream.write(`${dateString} - ${JSON.stringify(arg, null, 2)}\n`);
      } else {
        logStream.write(`${dateString} - ${arg}\n`);
      }
    });
    originalConsoleLog(...args);
  };

  console.error = function (...args) {
    const now = new Date();
    const dateString = now.toISOString().replace('T', ' ').replace('Z', '');
    args.forEach(arg => {
      if (typeof arg === 'object' && arg instanceof Error) {
        // Si el argumento es un objeto de tipo Error, captura su mensaje y pila de llamadas
        logStream.write(`${dateString} - ERROR: ${arg.message}\n`);
        logStream.write(`${dateString} - STACK TRACE:\n${arg.stack}\n`);
      } else if (typeof arg === 'object') {
        logStream.write(`${dateString} - ERROR: ${JSON.stringify(arg, null, 2)}\n`);
      } else {
        logStream.write(`${dateString} - ERROR: ${arg}\n`);
      }
    });
    // Llama a la función original de console.error para que el mensaje también se imprima en la consola
    originalConsoleError(...args);
  };

  console.log('Inicializando...');
  console.log('Ejecutando procedimiento');

  // try {
  const controlCaja = await verificacionControlCaja(variablesSesion.OficinaAlmacenID, variablesSesion.UsuarioID);
  const controlCajaData = controlCaja.result.recordset
  const orden0 = controlCajaData.filter(elemento => elemento.orden === 0);
  const dia = ((new Date()).getDate()) < 10 ? '0' + ((new Date()).getDate()) : ((new Date()).getDate());
  const mes = ((new Date()).getMonth() + 1) < 10 ? '0' + ((new Date()).getMonth() + 1) : ((new Date()).getMonth() + 1);
  const fechaFormateada = (new Date()).getFullYear() + '-' + mes + '-' + dia;

  // console.log(orden0);

  if (orden0.some(elemento => elemento.estado === '3')) {
    console.log("Si se tiene una Planilla Habilitada");
    const ordenPlanilla = orden0.find(elemento => elemento.estado === '3');
    const planillaID = ordenPlanilla.planillaID;
    const SeriePlanilla = await obtenerSeriePlanilla(ordenPlanilla);
    // console.log("Esta es la planilla", planillaID);
    PlanillaID = planillaID;
    console.log(await procesarOrdenPrestashop());
  } else {
    console.log("no se tiene una planilla habilitada");

    if (orden0.some(elemento => elemento.estado === '9')) {
      // console.log("La planilla esta para apertura");
      const ordenApertura = orden0.find(elemento => elemento.estado === '9');
      const SeriePlanilla = await obtenerSeriePlanilla(ordenApertura);
      await AperturaCaja(variablesSesion.OficinaAlmacenID, variablesSesion.UsuarioID, SeriePlanilla, fechaFormateada);
      await Inicializador();
    } else if (orden0.some(elemento => elemento.estado === 'S') || orden0.some(elemento => elemento.estado === 'N')) {
      // console.log("Se cierra planilla de Ayer");
      const ordenCierre = orden0.find(elemento => elemento.estado === 'S' || elemento.estado === 'N');
      const SeriePlanilla = await obtenerSeriePlanilla(ordenCierre);
      // console.log('Esta es la serie',SeriePlanilla);
      const ulimaPlanilla = await UltimaPlanillaCaja();
      if (ulimaPlanilla) {
        // console.log("Procedemos a cerrar la planilla de caja con estado N o S");
        // await CierreCaja(variablesSesion.OficinaAlmacenID, variablesSesion.UsuarioID, SeriePlanilla, ulimaPlanilla.PlanillaID, ulimaPlanilla.FechaCreacion);
        await UpdatePlanilla(variablesSesion.EmpresaID, variablesSesion.OficinaAlmacenID, ulimaPlanilla.PlanillaID, 2)
      } else {
        // console.log("No se encontró ninguna planilla de caja.");
      }
      await Inicializador();
    }
  }
  console.log('Procedimiento de ordenes completado.');
}


Inicializador();


