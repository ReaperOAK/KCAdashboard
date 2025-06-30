# KCAdashboard API – Tournaments Endpoints Documentation

## Overview

The `tournaments` endpoints folder provides the backend API for all tournament management features in KCAdashboard. These PHP files enable the creation, registration, management, and payment processing for chess tournaments. The endpoints support workflows for admins, organizers, and participants.

---

## File Structure

```
endpoints/tournaments/
  cancel-registration.php   # Cancel a tournament registration
  create.php                # Create a new tournament
  delete.php                # Delete a tournament
  get-all.php               # Retrieve all tournaments
  get-by-status.php         # Get tournaments by status
  get-registrations.php     # Get registrations for a tournament
  get-tournament.php        # Get details of a specific tournament
  payment-initiate.php      # Initiate payment for tournament registration
  payment-verify.php        # Verify payment for tournament registration
  register.php              # Register a user for a tournament
  registration-status.php   # Get the registration status for a user
  update.php                # Update tournament details
```

---

## File Explanations

- **cancel-registration.php**  
  Cancels a user's registration for a tournament.

- **create.php**  
  Creates a new tournament, specifying details such as name, date, and rules.

- **delete.php**  
  Deletes a tournament from the system.

- **get-all.php**  
  Retrieves all tournaments, supporting listing and browsing.

- **get-by-status.php**  
  Gets tournaments filtered by their status (upcoming, ongoing, completed, etc.).

- **get-registrations.php**  
  Gets all registrations for a specific tournament.

- **get-tournament.php**  
  Gets detailed information about a specific tournament.

- **payment-initiate.php**  
  Initiates payment processing for tournament registration.

- **payment-verify.php**  
  Verifies payment status for a tournament registration.

- **register.php**  
  Registers a user for a tournament.

- **registration-status.php**  
  Gets the registration status for a user in a tournament.

- **update.php**  
  Updates tournament details, such as schedule, rules, or participants.

---

## How These Endpoints Work

- Each PHP file acts as a RESTful API endpoint, typically returning JSON data.
- The frontend calls these endpoints to manage tournaments, handle registrations, and process payments.
- Access may be restricted based on user roles (admin, organizer, participant).

---

## Example Usage

- Organizers create and update tournaments, and manage registrations.
- Participants register for tournaments and check their registration/payment status.
- Admins review all tournaments and manage tournament data.

---

## Best Practices

- Ensure only authorized users can create, update, or delete tournaments.
- Validate all registration and payment data to prevent errors and fraud.
- Regularly review tournament data for accuracy and compliance.

---

## Troubleshooting

- If tournament data is missing or incorrect, check the underlying database queries and data sources in each PHP file.
- Ensure proper authentication and authorization checks are in place to protect tournament integrity.

---

For more details on the overall API structure and features, see the main `docs.md` in the `public/api` folder.
