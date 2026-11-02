import mongoose from 'mongoose';

const session = new mongoose.Schema({
  _id:          { type: String  },
  guild:        { type: String  },
  user:         { type: String  },
  topic:        { type: String  },
  questions:    { type: Number  },
  score:        { type: Number  },
  createdAt:    { type: Date    },
});

export = { name: 'Session', schema: session };