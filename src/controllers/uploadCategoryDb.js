const axios = require("axios")
const { Categorie } = require("../db");
const { URL_API } = require("./globalConst")

/** LOADING OF CATEGORIES IN THE DB */
async function uploadCategoryDb() {
  const apiCategory = await axios(URL_API)
  const data = apiCategory.data.map(e => e.category)
  const dataArr = new Set(data);
  const result = [...dataArr];
  const typesEach = result.flat(2);
  typesEach.forEach(e => {
    Categorie.findOrCreate({
      where: { name: e }
    })
      .then("Correctly Inserted")
      .catch(e => e)
  })
}

module.exports = { uploadCategoryDb }
