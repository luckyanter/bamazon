var mysql = require("mysql");
var inquirer = require("inquirer");
var totalCost = 0;

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 8889,
  user: "root",
  password: "root",
  database: "bamazon_DB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  console.log('these are the list of our products:');  
});

// ----------------------------------------------------------------------------------------- 
var display = function() {
  connection.query("SELECT * FROM products", function(err, results) {
  var productsArray = [];
  for (var i = 0; i < results.length; i++) {
    productsArray.push(results[i]);
    console.log(results[i].id, "product: " + results[i].item_name,"Price: $" + results[i].price);
  };
  // console.log(choiceArray);
  return productsArray;
})
};
 display();

 var buyagain = function() {
  inquirer.prompt(
    {name: 'rebuy', 
    message:"how about buying another item?",
    type: "rawlist",
    choices:["yes","no"]
  }
    ).then(function(answer) {
      if(answer.rebuy === "yes"){
        money();
      }
      else{console.log('thank you for your purchase ' + " your total cost = $" + totalCost)}
 });
 }
// ----------------------------------------------------------------------------------------- 
var money = function() {
  // query the database for all items being auctioned
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to bid on
    inquirer.prompt([
      {
        name: "choice",
        type: "rawlist",
        choices: function() {
          var choiceArray = [];
          for (var i = 0; i < results.length; i++) {
            choiceArray.push(results[i].item_name);
          }
          return choiceArray;
        },
        message: "What ITEM would you like to buy?"
      },
      {
        name: "bid",
        type: "input",
        message: "How many items would you like to buy?"
      }
    ]).then(function(answer) {
      // get the information of the chosen item
      var chosenItem;
      for (var i = 0; i < results.length; i++) {
        if (results[i].item_name === answer.choice) {
          chosenItem = results[i];
        }
      }

      // determine if bid was high enough
      if (chosenItem.stock_quantity > parseInt(answer.bid)) {
        // bid was high enough, so update db, let the user know, and start over
        connection.query("UPDATE products SET ? WHERE ?", [{
          stock_quantity:chosenItem.stock_quantity - answer.bid
        }, {
          id: chosenItem.id
        }], function(error) {
          if (error) throw err;
          var primaryCost = (answer.bid * chosenItem.price);
          console.log(" cost = $" + primaryCost);
          totalCost += primaryCost;
          buyagain();
        });
      }
      else {
        // bid wasn't high enough, so apologize and start over
        console.log("there is not enough stock_quantity");
        buyagain();
      }
    });
  });
};
money();
// connection.end();