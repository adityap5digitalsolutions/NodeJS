const dbConnect = require("./mongodb");

const insert = async () => {
  const db = await dbConnect();
  const result = await db.insertOne({
    name: "JBL Flip 6 Portable Speaker",
    brand: "JBL",
    price: 129.99,
    category: "Audio",
    stock: 100,
  });

  if (result.acknowledged) {
    console.log("data inserted");
  }
};

insert();
