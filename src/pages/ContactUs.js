import React, { useState } from 'react';

/**
 * ContactUs component renders a contact form and handles form submission.
 */
const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    captcha: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles input change and updates form data.
   * @param {Object} e - Event object
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  /**
   * Validates form data and returns errors if any.
   * @returns {Object} errors - Validation errors
   */
  const validate = () => {
    let errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.subject) errors.subject = 'Subject is required';
    if (!formData.message) errors.message = 'Message is required';
    if (!formData.captcha) errors.captcha = 'Please enter CAPTCHA';
    return errors;
  };

  /**
   * Handles form submission.
   * @param {Object} e - Event object
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const errors = validate();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      // Send the data to the server or API here
      console.log('Form submitted successfully', formData);
      // Reset form after submission
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        captcha: ''
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <section className="bg-gray-100 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.name ? 'border-red-500' : ''}`}
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.email ? 'border-red-500' : ''}`}
                    id="email"
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
                    Subject
                  </label>
                  <input
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.subject ? 'border-red-500' : ''}`}
                    id="subject"
                    type="text"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                  {formErrors.subject && <p className="text-red-500 text-xs mt-1">{formErrors.subject}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.message ? 'border-red-500' : ''}`}
                    id="message"
                    rows="5"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                  {formErrors.message && <p className="text-red-500 text-xs mt-1">{formErrors.message}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="captcha">
                    CAPTCHA
                  </label>
                  <input
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.captcha ? 'border-red-500' : ''}`}
                    id="captcha"
                    type="text"
                    placeholder="Enter CAPTCHA"
                    value={formData.captcha}
                    onChange={handleChange}
                  />
                  {formErrors.captcha && <p className="text-red-500 text-xs mt-1">{formErrors.captcha}</p>}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Contact Information</h2>
            <div className="text-center">
              <p className="mb-4">Address: 1234 Education St, Learning City, ED 56789</p>
              <p className="mb-4">Phone: (123) 456-7890</p>
              <p className="mb-4">Email: contact@eduplatform.com</p>
            </div>
          </div>
        </section>

        <section className="bg-gray-100 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Our Location</h2>
            <div className="w-full h-64">
              <iframe
                className="w-full h-full rounded-lg shadow-md"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509374!2d144.9537353153167!3d-37.81627977975195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf577d9f0b1b1a1b1!2sEducation%20St%2C%20Learning%20City%2C%20ED%2056789!5e0!3m2!1sen!2sus!4v1633021234567!5m2!1sen!2sus"
                allowFullScreen=""
                loading="lazy"
                title="Our Location"
              ></iframe>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactUs;