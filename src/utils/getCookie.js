export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    // Decode the cookie value to handle any URL encoding
    return decodeURIComponent(parts.pop().split(';').shift());
  }
  return null;
};
