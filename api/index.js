const server = require('./src/app');
const { database } = require('./src/db');
const { uploadCategoryDb } = require('./src/controllers/uploadCategoryDb');
require("dotenv").config(); //para leer las variables de entorno

const PORT = process.env.PORT || 3001;

// Syncing all the models at once.
//Con {force:true} ==>es un sincronizado forzado por lo que se reescribe la Bd al recargar la app

database.sync({ force: false}).then(() => {
  // uploadCategoryDb()    //  Realiza la carga de la categoria en la db  
  server.listen(PORT, () => {
    console.log(`Server Listening in http://localhost:${PORT}/`);
  });
});
          
 
