/**
 * seed-batra.js
 * Run with: mongosh "your_connection_string" --file seed-batra.js
 *
 * Seeds 28 patients, ~5-10 appointments per day for 30 days,
 * sessions, and billings for Dr. Batra (69f41fe7d2081b397e895e3d)
 */

const DOCTOR_ID = ObjectId("69f41fe7d2081b397e895e3d");

// ─── Helpers ─────────────────────────────────────────────────────────────────
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function addDays(date, days) {
  var d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function timeFromSlot(slotIndex) {
  // Slots: 07:00, 08:00, 09:00, 10:00, 11:00, 12:00, 14:00, 15:00, 16:00, 17:00
  var slots = ["07:00","08:00","09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00"];
  return slots[slotIndex % slots.length];
}

function endTime(start, mins) {
  var parts = start.split(":").map(Number);
  var total = parts[0] * 60 + parts[1] + mins;
  return String(Math.floor(total/60)).padStart(2,"0") + ":" + String(total%60).padStart(2,"0");
}

// ─── Patient pool ─────────────────────────────────────────────────────────────
var patientDefs = [
  { name:"Ananya Kapoor",      age:28, gender:"FEMALE", phone:"9876540001", email:"ananya.kapoor@gmail.com",    chiefComplaint:"Chronic lower back pain",          bodyPart:"Lower Back",    practiceTypes:["PHYSIOTHERAPY"], diagnosis:"Lumbar disc herniation" },
  { name:"Rohit Sharma",       age:35, gender:"MALE",   phone:"9876540002", email:"rohit.sharma@gmail.com",     chiefComplaint:"Knee swelling post-surgery",       bodyPart:"Knee",          practiceTypes:["PHYSIOTHERAPY","NUTRITION"], diagnosis:"Post ACL repair" },
  { name:"Priya Mehta",        age:42, gender:"FEMALE", phone:"9876540003", email:"priya.mehta@gmail.com",      chiefComplaint:"Neck stiffness and headaches",     bodyPart:"Cervical Spine",practiceTypes:["PHYSIOTHERAPY"], diagnosis:"Cervical spondylosis" },
  { name:"Aditya Nair",        age:24, gender:"MALE",   phone:"9876540004", email:"aditya.nair@gmail.com",      chiefComplaint:"Shoulder pain after gym injury",   bodyPart:"Shoulder",      practiceTypes:["PHYSIOTHERAPY","ACUPRESSURE"], diagnosis:"Rotator cuff strain" },
  { name:"Sunita Desai",       age:55, gender:"FEMALE", phone:"9876540005", email:"sunita.desai@gmail.com",     chiefComplaint:"Hip replacement rehabilitation",   bodyPart:"Hip",           practiceTypes:["PHYSIOTHERAPY"], diagnosis:"Post total hip arthroplasty" },
  { name:"Karan Patel",        age:19, gender:"MALE",   phone:"9876540006", email:"karan.patel@gmail.com",      chiefComplaint:"Ankle sprain from cricket",        bodyPart:"Ankle",         practiceTypes:["PHYSIOTHERAPY","SPORTS_REHABILITATION"], diagnosis:"Grade 2 ankle sprain" },
  { name:"Deepika Singh",      age:33, gender:"FEMALE", phone:"9876540007", email:"deepika.singh@gmail.com",    chiefComplaint:"Wrist pain while typing",          bodyPart:"Wrist",         practiceTypes:["PHYSIOTHERAPY"], diagnosis:"Carpal tunnel syndrome" },
  { name:"Manish Gupta",       age:47, gender:"MALE",   phone:"9876540008", email:"manish.gupta@gmail.com",     chiefComplaint:"Persistent knee pain climbing stairs",bodyPart:"Knee",        practiceTypes:["PHYSIOTHERAPY","NUTRITION"], diagnosis:"Osteoarthritis grade 2" },
  { name:"Kavya Iyer",         age:31, gender:"FEMALE", phone:"9876540009", email:"kavya.iyer@gmail.com",       chiefComplaint:"Sciatica radiating to left leg",   bodyPart:"Lumbar Spine",  practiceTypes:["PHYSIOTHERAPY","ACUPRESSURE"], diagnosis:"L4-L5 disc bulge with sciatica" },
  { name:"Rajan Tiwari",       age:60, gender:"MALE",   phone:"9876540010", email:"rajan.tiwari@gmail.com",     chiefComplaint:"Frozen shoulder inability to raise arm",bodyPart:"Shoulder",  practiceTypes:["PHYSIOTHERAPY"], diagnosis:"Adhesive capsulitis" },
  { name:"Nisha Choudhary",    age:26, gender:"FEMALE", phone:"9876540011", email:"nisha.choudary@gmail.com",   chiefComplaint:"Plantar fasciitis heel pain",      bodyPart:"Heel",          practiceTypes:["PHYSIOTHERAPY"], diagnosis:"Plantar fasciitis" },
  { name:"Vikram Rao",         age:38, gender:"MALE",   phone:"9876540012", email:"vikram.rao@gmail.com",       chiefComplaint:"Tennis elbow pain gripping",       bodyPart:"Elbow",         practiceTypes:["PHYSIOTHERAPY","SPORTS_REHABILITATION"], diagnosis:"Lateral epicondylitis" },
  { name:"Pooja Bhatia",       age:29, gender:"FEMALE", phone:"9876540013", email:"pooja.bhatia@gmail.com",     chiefComplaint:"Postpartum lower back pain",       bodyPart:"Lower Back",    practiceTypes:["PHYSIOTHERAPY","WOMEN_HEALTH"], diagnosis:"Sacroiliac joint dysfunction" },
  { name:"Arjun Malhotra",     age:52, gender:"MALE",   phone:"9876540014", email:"arjun.malhotra@gmail.com",   chiefComplaint:"Neck pain post whiplash accident", bodyPart:"Cervical Spine",practiceTypes:["PHYSIOTHERAPY"], diagnosis:"Whiplash associated disorder" },
  { name:"Sneha Joshi",        age:36, gender:"FEMALE", phone:"9876540015", email:"sneha.joshi@gmail.com",      chiefComplaint:"Knee ligament pain after fall",    bodyPart:"Knee",          practiceTypes:["PHYSIOTHERAPY","NUTRITION"], diagnosis:"MCL sprain grade 1" },
  { name:"Amit Verma",         age:44, gender:"MALE",   phone:"9876540016", email:"amit.verma@gmail.com",       chiefComplaint:"Chronic shoulder impingement",     bodyPart:"Shoulder",      practiceTypes:["PHYSIOTHERAPY","ACUPRESSURE"], diagnosis:"Subacromial impingement" },
  { name:"Ritu Saxena",        age:49, gender:"FEMALE", phone:"9876540017", email:"ritu.saxena@gmail.com",      chiefComplaint:"Arthritis pain both hands",        bodyPart:"Hands",         practiceTypes:["PHYSIOTHERAPY"], diagnosis:"Rheumatoid arthritis" },
  { name:"Gaurav Pandey",      age:23, gender:"MALE",   phone:"9876540018", email:"gaurav.pandey@gmail.com",    chiefComplaint:"IT band syndrome runner",          bodyPart:"Knee",          practiceTypes:["PHYSIOTHERAPY","SPORTS_REHABILITATION"], diagnosis:"Iliotibial band syndrome" },
  { name:"Meera Krishnan",     age:40, gender:"FEMALE", phone:"9876540019", email:"meera.krishnan@gmail.com",   chiefComplaint:"Thoracic spine stiffness posture", bodyPart:"Thoracic Spine",practiceTypes:["PHYSIOTHERAPY"], diagnosis:"Thoracic kyphosis" },
  { name:"Suresh Agarwal",     age:65, gender:"MALE",   phone:"9876540020", email:"suresh.agarwal@gmail.com",   chiefComplaint:"Balance issues and gait problems", bodyPart:"Lower Limb",    practiceTypes:["PHYSIOTHERAPY","NEUROLOGICAL_REHAB"], diagnosis:"Post-stroke gait rehabilitation" },
  { name:"Pallavi Reddy",      age:32, gender:"FEMALE", phone:"9876540021", email:"pallavi.reddy@gmail.com",    chiefComplaint:"Pelvic pain during pregnancy",     bodyPart:"Pelvis",        practiceTypes:["PHYSIOTHERAPY","WOMEN_HEALTH"], diagnosis:"SPD symphysis pubis dysfunction" },
  { name:"Sanjay Kulkarni",    age:41, gender:"MALE",   phone:"9876540022", email:"sanjay.kulkarni@gmail.com",  chiefComplaint:"Elbow pain after fracture healed", bodyPart:"Elbow",         practiceTypes:["PHYSIOTHERAPY"], diagnosis:"Post elbow fracture rehab" },
  { name:"Tanya Bose",         age:27, gender:"FEMALE", phone:"9876540023", email:"tanya.bose@gmail.com",       chiefComplaint:"Chronic neck headaches screen time",bodyPart:"Cervical Spine",practiceTypes:["PHYSIOTHERAPY","ACUPRESSURE"], diagnosis:"Tension-type headache with neck dysfunction" },
  { name:"Harish Kumar",       age:57, gender:"MALE",   phone:"9876540024", email:"harish.kumar@gmail.com",     chiefComplaint:"Low back pain radiating to thigh", bodyPart:"Lower Back",    practiceTypes:["PHYSIOTHERAPY"], diagnosis:"Lumbar facet joint arthropathy" },
  { name:"Divya Pillai",       age:34, gender:"FEMALE", phone:"9876540025", email:"divya.pillai@gmail.com",     chiefComplaint:"Patellofemoral pain running",      bodyPart:"Knee",          practiceTypes:["PHYSIOTHERAPY","SPORTS_REHABILITATION"], diagnosis:"Patellofemoral pain syndrome" },
  { name:"Rajesh Bhattacharya",age:50, gender:"MALE",   phone:"9876540026", email:"rajesh.bhatt@gmail.com",     chiefComplaint:"Spinal stenosis leg numbness",     bodyPart:"Lumbar Spine",  practiceTypes:["PHYSIOTHERAPY"], diagnosis:"Lumbar spinal stenosis" },
  { name:"Lakshmi Venkat",     age:38, gender:"FEMALE", phone:"9876540027", email:"lakshmi.venkat@gmail.com",   chiefComplaint:"Neck and trapezius muscle pain",   bodyPart:"Neck",          practiceTypes:["PHYSIOTHERAPY","ACUPRESSURE"], diagnosis:"Upper cross syndrome" },
  { name:"Varun Singh",        age:30, gender:"MALE",   phone:"8505890185", email:"varun@gmail.com",            chiefComplaint:"Knee pain",                        bodyPart:"Knee",          practiceTypes:["PHYSIOTHERAPY","NUTRITION","COUNSELING"], diagnosis:"None" },
];

var PRACTICE_TYPES = ["PHYSIOTHERAPY","ACUPRESSURE","SPORTS_REHABILITATION","NUTRITION","WOMEN_HEALTH","NEUROLOGICAL_REHAB","COUNSELING"];
var TECHNIQUES_MAP = {
  PHYSIOTHERAPY:       ["Ultrasound","TENS","IFT","SWD","Manual Therapy","Dry Needling","Traction","Exercise Therapy","Hot Pack","Cold Pack"],
  ACUPRESSURE:         ["Acupressure","Cupping","Dry Needling","Moxibustion","Gua Sha"],
  SPORTS_REHABILITATION:["Taping","Foam Rolling","Strength Training","Plyometrics","Sport-Specific Drills"],
  NUTRITION:           ["Dietary Assessment","Meal Planning","Supplement Guidance","Hydration Counseling"],
  WOMEN_HEALTH:        ["Pelvic Floor Exercise","Breathing Techniques","Postural Correction","Core Strengthening"],
  NEUROLOGICAL_REHAB:  ["Bobath Technique","PNF","Balance Training","Gait Training","Mirror Therapy"],
  COUNSELING:          ["CBT","Relaxation Techniques","Goal Setting","Mindfulness"],
};
var REFERRALS = ["WORD_OF_MOUTH","SOCIAL_MEDIA","DOCTOR_REFERRAL","ONLINE_SEARCH","OTHER"];
var BODY_SIDES = ["LEFT","RIGHT","BOTH"];
var PAYMENT_MODES = ["CASH","UPI","CARD","BANK_TRANSFER"];
var STATUSES_APPT = ["SCHEDULED","PRESENT","PRESENT","PRESENT","ABSENT","NO_SHOW"];
var PROGRESS_TYPES = ["IMPROVING","IMPROVING","IMPROVING","STABLE","WORSENING"];

// ─── 1. Insert Clients ────────────────────────────────────────────────────────
print("\n🏥 Inserting 28 patients...");

var clientIds = [];
var existingClient = ObjectId("69f420c6d2081b397e895ea9"); // Varun Singh already exists

patientDefs.forEach(function(p, i) {
  // Skip Varun Singh who already exists
  if (p.phone === "8505890185") {
    clientIds.push(existingClient);
    return;
  }

  var now = new Date();
  var createdAt = addDays(now, -rand(10, 90)); // registered 10-90 days ago

  var client = {
    doctorId: DOCTOR_ID,
    name: p.name,
    age: p.age,
    gender: p.gender,
    phone: p.phone,
    phoneCode: "IN",
    email: p.email,
    address: pick(["Sector 14, Faridabad","DLF Phase 3, Gurugram","Rohini, Delhi","Lajpat Nagar, Delhi","Noida Sector 62","Dwarka, Delhi","Vasant Kunj, Delhi","Green Park, Delhi"]),
    emergencyContact: "98765" + String(rand(10000,99999)),
    referralSource: pick(REFERRALS),
    chiefComplaint: p.chiefComplaint,
    bodyPart: p.bodyPart,
    bodySide: pick(BODY_SIDES),
    medicalHistory: pick(["None","Hypertension on medication","Diabetes Type 2","Previous knee surgery 2019","Asthma controlled","No significant history","Thyroid disorder"]),
    diagnosis: p.diagnosis,
    practiceTypes: p.practiceTypes,
    clientType: pick(["NEW","REGULAR","ONE_TIME","NEW","REGULAR"]),
    status: pick(["ACTIVE","ACTIVE","ACTIVE","ACTIVE","INACTIVE"]),
    totalSessionsPlanned: rand(6, 20),
    sessionFee: pick([500, 700, 800, 1000, 1200, 1500]),
    reminderEnabled: Math.random() > 0.15,
    documents: [],
    createdAt: createdAt,
    updatedAt: createdAt,
  };

  var result = db.clients.insertOne(client);
  clientIds.push(result.insertedId);
});

print("✅ " + clientIds.length + " clients ready.");

// ─── 2. Insert Appointments (~5-10 per day for past 30 days + next 14 days) ──
print("\n📅 Inserting appointments...");

var today = new Date();
today.setHours(0,0,0,0);
var allAppointments = [];

// Go from -30 days to +14 days
for (var dayOffset = -30; dayOffset <= 14; dayOffset++) {
  var apptDate = addDays(today, dayOffset);
  apptDate.setHours(0,0,0,0);

  var slotsPerDay = rand(5, 10);
  var usedSlots = [];

  for (var slotIdx = 0; slotIdx < slotsPerDay; slotIdx++) {
    // Pick a slot that isn't used yet
    var startHour;
    var attempts = 0;
    do {
      startHour = pick([7,8,9,10,11,12,14,15,16,17,18]);
      attempts++;
    } while (usedSlots.indexOf(startHour) !== -1 && attempts < 20);
    usedSlots.push(startHour);

    var startStr = String(startHour).padStart(2,"0") + ":00";
    var dur = pick([30,45,60,60,60,90]);
    var endStr = endTime(startStr, dur);

    var clientId = clientIds[rand(0, clientIds.length - 1)];
    var isRecurring = Math.random() > 0.6;
    var apptType = pick(["NEW_CONSULTATION","FOLLOWUP","FOLLOWUP","FOLLOWUP","ONE_TIME"]);
    var practiceType = pick(PRACTICE_TYPES);

    // Determine status based on day
    var status;
    if (dayOffset < 0) {
      // past appointments - some completed, some no-show
      status = pick(["PRESENT","PRESENT","PRESENT","ABSENT","NO_SHOW","CANCELLED"]);
    } else if (dayOffset === 0) {
      status = pick(["SCHEDULED","PRESENT","PRESENT"]);
    } else {
      status = "SCHEDULED";
    }

    var appt = {
      doctorId: DOCTOR_ID,
      clientId: clientId,
      date: apptDate,
      startTime: startStr,
      endTime: endStr,
      durationMins: dur,
      type: apptType,
      status: status,
      practiceType: practiceType,
      isRecurring: isRecurring,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isRecurring) {
      var pattern = pick(["DAILY","EVERY_N_DAYS","EVERY_N_DAYS"]);
      appt.recurrenceGroupId = uuid();
      appt.recurrencePattern = pattern;
      if (pattern === "EVERY_N_DAYS") appt.recurrenceEveryN = pick([2,3,7]);
      // Create 3-5 recurring instances spread out
      var recurCount = rand(3, 5);
      var interval = appt.recurrenceEveryN || 1;
      for (var ri = 0; ri < recurCount; ri++) {
        var recurDate = addDays(apptDate, ri * interval);
        recurDate.setHours(0,0,0,0);
        var recurStatus = (recurDate < today) ? pick(["PRESENT","PRESENT","ABSENT"]) : "SCHEDULED";
        allAppointments.push({
          doctorId: DOCTOR_ID,
          clientId: clientId,
          date: recurDate,
          startTime: startStr,
          endTime: endStr,
          durationMins: dur,
          type: apptType,
          status: recurStatus,
          practiceType: practiceType,
          isRecurring: true,
          recurrenceGroupId: appt.recurrenceGroupId,
          recurrencePattern: pattern,
          recurrenceEveryN: appt.recurrenceEveryN,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } else {
      allAppointments.push(appt);
    }
  }
}

if (allAppointments.length > 0) {
  var apptResult = db.appointments.insertMany(allAppointments);
  var apptIds = Object.values(apptResult.insertedIds);
  print("✅ " + apptIds.length + " appointments inserted.");
} else {
  var apptIds = [];
  print("⚠️ No appointments generated.");
}

// ─── 3. Insert Sessions (for PRESENT appointments) ───────────────────────────
print("\n📋 Inserting sessions...");

var sessionDocs = [];
// Track session numbers per client
var sessionCountMap = {};

// Find all PRESENT appointments to create sessions for
var presentAppts = db.appointments.find({ doctorId: DOCTOR_ID, status: "PRESENT" }).toArray();
print("   Found " + presentAppts.length + " PRESENT appointments to create sessions for...");

presentAppts.forEach(function(appt) {
  var cid = appt.clientId.toString();
  if (!sessionCountMap[cid]) sessionCountMap[cid] = 0;
  sessionCountMap[cid]++;

  var practiceType = appt.practiceType;
  var techniques = TECHNIQUES_MAP[practiceType] || TECHNIQUES_MAP.PHYSIOTHERAPY;
  var numTechniques = rand(1, 3);
  var selectedTechniques = [];
  for (var t = 0; t < numTechniques; t++) {
    var tech = pick(techniques);
    if (selectedTechniques.indexOf(tech) === -1) selectedTechniques.push(tech);
  }

  var painBefore = rand(4, 9);
  var painAfter = Math.max(0, painBefore - rand(1, 4));
  var progress = painAfter < painBefore ? "IMPROVING" : (painAfter === painBefore ? "STABLE" : "WORSENING");

  sessionDocs.push({
    doctorId: DOCTOR_ID,
    clientId: appt.clientId,
    appointmentId: appt._id,
    sessionNumber: sessionCountMap[cid],
    practiceType: practiceType,
    techniquesUsed: selectedTechniques,
    bodyAreaTreated: pick(["Lumbar Spine","Cervical Spine","Knee","Shoulder","Elbow","Ankle","Hip","Wrist","Thoracic Spine","Pelvis"]),
    bodySide: pick(BODY_SIDES),
    durationMins: appt.durationMins,
    painBefore: painBefore,
    painAfter: painAfter,
    subjective: pick([
      "Patient reports reduced pain compared to last session.",
      "Mild discomfort during treatment, tolerated well.",
      "Significant improvement in range of motion reported.",
      "Patient compliant with home exercise programme.",
      "Pain levels same as previous visit.",
      "Patient reports stiffness worse in the morning.",
    ]),
    objective: pick([
      "ROM improved by 15 degrees. MMT 4/5.",
      "Tenderness on palpation reduced. SLR negative.",
      "Joint line tenderness present. Swelling reduced 50%.",
      "Full weight bearing achieved. Gait normalized.",
      "Postural alignment improved. Core activation present.",
    ]),
    assessment: pick([
      "Responding well to physiotherapy. Continue current plan.",
      "Slow but steady progress. Adjust exercises.",
      "Plateau reached. Intensify strength programme.",
      "Excellent progress. Discharge planning in 2 sessions.",
      "Functional goals achieved. Home programme initiated.",
    ]),
    plan: pick([
      "Continue 3x per week. Add strengthening in next session.",
      "Reduce to 2x per week. Continue HEP.",
      "Progress to sports-specific drills next session.",
      "Discharge after 2 more sessions if maintained.",
      "Review in 1 week. Consider orthopaedic referral.",
    ]),
    progress: progress,
    privateNote: Math.random() > 0.7 ? pick(["Patient seems anxious about recovery timeline. Reassured.","Very motivated patient. Good compliance.","Family member accompanied. Educated caregiver as well."]) : "",
    createdAt: appt.date,
    updatedAt: appt.date,
  });
});

if (sessionDocs.length > 0) {
  db.sessions.insertMany(sessionDocs);
  print("✅ " + sessionDocs.length + " sessions inserted.");
}

// ─── 4. Insert Billings (one per client, some with partial payments) ──────────
print("\n💳 Inserting billing records...");

var billingDocs = [];

clientIds.forEach(function(cid) {
  // Find the client's session fee
  var client = db.clients.findOne({ _id: cid, doctorId: DOCTOR_ID });
  if (!client) return;

  var sessionFee = client.sessionFee || 1000;
  var totalSessions = client.totalSessionsPlanned || 10;
  var totalFee = sessionFee * totalSessions;
  var taxPct = pick([0, 0, 5, 18]); // mostly no tax for clinics
  var taxAmt = Math.round((totalFee * taxPct) / 100);
  var isPaid = Math.random();
  var amountPaid, status;
  if (isPaid > 0.6) {
    amountPaid = totalFee + taxAmt;
    status = "PAID";
  } else if (isPaid > 0.3) {
    amountPaid = Math.round((totalFee + taxAmt) * (rand(20, 70) / 100));
    status = "PARTIAL";
  } else {
    amountPaid = 0;
    status = "PENDING";
  }

  var billingDate = client.createdAt || new Date();
  billingDocs.push({
    doctorId: DOCTOR_ID,
    clientId: cid,
    date: billingDate,
    totalFee: totalFee,
    taxPercentage: taxPct,
    taxAmount: taxAmt,
    amountPaid: amountPaid,
    paymentMode: pick(PAYMENT_MODES),
    status: status,
    notes: pick([
      "Initial billing entry for new client",
      "Package deal for 10 sessions",
      "Advance payment received",
      "Billing for physiotherapy course",
      "",
    ]),
    includeClinicBranding: true,
    createdAt: billingDate,
    updatedAt: billingDate,
  });
});

if (billingDocs.length > 0) {
  db.billings.insertMany(billingDocs);
  print("✅ " + billingDocs.length + " billing records inserted.");
}

// ─── Summary ─────────────────────────────────────────────────────────────────
print("\n🎉 Seed complete for Dr. Batra!");
print("   Clients  : " + db.clients.countDocuments({ doctorId: DOCTOR_ID }));
print("   Appointments: " + db.appointments.countDocuments({ doctorId: DOCTOR_ID }));
print("   Sessions : " + db.sessions.countDocuments({ doctorId: DOCTOR_ID }));
print("   Billings : " + db.billings.countDocuments({ doctorId: DOCTOR_ID }));
