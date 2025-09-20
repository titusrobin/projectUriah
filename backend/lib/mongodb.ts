import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;
export default clientPromise;