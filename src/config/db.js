const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connecté: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error("Erreur MongoDB:", err);
    });
  } catch (error) {
    console.error("Erreur de connexion MongoDB:", error.message);
    process.exit(1);
  }
};

if (process.env.NODE_ENV === "development") {
  mongoose.set("debug", true); // Logs détaillés des requêtes MongoDB
}

module.exports = connectDB;
