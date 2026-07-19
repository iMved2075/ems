# EMS API Documentation

Base URL: `http://localhost:<PORT>/api`

All responses follow a common envelope:

```json
{
  "statusCode": 200,
  "message": "Description of what happened",
  "data": {},
  "success": true
}
```

Errors follow:

```json
{
  "statusCode": 400,
  "message": "Description of the error",
  "success": false
}
```

## Authentication

Most endpoints require the caller to be authenticated. On login, the API sets two **httpOnly cookies**:

- `accessToken`
- `refreshToken`

The same tokens are also returned in the JSON response body. Authenticated requests are validated via the `authenticate` middleware, which reads the access token from the cookie (or `Authorization` header, if configured) and attaches the employee to `req.employee`.

Employee roles referenced throughout this document: `super_admin`, `hr`, `hr_manager`, and standard employee roles. Role checks are enforced server-side per endpoint (see the **Access** column below).

---

## Auth

### Login

`POST /auth/login`

**Access:** Public

**Body**
| Field | Type | Required |
| --- | --- | --- |
| `employeeId` | string | one of `employeeId` / `employeeEmail` |
| `employeeEmail` | string | one of `employeeId` / `employeeEmail` |
| `password` | string | ✅ |

**Success — `200`**
```json
{
  "statusCode": 200,
  "message": "Employee logged in successfully",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "employee": { "...": "employee document, password excluded" }
  },
  "success": true
}
```

**Errors**
| Status | Reason |
| --- | --- |
| 400 | Missing `employeeId`/`employeeEmail` or `password` |
| 401 | Invalid credentials |
| 403 | Employee account has been deleted |

---

### Logout

`POST /auth/logout` 🔒

**Access:** Authenticated

Clears the `accessToken` / `refreshToken` cookies and invalidates the stored refresh token.

**Success — `200`**
```json
{ "statusCode": 200, "message": "Employee logged out successfully", "data": null, "success": true }
```

**Errors**
| Status | Reason |
| --- | --- |
| 401 | Unauthorized |

---

## Employees

### Create super admin

`POST /employees/create-super-admin`

**Access:** Public (intended for initial setup only)

**Body** — `multipart/form-data` (accepts file field `profileImage`)
| Field | Type | Required |
| --- | --- | --- |
| `employeeId` | string | ✅ |
| `employeeName` | string | ✅ |
| `employeeEmail` | string | ✅ |
| `password` | string | ✅ |
| `phoneNumber` | string | ✅ |
| `designation` | string | ✅ |
| `department` | string | ✅ |
| `salary` | number | ✅ |
| `joiningDate` | date | ✅ |
| `role` | string | ✅ (must be `"super_admin"`) |
| `profileImage` | file | optional |

**Success — `201`**: created employee object (no password).

**Errors**
| Status | Reason |
| --- | --- |
| 400 | Missing required fields, or `role !== "super_admin"` |
| 400 | Employee with the same ID, email, or phone number already exists |

---

### Create employee

`POST /employees/create-employee` 🔒

**Access:** `super_admin`, `hr`

**Body** — `multipart/form-data` (accepts file field `profileImage`)
| Field | Type | Required |
| --- | --- | --- |
| `employeeId` | string | ✅ |
| `employeeName` | string | ✅ |
| `employeeEmail` | string | ✅ |
| `password` | string | ✅ |
| `phoneNumber` | string | ✅ |
| `designation` | string | ✅ |
| `department` | string | ✅ |
| `salary` | number | ✅ |
| `joiningDate` | date | ✅ |
| `role` | string | ✅ |
| `reportingManager` | string | optional |
| `profileImage` | file | optional |

**Success — `201`**: created employee object.

**Errors**
| Status | Reason |
| --- | --- |
| 403 | Caller is not `super_admin` or `hr` |
| 400 | Missing required fields |
| 400 | Employee with the same ID, email, or phone number already exists |

---

### Update employee (Super Admin / HR)

`PUT /employees/update-employee/:employeeId` 🔒

**Access:** `super_admin`, `hr` (an `hr_manager` role has a restricted field set, see below)

**Params**
| Field | Description |
| --- | --- |
| `employeeId` | Mongo `_id` of the employee to update |

**Body** — `multipart/form-data` (accepts file field `profileImage`), any subset of employee fields.

> If the caller's role is `hr_manager`, only `phoneNumber`, `department`, `designation`, and `salary` may be updated, and they cannot assign the `super_admin` role.

**Success — `200`**: updated employee object (no password).

**Errors**
| Status | Reason |
| --- | --- |
| 403 | Caller is not `super_admin` or `hr` |
| 403 | `hr_manager` attempting to assign `super_admin` role |
| 404 | Employee not found |

---

### Self-update employee

`PUT /employees/self-update-employee` 🔒

**Access:** Authenticated (any employee, own record only)

**Body** — `multipart/form-data` (accepts file field `profileImage`). Only these fields are applied, all others are ignored:
- `phoneNumber`
- `password`
- `profilePicture`

**Success — `200`**: updated employee object.

**Errors**
| Status | Reason |
| --- | --- |
| 401 | Unauthorized |
| 404 | Employee not found |

---

### Delete employee

`PUT /employees/delete-employee/:employeeId` 🔒

**Access:** `super_admin`

**Params**
| Field | Description |
| --- | --- |
| `employeeId` | Mongo `_id` of the employee to delete |

Performs a soft delete (`isDeleted: true`, `deletedAt` set, refresh token cleared).

**Success — `200`**: updated (deleted) employee object.

**Errors**
| Status | Reason |
| --- | --- |
| 403 | Caller is not `super_admin` |
| 400 | `employeeId` param missing |
| 404 | Employee not found or already deleted |

---

### Get all employees

`GET /employees/get-all-employees` 🔒

**Access:** `super_admin`, `hr`

Returns all employees where `isDeleted` is `false` (passwords excluded).

**Success — `200`**: array of employee objects.

**Errors**
| Status | Reason |
| --- | --- |
| 403 | Caller is not `super_admin` or `hr` |

---

### Get employees by role

`GET /employees/get-employee-by-role/:role` 🔒

**Access:** `super_admin`, `hr`

**Params**: `role` — role to filter by.

**Success — `200`**: array of matching employees.

**Errors**
| Status | Reason |
| --- | --- |
| 403 | Caller is not `super_admin` or `hr` |

---

### Get employees by department

`GET /employees/get-employee-by-department/:department` 🔒

**Access:** `super_admin`, `hr`

**Params**: `department` — department to filter by.

**Success — `200`**: array of matching employees.

**Errors**
| Status | Reason |
| --- | --- |
| 403 | Caller is not `super_admin` or `hr` |
| 400 | `department` param missing |

---

### Get employees by designation

`GET /employees/get-employee-by-designation/:designation` 🔒

**Access:** `super_admin`, `hr`

**Params**: `designation` — designation to filter by.

**Success — `200`**: array of matching employees.

**Errors**
| Status | Reason |
| --- | --- |
| 403 | Caller is not `super_admin` or `hr` |

---

### Get employees by status

`GET /employees/get-employee-by-status/:status` 🔒

**Access:** `super_admin`, `hr`

**Params**: `status` — status to filter by (e.g. active/inactive).

**Success — `200`**: array of matching employees.

**Errors**
| Status | Reason |
| --- | --- |
| 403 | Caller is not `super_admin` or `hr` |
| 400 | `status` param missing |

---

### Get own profile

`GET /employees/get-employee-profile` 🔒

**Access:** Authenticated (any employee)

Returns the logged-in employee's own profile (password excluded).

**Success — `200`**: employee object.

**Errors**
| Status | Reason |
| --- | --- |
| 401 | Unauthorized |
| 404 | Employee not found |

---

### Get employee profile by ID

`GET /employees/get-employee-profile/:employeeId` 🔒

**Access:** `super_admin`, `hr`

**Params**
| Field | Description |
| --- | --- |
| `employeeId` | Mongo `_id` of the employee to look up |

**Success — `200`**: employee object.

**Errors**
| Status | Reason |
| --- | --- |
| 403 | Caller is not `super_admin` or `hr` |
| 404 | Employee not found |
| 403 | Employee account has been deleted |

---

## Organization

### Get organization chart

`GET /organization/tree` 🔒

**Access:** Authenticated

Builds and returns a hierarchical org chart from all employees, nesting each employee under their `reportingManager`. Top-level nodes are employees with no (or unresolved) reporting manager.

**Success — `200`**
```json
{
  "statusCode": 200,
  "message": "...",
  "data": [
    {
      "employeeId": "EMP001",
      "employeeName": "...",
      "subordinates": [
        { "employeeId": "EMP002", "employeeName": "...", "subordinates": [] }
      ]
    }
  ],
  "success": true
}
```

---

## Notes

- File upload fields (`profileImage`) are handled by Multer and uploaded to Cloudinary; the resulting URL is stored as `profilePicture` on the employee document.
- Password fields are never returned in API responses.
- This document is based on the current `backend/src/routes` and `backend/src/controllers` source; update it alongside any route/controller changes.
