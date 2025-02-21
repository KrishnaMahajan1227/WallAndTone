import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form, Table, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const CouponAdmin = () => {
const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://wallandtone.com');
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [editCoupon, setEditCoupon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/coupons/get`);
      setCoupons(response.data);
    } catch (err) {
      setError("Failed to fetch coupons.");
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/admin/coupons/add`, {
        code,
        discount,
        expirationDate,
        expirationTime: {
          hours: parseInt(hours, 10),
          minutes: parseInt(minutes, 10),
          seconds: parseInt(seconds, 10),
        }
      });

      setCoupons((prev) => [...prev, response.data]);
      resetForm();
    } catch (err) {
      setError("Failed to add coupon. Ensure all fields are filled correctly.");
    }
  };

  const handleUpdateCoupon = async () => {
    try {
      await axios.put(`${apiUrl}/api/admin/coupons/update/${editCoupon._id}`, {
        code,
        discount,
        expirationDate,
        expirationTime: {
          hours: parseInt(hours, 10),
          minutes: parseInt(minutes, 10),
          seconds: parseInt(seconds, 10),
        }
      });

      fetchCoupons();
      setShowModal(false);
    } catch (err) {
      setError("Failed to update coupon.");
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/admin/coupons/delete/${id}`);
      setCoupons(coupons.filter((coupon) => coupon._id !== id));
    } catch (err) {
      setError("Failed to delete coupon.");
    }
  };

  const resetForm = () => {
    setCode("");
    setDiscount("");
    setExpirationDate("");
    setHours("");
    setMinutes("");
    setSeconds("");
  };

  const handleEditClick = (coupon) => {
    setEditCoupon(coupon);
    setCode(coupon.code);
    setDiscount(coupon.discount);
    setExpirationDate(coupon.expirationDate);
    setHours(coupon.expirationTime.hours);
    setMinutes(coupon.expirationTime.minutes);
    setSeconds(coupon.expirationTime.seconds);
    setShowModal(true);
  };

  return (
    <div className="coupon-admin container mt-5">
      <h2 className="text-center mb-4">Coupon Management</h2>
      {error && <p className="text-danger text-center">{error}</p>}

      {/* Add Coupon Form */}
      <Form onSubmit={handleAddCoupon} className="coupon-form p-4 shadow-sm rounded">
        <h4>Add New Coupon</h4>
        <Form.Group>
          <Form.Label>Coupon Code</Form.Label>
          <Form.Control type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
        </Form.Group>

        <Form.Group>
          <Form.Label>Discount (%)</Form.Label>
          <Form.Control type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} required />
        </Form.Group>

        <Form.Group>
          <Form.Label>Expiration Date</Form.Label>
          <Form.Control type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} required />
        </Form.Group>

        {/* Time Selection for Expiration */}
        <Form.Group>
          <Form.Label>Expiration Time (H:M:S)</Form.Label>
          <div className="d-flex">
            <Form.Control type="number" placeholder="Hrs" value={hours} onChange={(e) => setHours(e.target.value)} min="0" max="23" required className="me-2" />
            <Form.Control type="number" placeholder="Min" value={minutes} onChange={(e) => setMinutes(e.target.value)} min="0" max="59" required className="me-2" />
            <Form.Control type="number" placeholder="Sec" value={seconds} onChange={(e) => setSeconds(e.target.value)} min="0" max="59" required />
          </div>
        </Form.Group>

        <Button type="submit" className="mt-3 w-100">Add Coupon</Button>
      </Form>

      {/* Coupon List */}
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Code</th>
            <th>Discount (%)</th>
            <th>Expiration Date</th>
            <th>Expiration Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <tr key={coupon._id}>
              <td>{coupon.code}</td>
              <td>{coupon.discount}%</td>
              <td>{new Date(coupon.expirationDate).toLocaleDateString()}</td>
              <td>{coupon.expirationTime.hours}:{coupon.expirationTime.minutes}:{coupon.expirationTime.seconds}</td>
              <td>
                <Button variant="warning" className="me-2" onClick={() => handleEditClick(coupon)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDeleteCoupon(coupon._id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit Coupon Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Coupon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Coupon Code</Form.Label>
              <Form.Control type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Discount (%)</Form.Label>
              <Form.Control type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Expiration Date</Form.Label>
              <Form.Control type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Expiration Time (H:M:S)</Form.Label>
              <div className="d-flex">
                <Form.Control type="number" placeholder="Hrs" value={hours} onChange={(e) => setHours(e.target.value)} min="0" max="23" required className="me-2"/>
                <Form.Control type="number" placeholder="Min" value={minutes} onChange={(e) => setMinutes(e.target.value)} min="0" max="59" required className="me-2"/>
                <Form.Control type="number" placeholder="Sec" value={seconds} onChange={(e) => setSeconds(e.target.value)} min="0" max="59" required />
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdateCoupon}>Update</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CouponAdmin;
