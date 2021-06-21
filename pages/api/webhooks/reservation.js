import axios from "axios";
import {
  API_TOKEN,
  GATHERUP_TOKEN,
  GATHERUP_CLIENT_ID,
  HQ_RENTAL_GATHERUP_LOCATION_MAP,
} from "../../../utils/constant";
import connectDB from "../../../utils/connect_db";

const handler = async (req, res) => {
  const { action, data } = req.body;

  try {
    if (action === "car_rental_reservation_completed") {
      const customerId = data.customer_id;
      const pickUpLocationId = data.pick_up_location_id;

      let response = await axios.get(
        `https://api-america-3.caagcrm.com/api-america-3/contacts/categories/3/contacts/${customerId}`,
        {
          headers: {
            Authorization: `Basic ${API_TOKEN}`,
          },
        }
      );

      if (response.data && response.data.contact) {
        const { email, phone_number, first_name, last_name } =
          response.data.contact;

        response = await axios.post(
          "https://app.gatherup.com/api/customers/get",
          {
            email,
            clientId: GATHERUP_CLIENT_ID,
          },
          {
            headers: {
              Authorization: `Bearer ${GATHERUP_TOKEN}`,
            },
          }
        );

        if (response.data && response.data.count > 0) {
          let customer = response.data;
          let expectedBusinessId =
            HQ_RENTAL_GATHERUP_LOCATION_MAP[pickUpLocationId];

          console.log(
            "CURRENT BUSINESS ID EXPECTED LOCATION",
            customer.businessId1,
            expectedBusinessId
          );

          if (Number(customer.businessId1) === expectedBusinessId) {
            response = await axios.post(
              "https://app.gatherup.com/api/customer/feedback/send",
              {
                customerId: customer.id1,
                clientId: GATHERUP_CLIENT_ID,
              },
              {
                headers: {
                  Authorization: `Bearer ${GATHERUP_TOKEN}`,
                },
              }
            );

            console.log("EXISTING CUSTOMER SEND REQUEST", customer);

            res.status(200).json({
              success: true,
            });
            return;
          }
        }

        response = await axios.post(
          "https://app.gatherup.com/api/customer/create",
          {
            businessId: HQ_RENTAL_GATHERUP_LOCATION_MAP[pickUpLocationId],
            customerEmail: email,
            customerFirstName: first_name,
            customerLastName: last_name,
            customerPhone: phone_number,
            sendFeedbackRequest: 1,
            clientId: GATHERUP_CLIENT_ID,
            customerPreference: "email",
          },
          {
            headers: {
              Authorization: `Bearer ${GATHERUP_TOKEN}`,
            },
          }
        );

        console.log("GATHER UP CREATE CUSTOMER", response.data);
        res.status(200).json({
          success: true,
        });
        return;
      }
    }

    res.status(404).send("Unfavorable action");
    return;
  } catch (e) {
    res.status(404).send("Server Error");
  }
};

export default connectDB(handler);
