const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");


const app = express();

// let items = ["Buy Food","Cook Food","Eat Food"];
// let workItems = [];

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", 'ejs');

mongoose.connect("mongodb+srv://admin-yanyin:P6aV0GyqyW6PG4Eb@cluster0.cao0kze.mongodb.net/todolistDB")
// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB")


const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Drink a cup of water"
});

const item2 = new Item({
  name: "Wash face and brush teeth"
});

const item3 = new Item({
  name: "Eat some nuts"
})

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  let day = date.getDate()

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Inserted!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
          listTitle: day,
          newListItem: foundItems
        }
      );
  };
});

});


app.post("/", function(req, res) {
  console.log(req.body);
  const itemName = req.body.courseUrls;
  const listName = req.body.list;

  const newItem = new Item({
    name:itemName
  });

  if (listName === date.getDate()) {
    newItem.save();
    res.redirect("/")
  } else {
    List.findOne({name:listName}, function(err,foundList){
      foundList.items.push(newItem)
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.list;

  if (listName === date.getDate()) {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
      }
    });
    res.redirect("/")
  } else {
    List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err) {
        res.redirect("/" + listName)
      }
    })
  }


})



app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);



  List.findOne({name:customListName},function (err,results) {
    if (results) {
      //Show an existing list
      res.render("list",{
        listTitle: results.name,
        newListItem: results.items
      })
    } else {
      //Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      // 在save完成之后再redirect
      list.save(function(){
        res.redirect("/" + customListName)
      })
    }
  })



})


app.get("/about", function(req, res) {
  res.render("about");
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
