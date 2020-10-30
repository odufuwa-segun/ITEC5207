var sqlite3 = require('sqlite3').verbose()
var csv = require('csv-parser');
var fs = require('fs');

var csv_file = 'db/cleaned.csv';

let create_sql = `CREATE TABLE publication(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    publication_id text,
    submitted text,
    updated	text,
    title text,
    authors	text,
    affiliations text,
    link_abstract text,
    link_pdf text,
    link_doi text,
    comment text, 
    journal text,
    primary_category text, 
    categories text, 
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
    publication_id, submitted, updated, title, authors, affiliations, link_abstract, link_pdf, link_doi, comment, journal, primary_category, categories, males, females) 
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
let data_csv_2_db = (db) => {
    console.log('Importing CSV data to SQLLite. ');
    var count=0;
    fs.createReadStream(csv_file)
        .pipe(csv())
        .on('data', (row) => {
            // publication_id, submitted, updated, title, authors, affiliations, link_abstract, link_pdf, link_doi, comment, journal, primary_category, categories, males, females
            
            var raw_authors = row.authors.split('|');
            var authors = [];
            raw_authors.forEach(raw_author => { 
                raw_author = raw_author.trim();
                if (authors.indexOf(raw_author)===-1){
                    // make sure its not already in the array
                    authors.push(raw_author);
                }
            }); 
            authors = authors.join('|');
            // var raw_categories = row.categories.replace(/,/gi,'|').split('|');
            var raw_categories = row.categories.split('|');
            var categories = [];
            raw_categories.forEach(raw_category => { 
                raw_category = raw_category.trim();
                if (categories.indexOf(raw_category)===-1){
                    // make sure its not already in the array
                    categories.push(raw_category);
                }
            }); 
            categories = categories.join('|');
            var raw_affiliations = row.affiliations.split('|');
            var affiliations = [];
            raw_affiliations.forEach(raw_affiliation => { 
                raw_affiliation = raw_affiliation.trim();
                if (affiliations.indexOf(raw_affiliation)===-1){
                    // make sure its not already in the array
                    affiliations.push(raw_affiliation);
                }
            }); 
            affiliations = affiliations.join('|');
            
            console.log(row.id+': '+ authors);

            db.run(insert, [row.id, row.submitted, row.updated, row.title.trim(), authors, affiliations, row.link_abstract, row.link_pdf, row.link_doi, 
                row.comment.trim(), row.journal.trim(), row.primary_category.trim(), categories, row.males, row.females]);
                count++;
        })
        .on('end', () => {
            console.log('CSV file successfully processed: '+ count);
        });

};


module.exports = initialize;