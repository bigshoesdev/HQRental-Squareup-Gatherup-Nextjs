import mongoose from "mongoose";

const SquareupTransactionSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      unqiue: true,
      required: true,
    },
    payment_id: {
      type: String,
      unqiue: true,
      required: true,
    },
    payment_type: {
      type: String,
      enum: ["CASH", "CARD", "EXTERNAL"],
      required: true,
    },
    items: [
      {
        reservation_id: {
          type: String,
        },
        payment_id: {
          type: String,
        },
        amount: {
          type: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
    collection: "transactions",
  }
);

export default mongoose.models.SquareupTransaction ||
  mongoose.model("SquareupTransaction", SquareupTransactionSchema);
