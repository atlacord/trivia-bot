import mongoose from 'mongoose';

const triviaTopic = new mongoose.Schema({
  _id:          { type: String },
  name:         { type: String, required: true },
  questions:    { type: Array },
  createdAt:    { type: Date },
  lastUpdated:  { type: Date },
});

export = { name: 'Topic', schema: triviaTopic };