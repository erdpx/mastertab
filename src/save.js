export const saveAllTabsInStorage = () => {

    chrome.tabs.query({currentWindow: true}, tabs => {

        chrome.storage.local.get(['tabs', 'tabsCounter'], result => {

            let tabsCounter;
            if (!result.tabsCounter)
                tabsCounter = 0;
            else
                tabsCounter = result.tabsCounter;

            let allTabs = [];
            let newTabs;
            if (result.tabs) {
                allTabs = result.tabs;
                newTabs = [{sectionId: result.tabs.length}];
            } else {
                newTabs = [{sectionId: 0}];
            }

            chrome.tabs.create({url: 'mastertab.html'});

            tabs.forEach(tab => {
                if (!tab.url.includes('chrome-extension://') && !tab.url.includes('chrome://')) {
                    newTabs.push({'url': tab.url, 'title': tab.title, 'favicon': tab.favIconUrl, 'id': tabsCounter});
                    tabsCounter++;
                }

                // Close tab from browser
                //chrome.tabs.remove(tab.id);
            });

            // Push to allTabs array only if contain some tab
            // The first element will always be sectionId, hence, newTabs.length > 1
            if (newTabs.length > 1) allTabs.push(newTabs);
            else return;
            
            chrome.storage.local.set({'tabsCounter': tabsCounter});
            chrome.storage.local.set({'tabs': allTabs});
        });
    });
}