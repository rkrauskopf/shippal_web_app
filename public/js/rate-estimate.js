import { getLocalStorageItem } from "./local-storage.js";
import { showError, loading, clearError } from "./ui-helpers.js";

export async function rateEstimate() {
  const rateBody = {
    rate_options: {
      carrier_ids: [] // Added server side
    },
    shipment: {
      validate_address: "no_validation",
      ship_to: getLocalStorageItem("toAddress"),
      ship_from: {
        ...getLocalStorageItem("fromAddress"),
        phone: "111-111-1111"
      },
      packages: [
        {
          weight: {
            value: getLocalStorageItem("totalWeight"),
            unit: "ounce"
          },
          dimensions: {
            unit: "inch",
          }
        }
      ]
    }
  };

  const dimensions = getLocalStorageItem("dimensions");
  if(dimensions.length !== "") {
    rateBody.shipment.packages[0].dimensions = {
      ...dimensions,
      unit: "inch"
    }

  }

  loading(true);
  clearError();
  try {
    const response = await fetch("/rates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(rateBody)
    });

    const data = await response.json();

    loading(false);

    const rateInputList = document.getElementById("rate-input-list");
    rateInputList.innerHTML = "";
    let defaultChecked = false;
    for (let rate of data.rate_response.rates) {
      const radioInput = document.createElement("input");
      radioInput.id = rate.rate_id;
      radioInput.value = rate.rate_id;
      radioInput.type = "radio";
      radioInput.setAttribute("name", "rates");

      const label = document.createElement("label");
      const totalAmount = rate.shipping_amount.amount + rate.insurance_amount.amount + rate.confirmation_amount.amount + rate.other_amount.amount;
      label.setAttribute("for", rate.rate_id);
      label.textContent = `$${totalAmount.toFixed(2)} - ${rate.service_type} / ${rate.delivery_days} day(s)`;

      if (!defaultChecked) {
        radioInput.setAttribute("checked", "checked");
        defaultChecked = true;
      }

      const inputWrapper = document.createElement("div");
      inputWrapper.classList.add("py-1");

      inputWrapper.append(radioInput);
      inputWrapper.append(label);

      rateInputList.append(inputWrapper);
    }
    return true;
  }
  catch (e) {
    loading(false);
    showError("Shipping Rates Error", "There was an issue with retrieving rates");
    return false;
  }
}
