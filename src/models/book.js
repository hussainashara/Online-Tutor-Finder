const mongoose = require('mongoose');
const bookSchema = new mongoose.Schema({
    tutor : {
        type : String,
    },
    student : {
        type : String,
    }
});
const Book = new mongoose.model("Book" , bookSchema);
module.exports = Book;
