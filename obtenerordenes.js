
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
  database: "prueba_kflor", //prueba_
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
          limit: 2000, // Obtener siempre los últimos 200 pedidos
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

    // Filtrar órdenes por la fecha de hoy y, si es la primera hora del día, también por la fecha de ayer
    const orders = result.prestashop.orders.order.filter(order => {
      const orderDate = new Date(order.date_upd);
      const orderDia = orderDate.getDate() < 10 ? '0' + orderDate.getDate() : orderDate.getDate();
      const orderMes = (orderDate.getMonth() + 1) < 10 ? '0' + (orderDate.getMonth() + 1) : (orderDate.getMonth() + 1);
      const orderFechaFormateada = orderDate.getFullYear() + '-' + orderMes + '-' + orderDia;
      // return orderFechaFormateada === fechaFormateada || (horaActual === 20 && orderFechaFormateada === fechaFormateadaAnterior); //por horas
      // return orderFechaFormateada === fechaFormateadaAnterior || (horaActual === 20 && orderFechaFormateada === fechaFormateadaAnterior);
      return orderFechaFormateada > '2024-09-18'; // trae por 2 dias 
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

async function BuscarOrdenPorID(orderId) {
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
        id_address_invoice: SeriedeFacturaEnvoice2.address.id,
        id_adress_Entrega: SeriedeFacturaEnvoice2.address.alias,
        company: SeriedeFacturaEnvoice2.address.company,
        phone: SeriedeFacturaEnvoice2.address.phone,
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
    var ProductosCategoriaOrden;

    function obtenerDetallesOrden(IDproducto) {
      // Realizar la petición a la API para obtener los datos de la orden
      return axios.get(
        `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/order_details/${IDproducto}`
      )
        .then(responseOrder => {
          return parser.parseStringPromise(responseOrder.data);
        })
        .then(result => {
          const Producto = result.prestashop.order_detail;
          return Producto;
        })
        .catch(err => {
          console.error(`Error al obtener detalles de producto o parsear la orden ${orderId}:`, err);
        });
    }

    function obtenerCategoriaOrden(IDproducto) {
      // Realizar la petición a la API para obtener los datos de la orden
      return axios.get(
        `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/products/${IDproducto}`
      )
        .then(responseOrder => {
          return parser.parseStringPromise(responseOrder.data);
        })
        .then(result => {
          const Producto = result.prestashop.product.id_category_default._;
          return Producto;
        })
        .catch(err => {
          console.error(`Error al obtener las categorias o parsear la orden ${orderId}:`, err);
        });
    }

    // Extraer el array de order_rows
    const orderRows = Pedido.productos.order_rows.order_row;
    // Manejo de orderRows dependiendo si es un array o un objeto
    let orderIds;
    let orderCategorias;
    if (Array.isArray(orderRows)) {
      orderIds = orderRows.map(row => row.id);  // Extraer IDs de un array
      orderCategorias = orderRows.map(row => row.product_id._);  // Extraer IDs de un array
    } else if (orderRows && typeof orderRows === 'object') {
      orderIds = [orderRows.id];  // Extraer ID si es un objeto
      orderCategorias = [orderRows.product_id._];  // Extraer ID si es un objeto
    } else {
      orderIds = [];  // Manejar caso donde orderRows es undefined o null
      orderCategorias = [];  // Manejar caso donde orderRows es undefined o null
    }

    // Crear una promesa que contiene todas las promesas de obtener los detalles de las órdenes
    const [productos, productosCateg] = await Promise.all([
      Promise.all(orderIds.map(orderId => obtenerDetallesOrden(orderId))),
      Promise.all(orderCategorias.map(ProductosID => obtenerCategoriaOrden(ProductosID)))
    ]);

    // Asigna los resultados a las variables
    ProductosOrden = productos;
    ProductosCategoriaOrden = productosCateg;

    // Solicitudes para traer convenio y detalles de orden
    const order_cart_rules_ID = await axios.get(
      `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/order_cart_rules/?filter[id_order]=${Pedido.id}`
    );

    let Id_Order_cart_rules = []; // Inicializamos como un array

    // Manejo de la respuesta
    parser.parseString(order_cart_rules_ID.data, (err, result) => {
      if (err) {
        console.error(err);
        return; // Salir si hay un error
      }
      const Details = result.prestashop;

      if (Details?.order_cart_rules?.order_cart_rule) {
        // Aseguramos que sea un array
        const rules = Array.isArray(Details.order_cart_rules.order_cart_rule)
          ? Details.order_cart_rules.order_cart_rule
          : [Details.order_cart_rules.order_cart_rule];

        // Extraemos los IDs
        Id_Order_cart_rules = rules.map(rule => rule.$.id);
      }
    });

    // Solicitudes para traer detalles
    let OrderDetails_cart_rules = []; // Inicializa como un array
    let cart_rules = []; // Inicializa como un array

    if (Id_Order_cart_rules.length === 0) {
      // console.log("No se encontraron reglas de carrito para esta orden.");
    } else {
      // Itera sobre cada ID de regla de carrito
      for (const id of Id_Order_cart_rules) {
        try {
          const order_Details_cart_rules = await axios.get(
            `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/order_cart_rules/${id}`
          );

          const orderRuleDetails = parser.parseStringPromise(order_Details_cart_rules.data); // Usa la versión basada en promesas

          const Details = await orderRuleDetails;

          OrderDetails_cart_rules.push({
            id: Details.prestashop.order_cart_rule.id,
            id_cart_rule: Details.prestashop.order_cart_rule.id_cart_rule,
            id_order_invoice: Details.prestashop.order_cart_rule.id_order_invoice,
            name: Details.prestashop.order_cart_rule.name,
            value: Details.prestashop.order_cart_rule.value,
            value_tax_excl: Details.prestashop.order_cart_rule.value_tax_excl,
            free_shipping: Details.prestashop.order_cart_rule.free_shipping,
            deleted: Details.prestashop.order_cart_rule.deleted,
          });

          // Obtener tipo de descuento en cart_rules
          const Details_cart_rules = await axios.get(
            `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/cart_rules/${OrderDetails_cart_rules[OrderDetails_cart_rules.length - 1].id_cart_rule}`
          );

          const cartRuleDetails = parser.parseStringPromise(Details_cart_rules.data); // Usa la versión basada en promesas

          const cartRuleData = await cartRuleDetails;

          cart_rules.push({
            id: cartRuleData.prestashop.cart_rule.id,
            id_customer: cartRuleData.prestashop.cart_rule.id_customer,
            date_from: cartRuleData.prestashop.cart_rule.date_from,
            date_to: cartRuleData.prestashop.cart_rule.date_to,
            description: cartRuleData.prestashop.cart_rule.description,
            quantity: cartRuleData.prestashop.cart_rule.quantity,
            quantity_per_user: cartRuleData.prestashop.cart_rule.quantity_per_user,
            priority: cartRuleData.prestashop.cart_rule.priority,
            partial_use: cartRuleData.prestashop.cart_rule.partial_use,
            code: cartRuleData.prestashop.cart_rule.code,
            minimum_amount: cartRuleData.prestashop.cart_rule.minimum_amount,
            minimum_amount_tax: cartRuleData.prestashop.cart_rule.minimum_amount_tax,
            minimum_amount_currency: cartRuleData.prestashop.cart_rule.minimum_amount_currency,
            minimum_amount_shipping: cartRuleData.prestashop.cart_rule.minimum_amount_shipping,
            country_restriction: cartRuleData.prestashop.cart_rule.country_restriction,
            carrier_restriction: cartRuleData.prestashop.cart_rule.carrier_restriction,
            group_restriction: cartRuleData.prestashop.cart_rule.group_restriction,
            cart_rule_restriction: cartRuleData.prestashop.cart_rule.cart_rule_restriction,
            product_restriction: cartRuleData.prestashop.cart_rule.product_restriction,
            shop_restriction: cartRuleData.prestashop.cart_rule.shop_restriction,
            free_shipping: cartRuleData.prestashop.cart_rule.free_shipping,
            reduction_percent: cartRuleData.prestashop.cart_rule.reduction_percent,
            reduction_amount: cartRuleData.prestashop.cart_rule.reduction_amount,
            reduction_tax: cartRuleData.prestashop.cart_rule.reduction_tax,
            reduction_currency: cartRuleData.prestashop.cart_rule.reduction_currency,
            reduction_product: cartRuleData.prestashop.cart_rule.reduction_product,
            reduction_exclude_special: cartRuleData.prestashop.cart_rule.reduction_exclude_special,
            gift_product: cartRuleData.prestashop.cart_rule.gift_product,
            gift_product_attribute: cartRuleData.prestashop.cart_rule.gift_product_attribute,
            highlight: cartRuleData.prestashop.cart_rule.highlight,
            active: cartRuleData.prestashop.cart_rule.active,
            date_add: cartRuleData.prestashop.cart_rule.date_add,
            date_upd: cartRuleData.prestashop.cart_rule.date_upd,
          });
        } catch (error) {
          console.error("Error al procesar la regla de carrito:", error);
        }
      }
    }

    // Unave veridicacion para un mejor manejo

    if (OrderDetails_cart_rules.length === 0) {
      OrderDetails_cart_rules = null;
    }

    if (cart_rules.length === 0) {
      cart_rules = null;
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
      ProductosOrden,
      ProductosCategoriaOrden
    };

    return ArrayCompleto;

  } catch (error) {
    console.error(error);
    return null;
  }
}

// async function obtenerCuponesYCategoriaFiltro(idCupon, idCategoria) {
//   try {
//     const response = await axios.get(
//       `https://www.kukyflor.com/devs/json_cupones.php?token=ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T`
//     );

//     const cupones = response.data;

//     // Filtrar cupones por ID
//     const cuponFiltrado = cupones.filter(cupon => cupon.id_cart_rule == idCupon);

//     // Filtrar categorías en cada cupón
//     const cuponConCategoriaFiltrada = cuponFiltrado.map(cupon => {
//       return {
//         ...cupon,
//         categories: cupon.categories.filter(cat => cat.id_category == idCategoria)
//       };
//     });

//     return JSON.stringify(cuponConCategoriaFiltrada, null, 2);
//   } catch (err) {
//     console.error(`Error al obtener o filtrar cupones:`, err);
//   }
// }
async function obtenerCuponesYCategoriaFiltro(idCupon, idCategoria) {
  try {
    const response = await axios.get(
      `https://www.kukyflor.com/devs/json_cupones.php?token=ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T`
    );

    const cupones = response.data;

    // Filtrar cupones por ID
    const cuponFiltrado = cupones.filter(cupon => cupon.id_cart_rule == idCupon);

    // Filtrar categorías en cada cupón
    const cuponConCategoriaFiltrada = cuponFiltrado.map(cupon => {
      const categorias = cupon.categories == 'No hay categorías asociadas'
        ? 'No hay categorías asociadas'
        : cupon.categories.filter(cat => cat.id_category == idCategoria);

      return {
        ...cupon,
        categories: categorias
      };
    });

    return JSON.stringify(cuponConCategoriaFiltrada, null, 2);
  } catch (err) {
    console.error(`Error al obtener o filtrar cupones:`, err);
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

async function crearCliente(params, paramsAPI) {
  // console.log("Estos son mis parametros de lciente",params);
  let pool;
  let transaction;
  let principalID = null;
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
    // request.input('ConvenioID', sql.Decimal(9, 5), 902.00001);
    // request.input('ConvenioID', sql.Decimal(9, 5), principalID == null ? 902.00001 : principalID);
    request.input('ConvenioID', sql.Decimal(9, 5), 902.00001 );
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

async function updateCliente(DatosOrden, Cliente) {
  let pool;
  let transaction;
  try {
    pool = await sql.connect(config);
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Consulta para obtener el ID del cliente que se va a actualizar
    const queryFindClienteID = `
      SELECT PersoneriaID, Email, Telefonos
      FROM dbo.Personeria
      WHERE PersoneriaID = @PersoneriaID;
    `;

    const requestFind = new sql.Request(transaction);
    requestFind.input('PersoneriaID', sql.Int, Cliente.PersoneriaID);
    const resultFind = await requestFind.query(queryFindClienteID);

    if (resultFind.recordset.length === 0) {
      throw new Error('Cliente no encontrado.');
    }

    const personeriaID = resultFind.recordset[0].PersoneriaID;
    const currentEmail = resultFind.recordset[0].email;
    const currentTelefonos = resultFind.recordset[0].Telefonos;

    // Nuevos datos desde DatosOrden
    const newEmail = DatosOrden.Customer.email;
    var  newPhone; // Asumiendo que `phone` está en `SerieDePedido` 
    if(DatosOrden.SerieDePedido.id_address_invoice == DatosOrden.DireccionEntrega.id_adress_Entrega){
        newPhone = DatosOrden.DireccionEntrega.Telefono || ''
    }else{
      newPhone = DatosOrden.SerieDePedido.phone || ''
    }
    // Verificar si es necesario actualizar
    const shouldUpdateEmail = newEmail && newEmail !== currentEmail;
    const shouldUpdatePhone = newPhone && newPhone !== currentTelefonos;

    if (!shouldUpdateEmail && !shouldUpdatePhone) {
      return { success: true, message: 'No se requieren actualizaciones.' };
    }

    // Consulta para actualizar los datos del cliente
    const queryUpdate = `
      UPDATE dbo.Personeria
      SET Email = @Email,
          Telefonos = @Telefonos 
      WHERE PersoneriaID = @PersoneriaID;
    `;

    const requestUpdate = new sql.Request(transaction);
    requestUpdate.input('Email', sql.NVarChar, shouldUpdateEmail ? newEmail : currentEmail);
    requestUpdate.input('Telefonos', sql.NVarChar, shouldUpdatePhone ? newPhone : currentTelefonos);
    requestUpdate.input('PersoneriaID', sql.Int, personeriaID);

    await requestUpdate.query(queryUpdate);
    await transaction.commit();

    return { success: true, message: 'Cliente actualizado exitosamente.' };
  } catch (error) {
    console.error(`Error al actualizar el cliente con DNI: ${Cliente.numeroDocumento} y Orden ${DatosOrden.Pedido.id}`, error);
    if (transaction) {
      await transaction.rollback();
    }
    return { success: false, message: `Error al actualizar el cliente con DNI: ${Cliente.numeroDocumento} y Orden ${DatosOrden.Pedido.id}`, error: error.message };
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


async function createPedido(paramsOrden, Convenio) {
  let pool, result, error = '';
  let newPedidoID = 0;
  let transaction;
  let resultConvenio;
  let principalID = null;
  try {
    pool = await sql.connect(config);
    transaction = new sql.Transaction(pool);

    await transaction.begin();
    // console.log("Datos de ordenes ",paramsOrden);
    // console.log("Datos de Convenio", Convenio);
    if (Convenio !== null) {
      const queryFindPrincipalID = `
        SELECT PrincipalID
        FROM tablageneral
        WHERE PrincipalID LIKE '902.%' AND Abreviatura = @Convenio AND Estado = 1;
        `;
      const requestConvenio = new sql.Request(transaction);
      requestConvenio.input('Convenio', sql.NVarChar, Convenio[0].name);
      resultConvenio = await requestConvenio.query(queryFindPrincipalID);
      if (resultConvenio.recordset.length > 0) {
        principalID = resultConvenio.recordset[0].PrincipalID;
      } else {
        principalID = null;
      }
    }

    if(principalID !== null){
        console.log("WebID : "+ paramsOrden.Pedido.id + " " + "Convenio correspondiente : " + principalID);
    }else{
        console.log("==");
    }
    await transaction.commit();
  } catch (err) {
    console.error(`Error en la transacción de crear pedido con orden :${paramsOrden.Pedido.id}`, err);
    await transaction.rollback();
    error = err.toString() + ' - Rollback realizado';
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
    let ordersInfo = [  
      "101167", "101172", "101175", "101184", 
      "101192", "101194", "101200", "101216", 
      "101217", "101218", "101220", "101221", 
      "101234", "101283", "101350", "101406", 
      "101418", "101424", "101450", "101457"
  ];
  
    console.log("Datos de las órdenes:", ordersInfo);

    for (let i = 0; i < ordersInfo.length; i++) {
      const orden = ordersInfo[i];
      let resultadoOrdenes;

      // try {
      //   resultadoOrdenes = await BuscarOrden(orden);
      // } catch (error) {
      //   console.error(`Error al buscar la orden ${orden}:`, error);
      //   continue; // Continúa con la siguiente orden en caso de error
      // }

      if (resultadoOrdenes) {
        console.log(`Orden ${orden} encontrada:`, resultadoOrdenes);
      } else {
        let DatosDeOrden;

        try {
          DatosDeOrden = await BuscarOrdenPorID(orden);
        } catch (error) {
          console.error(`Error al buscar la orden por ID ${orden}:`, error);
          continue; // Continúa con la siguiente orden en caso de error
        }

        if (DatosDeOrden) {
          // console.log("Estos son los datos de orden", DatosDeOrden);
          const EstadoOrden = await HistorialOrden(orden);
          
          if (EstadoOrden == '2') {
            await createPedido(DatosDeOrden, 
              DatosDeOrden.OrderDetails_cart_rules !== null && 
              DatosDeOrden.cart_rules[0].active == 1 ? 
              DatosDeOrden.OrderDetails_cart_rules : null
            );
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

  // console.log('Inicializando...');
  // console.log('Ejecutando procedimiento');

  // try {
  const controlCaja = await verificacionControlCaja(variablesSesion.OficinaAlmacenID, variablesSesion.UsuarioID);
  const controlCajaData = controlCaja.result.recordset
  const orden0 = controlCajaData.filter(elemento => elemento.orden === 0);
  const dia = ((new Date()).getDate()) < 10 ? '0' + ((new Date()).getDate()) : ((new Date()).getDate());
  const mes = ((new Date()).getMonth() + 1) < 10 ? '0' + ((new Date()).getMonth() + 1) : ((new Date()).getMonth() + 1);
  const fechaFormateada = (new Date()).getFullYear() + '-' + mes + '-' + dia;

  // console.log(orden0);

  if (orden0.some(elemento => elemento.estado === '3')) {
    // console.log("Si se tiene una Planilla Habilitada");
    const ordenPlanilla = orden0.find(elemento => elemento.estado === '3');
    const planillaID = ordenPlanilla.planillaID;
    const SeriePlanilla = await obtenerSeriePlanilla(ordenPlanilla);
    // console.log("Esta es la planilla", planillaID);
    PlanillaID = planillaID;
    console.log(await procesarOrdenPrestashop());
  } else {
    // console.log("no se tiene una planilla habilitada");
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
        await UpdatePlanilla(variablesSesion.EmpresaID, variablesSesion.OficinaAlmacenID, ulimaPlanilla.PlanillaID, 2);
      } else {
        // console.log("No se encontró ninguna planilla de caja.");
      }
      await Inicializador();
    }
  }
  // console.log('Procedimiento de ordenes completado.');
}


Inicializador();


