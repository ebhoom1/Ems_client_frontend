import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const PaymentPage = () => {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan');

  // This is just a static UI showcasing the payment form.
  // You can integrate your payment logic (Stripe, Razorpay, etc.) as needed.

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Payment Page</h2>
      <p className="text-center">User ID: <strong>{userId}</strong></p>
      <p className="text-center">Selected Plan: <strong>{plan}</strong></p>

      <div className="payment-methods d-flex justify-content-center mb-3">
        <button className="btn btn-light me-2">Pay with Link</button>
        <button className="btn btn-warning">Amazon Pay</button>
      </div>

      <div className="text-center mb-3">Or pay another way</div>

      <div className="d-flex justify-content-center">
        <div style={{ maxWidth: '400px', width: '100%' }}>
          {/* Email */}
          <label>Email</label>
          <input
            type="email"
            className="form-control mb-3"
            placeholder="john.doe@example.com"
          />

          {/* Payment Method */}
          <h5>Payment method</h5>
          <div className="mb-3">
            <input type="radio" name="paymentMethod" id="cardOption" defaultChecked />
            <label className="ms-2" htmlFor="cardOption">Card</label>
          </div>

          <div className="mb-3">
            <label>Card information</label>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="1234 1234 1234 1234"
            />
            <div className="d-flex mb-2">
              <input
                type="text"
                className="form-control me-2"
                placeholder="MM / YY"
              />
              <input
                type="text"
                className="form-control"
                placeholder="CVC"
              />
            </div>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Cardholder name"
            />
            <select className="form-control mb-3">
              <option>India</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Other</option>
            </select>
          </div>

          <div className="mb-3">
            <input type="radio" name="paymentMethod" id="cashAppOption" />
            <label className="ms-2" htmlFor="cashAppOption">Cash App Pay</label>
          </div>

          <div className="mb-3">
            <input type="radio" name="paymentMethod" id="alipayOption" />
            <label className="ms-2" htmlFor="alipayOption">Alipay</label>
          </div>

          {/* Save Info */}
          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" value="" id="saveInfoCheck" />
            <label className="form-check-label" htmlFor="saveInfoCheck">
              Securely save my information for 1-click checkout
            </label>
          </div>

          {/* Pay Button */}
          <button className="btn btn-primary w-100">Pay</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
