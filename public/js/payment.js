import { getLocalStorageItem, setLocalStorage } from "./local-storage.js";
import { showError } from "./ui-helpers.js";

let stripe;
export async function makePaypalPayment() {

  if (!stripe) {
    const response = await fetch("/config");
    const config = await response.json();
    stripe = Stripe(config.paypalPublishableKey);
  }
  paypal.Buttons({
    createOrder: function (data, actions) {
      // This function sets up the details of the transaction, including the amount and line item details.
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: getLocalStorageItem("totalAmount ")
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      // This function captures the funds from the transaction.
      return actions.order.capture().then(function(details) {
        // This function shows a transaction success message to your buyer.
        alert('Transaction completed by ' + details.payer.name.given_name);
      });
    }
  }).render('#paypal-button-container');


  // TODO: add error handling
  // const response = await fetch("/create-checkout-session", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json"
  //   },
  //   body: JSON.stringify({ "rateID": getLocalStorageItem("rateID") })
  // })

  // const session = await response.json();
  // setLocalStorage("stripeSession", session.id);
  // await stripe.redirectToCheckout({ sessionId: session.id });
}

export async function verifyStripePayment() {

  const sessionID = getLocalStorageItem("stripeSession");

  const response = await fetch(`/verify-stripe-payment?sessionID=${sessionID}`);
  const success = await response.json();

  return success;
}

export async function refundStripePayment() {

  try {
    const sessionID = getLocalStorageItem("stripeSession");
    const response = await fetch(`/refund-stripe-payment?sessionID=${sessionID}`, { method: "POST" });

    const data = await response.json();
    return data;
  }
  catch (e) {
    showError("Stripe Refund issue", `${e.message} \n Please contact ShipEngine support`);
  }
}