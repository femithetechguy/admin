# Data Privacy Levels and Sensitivity Labels

Understanding and correctly applying data privacy levels and sensitivity labels is crucial for protecting company information, maintaining customer trust, and complying with regulations. This guide outlines the standard data classification levels and how they are implemented using sensitivity labels.

## 1. Data Privacy Levels

Data is categorized into levels based on its sensitivity and the potential impact if it were to be disclosed, altered, or destroyed without authorization. While the exact terminology can vary between organizations, the levels generally follow this structure:

### Level 1: Public
This is information that is intended for public consumption. Its disclosure poses no risk to the company, its employees, or its customers.

*   **Examples:** Marketing materials, press releases, public website content, job postings.
*   **Handling:** No restrictions on distribution.

### Level 2: Internal / General
This data is not meant for public release but can be shared broadly within the organization. Unauthorized disclosure would have a minimal negative impact.

*   **Examples:** General company announcements, internal newsletters, team contact lists, non-sensitive operational procedures.
*   **Handling:** Should be limited to company personnel. Avoid sharing on public forums or with external parties without a valid business reason.

### Level 3: Confidential
This is sensitive information that, if disclosed, could negatively impact the company's operations, reputation, or competitive advantage. Access should be restricted to specific groups or individuals on a "need-to-know" basis.

*   **Examples:** Business plans, financial reports before public release, sales data, employee information (non-PII), contracts, internal project details.
*   **Handling:** Requires access controls. Data should be encrypted when stored or transmitted. Do not share outside the authorized group without explicit permission.

### Level 4: Restricted / Highly Confidential
This is the most sensitive data. Unauthorized disclosure could lead to severe financial loss, legal and regulatory penalties, reputational damage, or harm to individuals. Access is strictly limited to a small number of named individuals.

*   **Examples:** Personally Identifiable Information (PII), Protected Health Information (PHI), credit card numbers, trade secrets, source code, security credentials, M&A details.
*   **Handling:** Must be encrypted at rest and in transit. Requires multi-factor authentication for access. Strict monitoring and logging are essential.

## 2. Sensitivity Labels

Sensitivity labels are the practical application of data privacy levels. They are tags applied to documents, emails, and other data assets to:

*   **Visually Mark Data:** Apply headers, footers, or watermarks (e.g., "Confidential") to inform users of the data's sensitivity.
*   **Enforce Protection Policies:** Automatically apply security measures like encryption, access restrictions, or prevent actions like printing or forwarding.
*   **Aid in Data Governance:** Allow tools (like Data Loss Prevention - DLP systems) to identify sensitive data and prevent it from leaving the corporate network.

### Example Mapping: Levels to Labels

| Data Privacy Level | Example Sensitivity Label | Applied Protections |
| :--- | :--- | :--- |
| **Public** | `Public` | None. |
| **Internal** | `General` or `Internal` | May add a simple footer like "For Internal Use Only". |
| **Confidential** | `Confidential` | Adds a "Confidential" watermark. May encrypt the file. Access might be restricted to internal users. |
| **Restricted** | `Highly Confidential` | Adds a prominent watermark. Enforces encryption. Prevents copying, printing, and forwarding. Access is restricted to a specific user group. |

## Best Practices

*   **Classify at Creation:** Apply the correct sensitivity label when you create a document or email.
*   **Least Privilege Principle:** Start with the most restrictive label and lower it only if necessary.
*   **Review and Re-classify:** If the content of a document changes, review and update its sensitivity label.
*   **Report Misclassifications:** If you find data with an incorrect or missing label, report it to your manager or IT security team.
