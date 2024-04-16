module.exports = {
    ProcessQueries: function (req, StringArray, NumberArray ) {
      let exclude = ["sort", "page", "limit"];
      let objQueries = JSON.parse(JSON.stringify(req.query));
  
      for (const [key, value] of Object.entries(objQueries)) {
        if (exclude.includes(key)) {
          delete objQueries[key];
        } else {
          if (StringArray.includes(key)) {
            objQueries[key] = new RegExp(value.replace(',', '|'), 'i');
          } else {
            if (NumberArray.includes(key)) {
              let string = JSON.stringify(value);
              let index = string.search(new RegExp('gte|gt|lte|lt', 'i'));
              if (index < 0) {
                objQueries[key] = value;
              } else {
                objQueries[key] = JSON.parse(string.slice(0, index) + "$" + string.slice(index, string.length));
              }
            }
          }
        }
      }
  
      objQueries.isDeleted = false;
      return objQueries;
    },
  
    ProcessSortQuery: function (req) {
      let sortObj = {};
      if (req.query.sort) {
        if (req.query.sort.startsWith('-')) {
          let field = req.query.sort.substring(1);
          sortObj[field] = -1;
        } else {
          let field = req.query.sort;
          sortObj[field] = 1;
        }
      }
      return sortObj;
    },
  
    GetPageAndLimit: function (req) {
      let page = req.query.page ? req.query.page : 1;
      let limit = req.query.limit ? req.query.limit : 5;
      return { page, limit };
    }
  };
  