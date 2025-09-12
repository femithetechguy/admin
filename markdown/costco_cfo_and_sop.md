# Costco Experience: Bridging S&OP and Finance

## Data Integration Challenges at Scale

You know, when I was at Costco, I saw firsthand how much data a company that size generates. We had to connect disparate systems—the ERP with the 3PL warehouses—just to get a single source of truth for our inventory. The old system was clunky, and manual. My team used Python and SQL to modernize it and built REST APIs to get the data flowing. We got rid of 25% of the bugs and improved the data integration accuracy significantly.

## Building Reliable Data Foundations

This experience taught me a key lesson: to make good decisions, you need reliable data. I took that principle and applied it to building our data pipelines. We migrated everything to Azure Data Factory and Databricks, which made our processes way more reliable. I even built automated data validation checks right into our CI/CD workflows. That's how we ensured the data going into our dashboards was a hundred percent trustworthy.

## Connecting Operations to Financial Impact

This brings me to the core of your question: bridging S&OP and Finance. The executives wanted to see more than just units. They wanted to see the money. I used Power Query to pull in multi-source retail data and engineered dashboards that translated our S&OP plans into financial terms. We'd look at the operational forecast for a new product and immediately see its projected impact on gross margin. We could run "what-if" scenarios on supplier costs and instantly see the effect on our P&L. My dashboards gave them a clear picture of how operational decisions impacted the bottom line. It wasn't just about showing data; it was about connecting the dots to help them make better, faster, and more profitable decisions.

---

### **Situation**
When I was at Costco, we had a major challenge with our legacy inventory systems. We were generating massive amounts of data from our ERP and 3PL warehouses, but the systems were disconnected, manual, and full of bugs. This made it nearly impossible to get a single, accurate view of our inventory and operational health, which was a huge problem for both our S&OP and Finance teams.

---

### **Task**
My primary task was to modernize these systems. I needed to create a seamless flow of reliable data from all our sources into a unified system. This was crucial for building executive-level dashboards that could effectively translate operational decisions into financial outcomes and help leadership make informed decisions.

---

### **Action**
I took a multi-pronged approach to solve this. First, my team and I used **Python and SQL** to modernize the legacy systems. I designed and built **REST APIs** to synchronize the ERP and 3PL systems, which improved data integration accuracy and resulted in a **25% bug reduction**.

Next, I focused on the data pipelines. I **designed and deployed fully managed ETL/ELT pipelines using Azure Data Factory and Databricks**, which made our data processing far more scalable and reliable than the old on-premise methods. To guarantee the data's quality, I embedded **automated data validation checks into our CI/CD workflows via Azure DevOps**. This ensured the data was trustworthy before it ever reached a dashboard.

Finally, I engineered executive-level dashboards. I used **Power Query (M)** to pull data from multiple retail sources and presented it in a way that spoke to both operations and finance. For instance, we could take an S&OP plan for a new product and instantly visualize its projected impact on gross margin, or run a **"what-if" scenario** to see how a change in supplier costs would affect our profit and loss (P&L) statement.

---

### **Result**
By connecting the disparate systems and ensuring data reliability, I created an environment where operational plans and financial results were directly linked. The dashboards I engineered weren't just reports—they were strategic tools that gave leaders a clear, real-time picture of how their decisions were impacting the bottom line. This allowed the teams to move from reactive reporting to proactive, data-driven decision-making, helping the company operate more efficiently and profitably.