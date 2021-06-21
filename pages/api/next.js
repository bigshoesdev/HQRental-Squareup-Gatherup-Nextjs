import axios from "axios";
import moment from "moment";
import { API_TOKEN } from "../../utils/constant";

export default async (req, res) => {
  switch (req.method) {
    case "POST":
      await handlePostRequest(req, res);
      break;
    default:
      res.status(405).send(`Method ${req.method} not allowed`);
      break;
  }
};

async function handlePostRequest(req, res) {
  let { id, date, firstName, lastName, email } = req.body;

  try {
    let { data } = await axios.get(
      `https://api-america-3.caagcrm.com/api-america-3/car-rental/reservations/${id}`,
      {
        headers: {
          Authorization: `Basic ${API_TOKEN}`,
        },
      }
    );

    if (data.success) {
      let reservationData = data.data;
      date = moment(date).format("YYYY-MM-DD");

      if (
        reservationData.reservation.pick_up_date.startsWith(date) &&
        reservationData.reservation.status === "open"
      ) {
        // Find Contact
        let { data } = await axios.get(
          `https://api-america-3.caagcrm.com/api-america-3/contacts/categories/3/contacts?filters=[{"type":"string","column":"first_name","operator":"contains","value":"${firstName}"},{"type":"string","column":"last_name","operator":"contains","value":"${lastName}"},{"type":"string","column":"email","operator":"contains","value":"${email}"}]`,
          {
            headers: {
              Authorization: `Basic ${API_TOKEN}`,
            },
          }
        );

        let customerId = "";
        if (data.data.length > 0) {
          customerId = data.data[0].id;
        } else {
          // Create contact
          let response = await axios.post(
            `https://api-america-3.caagcrm.com/api-america-3/contacts/categories/3/contacts`,
            {
              contact_entity: "person",
              field_9: email,
              field_2: firstName,
              field_3: lastName,
            },
            {
              headers: {
                Authorization: `Basic ${API_TOKEN}`,
              },
            }
          );

          customerId = response.data.contact.id;
        }

        // Associate the customer with the contact
        let response = await axios.post(
          `https://api-america-3.caagcrm.com/api-america-3/car-rental/reservations/${id}/update`,
          {
            customer_id: customerId,
          },
          {
            headers: {
              Authorization: `Basic ${API_TOKEN}`,
            },
          }
        );

        if (response.data.success) {
          let reservationData = response.data.data;
          res.status(200).json({
            success: true,
            link: reservationData.reservation.public_link.replace(
              "step1",
              "step3"
            ),
          });
          return;
        }
      }
    }

    res.status(200).json({
      success: false,
      message: "Failed to associate the customer info with the reservation.",
    });
  } catch (e) {
    console.log(e);
    res.status(200).json({
      success: false,
      message: "Failed to associate the customer info with the reservation.",
    });
    return;
  }
}
