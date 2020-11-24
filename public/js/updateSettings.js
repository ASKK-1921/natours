/* eslint-disable */

// create updateData function, call in index.js after exporting

import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updatepassword'
        : '/api/v1/users/updatemyprofile';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
