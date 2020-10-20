var express = require("express");
var app = express();
var db = require("./database.js");
var initialize_db = require("./initialize_db.js");


// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Welcome to ITEC5207 Backend"})
});
// app.get("/init", (req, res, next) => {
//     initialize_db(db);
//     res.json({"message":"Ok"})
// });
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
        res.json({
            "message":"success",
            "data":row
        })
      });

});
app.get("/api/categories", (req, res, next) => {
    // return all categories
    var sql = "select category, sum(males) as males, sum(females) as females, count(id) as publications from publication group by category";
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
    });
});
app.get("/api/category/:category", (req, res, next) => {
    // return all categories
    var sql = "select category, sum(males) as males, sum(females) as females, count(id) as publications from publication where  category = ? group by category";
    var params = [req.params.category]
    db.get(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
    });
});
app.get("/api/category/:category/publications", (req, res, next) => {
    // return all categories
    var sql = "select * from publication where category = ?";
    var params = [req.params.category]

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
app.listen(3000, () => {
 console.log("Server running on port 3000");
});