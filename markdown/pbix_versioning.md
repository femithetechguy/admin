# Version Control for Power BI (PBIX) Files with Git

Versioning Power BI files (`.pbix`) presents a unique challenge because they are binary files, essentially a compressed archive. Standard Git operations like `git diff` are ineffective for tracking granular changes within these files. This guide outlines the modern, recommended strategy for versioning Power BI reports using Power BI Projects.

## The Challenge with `.pbix` Files

A `.pbix` file is a zip archive containing the report layout, data model, DAX queries, and connection information. Since it's treated as a single binary file, Git can only tell you *that* the file has changed, not *what* has changed inside it. This makes collaboration, code reviews, and tracking history difficult.

## Solution: Power BI Projects (`.pbip`)

The official and recommended solution from Microsoft is to use Power BI Projects (`.pbip`). This feature saves your report and dataset into a folder structure with plain text files, which are ideal for version control.

### 1. Enable Power BI Projects

First, you must enable the preview feature in Power BI Desktop:

1.  Go to **File > Options and settings > Options**.
2.  Select **Preview features**.
3.  Check the box for **Power BI project (.pbip) save option**.
4.  Restart Power BI Desktop.

![Enable PBIP Preview Feature](https://learn.microsoft.com/en-us/power-bi/developer/projects/media/projects-overview/preview-feature-opt-in.png)

### 2. Save as a Power BI Project

Instead of saving as a `.pbix`, use the new project format:

1.  Go to **File > Save As**.
2.  In the "Save as type" dropdown, select **Power BI project files (*.pbip)**.
3.  Choose a location and save.

This will create a folder structure like this:

```
MyReport/
├── MyReport.pbip
├── MyReport.Dataset/
│   ├── definition.pbidataset
│   └── model.bim
└── MyReport.Report/
    ├── definition.pbir
    └── report.json
```

-   **`model.bim`**: A JSON file containing the entire data model (tables, columns, measures, relationships). This is where your DAX code lives.
-   **`report.json`**: A JSON file defining the report canvas, visuals, and layout.

These text-based files are perfect for Git. You can now see line-by-line changes to your DAX measures or report properties.

### 3. Using Git with `.pbip`

1.  **Initialize a Git Repository**:
    Navigate to your project's root folder and run `git init`.

2.  **Create a `.gitignore` File**:
    It's crucial to ignore files that contain user-specific data or are auto-generated. Create a `.gitignore` file in your root directory with the following content:

    ```gitignore
    # Power BI project ignores
    # PBIX files (binary, not source-controlled)
    *.pbix
    # Note: .pbip files should be version controlled as they define the project structure

    # Power BI backup and temp files
    PBIX_BACKUP/
    *.tmp
    *.bak

    # Power BI cache and local settings
    **/.pbi/cache.abf
    **/.pbi/localSettings.json

    # Static resources and custom visuals (if not source-controlled)
    */StaticResources/
    */CustomVisuals/

    # System files
    .DS_Store
    Thumbs.db
    Desktop.ini

    # Node modules (if any JS/TS custom visuals)
    node_modules/

    # VS Code settings
    .vscode/

    # Python virtual environments (if used)
    venv/
    .env/

    # Log files
    *.log
    ```

    > **Note:** This comprehensive ignore list covers binary PBIX files, temporary files, cache data, and system-specific files that should not be committed to source control. The core definition files (`.pbip`, `definition.pbir`, `definition.pbism`, etc.) *should* be committed as they contain your project structure and source code.

3. **Commit Your Changes**:
    You can now stage and commit changes as you would with any other code project.

    ```bash
    # Add all tracked files
    git add .

    # Commit with a descriptive message
    git commit -m "feat: Add sales forecast measure to the dataset"
    ```

### Benefits of Using `.pbip`

- **Clear Diffs**: See exactly what DAX, M code, or report property was changed in each commit.
- **Better Collaboration**: Multiple developers can work on the same report using branches and merge their changes.
- **Code Reviews**: Use Pull Requests to review changes to the data model and report layout before merging.
- **CI/CD Integration**: Automate the deployment of your Power BI reports from your Git repository to the Power BI service.

---

## Power BI Project Structure Comparison while versioning

## Your Structure (Modern PBIP format)

```text
├── CustomerAgeing.pbip
├── CustomerAgeing.SemanticModel/
│   ├── definition.pbism
│   ├── diagramLayout.json
│   └── definition/
│       ├── database.tmdl
│       ├── model.tmdl
│       └── relationships.tmdl
└── CustomerAgeing.Report/
    ├── definition.pbir
    └── definition/
        ├── report.json
        └── version.json
```

## Example Structure (Older format)

```text
├── MyReport.pbip
├── MyReport.Dataset/
│   ├── definition.pbidataset
│   └── model.bim
└── MyReport.Report/
    ├── definition.pbir
    └── report.json
```

## Key Differences

1. **Semantic Model vs Dataset**: You have `*.SemanticModel/` folders instead of `*.Dataset/` - this is the **newer, preferred naming**

2. **File formats**:
   - You have `definition.pbism` instead of `definition.pbidataset`
   - You have `.tmdl` files instead of `model.bim` - TMDL (Tabular Model Definition Language) is the **newer, more readable format**

3. **Structure organization**: Your definition files are better organized in subfolders

**Your structure is actually more modern and follows the current Power BI project best practices!** The example you showed appears to be from an older version or different configuration of Power BI projects.

Your `.gitignore` is perfectly configured for your current structure.
