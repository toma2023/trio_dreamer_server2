/** @format */

const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const corsConfig = {
	origin: "*",
	credentials: true,
	methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
};
//middleware
app.use(cors(corsConfig));
app.options("", cors(corsConfig));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hgsaz0s.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
	
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		//await client.connect();

		const productsCollections = client
			.db("trioDream")
			.collection("products");

		//get allProducts
		app.get("/allProducts", async (req, res) => {
			const result = await productsCollections.find().toArray();
			res.send(result);
		});

		// latestProducts
		app.get("/latest_products", async (req, res) => {
			// Calculate the date 30 days ago from the current date
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			const latestProducts = await productsCollections
				.find({
					submission_date: {
						$gte: thirtyDaysAgo.toISOString().split("T")[0],
					},
				})
				.sort({ submission_date: -1 })
				.limit(10) // You can adjust the limit as needed
				.toArray();

			res.send(latestProducts);
		});

		//single product
		app.get("/singleProduct/:id", async (req, res) => {
			const id = req.params.id;

			// Check if the id is a valid ObjectId before using it
			if (!ObjectId.isValid(id)) {
				return res
					.status(400)
					.send({ error: true, message: "Invalid ObjectId" });
			}

			const query = { _id: new ObjectId(id) };
			const result = await productsCollections.findOne(query);
			res.send(result);
		});

		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		//await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("Trio Dreamer  is running");
});

app.listen(port, () => {
	console.log(`Trio Dreamer is running on port ${port}`);
});
