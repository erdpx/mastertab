chrome.browserAction.onClicked.addListener(() => {
    saveAllTabsInStorage();
});

const saveAllTabsInStorage = () => {

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

                chrome.tabs.remove(tab.id);
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

chrome.runtime.onInstalled.addListener(() => {

    chrome.contextMenus.create({
        "id": "displayMasterTab",
        "title": "Open MasterTab!"
    });
    
    chrome.contextMenus.create({
        "id": "collapseMasterTab",
        "title": "Collapse all tabs into MasterTab!"
    });
    
});

chrome.contextMenus.onClicked.addListener(contextMenu => {
    if (contextMenu.menuItemId == 'displayMasterTab') {
        chrome.tabs.query({currentWindow: true, title: 'MasterTab!'}, tabs => {
            if (tabs[0] && tabs[0].index)
                chrome.tabs.highlight({'tabs': tabs[0].index});
            else
                chrome.tabs.create({url: 'mastertab.html'});
        });
    }
    if (contextMenu.menuItemId == 'collapseMasterTab')
        saveAllTabsInStorage();
});