import React, { useState } from "react";
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const CheckoutForm = ({ orderId }) => {
  localStorage.setItem("orderId", orderId);
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const paymentElementOptions = {
    loyout: "tabs",
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setIsLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url:
          "https://icy-smoke-09917aa1e.1.azurestaticapps.net/order/confirm",
      },
    });
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An Unexpected error occured");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={submit} id="payment-form">
      <LinkAuthenticationElement id="link-authentication-element" />
      <PaymentElement id="payment-element" options={paymentElementOptions} />

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="px-10 py-[6px] rounded-sm hover:shadow-green-700/30 hover:shadow-lg bg-green-700 text-white"
      >
        <span id="button-text">
          {isLoading ? <div>Loading...</div> : "Pay Now"}
        </span>
      </button>
      {message && <div>{message}</div>}
    </form>
  );
};
export default CheckoutForm;
