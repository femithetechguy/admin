# Data Pipeline: A 5-Step Overview

![Data Pipeline Process](/images/interviewtopics/data_pipeline.gif)

A data pipeline is a system that moves and transforms raw data from various sources to a destination where it can be analyzed and used. This process typically involves five key stages:

1. **Collect**: Data is gathered from its starting points, such as data stores (like databases), data streams (like real-time event logs), and applications.

2. **Ingest**: The collected data is moved into a central point, often an event queue, which acts as a buffer and a hub for further processing.

3. **Store**: The data is then saved in a destination designed for its specific use. This could be a data lake for raw, unstructured data, a data warehouse for structured data used in business intelligence, or a data lakehouse which combines the best features of both.

4. **Compute**: This is where the data is processed or transformed. This can be done through batch processing (for large, scheduled tasks) or stream processing (for real-time, continuous data).

5. **Consume**: Finally, the processed data is used by various teams and systems for different purposes. These can include data science, business intelligence, self-service analytics, and powering machine learning services.