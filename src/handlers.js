const handle = {

    searchBox: function() {
        const searchTab = document.getElementById('search-tab-input');
    
        searchTab.parentNode.addEventListener('click', () => {
            searchTab.focus();
        });
    
        searchTab.addEventListener('keypress', (e) => {
            if (searchTab.value != "") 
                this.searchTabs(searchTab.value);
            else if (e.keyCode == 13 && searchTab.value == "") 
                window.location.reload()
        });
    },

    searchTabs: function(query) {
        let tabsFound = [];
        
        storage.getObject('tabs')
        .then(result => {
            result.tabs.forEach(tabs => {
                // The first element, tabs[0], will be sectionId, thus can be ignored
                tabs.slice(1).forEach(tab => {
                    if(tab.title.toLowerCase().includes(query.toLowerCase()))
                        tabsFound.push(tab);
                });
            });
    
            helpers.removeAllSectionTabsFromDOM();
    
            tabsHandlers.createSectionOfTabs(tabsFound);
        })
        .catch(resultIsEmpty => {return});
    },

    options: function() {
        let optionsBtn = document.getElementById('master-tab-options');
        optionsBtn.addEventListener('click', this.renderOptions);
    },

    renderOptions: function(event) {

        let optionsContent = document.getElementById('options-link').import;

        helpers.replaceHeaderMenuContent(optionsContent);

        handleOptions() // options.js

        event.target.removeEventListener('click', handle.renderOptions);
    }
}