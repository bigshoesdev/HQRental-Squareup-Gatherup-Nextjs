import axios from "axios";
import { verifyToken } from "../../utils/auth";
import { API_TOKEN } from "../../utils/constant";
import connectDB from "../../utils/connect_db";

const handler = async (req, res) => {
  await verifyToken(req);

  const { name, date } = req.body;
  const URL = `https://api-america-3.caagcrm.com/api-america-3/car-rental/reservations?filters=[{"type":"string","column":"customers.label","operator":"contains","value":"${name}"},{"type":"date","column":"pick_up_date","operator":"specific_date","value":"${date}"},{"type":"string","column":"status","operator":"equals","value":"open"}]`;

  try {
    let { data } = await axios.get(URL, {
      headers: {
        Authorization: `Basic ${API_TOKEN}`,
      },
    });

    let reservations = [];

    if (data.success) {
      reservations = data.data.map((item) => ({
        id: item.id,
        key: item.id,
        customer: {
          id: item.customer.id,
          name: item.customer.label,
          first_name: item.customer.first_name,
          last_name: item.customer.last_name,
          phone_number: item.customer.phone_number,
          email: item.customer.email,
        },
        vehicle_class: {
          id: item.vehicle_class.id,
          name: item.vehicle_class.name,
          image: item.vehicle_class.public_image_link,
        },
        uuid: item.uuid,
        pick_up_date: item.pick_up_date,
        return_date: item.return_date,
      }));
    }

    return res.status(200).json({
      success: true,
      reservations,
    });
  } catch (e) {
    console.log(e);
    res.status(200).json({
      success: false,
      message:
        "The reservations which has this customer name and pick up date does not exist.",
    });
    return;
  }
};

export default connectDB(handler);
