let mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: String,
  post: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Post', postSchema);
