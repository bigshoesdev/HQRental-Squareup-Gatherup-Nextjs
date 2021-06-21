import { verifyToken } from "../../utils/auth";
import { Twilio } from "twilio";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  API_TOKEN,
} from "../../utils/constant";
import connectDB from "../../utils/connect_db";
import moment from "moment-timezone";
import axios from "axios";

const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const handler = async (req, res) => {
  await verifyToken(req);

  // const { sendSMSArray, isUpdatePickupTime, pickUpTime } = req.body;

  // const result = await client.incomingPhoneNumbers.list();
  // const errors = [];

  // const twilioNumbers = result.map((item) => item.phoneNumber.substr(1));

  // for (var i = 0; i < sendSMSArray.length; i++) {
  //   const reservation = sendSMSArray[i].reservation;
  //   const phone = sendSMSArray[i].phone;

  //   // Find Contact
  //   let { data } = await axios.get(
  //     `https://api-america-3.caagcrm.com/api-america-3/contacts/categories/3/contacts?filters=[{"type":"string","column":"field_8","operator":"equals","value":"${phone}"}]`,
  //     {
  //       headers: {
  //         Authorization: `Basic ${API_TOKEN}`,
  //       },
  //     }
  //   );

  //   let customerId = "";
  //   if (data?.data?.length > 0) {
  //     customerId = data.data[0].id;
  //   } else {
  //     // Create contact
  //     let response = await axios.post(
  //       `https://api-america-3.caagcrm.com/api-america-3/contacts/categories/3/contacts`,
  //       {
  //         contact_entity: "person",
  //         field_8: phone,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Basic ${API_TOKEN}`,
  //         },
  //       }
  //     );

  //     customerId = response.data?.contact?.id;
  //   }

  //   if (customerId) {
  //     // Associate the customer with the contact
  //     let response = await axios.post(
  //       `https://api-america-3.caagcrm.com/api-america-3/car-rental/reservations/${reservation.id}/update`,
  //       {
  //         customer_id: customerId,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Basic ${API_TOKEN}`,
  //         },
  //       }
  //     );

  //     console.log("Associate the customer", response.data);
  //     if (response.data?.success) {
  //       console.log("Sending SMS", phone);

  //       const msgObj = {
  //         from: twilioNumbers[i % twilioNumbers.length],
  //         to: phone,
  //         body: `Here is the link to complete your registration.\nhttps://hawaiian-style-rentals-sales.us5.hqrentals.app/public/car-rental/reservations/step3?id=${reservation.uuid}`,
  //       };

  //       await client.messages.create(msgObj);

  //       console.log("Sent SMS", phone);

  //       if (isUpdatePickupTime) {
  //         const URL = `https://api-america-3.caagcrm.com/api-america-3/car-rental/reservations/${reservation.id}/update`;
  //         const now = moment().tz("Pacific/Honolulu");

  //         now.add(pickUpTime, "minutes");

  //         const reservationPickUpDate = reservation.pick_up_date?.substr(0, 11);
  //         const reservationPickUpTime = now.format("HH:mm:00");

  //         console.log(
  //           `Update Pick up time: date: ${reservationPickUpDate} time: ${reservationPickUpTime}`
  //         );

  //         try {
  //           let { data } = await axios.post(
  //             URL,
  //             {
  //               pick_up_time: reservationPickUpTime,
  //               pick_up_date: reservationPickUpDate,
  //             },
  //             {
  //               headers: {
  //                 Authorization: `Basic ${API_TOKEN}`,
  //               },
  //             }
  //           );

  //           if (!data.success) {
  //             errors.push(
  //               `Reservation ${reservation.id}: ${data.errors.error_message}`
  //             );
  //           }
  //         } catch (e) {
  //           errors.push(`Reservation ${reservation.id}: ${e.toString()}`);
  //         }
  //       }
  //     }
  //   } else {
  //     errors.push(
  //       `Reservation ${reservation.id}: Could not associate the customer with the phone ${phone}`
  //     );
  //   }
  // }

  if (errors.length > 0) {
    return res.status(200).json({
      success: false,
      errors,
    });
  } else {
    return res.status(200).json({
      success: true,
      errors,
    });
  }
};

export default connectDB(handler);
