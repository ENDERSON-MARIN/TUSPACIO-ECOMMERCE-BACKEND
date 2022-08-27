const server = require('./src/app.js');
const { database } = require('./src/db.js');
const { uploadCategoryDb } = require('./src/controllers/uploadCategoryDb');


const PORT = process.env.PORT || 3001;

// Syncing all the models at once.
//Con {force:true} ==>es un sincronizado forzado por lo que se reescribe la Bd al recargar la app

database.sync({ force: true }).then(() => {
  uploadCategoryDb()    //  Realiza la carga de la categoria en la db
  server.listen(PORT, () => {
    console.log(`Server Listening in http://localhost:${PORT}/`);
  });
});