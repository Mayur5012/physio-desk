const mongoose = require('mongoose');
require('dotenv').config({path:'.env.local'});

async function testCreate() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Import the fixed model
  const { Schema } = mongoose;
  
  // Recreate schema to test
  if (mongoose.models.Client) delete mongoose.models.Client;
  
  const ClientSchema = new Schema({
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], required: true },
    phone: { type: String, required: true },
    chiefComplaint: { type: String, required: true },
    practiceTypes: { type: [String], default: [] },
    practiceType: { type: String },
    clientType: { type: String, default: "NEW" },
    status: { type: String, default: "ACTIVE" },
    sessionFee: { type: Number, default: 0 },
    reminderEnabled: { type: Boolean, default: true },
    bodyPart: { type: String },
    bodySide: { type: String, default: "BOTH" },
  }, { timestamps: true, strict: false });
  
  const Client = mongoose.model("Client", ClientSchema);

  // Get a valid doctorId from existing records
  const existingClient = await mongoose.connection.db.collection('clients').findOne({});
  if (!existingClient) {
    console.log("No existing clients found!");
    process.exit(1);
  }
  
  const testDoc = await Client.create({
    doctorId: existingClient.doctorId,
    name: "TEST_MULTI_SERVICE",
    age: 30,
    gender: "MALE",
    phone: "9999999999",
    chiefComplaint: "Testing multi-service",
    practiceTypes: ["PSYCHIATRY", "DERMATOLOGY", "ORTHOPEDIC"],
    practiceType: "PSYCHIATRY",
    bodyPart: "Test",
  });

  console.log("Created test doc:");
  console.log("  name:", testDoc.name);
  console.log("  practiceTypes:", JSON.stringify(testDoc.practiceTypes));
  console.log("  practiceType:", testDoc.practiceType);

  // Verify from raw MongoDB
  const raw = await mongoose.connection.db.collection('clients').findOne({ name: "TEST_MULTI_SERVICE" });
  console.log("\nRaw MongoDB:");
  console.log("  practiceTypes:", JSON.stringify(raw.practiceTypes));
  console.log("  practiceType:", raw.practiceType);
  
  // Cleanup
  await Client.deleteOne({ name: "TEST_MULTI_SERVICE" });
  console.log("\nTest doc cleaned up.");
  
  process.exit(0);
}

testCreate().catch(e => { console.error(e); process.exit(1); });
