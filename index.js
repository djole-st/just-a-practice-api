const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
require('dotenv').config();
app.use(bodyParser.json());
app.use(cookieParser());
const cron = require('node-cron');
const PORT = process.env.PORT || 3000;


cron.schedule('0 0 * * *', () => {
  //console.log('running a task every day at 00:00');
  /*
  let db =  new sqlite3.Database('./database.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
  });

  var a = "asdf";
  var b = "qwer";
  var c = "asdf@qwer";

  var stmt = db.prepare("insert into users values (null,?,?,?)");
  stmt.run(a,b,c);
  stmt.finalize();

  db.close();
  */
});

/*
const db = new sqlite3.Database('./database.db',sqlite3.OPEN_READONLY,(err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });
*/

app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.json());
const userRoutes = require('./routes/users');
app.use('/api/users',userRoutes);

app.get('/',(req,res)=>{
  res.render('index');
});

/*
app.get('/help',(req,res)=>{
  res.render('help');
});
*/

app.listen(PORT,()=>{
    console.log(`Server started at port ${PORT}`);
});