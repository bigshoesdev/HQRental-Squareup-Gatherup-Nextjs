import {
  API_TOKEN,
  SQUAREUP_ACCESS_TOKEN_PRODUCTION,
  SQUAREUP_ACCESS_TOKEN_SANDBOX,
  HQ_RENTAL_SQUAREUP_LOCATION_MAP,
} from "../../../utils/constant";
import { Client, Environment } from "square";
import connectDB from "../../../utils/connect_db";
import SquareUpTransaction from "../../../models/SquareupTransaction.js";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const isProduction = true;

const client = new Client({
  environment: isProduction ? Environment.Production : Environment.Sandbox,
  accessToken: isProduction
    ? SQUAREUP_ACCESS_TOKEN_PRODUCTION
    : SQUAREUP_ACCESS_TOKEN_SANDBOX,
});

const handler = async (req, res) => {
  const { data, action } = req.body;

  if (
    data.item_type === "car_rental.reservations" &&
    action === "updated" &&
    data.source === "web" &&
    data.status_description === "Payment Approved" &&
    data.credit_card_id // only card exists
  ) {
    const reservation_id = data.item_id;
    const amount = Number(data.amount);

    if (amount <= 0 || isNaN(amount)) {
      res.status(200).json({
        success: true,
      });
    }

    try {
      let { data } = await axios.get(
        `https://api-america-3.caagcrm.com/api-america-3/car-rental/reservations/${reservation_id}`,
        {
          headers: {
            Authorization: `Basic ${API_TOKEN}`,
          },
        }
      );

      // Getting HQ Rental Reservation Information
      if (data.data && data.data.reservation) {
        const pick_up_location_id = data.data.reservation.pick_up_location_id;
        console.log(
          `HQ Rental Stripe Payment: Reservation ID: ${reservation_id} Amount: ${amount} USD Location: ${pick_up_location_id}`
        );

        const square_location_id =
          HQ_RENTAL_SQUAREUP_LOCATION_MAP[pick_up_location_id];

        console.log(`Square Location ID ${square_location_id}`);

        let response = await client.paymentsApi.createPayment({
          sourceId: "EXTERNAL",
          idempotencyKey: uuidv4(),
          amountMoney: {
            amount: amount * 100,
            currency: "USD",
          },
          autocomplete: true,
          note: `${reservation_id}`,
          externalDetails: {
            type: "OTHER",
            source: "Stripe Payment in HQ",
          },
          locationId: square_location_id,
        });

        if (response.result && response.result.payment) {
          const payment = response.result.payment;
          console.log(
            `Payment Success Creation Payment Id: ${payment.id} Order Id: ${payment.orderId}`
          );

          let transaction = await SquareUpTransaction.create({
            order_id: payment.orderId,
            payment_id: payment.id,
            payment_type: "EXTERNAL",
            items: [
              {
                reservation_id,
                payment_id: "stripe-" + uuidv4(),
                amount,
              },
            ],
            location_id: square_location_id,
          });

          console.log(
            `Payment Success Saved Payment Id: ${payment.id} Order Id: ${payment.orderId} `
          );
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  res.status(200).json({
    success: true,
  });
};

export default connectDB(handler);
