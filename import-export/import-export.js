let handleImportExport = () => {

    let importExportTextarea = document.getElementById('import-export-json-textarea');

    (function handleExport() {

        const exportBtn = document.getElementById('export-json-btn');
        exportBtn.addEventListener('click', exportJSON);

        function exportJSON() {
            storage.getObject(['tabs', 'categories'])
            .then(result => {

                let data = parseExportData(result);

                let jsonContent = [];

                jsonContent.push({categories: data.categories});
                jsonContent.push({tabs: data.tabs});

                importExportTextarea.innerHTML = JSON.stringify(jsonContent);
                helpers.displayFlashMsg('Seems like MasterTab! data was successfully exported!');
            })
            .catch(error => helpers.displayFlashMsg('Could not export data.'));;
        }

    })();

    (function handleImport() {

        const importBtn = document.getElementById('import-json-btn');
        importBtn.addEventListener('click', importJSON);

        function importJSON() {

            if (importExportTextarea.value == '')
                return importExportTextarea.placeholder = 'Paste your exported JSON data here';

            let JSONData = importExportTextarea.value;

            try {
                JSONData = JSON.parse(JSONData);
            } 
            catch(err) {
                return helpers.displayFlashMsg('ERROR: Invalid JSON.');
            }

            storage.getObject(['tabs', 'categories'])
            .then(result => {
                
                let data = parseImportData(JSONData, result)

                storage.setObject({'categories': data.categories});
                storage.setObject({'tabs': data.tabs});
            })
            .catch(error => helpers.displayFlashMsg('Could not import data.'));;


            helpers.displayFlashMsg('Seems like MasterTab! data was successfully imported!');
        }
    })();


    function parseExportData(data) {

        let categoriesData;
        if (data.categories === undefined || data.categories.length === 0)
            categoriesData = [];
        else 
            categoriesData = data.categories.splice(1);

        let tabsSections;
        if (data.tabs === undefined || data.tabs.length === 0)
            tabsSections = []
        else
            tabsSections = data.tabs

        let tabsData = [];

        tabsSections.forEach(tabs => {
            if (tabs.length === 0) return;

            let sectionTabs = []

            sectionTabs.push({category: tabs[0].category || 0});

            tabs.slice(1).forEach(tab => {
                sectionTabs.push({
                    url: tab.url,
                    title: tab.title,
                    favicon: tab.favicon
                });
            });

            tabsData.push(sectionTabs);
        });

        return {tabs: tabsData, categories: categoriesData};
    }

    function parseImportData(JSONData, data) {

        let categories;
        if (data.categories === undefined || data.categories.length === 0)
            categories = [null]
        else
            categories = data.categories;

        // First element of categories is null, meaning 'No Category', hence, -1
        let categoriesLength = categories.length - 1;

        if (JSONData[0].categories.length > 0) {
            JSONData[0].categories.forEach(category => {
                categories.push(category);
            });
        }

        let tabsSections;
        if (data.tabs === undefined || data.tabs.length === 0)
            tabsSections = [];
        else
            tabsSections = data.tabs;

        let sectionIdCounter = tabsSections.length;

        if (JSONData[1].tabs.length > 0) {
            JSONData[1].tabs.forEach(tabs => {

                let sectionTabs = [];

                let categoryId;
                if (tabs[0].category == 0)
                    categoryId = tabs[0].category
                else
                    categoryId = categoriesLength + tabs[0].category
                
                sectionTabs.push({sectionId: sectionIdCounter, category: categoryId});

                tabs.splice(1).forEach(tab => {
                    sectionTabs.push({
                        url: tab.url,
                        title: tab.title,
                        favicon: tab.favicon
                    });
                });

                sectionIdCounter++;
                tabsSections.push(sectionTabs);
            });
        }
        return {tabs: tabsSections, categories: categories};
    }
}