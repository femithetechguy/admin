# Power Automate and the On-Premises Data Gateway

This guide provides an overview of Power Automate and the On-Premises Data Gateway, explaining how they work together to connect cloud-based workflows with on-premises data sources.

## 1. What is Power Automate?

**Power Automate** (formerly Microsoft Flow) is a cloud-based service that allows you to create and automate workflows and tasks across multiple applications and services. It helps you connect disparate data sources, applications, and services to automate business processes without writing code.

### Key Concepts

*   **Connectors**: Pre-built proxies or wrappers around an API that allow the underlying service to talk to Power Automate. Examples include SharePoint, Outlook, SQL Server, Twitter, and more.
*   **Triggers**: An event that starts a cloud flow. For example, receiving a new email in Outlook or adding a new file to a SharePoint library.
*   **Actions**: The operations the flow performs when a trigger is invoked. For example, sending a notification, creating a file, or inserting a row into a database.

## 2. What is the On-Premises Data Gateway?

The **On-Premises Data Gateway** acts as a secure bridge that provides quick and secure data transfer between on-premises data (data that isn't in the cloud) and several Microsoft cloud services. These cloud services include Power BI, Power Apps, Azure Logic Apps, and **Power Automate**.

By using a gateway, you can keep your databases, file shares, and other data sources on your on-premises network and securely use that data in cloud services.

## 3. How They Work Together

When a Power Automate flow needs to access data that resides within your private, on-premises network (like a local SQL Server or a file on a network share), it cannot connect directly due to network firewalls and security boundaries.

The On-Premises Data Gateway solves this problem.

**The process works as follows:**

1.  **Trigger**: A Power Automate flow is triggered in the cloud.
2.  **Cloud Request**: An action in the flow creates a query and sends it to the Azure Service Bus, encrypted with the gateway's public key.
3.  **Gateway Polling**: The On-Premises Data Gateway, installed on a server within your local network, polls the Azure Service Bus for pending requests.
4.  **Request Decryption**: The gateway retrieves the encrypted request and decrypts it using its private key.
5.  **Data Source Connection**: The gateway connects to the on-premises data source (e.g., SQL Server, File System) to execute the query.
6.  **Data Return**: The data is sent back from the gateway to the Azure Service Bus, encrypted.
7.  **Flow Execution**: Power Automate receives the data from the Service Bus and continues the flow execution in the cloud.

![Gateway Flow Diagram](https://learn.microsoft.com/en-us/power-bi/connect-data/media/service-gateway-onprem/gateway-flow.png)
*Image courtesy of Microsoft Docs*

## 4. Setting Up the On-Premises Data Gateway

### Prerequisites

*   A machine running Windows Server 2012 R2 or later, or Windows 8 or later.
*   .NET Framework 4.7.2 or later.
*   The machine must be always on and connected to the internet.

### Installation and Configuration Steps

1.  **Download**: Download the gateway from the [Microsoft download page](https://powerapps.microsoft.com/downloads/).
2.  **Install**: Run the installer on your designated on-premises server.
3.  **Sign In**: Sign in with the same work or school account you use for Power Automate.
4.  **Register**: Choose "Register a new gateway on this computer".
5.  **Name and Recovery Key**: Provide a name for your gateway and create a recovery key. **Store the recovery key in a safe place.** You will need it if you ever need to restore or move your gateway.
6.  **Confirmation**: Once configured, the gateway is ready to be used.

## 5. Using the Gateway in a Power Automate Flow

After the gateway is installed and running, you can create connections in Power Automate that use it.

### Example: Reading a Local File

1.  **Create a New Flow**: In Power Automate, create a new flow (e.g., an "Instant cloud flow" with a manual trigger).
2.  **Add an Action**: Add an action from the "File System" connector, such as "Get file content".
3.  **Create a Connection**: When you add the action, Power Automate will prompt you to create a connection.
    *   Provide a **Connection Name**.
    *   Specify the **Root folder** (e.g., `C:\MyFiles\`).
    *   Choose your **Authentication Type** (typically Windows).
    *   Enter the **Username** and **Password** for an account that has access to the specified folder. The username should be in the format `DOMAIN\user` or `machinename\user`.
    *   Select your newly installed **Gateway** from the dropdown list.
    *   Click **Create**.
4.  **Configure the Action**: Once the connection is created, specify the full path to the file you want to read in the "File" field of the action.
5.  **Test**: Save and test your flow. Power Automate will now use the gateway to securely access and read the content of the file from your on-premises machine.

## 6. Best Practices

*   **Dedicated Machine**: Install the gateway on a dedicated server that is always on and has a reliable network connection. Do not install it on a laptop or a machine that might be turned off or go to sleep.
*   **Performance**: The machine hosting the gateway should have sufficient resources (CPU, RAM) to handle the expected load.
*   **High Availability**: For business-critical workflows, consider setting up a gateway cluster for high availability and load balancing.
*   **Permissions**: Ensure the gateway service account and the credentials used in the connection have the necessary permissions to access the on-premises data source.