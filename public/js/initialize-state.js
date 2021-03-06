import { getLocalStorageItem } from "./local-storage.js";
import { setStep, loading, showError, populateCheckoutPage, populateRatePage, populateDimensionsAndWeightPage, clearError, clearInfo, showInfo } from "./ui-helpers.js";
import { getLabel } from "./get-label.js";
import { sendEmail } from "./send-email.js";
import { rateEstimate } from "./rate-estimate.js";
import { verifyStripePayment, refundStripePayment } from "./payment.js";

export function initializeState() {

  setCurrentStep(true);

  // Populate fields

  // From Address
  const fromAddress = getLocalStorageItem("fromAddress");
  if (fromAddress) {
    document.getElementById("from-name").value = fromAddress.name;
    document.getElementById("from-address1").value = fromAddress.address_line1;
    document.getElementById("from-address2").value = fromAddress.address_line2;
    document.getElementById("from-city").value = fromAddress.city_locality;
    document.getElementById("from-state").value = fromAddress.state_province;
    document.getElementById("from-zip").value = fromAddress.postal_code;
  }

  // To Address
  const toAddress = getLocalStorageItem("toAddress");
  if (toAddress) {
    document.getElementById("to-name").value = toAddress.name;
    document.getElementById("to-address1").value = toAddress.address_line1;
    document.getElementById("to-address2").value = toAddress.address_line2;
    document.getElementById("to-city").value = toAddress.city_locality;
    document.getElementById("to-state").value = toAddress.state_province;
    document.getElementById("to-zip").value = toAddress.postal_code;
  }

  // Package Weight
  const packageWeight = getLocalStorageItem("weight");
  if (packageWeight) {
    document.getElementById("weight-lbs").value = packageWeight.pounds;
    document.getElementById("weight-ounces").value = packageWeight.ounces;
  }

  // Dimensions
  const dimensions = getLocalStorageItem("dimensions");
  if (dimensions) {
    document.getElementById("length").value = dimensions.length;
    document.getElementById("width").value = dimensions.width;
    document.getElementById("height").value = dimensions.height;
  }
}

export async function setCurrentStep(isBrowserLoad) {

  switch (window.location.hash) {
    case "#step1":
      setStep("step-one");
      break;

    case "#step2":
      populateDimensionsAndWeightPage();
      setStep("step-two");
      break;

    case "#step3":

      if (isBrowserLoad) {
        await rateEstimate();
      }

      populateRatePage();

      setStep("step-three");
      break;

    case "#step4":
      if (isBrowserLoad) {
        await rateEstimate();
      }
      populateCheckoutPage();
      setStep("step-four");
      break;

    case "#step5":
      setStep("step-five");
      loading(true);
      // const madePayment = await verifyStripePayment();
      clearError();
      clearInfo();
      // if (!madePayment) {
      //   loading(false);
      //   showError("Stripe Payment", "Sorry but you don't appear to have made a payment, please contact ShipEngine support");
      //   break;
      // }

      const labelUrls = await getLabel();

      if (labelUrls && labelUrls.pdf) {
        await sendEmail(labelUrls);
      }
      else if (labelUrls.labelPurchaseError) {
        showError("Label Purchase Error", "Sorry, there seems to have been an error purchasing your label");
        // const success = await refundStripePayment();
        // if(success) {
        //   showInfo("Payment Refund", "Your Stripe Payment has been refunded.");
        // }
        // else {
        //   showError("Payment Refund", "There was an issue refunding your payment, please contact ShipEngine support");
        // }
      }
      loading(false);
      break;

    default:
      setStep("step-zero");
  }
}
