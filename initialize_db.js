var sqlite3 = require('sqlite3').verbose()
var csv = require('csv-parser');
var fs = require('fs');

let create_sql = `CREATE TABLE publication(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        publication_id text,
        submitted text,
        updated	text,
        title text,
        abstract text,
        authors	text,
        link_abstract text,
        link_pdf text,
        link_doi text,
        comment text, 
        journal text,
        category text, 
        males INTEGER,
        females INTEGER
    )`;
let initialize  = (db) => {
    db.run(create_sql, (err) => {
        console.log('Initializing Database.');
        if (err) {
            console.log('Something went wrong creating table. '+ err);
            return;
        }
        data_csv_2_db(db);
    });
};
let insert_sql = '';
var insert = `INSERT INTO publication (
    publication_id, submitted, updated, title, abstract, authors, link_abstract, link_pdf, link_doi, comment, journal, category, males, females) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
let data_csv_2_db = (db) => {
    console.log('Importing CSV data to SQLLite. ');
    fs.createReadStream('db/cleaned.csv')
        .pipe(csv())
        .on('data', (row) => {
            // publication_id, submitted, updated, title, abstract, authors, link_abstract, link_pdf, link_doi, comment, journal, category, males, females
            console.log(row.id);
            db.run(insert, [row.id, row.submitted, row.updated, row.title, row.abstract, row.authors, row.link_abstract, row.link_pdf, row.link_doi, 
                row.comment, row.journal, row.category, row.males, row.females]);
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
        });

};


module.exports = initialize;