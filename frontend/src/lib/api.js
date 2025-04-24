import api from './axios';

export const signupUser = async (userData) => {
  try {
    const response = await api.post('/signup/', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}


export const loginUser = async (userData) => {
    try {

      const response = await api.post('/login/', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  };

export const verifyCode = async (codeData) => {
  try {
    const response = await api.post('/verify-code/', codeData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}


export const checkAuth = async () => {
    try {
      const response = await api.get('/check-auth/');
      return response.data;
    } catch (error) {
      return { isAuthenticated: false };
    }
  };

  export const refreshToken = async () => {
    try {
      const response = await api.post('/refresh-token/');
      console.log('Refresh Token Response:', response.status, response.data);
      return response;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      console.error('Full error:', error);
      throw error.response?.data || error.message;
    }
  };

  export const logout = async () => {
    try {
      const response = await api.post('/logout/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Logout failed' };
    }
  };

  export const getUsername = async () => {
    try {
      const response = await api.get('/get-username/');
      console.log('Get Username Response:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  };



  export const createProduct = async (productData) => {
    try {
      console.log('Sending:', productData); // Debug payload
      const response = await api.post('/create-products/', productData);
      return response; // Return full response
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  };


export const getProducts = async () => {
    try {
        const response = await api.get('/products-list/');
        return response.data;
    } catch (error) {
        throw error.response.data;
}
};


export const updateProduct = async (id, productData) => {
    try {
      console.log('Updating product ID:', id, 'Data:', productData);
      const response = await api.put(`/update-products/${id}/`, productData);
      return response;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  };

  export const deleteProduct = async (id) => {
    try {
      console.log('Deleting product ID:', id);
      const response = await api.delete(`/delete-products/${id}/delete/`);
      return response;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  };



export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/create-orders/', orderData);
    console.log('Create Order Response:', response.status, response.data); // Debug
    return response;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    console.error('Full error:', error);
    throw error.response?.data || error.message;
  }
};

  export const getOrders = async () => {
    try {
      const response = await api.get('/orders/');
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  };

