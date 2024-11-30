export const getCookie = (name) => {
  // Construct the cookie string with a leading semicolon and space
  const value = `; ${document.cookie}`;
  
  // Split the cookie string to find the target cookie
  const parts = value.split(`; ${name}=`);
  
  // If the target cookie is found, decode and return its value
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }
  
  // Return null if the cookie is not found
  return null;
};