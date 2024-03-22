const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const parser = new xml2js.Parser({ explicitArray: false });

const app = express();
const port = 3099;

////////////////////////////////
const http = require("http");
const sql = require("mssql");

// Configuración de la conexión a la base de datos
const config = {
  user: "kuky",
  password: "Kf123456",
  server: "3.144.237.208",
  database: "prueba_kflor",
  options: {
    encrypt: false, // Si estás utilizando Azure, establece esto en true
  },
};


var productosNoEncontrados = {};


async function insertarProductoSiNoExiste(producto) {
  try {
    // Conectar a la base de datos
    await sql.connect(config);

    // Verificar si el producto ya existe en la base de datos por su código alterno
    const existeProducto = await sql.query(
      `SELECT COUNT(*) AS count FROM producto WHERE CodigoAlterno = '${producto.CodigoAlterno}'`
    );

    // Si existe el producto, mostrar un mensaje y continuar
    if (existeProducto.recordset[0].count > 0) {
      console.log(
        `El producto con código alterno ${producto.CodigoAlterno} ya existe en la base de datos. Continuando con el siguiente.`
      );
      return;
    }

    // Si no existe el producto, insertarlo en la base de datos
    const result = await sql.query(
      `INSERT INTO producto (EmpresaID, Descripcion, Abreviatura, Codigo, GrupoID, UMUnitarioID, StockMaximo, StockMinimo, MarcaID, Modelo, Peso, Ubicacion, Area, CodigoBarra, CodigoAlterno, Estado, UsuarioID, FechaCreacion, FechaModificacion, Idodoo, Precio, Habilitado) 
       VALUES (${producto.EmpresaId}, '${producto.Descripcion}', '${producto.Abreviatura}', '${producto.Codigo}', '${producto.GrupoId}', ${producto.UMUnitarioId}, ${producto.StockMaximo}, ${producto.StocMinimo}, ${producto.MarcaId}, '${producto.Modelo}', ${producto.Peso}, '${producto.Ubicacion}', ${producto.Area}, '${producto.CodigoBarra}', '${producto.CodigoAlterno}', '${producto.Estado}', ${producto.UsuarioID}, '${producto.FechaCreacion}', '${producto.FechaModificacion}', ${producto.Idodoo}, ${producto.Precio}, ${producto.Habilitado})`
    );

    console.log(
      `Producto con código alterno ${producto.CodigoAlterno} insertado correctamente.`
    );

  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    // Cerrar la conexión
    await sql.close();
  }
}

//----------------------------------------------------------------
// Endpoint para obtener productos desde PrestaShop
// Endpoint para obtener los primeros 10 productos desde PrestaShop
app.get("/api/products", async (req, res) => {
  try {
    const response = await axios.get(
      "https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/products",
      {
        params: {
          display: "full",
          output_format: "JSON",
          // limit: 10,
        },
        headers: {
          Authorization: "ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T",
        },
      }
    );

    // Extraer la información específica de cada producto
    const productsInfo = response.data.products.map((product) => {
      return {
        EmpresaId: 1,
        //ProductoId: product.reference,
        Descripcion: product.meta_title[0].value,
        Abreviatura: product.reference,
        Codigo: "",
        GrupoId: "050101",
        // id: 050101 es PRESTASHOP
        // guardar por nombre no por id
        UMUnitarioId: 138.00015,
        StockMaximo: 0,
        StocMinimo: 0,
        MarcaId: 124,
        Modelo: "",
        Peso: 0,
        Ubicacion: "",
        Area: 0,
        CodigoBarra: "",
        CodigoAlterno: product.reference,
        Estado: "1",
        UsuarioID: 1,
        FechaCreacion: product.date_add,
        FechaModificacion: product.date_upd,
        Idodoo: null,
        Precio: 0,
        Habilitado: 1,
      };
    });

    // Insertar cada producto si no existe en la base de datos
    // for (const producto of productsInfo) {
    //   await insertarProductoSiNoExiste(producto);
    // }

    res.json(productsInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener los primeros 10 productos de PrestaShop",
    });
  }
});

// Endpoint para obtener los clientes desde PrestaShop
app.get("/api/customers", async (req, res) => {
  try {
    const response = await axios.get(
      "https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/customers",
      {
        params: {
          display: "full",
          output_format: "JSON",
          limit: 3,
        },
        headers: {
          Authorization: "ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T",
        },
      }
    );

    // Extraer la información específica de cada cliente
    const customersInfo = response.data.customers.map((customer) => {
      return {
        //TipoIdentidadId: "buscar en otra tabla",
        //NroIdentidad: "Sacar de la tabla address",
        GrupoPersoneria: 1,
        Personeria: `${customer.name ? customer.name : ""}`,
        NombreComercial: `${customer.name ? customer.name : ""}`,
        Domiciliado: 1,
        TipoContribuyente: "1",
        FamiliaID: 143,
        NegocioID: 179,
        CtaDetraccion: "",
        Codigo: "",
        Estado: 1,
        UsuarioID: "1",
        FechaCreacion: `${customer.date_add ? customer.date_add : ""}`,
        FechaModificacion: `${customer.date_upd ? customer.date_add : ""}`,
        ConvenioID: 902.00001,
        MedioRegistroID: 900.00001,
        MedioInformacionID: 901.00001,
        Referencia: "",
        //Telefonos: "sacar de la tabla address",
        email: `${customer.email ? customer.email : ""}`,
      };
    });

    // Mostrar la información por consola
    customersInfo.forEach((customer) => {
      console.log(
        `
        TipoIdentidadId: *buscar en otra tabla*,
        NroIdentidad: *Sacar de la tabla address*,
        GrupoPersoneria: 1,
        Personeria: ${customer.name ? customer.name : ""}, 
        NombreComercial: ${customer.name ? customer.name : ""}, 
        Domiciliado: 1, 
        TipoContribuyente: "1", 
        FamiliaID: 143, 
        NegocioID: 179, 
        CtaDetraccion: "", 
        Codigo: "", 
        Estado: 1, 
        UsuarioID: "1", 
        FechaCreacion: ${customer.date_add ? customer.date_add : ""}, 
        FechaModificacion: ${customer.date_upd ? customer.date_add : ""}, 
        ConvenioID: 902.00001, 
        MedioRegistroID: 900.00001, 
        MedioInformacionID: 901.00001, 
        Referencia: "", 
        Telefonos: *sacar de la tabla address*, 
        email: ${customer.email ? customer.email : ""}, 
        `
      );
      console.log("---");
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al obtener los clientes de PrestaShop" });
  }
});


// Desarrollo de enlaces para la api de prestashop

// app.get("/api/orders", async (req, res) => {
//   try {
//     const page = req.query.page || 1; // Obtener el número de página de la consulta
//     const pageSize = req.query.pageSize || 10; // Obtener el tamaño de la página de la consulta

//     const response = await axios.get(
//       "https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/orders",
//       {
//         params: {
//           display: "full",
//           output_format: "XML",
//           page: page,
//           limit: pageSize,
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
//           PersoneriaID: order.id_customer,
//           OficinaAlmacenID: 1,
//           DireccionID: 1, //en la db hay 1 y 2
//           MonedaID: "102.00001",
//           ListaPrecioID: "108.00001",
//           estado: order.current_state,
//           ContadoEstado: 0,
//           VendedorId: "1",
//           TipoEntrega: 2,
//           FechaEntrega: order.delivery_date,
//           DireccionEntrega: order.id_address_delivery,
//           OficinaAlmacenEntregaID: "1",
//           referencia: order.reference,
//           Observaciones: "",
//           cliente: "",
//           Contacto: "",
//           ContactoTelefono: "",
//           tipoventa: 0,
//           HabilitarFecha: "0",
//           MotivoID: "190.00062", //por defecto
//           CondicionVtaID: "113.00001", //por defecto
//           DeliveryTipoID: "193.00001", //por defecto
//           DeliveryTurnoID: "192.00002", //por defecto
//           TipoDocID: "", // se jalara por address
//           ValorPedido: order.total_paid,
//           PrecioPedido: order.total_paid,
//           FacturarSwitch: 0,
//           ConvenioID: "902.00002", //por defecto
//           firstname: order.firstname,
//           lastname: order.lastname,
//           addres1: order.addres1,
//           addres2: order.addres2,
//           id_state: order.id_state,
//           phone: order.phone,
//           dniORUC: order.company,
//         };
//       });

//       res.json(orders);
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "Error al obtener los pedidos de PrestaShop" });
//   }
// });

app.get("/api/orders", async (req, res) => {
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
    parser.parseString(response.data, (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Error al parsear la respuesta XML" });
      }
      // Extraer los elementos <order>
      const orders = result.prestashop.orders.order;
      // Extraer la información específica de cada cliente
      const ordersInfo = result.prestashop.orders.order.map((order) => {
        return {
          Orden: order.id,
          PersoneriaID: order.id_customer,
          // OficinaAlmacenID: 1,
          // DireccionID: 1, //en la db hay 1 y 2
          // MonedaID: "102.00001",
          // ListaPrecioID: "108.00001",
          // estado: order.current_state,
          // ContadoEstado: 0,
          // VendedorId: "1",
          // TipoEntrega: 2,
          // FechaEntrega: order.delivery_date,
          // DireccionEntrega: order.id_address_delivery,
          // OficinaAlmacenEntregaID: "1",
          // referencia: order.reference,
          // Observaciones: "",
          // cliente: "",
          // Contacto: "",
          // ContactoTelefono: "",
          // tipoventa: 0,
          // HabilitarFecha: "0",
          // MotivoID: "190.00062", //por defecto
          // CondicionVtaID: "113.00001", //por defecto
          // DeliveryTipoID: "193.00001", //por defecto
          // DeliveryTurnoID: "192.00002", //por defecto
          // TipoDocID: "", // se jalara por address
          // ValorPedido: order.total_paid,
          // PrecioPedido: order.total_paid,
          // FacturarSwitch: 0,
          // ConvenioID: "902.00002", //por defecto
          // firstname: order.firstname,
          // lastname: order.lastname,
          // addres1: order.addres1,
          // addres2: order.addres2,
          // id_state: order.id_state,
          // phone: order.phone,
          // dniORUC: order.company,
        };
      });
      res.json(ordersInfo);
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al obtener los pedidos de PrestaShop" });
  }
});


app.get("/api/orders/:id", async (req, res) => {
  const orderId = req.params.id;

  try {
    const response = await axios.get(
      `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/orders/${orderId}`
    );

    var Pedido = {};
    // Parsear la respuesta XML
    parser.parseString(response.data, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al parsear la respuesta XML" });
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
        return res.status(500).json({ error: "Error al parsear la respuesta XML" });
      }
      // Extraer la orden con el ID especificado
      const direccionEntrega = result.prestashop;
      DireccionEntrega = {
        id_adress_Entrega: direccionEntrega.address.id,
        id_direccion: direccionEntrega.address.id_state._,
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
        return res.status(500).json({ error: "Error al parsear la respuesta XML" });
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

    const responseAddresinvoice = await axios.get(
      `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/addresses/${Pedido.address_delivery}`
    );

    var DireccionFacturacion = {};
    parser.parseString(responseAddresinvoice.data, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al parsear la respuesta XML" });
      }
      // Extraer la orden con el ID especificado
      const direccionFacturacion = result.prestashop;
      DireccionFacturacion = {
        id_adress_Entrega: direccionFacturacion.address.id,
      };
    });


    const responseCard = await axios.get(
      `https://ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T@www.kukyflor.com/api/carts/${Pedido.cart}`
    );

    var Card = {};
    parser.parseString(responseCard.data, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al parsear la respuesta XML" });
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
        return res.status(500).json({ error: "Error al parsear la respuesta XML" });
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
        return res.status(500).json({ error: "Error al parsear la respuesta XML" });
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
      DireccionFacturacion,
      DireccionEntrega,
      IDEntrega_Direccion,
      Card,
      Customer,
      Pedido
    };

    res.json(ArrayCompleto);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la orden de PrestaShop" });
  }

});


// Funciones del modelo para la creacion de el pedido

async function buscarClientePorDNI(dni) {
  try {
    await sql.connect(config);
    const request = new sql.Request();
    request.input('NroIdentidad', sql.VarChar, dni);
    const result = await request.query('SELECT * FROM Personeria WHERE NroIdentidad = @NroIdentidad');
    return result.recordset[0]; // Devolver el primer cliente encontrado
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await sql.close();
  }
}


// async function buscarRazonSocialPorDNI(dni) {
//   try {
//       const token = 'apis-token-4761.8i-67B5lTexuXTijVwxpPqh-hjNAYJLn';
//       const apiUrl = `https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`;
//       const headers = {
//           'Authorization': `Bearer ${token}`
//       };

//       const response = await axios.get(apiUrl, { headers });
//       const persona = response.data;
//       return persona.apellidoPaterno + " " + persona.apellidoMaterno + " " + persona.nombres;
//   } catch (error) {
//       console.error(error);
//       return 'DNI no encontrado';
//   }
// }


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
      return resultado.nombres + ' ' + resultado.apellidoPaterno + ' ' + resultado.apellidoMaterno
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

async function crearCliente(params, Razonsocisl, TipoDocumento) {
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
    request.input('TipoIdentidadID', sql.Decimal(9, 5), 203.00001);//Funcionalidad para dni o ruc
    request.input('NroIdentidad', sql.NVarChar, params.NroIdentidad);
    request.input('GrupoPersoneria', sql.NVarChar, '1');
    request.input('Personeria', sql.NVarChar, Razonsocisl);
    request.input('NombreComercial', sql.NVarChar, Razonsocisl);
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
    request.input('Email', sql.NVarChar, params.Email);

    const result = await request.query(query);
    const PersoneriaID = result.recordset[0].LastId;
    const query2 = `
          INSERT INTO [dbo].[PersoneriaDireccion]
              ([PersoneriaID], [DireccionID], [PaisID], [UbicacionID], [ViaID], [NombreVia], [NumeroVia], [InteriorVia], [ZonaID], [NombreZona], [Direccion], [Telefonos], [Email], [ZonaRutaID], [Secuencia], [Coordenada], [Estado], [UsuarioID])
          VALUES
              (@PersoneriaID, @DireccionID, @PaisID, @UbicacionID, @ViaID, @NombreVia, @NumeroVia, @InteriorVia, @ZonaID, @NombreZona, @Direccion, @Telefonos, @Email, @ZonaRutaID, @Secuencia, @Coordenada, @Estado, @UsuarioID);
      `;

    const request2 = new sql.Request(transaction);

    if (TipoDocumento == '1') {
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
      request2.input('Email', sql.NVarChar, params.Email);
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
      request2.input('UbicacionID', sql.NVarChar, '000000');
      request2.input('ViaID', sql.Decimal, 135.00000);
      request2.input('NombreVia', sql.NVarChar, '');
      request2.input('NumeroVia', sql.NVarChar, '');
      request2.input('InteriorVia', sql.NVarChar, '');
      request2.input('ZonaID', sql.Decimal(9, 5), 136.00000);
      request2.input('NombreZona', sql.NVarChar, '');
      request2.input('Direccion', sql.NVarChar, '');
      request2.input('Telefonos', sql.NVarChar, '');
      request2.input('Email', sql.NVarChar, params.Email);
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

async function createPedido(params, usevariables, IDPlanilla) {
  let pool, result, error = '';
  let nuevoIDpedido = 0;
  let newPedidoID = 0;

  console.log(params);

  try {
    pool = await sql.connect(config.db);
    //Obtenemos el maximo valor de nuestro Pedido para uno nuevo
    const query_count2 = `
          SELECT CASE 
          WHEN MAX(NumeroPedido) IS NULL THEN 1  
          ELSE MAX(NumeroPedido) + 1 
          END AS IDPedido
          FROM VentaPedidoCabecera;`;
    const request2 = pool.request();
    result_count = await request2.query(query_count2);
    let count = result_count.recordset[0].IDPedido;
    nuevoIDpedido = count
    console.log(count);
    //Fin de obtencion de nuevo pedidoID

    //Extraccion de numero de serie 
    const queryDocRelativo = `
          SELECT * FROM documentocorrelativo 
          WHERE EmpresaID = ${parseFloat(usevariables.EmpresaID)} 
          AND OficinaAlmacenID = ${parseFloat(usevariables.UsuarioOficina)} 
          AND TipoDocID = ${parseFloat(params.header.TipoDocID)};`;
    const request9 = pool.request();
    result_Serie = await request9.query(queryDocRelativo);
    let SerieCorrelativo = result_Serie.recordset[0].SerieDoc;
    // Fin de extraccion de numero de serie
    const query = `
          INSERT INTO VentaPedidoCabecera
              (EmpresaID, OficinaAlmacenID, SeriePedido, NumeroPedido, PersoneriaID, DireccionID, VendedorID, CondicionVtaID, MonedaID, ListaPrecioID, Fecha, TipoEntrega, FechaEntrega, DireccionEntrega, OficinaAlmacenEntregaID, Referencia, Observaciones, Cliente, Contacto, Contactotelefono, MotivoID, DeliveryTipoID, DeliveryTurnoID, TipoDocID, ValorPedido, PrecioPedido, TipoCambio, Estado, UsuarioID, FechaCreacion, FechaModificacion, TipoVenta, Gratuita, PlanillaID, ConvenioID)
          VALUES
              (1, @OficinaAlmacenID, @SerieCorrelativo, @NumeroPedido, @PersoneriaID, @DireccionID, @Vendedor, @CondicionVtaID, @MonedaID, @ListaPrecioID, GETDATE(), @TipoEntrega, @FechaEntrega, @DireccionEntrega, @OficinaAlmacenEntregaID, @Referencia, @Observaciones, '', @Contacto, @Contactotelefono, @MotivoID, @DeliveryTipoID, @DeliveryTurnoID, @TipoDocID, @ValorPedido, @PrecioPedido, 0.00000, '1', @UsuarioID, GETDATE(), GETDATE(), @TipoVenta, @HabilitarFecha, @IDPlanilla, @ConvenioID);
          SELECT SCOPE_IDENTITY() AS LastInsertedID;    
      `;
    const request = pool.request();
    //nuevos datos
    //request.input('PedidoID', sql.Int, nuevoIDpedido); es automatico
    request.input('NumeroPedido', sql.Int, nuevoIDpedido);  // es automatico
    request.input('SerieCorrelativo', sql.VarChar, SerieCorrelativo);
    request.input('PersoneriaID', sql.Int, params.header.PersoneriaID);
    request.input('DireccionID', sql.Int, params.header.DireccionID);
    request.input('MonedaID', sql.Decimal(9, 5), params.header.MonedaID);
    request.input('ListaPrecioID', sql.Decimal(9, 5), params.header.ListaPrecioID);
    request.input('TipoEntrega', sql.Int, params.header.TipoEntrega);
    request.input('FechaEntrega', sql.Date, params.header.FechaEntrega.replaceAll('/', '-'));
    request.input('DireccionEntrega', sql.VarChar, params.header.DireccionEntrega);
    request.input('OficinaAlmacenEntregaID', sql.Decimal(6, 3), params.header.OficinaAlmacenEntregaID);
    request.input('Referencia', sql.VarChar, params.header.referencia);
    request.input('Observaciones', sql.VarChar, params.header.Observaciones);
    request.input('Contacto', sql.VarChar, params.header.Contacto);
    request.input('Contactotelefono', sql.VarChar, params.header.ContactoTelefono);
    request.input('MotivoID', sql.Decimal(9, 5), params.header.MotivoID);
    request.input('CondicionVtaID', sql.Decimal(9, 5), params.header.CondicionVtaID);
    request.input('DeliveryTipoID', sql.Decimal(9, 5), params.header.DeliveryTipoID);
    request.input('DeliveryTurnoID', sql.Decimal(9, 5), params.header.DeliveryTurnoID);
    request.input('TipoDocID', sql.Decimal(9, 5), params.header.TipoDocID);
    request.input('OficinaAlmacenID', sql.Decimal(6, 3), 17);
    request.input('UsuarioID', sql.Int, 1);
    request.input('Vendedor', sql.Int, 1);
    request.input('TipoVenta', sql.Int, 0);
    request.input('HabilitarFecha', sql.Int, '');
    request.input('IDPlanilla', sql.NVarChar, 1);
    request.input('ConvenioID', sql.Decimal(9, 5), 902.00002);

    const totalpedido = params.productos.reduce((acumulador, producto) => {
      return acumulador + parseFloat(producto.quantity) * parseFloat(producto.price) - parseFloat(producto.quantity) * parseFloat(producto.price) * parseFloat(producto.descuento) / 100;
    }, 0);

    request.input('ValorPedido', sql.Decimal(9, 5), totalpedido);
    request.input('PrecioPedido', sql.Decimal(9, 5), totalpedido);

    result = await request.query(query);

    newPedidoID = result.recordset[0].LastInsertedID;
    // console.log(params);

    for (let i = 0; i < params.productos.length; i++) {
      let producto = params.productos[i];
      const request2 = pool.request();
      const query1 = `
              INSERT INTO [dbo].[VentaPedidoDetalle]
                      ([EmpresaID]
                      ,[OficinaAlmacenID]
                      ,[PedidoID]
                      ,[Consecutivo]
                      ,[ProductoID]
                      ,[cantidad]
                      ,[valorunitario]
                      ,[preciounitario]
                      ,[PorcentajeDescuento]
                      ,[descuento]
                      ,[FechaEntrega]
                      ,[UMUnitarioID]
                      ,[observaciones]
                      ,[Estado]
                      ,[UsuarioID]
                      ,[FechaCreacion]
                      ,[FechaModificacion])
              VALUES
                      (1
                      ,@OficinaAlmacenID
                      ,@PedidoID
                      ,@Consecutivo
                      ,@ProductoID
                      ,@cantidad
                      ,0.0
                      ,@preciounitario
                      ,0.0
                      ,@descuento
                      ,@FechaEntrega
                      ,@UMUnitarioID
                      ,''
                      ,1
                      ,@UsuarioID
                      ,GETDATE()
                      ,GETDATE())
                      `;

      request2.input('PedidoID', sql.Int, newPedidoID);
      request2.input('Consecutivo', sql.Int, i + 1);
      request2.input('ProductoID', sql.Int, producto.id);
      request2.input('cantidad', sql.Decimal(12, 4), producto.quantity);
      request2.input('preciounitario', sql.Decimal(18, 9), producto.price);
      request2.input('descuento', sql.Decimal(18, 9), producto.descuento);
      request2.input('FechaEntrega', sql.Date, producto.EstadocheckFecha == '1' ? producto.fecha : params.header.FechaEntrega.replaceAll('/', '-'));
      request2.input('UMUnitarioID', sql.Decimal(9, 5), producto.PrincipalIDUM);
      //Oficina y usuario
      request2.input('OficinaAlmacenID', sql.Decimal(6, 3), usevariables.UsuarioOficina);
      request2.input('UsuarioID', sql.Int, usevariables.UsuarioID);
      result = await request2.query(query1);
    }

    if (params.header.ContadoEstado != '1') {
      console.log("Se agregan los metodos de pago");
      for (let i = 0; i < params.MediosPagoID.length; i++) {
        let MedioPago = params.MediosPagoID[i];
        const request4 = pool.request();
        const query4 = `
                  INSERT INTO [dbo].[VentaPedidoPago]
                      ([EmpresaID]
                      ,[OficinaAlmacenID]
                      ,[PedidoID]
                      ,[FormaPagoID]
                      ,[MontoPago]
                      ,[UsuarioID]
                      ,[FechaCreacion]
                      ,[FechaModificacion]
                      ,[NroOperacion]
                      ,[PlanillaID])
                  VALUES
                      (
                          1
                          ,@OficinaAlmacenID
                          ,@PedidoID
                          ,@FormaPagoID
                          ,@MontoPago
                          ,@UsuarioID
                          ,GETDATE()
                          ,GETDATE()
                          ,@NroOperacion
                          ,@PlanillaID
                      )`;
        request4.input('OficinaAlmacenID', sql.Decimal(6, 3), usevariables.UsuarioOficina);
        request4.input('PedidoID', sql.Int, newPedidoID);
        request4.input('FormaPagoID', sql.Decimal(9, 5), MedioPago.MedioPagoID);
        request4.input('MontoPago', sql.Decimal(12, 2), MedioPago.importe);
        request4.input('UsuarioID', sql.Int, usevariables.UsuarioID);
        request4.input('NroOperacion', sql.NVarChar, MedioPago.numtransaccion);
        request4.input('PlanillaID', sql.NVarChar, IDPlanilla);
        result = await request4.query(query4);
      }
    }

    if (params.header.FacturarSwitch == '1') {
      console.log("Ejecutamos el procedimiento de facturacion");
      const query2 = `
              exec spPyOPedidoGeneraComprobante 1,@OficinaAlmacenID,@PedidoID,@tipoDocID;`;
      const request3 = pool.request();
      request3.input('OficinaAlmacenID', sql.Decimal(6, 3), usevariables.UsuarioOficina);
      request3.input('PedidoID', sql.Int, newPedidoID);
      request3.input('tipoDocID', sql.Decimal(9, 5), params.header.TipoDocID);
      result = await request3.query(query2);
    } else {
      console.log("No!!!! Ejecutamos el procedimiento de facturacion");
    }

  } catch (err) {
    error = err.toString();
    log.logError("dbo.VentaPedidoCabecera/create", err);
  } finally {
    if (pool) {
      pool.close();
    }
  }
  return {
    result,
    error
  }
}



app.get("/api/BuscarDNI/:id", async (req, res) => {
  const orderId = req.params.id;
  try {
    const cliente = await buscarClientePorDNI(orderId);
    console.log(cliente);
    res.status(200).json(cliente); // Devolver el cliente encontrado
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el cliente" });
  }
});


app.get("/api/BuscarRUCoDNISunat/:numero", async (req, res) => {
  const numero = req.params.numero;
  try {
    const razonSocial = await buscarRazonSocialPorDNIRUC(numero);
    console.log(razonSocial);
    res.status(200).json({ razonSocial }); // Devolver la razón social encontrada
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la razón social" });
  }
});


app.get('/api/CrearCliente/:numero', async (req, res) => {
  try {
    console.log("Entramos al controlador");
    const numero = req.params.numero;
    const razonSocial = await buscarRazonSocialPorDNIRUC(numero);
    const resultadoCreacion = await crearCliente({ NroIdentidad: numero, Email: 'prueba1111@correo.com' }, razonSocial);
    if (resultadoCreacion.success) {
      res.status(200).json("El cliente se creo correctamente");
    } else {
      res.status(200).json("El cliente no se creo");
      throw new Error(resultadoCreacion.message);
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al registrar el cliente.', error: error.message };
  }
});

// Ejecutamos proceso de verificacion de cliente y orden
async function procesarOrden(orden) {
  try {
    // Conectar a la base de datos
    await sql.connect(config);

    // Verificar si el estado de la orden es "procesado" (id=14)
    if (orden.Estado.Id !== '14') {
      console.log('La orden no está procesada. No se puede crear el pedido.');
      return;
    }
    // Paso 1: Revisar el DNI y buscar o crear al cliente
    let clienteId = '00000001'; // Cliente general por defecto
    if (orden.Customer.documentoIdentidad !== '') {
      const cliente = await buscarClientePorDNI(orden.DNI);
      if (cliente) {
        clienteId = cliente.NroIdentidad; //Obtenemos el numero de Identidad del Cliente 
      } else {
        // Ser crea el cliente 
        clienteId = await crearClientePorDNI(orden.DNI);
      }
    }
    // Paso 2: Crear el pedido
    await crearPedido(orden, clienteId);
    console.log('Pedido creado correctamente.');

  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    // Cerrar la conexión
    await sql.close();
  }
}

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
