import { Card, Row, Input, Col, DatePicker, Spin, Table, Button } from "antd";
import Column from "antd/lib/table/Column";
import axios from "axios";
import moment from "moment";
import { useState } from "react";
import cookie from "js-cookie";
import styles from "../styles/admin-reservations.module.scss";
import baseUrl from "../utils/baseUrl";
import { isUnique, showNotification } from "../utils";
import Modal from "antd/lib/modal/Modal";
import PhoneInput from "react-phone-input-2";
import Checkbox from "antd/lib/checkbox/Checkbox";

const { Search } = Input;

const dateFormat = "YYYY-MM-DD";

export default function AdminReservations() {
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState(moment());
  const [selReservationIds, setSelReservationIds] = useState([]);
  const [selReservationPhones, setSelReservationPhones] = useState({});
  const [isSendReservationModal, setIsSendReservationModal] = useState(false);
  const [sendReservationLoading, setSendReservationLoading] = useState(false);
  const [isUpdatePickupTime, setIsUpdatePIckupTime] = useState(true);
  const [pickUpTime, setPickupTime] = useState(30);

  const onSearch = async (value) => {
    if (value) {
      const token = cookie.get("token");
      const headers = { headers: { Authorization: token } };
      const url = `${baseUrl}/api/reservation-search`;

      setSelReservationIds([]);
      setSelReservationPhones({});
      setLoading(true);

      try {
        const { data } = await axios.post(
          url,
          {
            date: date.format(dateFormat),
            name: value,
          },
          headers
        );

        setReservations(data.reservations);
      } catch (e) {
        setReservations([]);
      }

      setLoading(false);
    }
  };

  const onDateChange = async (date) => {
    setDate(date);
  };

  const onSelectChange = (selectedRowKeys) => {
    setSelReservationIds(selectedRowKeys);
  };

  const sendReservation = () => {
    if (selReservationIds.length > 0) {
      setIsSendReservationModal(true);
    }
  };

  const sendSMS = async () => {
    if (Object.keys(selReservationPhones).length === 0) {
      showNotification("Please input phone numbers on the reservation.");
      return;
    }

    if (selReservationIds.length === Object.keys(selReservationPhones).length) {
      const phones = Object.values(selReservationPhones);

      if (!isUnique(phones)) {
        showNotification(
          "You have input duplicate phones. Please input unique phone."
        );
        return;
      }

      const sendSMSArray = [];

      for (const [reservationID, phone] of Object.entries(
        selReservationPhones
      )) {
        const reservation = reservations.find(
          (reservation) => reservation.id == reservationID
        );

        if (reservation) {
          sendSMSArray.push({
            phone,
            reservation: {
              id: reservation.id,
              uuid: reservation.uuid,
              pick_up_date: reservation.pick_up_date,
              return_date: reservation.return_date,
              customer: reservation.customer,
            },
          });
        }
      }

      try {
        const url = `${baseUrl}/api/reservation-sms`;

        const token = cookie.get("token");
        const headers = { headers: { Authorization: token } };

        setSendReservationLoading(true);

        const { data } = await axios.post(
          url,
          {
            sendSMSArray,
            isUpdatePickupTime,
            pickUpTime,
          },
          headers
        );

        if (data.success) {
          setSelReservationIds([]);
          setSelReservationPhones({});
          setIsSendReservationModal(false);
        } else {
          showNotification(data.errors.join("\n"));
        }
      } catch (e) {
        console.log(e);
      }

      setSendReservationLoading(false);
    }
  };

  const rowSelection = {
    selectedRowKeys: selReservationIds,
    onChange: onSelectChange,
  };

  const renderSendReservationTable = () => {
    const selectedReservations = reservations.filter((reservation) =>
      selReservationIds.includes(reservation.id)
    );

    return (
      <Table
        dataSource={selectedReservations}
        style={{ width: "100%" }}
        style={{ minHeight: "50vh" }}
        scroll={{ y: "50vh" }}
      >
        <Column width="15%" title="ID" dataIndex="id" key="id" align="center" />
        <Column
          title="Bike Class"
          dataIndex="id"
          key="vehicle_class"
          align="center"
          width="30%"
          render={(value, row, index) => `${row.vehicle_class.name}`}
        />
        <Column
          title="Phone"
          dataIndex="phone"
          key="phone"
          align="center"
          render={(value, row, index) => (
            <PhoneInput
              country={"us"}
              value={selReservationPhones[row.id]}
              onChange={(phone) => {
                selReservationPhones[row.id] = `${phone}`;
                setSelReservationPhones(selReservationPhones);
              }}
            />
          )}
        />
      </Table>
    );
  };

  return (
    <div id={styles.reservation} className={styles.section}>
      <Modal
        width={700}
        destroyOnClose={true}
        title="Send Reservation Links"
        visible={isSendReservationModal}
        onOk={() => {
          setSelReservationPhones({});
          setIsSendReservationModal(false);
        }}
        onCancel={() => {
          setSelReservationPhones({});
          setIsSendReservationModal(false);
        }}
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={sendSMS}
          >
            Send SMS
          </Button>,
        ]}
      >
        <Spin size="large" spinning={sendReservationLoading}>
          {renderSendReservationTable()}
          <Row align="middle">
            <Col span={7}>
              <Checkbox
                checked={isUpdatePickupTime}
                onClick={(e) => setIsUpdatePIckupTime(!isUpdatePickupTime)}
              >
                Update Pickup Time
              </Checkbox>
            </Col>
            <Col span={5}>
              <Input
                type="number"
                value={pickUpTime}
                disabled={!isUpdatePickupTime}
                min={1}
                max={50}
                placeholder="min"
                onChange={(e) => setPickupTime(e.target.value)}
              />
            </Col>
            <Col push={1}>
              <label>mins from now</label>
            </Col>
          </Row>
        </Spin>
      </Modal>
      <div className={styles.sectionCenter}>
        <div className="col-md-8 col-md-offset-2">
          <Card>
            <Row>
              <Col md={17}>
                <DatePicker
                  size="large"
                  value={date}
                  format={dateFormat}
                  style={{ width: "35%" }}
                  onChange={onDateChange}
                />
                <Search
                  placeholder="Name"
                  onSearch={onSearch}
                  size="large"
                  allowClear
                  enterButton="Search"
                  onSearch={onSearch}
                  style={{ width: "60%", marginLeft: "5%" }}
                />
              </Col>
            </Row>
            <Row>
              <Col md={24}>
                <Spin size="large" spinning={loading}>
                  <Table
                    dataSource={reservations}
                    style={{ width: "100%" }}
                    style={{ marginTop: "2vh", minHeight: "70vh" }}
                    rowSelection={rowSelection}
                    scroll={{ y: "60vh" }}
                  >
                    <Column
                      title="No"
                      dataIndex="_id"
                      key="id"
                      width="10%"
                      render={(id, row, index) => {
                        return `${index + 1}`;
                      }}
                      responsive={["md"]}
                    />
                    <Column title="ID" dataIndex="id" key="id" width="15%" />
                    <Column
                      title="Customer"
                      dataIndex="customer_name"
                      key="customer_name"
                      align="center"
                      responsive={["md"]}
                      width="20%"
                      render={(value, row, index) => {
                        return `${row.customer.name}`;
                      }}
                    />
                    <Column
                      title="Bike Photo"
                      dataIndex="vehicle_class"
                      key="vehicle_class"
                      align="center"
                      render={(value, row, index) => (
                        <img
                          src={row.vehicle_class.image}
                          width="100%"
                          height="150px"
                          style={{ objectFit: "contain" }}
                        />
                      )}
                    />
                    <Column
                      title="Bike Name"
                      dataIndex="vehicle_class"
                      key="vehicle_class"
                      align="center"
                      responsive={["md"]}
                      render={(value, row, index) =>
                        `${row.vehicle_class.name}`
                      }
                    />
                  </Table>
                </Spin>
              </Col>
            </Row>
            <Row>
              <Col md={24} align="center">
                <Button
                  onClick={sendReservation}
                  size="large"
                  type="primary"
                  disabled={selReservationIds.length == 0}
                >
                  Send Reservation Link
                </Button>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </div>
  );
}
