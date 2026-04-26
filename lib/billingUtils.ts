import Billing from "@/models/Billing";
import Client from "@/models/Client";
import mongoose from "mongoose";

/**
 * Auto-create billing entry when appointment status changes
 * Used when appointment moves to PRESENT status
 */
export async function createBillingFromAppointment(
  appointmentData: {
    doctorId: mongoose.Types.ObjectId;
    clientId: mongoose.Types.ObjectId;
    appointmentId: mongoose.Types.ObjectId;
    date: Date;
  }
) {
  try {
    // Check if billing already exists for this appointment
    const existingBilling = await Billing.findOne({
      appointmentId: appointmentData.appointmentId,
    });

    if (existingBilling) {
      return existingBilling;
    }

    // Get client to fetch session fee
    const client = await Client.findById(appointmentData.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    // Create billing entry
    const billing = new Billing({
      doctorId: appointmentData.doctorId,
      clientId: appointmentData.clientId,
      appointmentId: appointmentData.appointmentId,
      date: appointmentData.date,
      totalFee: client.sessionFee,
      amountPaid: 0,
      paymentMode: "CASH",
      status: "PENDING",
      notes: "Auto-created from appointment",
    });

    await billing.save();
    return billing;
  } catch (error) {
    console.error("Error creating auto-billing:", error);
    throw error;
  }
}

/**
 * Auto-create initial billing entry when a new client is registered
 */
export async function createInitialBillingForClient(
  doctorId: mongoose.Types.ObjectId,
  clientId: mongoose.Types.ObjectId,
  sessionFee: number
) {
  try {
    const billing = new Billing({
      doctorId,
      clientId,
      date: new Date(),
      totalFee: sessionFee,
      amountPaid: 0,
      paymentMode: "CASH",
      status: "PENDING",
      notes: "Initial billing entry for new client",
    });

    await billing.save();
    return billing;
  } catch (error) {
    console.error("Error creating initial billing:", error);
    throw error;
  }
}
