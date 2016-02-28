var express  = require('express'),
    path     = require('path'),
    bodyParser = require('body-parser'),
    app = express(),
    expressValidator = require('express-validator');


/*Set EJS template Engine*/
app.set('views','./views');
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true })); //support x-www-form-urlencoded
app.use(bodyParser.json());
app.use(expressValidator());

/*MySql connection*/
var connection  = require('express-myconnection'),
    mysql = require('mysql');

app.use(

    connection(mysql,{
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'test',
        debug    : false //set true if you wanna see debug logger
    },'request')

);

app.get('/',function(req,res){
    res.send('Welcome');
});


//RESTful route
var router = express.Router();


router.use(function(req, res, next) {
    console.log(req.method, req.url);
    next();
});

var curut = router.route('/cars');


//show the CRUD interface | GET
curut.get(function(req,res,next){


    req.getConnection(function(err,conn){

        if (err) return next("Cannot Connect");

        var query = conn.query('SELECT * FROM t_user',function(err,rows){

            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }

            res.render('user',{title:"RESTful Crud Example",data:rows});

         });

    });

});
//post data to DB | POST
curut.post(function(req,res,next){

    //validation
    req.assert('name','Name is required').notEmpty();
    req.assert('Color','Color is required').notEmpty();
    req.assert('Year','Year is required').notEmpty();

    var errors = req.validationErrors();
    if(errors){
        res.status(422).json(errors);
        return;
    }

    //get data
    var data = {
        name:req.body.name,
        email:req.body.color,
        password:req.body.year
     };

    //inserting into mysql
    req.getConnection(function (err, conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("INSERT INTO cars set ? ",data, function(err, rows){

           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }

          res.sendStatus(200);

        });

     });

});


//now for Single route (GET,DELETE,PUT)
var curut2 = router.route('/cars/:cars_id');


curut2.all(function(req,res,next){
    console.log("You need to smth about curut2 Route ? Do it here");
    console.log(req.params);
    next();
});

//get data to update
curut2.get(function(req,res,next){

    var cars_id = req.params.cars_id;

    req.getConnection(function(err,conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("SELECT * FROM cars WHERE cars = ? ",[cars_id],function(err,rows){

            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }


            if(rows.length < 1)
                return res.send("cars Not found");

            res.render('edit',{title:"Edit cars",data:rows});
        });

    });

});

//update data
curut2.put(function(req,res,next){
    var cars_id = req.params.cars_id;

    //validation
    req.assert('name','Name is required').notEmpty();
    req.assert('color','color is required').notEmpty();
    req.assert('year','year is required').notEmpty();

    var errors = req.validationErrors();
    if(errors){
        res.status(422).json(errors);
        return;
    }

    //get data
    var data = {
        name:req.body.name,
        color:req.body.color,
        year:req.body.year
     };

    //inserting into mysql
    req.getConnection(function (err, conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("UPDATE cars set ? WHERE cars_id = ? ",[data,cars_id], function(err, rows){

           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }

          res.sendStatus(200);

        });

     });

});

//delete data
curut2.delete(function(req,res,next){

    var cars_id = req.params.cars_id;

     req.getConnection(function (err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query("DELETE FROM cars  WHERE cars_id = ? ",[cars_id], function(err, rows){

             if(err){
                console.log(err);
                return next("Mysql error, check your query");
             }

             res.sendStatus(200);

        });
        //console.log(query.sql);

     });
});

//now we need to apply our router here
app.use('/api', router);

//start Server
var server = app.listen(8080,function(){

   console.log("Listening to port %s",server.address().port);

});
