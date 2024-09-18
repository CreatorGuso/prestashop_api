const axios = require('axios');

// async function obtenerCuponesYFiltrar(idCupon, idCategoria) {
//   try {
//     const response = await axios.get(
//       `https://www.kukyflor.com/devs/json_cupones.php?token=ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T`
//     );

//     const cupones = response.data;

//     // Filtrar cupones por ID
//     const cuponFiltrado = cupones.filter(cupon => cupon.id_cart_rule === idCupon);

//     // Filtrar categorías en cada cupón
//     const cuponConCategoriaFiltrada = cuponFiltrado.map(cupon => {
//       return {
//         ...cupon,
//         categories: cupon.categories.filter(cat => cat.id_category === idCategoria)
//       };
//     });

//     return JSON.stringify(cuponConCategoriaFiltrada, null, 2);
//   } catch (err) {
//     console.error(`Error al obtener o filtrar cupones:`, err);
//   }
// }

// Ejemplo de uso

async function obtenerCuponesYFiltrar(idCupon, idCategoria) {
    try {
      const response = await axios.get(
        `https://www.kukyflor.com/devs/json_cupones.php?token=ZBR3Q8MEZ3KC16C7Z5CMYYD9V1VFCT3T`
      );
  
      const cupones = response.data;
  
      // Filtrar cupones por ID
      const cuponFiltrado = cupones.filter(cupon => cupon.id_cart_rule === idCupon);

      // Filtrar categorías en cada cupón
      const cuponConCategoriaFiltrada = cuponFiltrado.map(cupon => {
        const categorias = cupon.categories === 'No hay categorías asociadas'
          ? 'No hay categorías asociadas'
          : cupon.categories.filter(cat => cat.id_category === idCategoria);
  
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
  
obtenerCuponesYFiltrar(511, 90).then(cupon => {
  console.log(cupon);
});
