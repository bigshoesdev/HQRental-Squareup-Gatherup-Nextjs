import axios from "axios";
import styles from "../styles/home.module.scss";
import { useState } from "react";
import {
  Button,
  Form,
  DatePicker,
  Input,
  Spin,
  Radio,
} from "antd";
import moment from "moment";
import { showNotification } from "../utils";

export default function Home() {
  const [reservationID, setReservationID] = useState("");
  const [reservationPickupDate, setReservationPickupDate] = useState("");
  const [reservationSelectValue, setReservationSelectValue] = useState(1);
  const [customerInputView, setCustomerInputView] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function findReservation(e) {
    e.preventDefault();

    if (!reservationID) {
      showNotification("Please input confirmation number.");
      return;
    }

    if (!reservationPickupDate) {
      showNotification("Please input reservation pick-up date.");
      return;
    }

    setLoading(true);

    const url = `/api/reservation`;
    const payload = {
      id: reservationID,
      date: moment(reservationPickupDate).format("YYYY-MM-DD"),
    };
    const { data } = await axios.post(url, payload);

    setLoading(false);

    if (data.success) {
      setCustomerInputView(true);
    } else {
      showNotification(data.message);
    }
  }

  async function next(e) {
    e.preventDefault();

    if (!firstName) {
      showNotification("Please input first name.");
      return;
    }

    if (!lastName) {
      showNotification("Please input last name.");
      return;
    }

    if (!email) {
      showNotification("Please input email.");
      return;
    }

    const url = `/api/next`;
    const payload = {
      id: reservationID,
      date: moment(reservationPickupDate).format("YYYY-MM-DD"),
      firstName,
      lastName,
      email,
    };

    setLoading(true);

    const { data } = await axios.post(url, payload);

    setLoading(false);

    if (data.success) {
      location.replace(data.link);
    } else {
      showNotification(data.message);
    }
  }

  return (
    <div id={styles.booking} className={styles.section}>
      <div className={styles.sectionCenter}>
        <div className="container">
          <div className="row">
            <div className="col-md-7 col-md-push-5">
              <div className={styles.bookingCTA}>
                <h1>
                  {reservationSelectValue == 0
                    ? "Complete your registration"
                    : "Register Now"}
                </h1>
              </div>
            </div>
            <div className="col-md-4 col-md-pull-7">
              <Spin size="large" spinning={loading}>
                <div className={styles.bookingForm}>
                  {!customerInputView && (
                    <Form layout="vertical">
                      <Radio.Group
                        size="large"
                        onChange={(e) =>
                          setReservationSelectValue(e.target.value)
                        }
                        value={reservationSelectValue}
                      >
                        <Radio
                          value={0}
                          style={{
                            marginTop: "1em",
                            marginRight: "2em",
                            marginBottom: "2em",
                          }}
                        >
                          SELECT
                        </Radio>
                        <Radio size="large" value={1}>
                          NEW REGISTRATION
                        </Radio>
                      </Radio.Group>
                      {reservationSelectValue == 0 && (
                        <Form.Item label="CONFIRMATION NUMBER:">
                          <Input
                            type="number"
                            size="large"
                            min={1}
                            max={100000}
                            style={{ width: "100%" }}
                            value={reservationID}
                            onChange={(e) => setReservationID(e.target.value)}
                            placeholder="Confirmation Number"
                          />
                        </Form.Item>
                      )}
                      {reservationSelectValue == 0 && (
                        <Form.Item label="PICK-UP DATE:">
                          <DatePicker
                            size="large"
                            style={{ width: "100%" }}
                            value={reservationPickupDate}
                            onChange={(value) =>
                              setReservationPickupDate(value)
                            }
                            placeholder="Pick-up Date"
                          />
                        </Form.Item>
                      )}
                      {reservationSelectValue == 0 && (
                        <div className="form-btn">
                          <Button
                            style={{ width: "100%" }}
                            type="submit"
                            onClick={findReservation}
                            size="large"
                            type="primary"
                          >
                            FIND MY RESERVATION
                          </Button>
                        </div>
                      )}
                      {reservationSelectValue == 1 && (
                        <Button
                          size="large"
                          type="primary"
                          onClick={() =>
                            window.location.replace(
                              "https://hawaiian-style-rentals-sales.us5.hqrentals.app/public/car-rental/reservations/step1?new=1&brand=d60c23e8-f56d-48f2-bb40-377c42e38238&pick_up_location=1"
                            )
                          }
                          style={{ width: "100%" }}
                        >
                          Lemon Road
                        </Button>
                      )}
                      {reservationSelectValue == 1 && (
                        <Button
                          danger
                          size="large"
                          type="primary"
                          style={{ width: "100%", marginTop: "1em" }}
                          onClick={() =>
                            window.location.replace(
                              "https://hawaiian-style-rentals-sales.us5.hqrentals.app/public/car-rental/reservations/step1?new=1&brand=d60c23e8-f56d-48f2-bb40-377c42e38238&pick_up_location=2"
                            )
                          }
                        >
                          Uluniu Avenue
                        </Button>
                      )}
                    </Form>
                  )}
                  {customerInputView && (
                    <Form layout="vertical">
                      <Form.Item label="FIRST NAME:">
                        <Input
                          size="large"
                          style={{ width: "100%" }}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First Name"
                        />
                      </Form.Item>
                      <Form.Item label="LAST NAME:">
                        <Input
                          size="large"
                          style={{ width: "100%" }}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last Name"
                        />
                      </Form.Item>
                      <Form.Item label="EMAIL:">
                        <Input
                          type="email"
                          size="large"
                          style={{ width: "100%" }}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email"
                        />
                      </Form.Item>
                      <div className="form-btn">
                        <Button
                          style={{ width: "100%" }}
                          type="submit"
                          onClick={next}
                          size="large"
                          type="primary"
                        >
                          NEXT
                        </Button>
                      </div>
                    </Form>
                  )}
                </div>
              </Spin>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
