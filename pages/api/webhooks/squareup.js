import {
  API_TOKEN,
  SQUAREUP_ACCESS_TOKEN_PRODUCTION,
  SQUAREUP_ACCESS_TOKEN_SANDBOX,
} from "../../../utils/constant";
import { Client, Environment } from "square";
import connectDB from "../../../utils/connect_db";
import SquareUpTransaction from "../../../models/SquareupTransaction.js";
import axios from "axios";
import moment from "moment-timezone";
import FormData from "form-data";

const isProduction = true;

const client = new Client({
  environment: isProduction ? Environment.Production : Environment.Sandbox,
  accessToken: isProduction
    ? SQUAREUP_ACCESS_TOKEN_PRODUCTION
    : SQUAREUP_ACCESS_TOKEN_SANDBOX,
});

const ordersApi = client.ordersApi;

const handler = async (req, res) => {
  const { data, type } = req.body;

  try {
    if (type === "payment.updated" && data.type === "payment") {
      const payment = data.object.payment;

      if (payment.status === "COMPLETED") {
        const payment_id = payment.id;
        const order_id = payment.order_id;
        const source_type = payment.source_type;

        console.log(
          "SQUARE UP TRANSACTION Payment ID:",
          payment_id,
          "Payment Source Type:",
          source_type,
          "Order ID:",
          order_id
        );

        if (source_type === "EXTERNAL") {
          console.log("External Payment Exception");
          res.status(200).json({
            success: true,
          });
          return;
        }

        let transaction = await SquareUpTransaction.findOne({
          payment_id,
          order_id,
        });

        if (transaction) {
          console.log(
            `This transaction Payment ID: ${payment_id} Order ID: ${order_id} is already processed`
          );
          res.status(200).json({
            success: false,
            message: `This transaction Payment ID: ${payment_id} Order ID: ${order_id} is already processed`,
          });
          return;
        }

        transaction = await SquareUpTransaction.create({
          order_id,
          payment_id,
          payment_type: source_type,
          items: [],
        });

        const { result } = await ordersApi.retrieveOrder(order_id);

        const processedItems = [];
        if (result.order && result.order.lineItems.length > 0) {
          for (const lineItem of result.order.lineItems) {
            const reservation_id = Number(lineItem.note);

            if (reservation_id && !isNaN(reservation_id)) {
              const money = Number(lineItem.totalMoney.amount) / 100;
              const now = moment().tz("Pacific/Honolulu");
              console.log(
                "Reservation ID: ",
                reservation_id,
                "Money: ",
                money,
                "Current Time: ",
                now
              );

              const formData = new FormData();
              formData.append("field_32[day]", now.date());
              formData.append("field_32[month]", now.month() + 1);
              formData.append("field_32[year]", now.year());
              formData.append("field_37", "Approved");
              formData.append("field_34", money);
              formData.append("field_29", "payment");
              formData.append("field_35", "squareup");

              if (source_type === "CARD") {
                formData.append("field_31", "Credit Card");
              } else if (source_type === "CASH") {
                formData.append("field_31", "Cash");
              } else if (source_type === "EXTERNAL") {
                formData.append("field_31", "Credit Card");
              } else if (source_type === "GIFT_CARD") {
                formData.append("field_31", "Gift Card");
              }

              try {
                const { data } = await axios.post(
                  `https://api-america-3.caagcrm.com/api-america-3/car-rental/reservations/${reservation_id}/payments`,
                  formData,
                  {
                    headers: {
                      ...formData.getHeaders(),
                      Authorization: `Basic ${API_TOKEN}`,
                    },
                  }
                );

                if (data && data.success && data.data) {
                  console.log(
                    "Reservation ID: ",
                    reservation_id,
                    "Money: ",
                    money,
                    "Payment Id: ",
                    data.data.payment.id
                  );
                  processedItems.push({
                    reservation_id,
                    payment_id: data.data.payment.id,
                    amount: money,
                  });
                }
              } catch (e) {
                console.log(`Payment Creation Failed: ${e.toString()}`);
              }
            }
          }

          if (processedItems.length > 0) {
            transaction.items = processedItems;
            await transaction.save();

            console.log(`Payment Transaction Logged:`, {
              order_id,
              payment_id,
              payment_type: source_type,
              items: processedItems,
            });
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
  }

  res.status(200).json({
    success: true,
  });
};

export default connectDB(handler);
