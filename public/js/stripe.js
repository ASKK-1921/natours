/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51Hqq2xE5v3BcbjtPXJ2SYFJ0DAPEWLt3esZdDDzXn6TLoDBqyzvewazl73rpJsfFfxqxfVRl8bUP6heL0hCB3bhl00AgekMl4I'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout-session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
