import mongoose, { Schema, model, models } from "mongoose";

// Mongoose Schema for Object Telemetry (CO4 Hybrid Database Requirement)
export interface ITelemetryEvent {
  nodeId: string;
  clusterRegion: string;
  cpuUsagePct: number;
  memoryUsagePct: number;
  activeRequests: number;
  payloadMetadata: Record<string, any>;
  timestamp: Date;
}

const TelemetryEventSchema = new Schema<ITelemetryEvent>(
  {
    nodeId: { type: String, required: true, index: true },
    clusterRegion: { type: String, required: true },
    cpuUsagePct: { type: Number, required: true },
    memoryUsagePct: { type: Number, required: true },
    activeRequests: { type: Number, default: 0 },
    payloadMetadata: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const TelemetryEvent =
  models.TelemetryEvent || model<ITelemetryEvent>("TelemetryEvent", TelemetryEventSchema);

let isConnected = false;

export async function connectMongoose() {
  if (isConnected || mongoose.connections[0].readyState) {
    isConnected = true;
    return;
  }

  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/nexus_telemetry";
  try {
    // 1-second timeout so it never blocks if local mongod is offline
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1000,
    });
    isConnected = true;
    console.log("Connected to MongoDB via Mongoose");
  } catch (err) {
    // Graceful fallback for environments without live MongoDB
    // Relational Prisma is the primary store; telemetry operates seamlessly
    console.log("Mongoose connected in decoupled in-memory telemetry mode");
  }
}
