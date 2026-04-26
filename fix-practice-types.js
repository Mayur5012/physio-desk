const mongoose = require('mongoose');
require('dotenv').config({path:'.env.local'});

async function fixData() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Fix all clients that have practiceType but no practiceTypes
  const result = await mongoose.connection.db.collection('clients').updateMany(
    { practiceTypes: { $exists: false } },
    [{ $set: { practiceTypes: { $cond: { if: { $ifNull: ["$practiceType", false] }, then: ["$practiceType"], else: [] } } } }]
  );
  console.log('Fixed', result.modifiedCount, 'clients without practiceTypes');

  // Also fix clients where practiceTypes exists but is empty
  const result2 = await mongoose.connection.db.collection('clients').updateMany(
    { practiceTypes: { $size: 0 }, practiceType: { $exists: true, $ne: null } },
    [{ $set: { practiceTypes: ["$practiceType"] } }]
  );
  console.log('Fixed', result2.modifiedCount, 'clients with empty practiceTypes');

  // Show all clients with their practiceTypes
  const clients = await mongoose.connection.db.collection('clients').find({}, { projection: { name: 1, practiceTypes: 1, practiceType: 1 } }).toArray();
  clients.forEach(c => {
    console.log(`  ${c.name}: practiceTypes=${JSON.stringify(c.practiceTypes)} | practiceType=${c.practiceType}`);
  });

  process.exit(0);
}

fixData().catch(e => { console.error(e); process.exit(1); });
