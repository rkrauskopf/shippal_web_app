import { rateEstimate } from "./rate-estimate.js";
import { setLocalStorage, clearLocalStorage, clearInputs } from "./local-storage.js";
import { pay } from "./payment.js";
import { initializeState, setCurrentStep } from "./initialize-state.js";
import { verifyAddresses } from "./verify-addresses.js";
import { checkForFraud } from "./check-for-fraud.js";
import { debounce, loading, showError, clearError } from "./ui-helpers.js";

window.addEventListener("load", () => {

  initializeState();

  // Landing Page
  document.getElementById("step0NextButton").addEventListener("click", () => {
    window.location.hash = "#step1"
  })

  // If the user does an address auto complete via their browser then that can cause many change
  // events to be fired at once. We wrap it in a debounce function to keep the api calls limited.
  async function runVerifyAddresses() {
    loading(true);
    await verifyAddresses();
    loading(false);
  }

  // Address Forms
  document.getElementById("address-form").addEventListener("change", debounce(runVerifyAddresses));
  document.getElementById("address-form").addEventListener("submit", async (evt) => {
    evt.preventDefault();

    loading(true);
    const verified = await verifyAddresses();
    loading(false);

    if (!verified.fromAddress) {
      showError("Invalid Address", `The "Shipping From" address could not be verified`);
    }
    else if (!verified.toAddress) {
      showError("Invalid Address", `The "Shipping To" address could not be verified`);
    }
    else {
      clearError();
      window.location.hash = "#step2";
    }
  });

  // Dimensions and Weights
  document.getElementById("step-2-form").addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const pounds = document.getElementById("weight-lbs").value;
    const ounces = document.getElementById("weight-ounces").value;
    const length = document.getElementById("length").value;
    const width = document.getElementById("width").value;
    const height = document.getElementById("height").value;

    const totalWeight = 16 * Number(pounds) + Number(ounces);

    clearError();
    if (!totalWeight) {
      showError("Package Weight Error", "Please enter a weight for your package");
      return;
    }

    if (totalWeight > 16 * 70) {
      showError("Package Weight Error", "Package weight cannot exceed 70 lbs");
      return;
    }

    const allFilledDimensions = [length, width, height].every((item) => item !== undefined && item !== null && item !== "");
    const allEmptyDimensions = [length, width, height].every((item) => item === undefined || item === null || item === "");
    if (!allFilledDimensions && !allEmptyDimensions) {
      showError("Package Dimensions Error", "Please complete filling out the package dimensions");
      return;
    }

    setLocalStorage("weight", { pounds, ounces });
    setLocalStorage("totalWeight", totalWeight);
    setLocalStorage("dimensions", { length, width, height });

    const rateSucess = await rateEstimate();
    if (rateSucess) {
      window.location.hash = "#step3";
    }
  });

  // Rate Selections
  document.getElementById("step-3-form").addEventListener("submit", (evt) => {
    evt.preventDefault();
    const rateFieldSet = document.getElementById("rate-input-list");
    const selectedRate = rateFieldSet.querySelector("input:checked");
    const rateID = selectedRate.value;

    const rateLabel = rateFieldSet.querySelector(`label[for="${rateID}`);

    const carrierService = rateLabel.textContent.split("-")[1].split("/")[0].trim();
    const shippingCost = rateLabel.textContent.split("-")[0].trim();
    setLocalStorage("carrierService", carrierService);
    setLocalStorage("shippingCost", shippingCost);
    setLocalStorage("rateID", rateID);
    window.location.hash = "#step4";
  });

  // Checkout
  document.getElementById("step4Form").addEventListener("submit", async (evt) => {
    evt.preventDefault();
    loading(true);
    const isFraud = await checkForFraud();

    if (isFraud) {
      showError("Potential Fraud Detected", "You have been flagged for potential fraud, please contact the ShipEngine support team");
      loading(false);
    }
    else {
      setLocalStorage("email", document.getElementById("email").value);
      await pay();
    }
  });

  // Thank you Page
  document.getElementById("create-another-label").addEventListener("click", () => {
    clearLocalStorage();
    clearInputs();
    window.location.hash = "#step1";
  });

  document.getElementById("error-button").addEventListener("click", () => {
    clearError();
  })

  window.addEventListener("hashchange", (evt) => {
    setCurrentStep();
  });
});
