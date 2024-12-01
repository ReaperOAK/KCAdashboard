/**
 * Retrieves the value of a specified cookie by name.
 *
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string|null} - The value of the cookie if found, otherwise null.
 */
export const getCookie = (name) => {
  // Validate that the cookie name is a string
  if (typeof name !== 'string') {
    console.error('Cookie name must be a string');
    return null;
  }

  // Trim and normalize the cookie name
  const trimmedName = name.trim();
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${trimmedName}=`);

  // Return the decoded cookie value if found
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift().trim());
  }

  // Return null if the cookie is not found
  return null;
};