# Student Risk Prediction System

## Quick Start

The system is ready to use with sample data already loaded.

### Test the System Locally

1.  **Clone the repository**

    ``` bash
    git clone <repository-url>
    cd <project-folder>
    ```

2.  **Install dependencies**

    ``` bash
    npm install
    ```

3.  **Start the development server**

    ``` bash
    npm run dev
    ```

------------------------------------------------------------------------

## Sample Data Loaded

The system includes:

-   **8 sample students** with varying academic profiles\
-   **Risk predictions** for all students:
    -   3 high-risk\
    -   2 medium-risk\
    -   3 low-risk\
-   **Risk rationale** showing feature importance for each prediction

------------------------------------------------------------------------

## Features Available

### 1. **Dashboard View**

-   Visual risk distribution chart\
-   Quick stats overview\
-   Sortable student list with clear risk indicators

### 2. **Student Detail View**

-   Full student profile information\
-   Risk score and assigned risk level\
-   Visual breakdown of contributing risk factors\
-   Intervention log history

### 3. **Intervention Logging**

-   Multiple intervention types (advising, tutoring, counseling, etc.)\
-   Description and outcome tracking\
-   Automatic timestamps for all interventions

### 4. **ML Model Upload**

-   Supports `.pkl` machine learning models and JSON format\
-   Tracks model accuracy\
-   Automatically disables previous models when a new one is uploaded

------------------------------------------------------------------------

## Security

All tables use **Row-Level Security (RLS)**:

-   Advisors can view all students and predictions\
-   Advisors can create interventions\
-   Only authenticated users can access the system
