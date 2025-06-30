# KCAdashboard API – Support FAQs Endpoints Documentation

## Overview

The `faqs` endpoints folder under `support` provides the backend API for managing Frequently Asked Questions (FAQs) in KCAdashboard. These PHP files enable admins and support staff to create, delete, and retrieve FAQ entries, helping users find answers to common questions and issues.

---

## File Structure

```
endpoints/support/faqs/
  create.php   # Create a new FAQ entry
  delete.php   # Delete an FAQ entry
  get-all.php  # Retrieve all FAQ entries
```

---

## File Explanations

- **create.php**  
  Creates a new FAQ entry, allowing admins to add helpful information for users.

- **delete.php**  
  Deletes an existing FAQ entry, keeping the FAQ list up to date.

- **get-all.php**  
  Retrieves all FAQ entries, supporting the display of FAQs in the support section.

---

## How These Endpoints Work

- Each PHP file acts as a RESTful API endpoint, typically returning JSON data.
- The frontend calls these endpoints to manage and display FAQs to users.
- Access to create and delete may be restricted to admins or support staff.

---

## Example Usage

- Admins add new FAQs to address common user questions.
- Users view all FAQs in the support/help section of the platform.

---

## Best Practices

- Ensure only authorized users can create or delete FAQ entries.
- Keep FAQ content clear, concise, and up to date.

---

## Troubleshooting

- If FAQs are missing or not updating, check the underlying database queries and data sources in each PHP file.
- Ensure proper authentication and authorization checks are in place for managing FAQs.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
