# Purchase Requests Controller (Beginner Guide)

## What is the controller?

The controller is the layer between the **user** (browser) and the **database**. When the user opens a URL or submits a form, the **route** directs the request to a **specific method** in the controller, and that method decides what to do and returns a page or a redirect.

---

## Request flow (from URL to database)

1. **User visits:** `https://yoursite.com/purchase-requests`
2. **Laravel** matches the URL in `routes/web.php` and finds:
   - `Route::get('purchase-requests', [PurchaseRequestController::class, 'index'])`
3. **PurchaseRequestController::index()** is called.
4. The **index()** method loads requests from the database via the model and passes them to the Inertia page:
   - `PurchaseRequest::query()->with('requester')->latest()->get()`
   - `return Inertia::render('purchase-requests/index', ['purchaseRequests' => ...])`
5. **Inertia** renders the page in the browser with that data.

---

## The three methods

| Method     | Route (example)              | When it runs              | What it does                                      |
|-----------|------------------------------|---------------------------|---------------------------------------------------|
| **index**  | GET /purchase-requests       | Opening the list page     | Loads all requests and passes them to the view   |
| **create** | GET /purchase-requests/create | Opening the "new request" page | Shows the empty form only                    |
| **store**  | POST /purchase-requests     | Submitting the form       | Validates, saves to the table, redirects to list |

---

## Validation (StorePurchaseRequest)

Before **store()** runs, the request is validated by **StorePurchaseRequest**:

- **rules()**: Defines required fields, numeric price, etc.
- **messages()**: Error messages shown when validation fails.

If validation fails, Laravel redirects back to the form and the errors are displayed automatically.

---

## Where are routes defined?

In **routes/web.php**. Routes wrapped in `middleware(['auth', 'verified'])` run only for logged-in users with a verified email.

---

## File summary

- **PurchaseRequestController.php** — Methods that handle listing, showing the form, and storing a new request.
- **StorePurchaseRequest.php** — Validation rules and error messages for creating a request.
- **routes/web.php** — Binds URLs (e.g. /purchase-requests) to the controller.
