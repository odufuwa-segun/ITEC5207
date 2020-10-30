var express = require("express");
const jsonexport = require('jsonexport');
var app = express();
var db = require("./database.js");
var initialize_db = require("./initialize_db.js");

var port = process.env.PORT || 3000;

var json2csv2stdout = (res, jsondata, filename) => {
    jsonexport(jsondata, function(err, csv){
        if (err) {
            res.status(400).message('Error occurred while processing output. '+ err);
            return console.error(err);
        }
        res.header('Content-Type', 'text/csv');
        res.attachment(filename);
        return res.send(csv);
        console.log(csv);
    });
};

// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Welcome to ITEC5207 Backend"})
});
app.get("/api/init", (req, res, next) => {
    initialize_db(db);
    res.json({"message":"Ok"})
});
app.get("/api/publications", (req, res, next) => {
    // return all publications
    var sql = "select * from publication WHERE 1=1 "
    var params = [];

    let submitted_after = req.query.submitted_after; // format=YYYY-MM-DD
    let submitted_before = req.query.submitted_before;

    let updated_after = req.query.updated_after;
    let updated_before = req.query.updated_before;

    if (submitted_after) {
        sql += ' AND date(submitted) > ? ';
        params.push(submitted_after);
    }
    if (submitted_before) {
        sql += ' AND date(submitted) < ? ';
        params.push(submitted_before);
    }
    if (updated_after) {
        sql += ' AND date(updated) > ? ';
        params.push(updated_after);
    }
    if (updated_before) {
        sql += ' AND date(updated) < ? ';
        params.push(updated_before);
    }


    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        if (req.query.format === 'csv'){
            // console.log(rows);
            return json2csv2stdout(res, rows, 'publications.csv');
        }
        res.json({
            "message":"success",
            "data":rows
        })
    });
});
app.get("/api/publication/:id", (req, res, next) => {
    // return all publication with id
    var sql = "select * from publication where publication_id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        if (req.query.format === 'csv'){
            // console.log(rows);
            return json2csv2stdout(res, row, 'publications-'+req.params.id+'.csv');
        }
        res.json({
            "message":"success",
            "data":row
        })
      });

});
app.get("/api/categories", (req, res, next) => {
    // return all categories
    var sql = "select categories, males, females from publication";
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        console.log(rows)
        var categories = [];
        // console.log('Start Aggregation')
        var count=1;
        rows.forEach(row => { 
            var raw_categories = row.categories.split('|');
            var males = row.males;
            var females = row.females;
            // console.log('Aggregating: '+count)
            // console.log(raw_categories)
            count++;
            raw_categories.forEach(raw_category => {
                if (isNaN(raw_category)) {
                    // console.log(raw_category);
                    var category = {
                        name: raw_category,
                        males: males,
                        females: females,
                        publications: 1
                    };
                    if (categories[raw_category] === undefined){
                        // make sure its not already in the array
                        categories[raw_category] = category;
                    } else {
                        categories[raw_category].males = categories[raw_category].males+males;
                        categories[raw_category].females = categories[raw_category].females+females;
                        categories[raw_category].publications++;
                    }
                }
                
            });
        }); 
        categories = Object.keys(categories).map(val => categories[val]);
        // console.log('Done Aggregation')
        // console.log(categories);
        if (req.query.format === 'csv'){
            // console.log(rows);
            return json2csv2stdout(res, categories, 'categories.csv');
        }
        res.json({
            "message":"success",
            "data":categories
        })
    });
});
app.get("/api/category/:category", (req, res, next) => {
    // return all categories
    var sql = "select sum(males) as males, sum(females) as females, count(id) as publications from publication where categories LIKE ?";
    var params = ['%'+req.params.category+'%']
    db.get(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        if (req.query.format === 'csv'){
            // console.log(rows);
            return json2csv2stdout(res, categories, 'category-'+req.params.category+'.csv');
        }
        // console.log(rows)
        rows['category'] = req.params.category;
        res.json({
            "message":"success",
            "data":rows
        })
    });
});
app.get("/api/category/:category/publications", (req, res, next) => {
    // return all categories
    var sql = "select * from publication where categories LIKE ?";
    var params = ['%'+req.params.category+'%']

    let submitted_after = req.query.submitted_after; // format=YYYY-MM-DD
    let submitted_before = req.query.submitted_before;

    let updated_after = req.query.updated_after;
    let updated_before = req.query.updated_before;

    if (submitted_after) {
        sql += ' AND date(submitted) > ? ';
        params.push(submitted_after);
    }
    if (submitted_before) {
        sql += ' AND date(submitted) < ? ';
        params.push(submitted_before);
    }
    if (updated_after) {
        sql += ' AND date(updated) > ? ';
        params.push(updated_after);
    }
    if (updated_before) {
        sql += ' AND date(updated) < ? ';
        params.push(updated_before);
    }
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        if (req.query.format === 'csv'){
            // console.log(rows);
            return json2csv2stdout(res, rows, 'category-'+req.params.category+'.publications.csv');
        }
        res.json({
            "message":"success",
            "data":rows
        })
    });
});
app.get("/api/journals", (req, res, next) => {
    // return all journals
    var sql = "select distinct journal, sum(males) as males, sum(females) as females, count(*) as publications from publication where journal !='' GROUP By journal ";
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        if (req.query.format === 'csv'){
            // console.log(rows);
            return json2csv2stdout(res, rows, 'journals.csv');
        }
        res.json({
            "message":"success",
            "data":rows
        })
    });
});

// Default response for any other request
app.use(function(req, res){
    res.status(404);
});
app.listen(port, () => {
 console.log("Server running on port " + port);
});