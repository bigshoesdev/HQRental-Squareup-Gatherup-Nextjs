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
  let { id, date } = req.body;

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
      data = data.data;
      date = moment(date).format("YYYY-MM-DD");

      console.log(
        "Data Reservation Pick Up Date",
        data.reservation.pick_up_date
      );

      console.log("Date Reservation Date", date);

      if (
        data.reservation.pick_up_date.startsWith(date) &&
        data.reservation.status === "open"
      ) {
        res.status(200).json({
          success: true,
        });
        return;
      }
    }

    return res.status(200).json({
      success: false,
      message:
        "The reservation which has this number and pick up date does not exist.",
    });
  } catch (e) {
    console.log(e);
    res.status(200).json({
      success: false,
      message:
        "The reservation which has this number and pick up date does not exist.",
    });
    return;
  }
}
