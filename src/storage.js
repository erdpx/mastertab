const storage = {

    get: obj => {
        return new Promise((resolve, reject) => {
            if (obj) {
                chrome.storage.local.get(obj, result => {
                    if (result === undefined)
                        return reject(null)
    
                    Object.keys(result).forEach(key => {
                        if (result[key] === undefined || result[key].length == 0)
                            return reject(null)
                    });
                    
                    resolve(result);
                });
            } else {
                reject(null);
            }
        });
    },

    
    getObject: async obj => {
        return await storage.get(obj);
    },

    
    set: obj => {
        return new Promise((resolve, reject) => {
            if (obj) {
                chrome.storage.local.set(obj, () => {
                    resolve(true)
                });
            } else {
                reject(null);
            }
        });
    },

    
    setObject: async obj => {
        return await storage.set(obj);
    },
    

    deleteTab: (sectionId, tabId) => {
        if (sectionId < 0) return;

        storage.getObject('tabs')
        .then(result => {

        let tabIndex = result.tabs[sectionId].findIndex(obj => obj.id == tabId);

        result.tabs[sectionId].splice(tabIndex, 1);

        if (result.tabs[sectionId].length == 1)
            result.tabs[sectionId] = [];

        storage.setObject({'tabs': result.tabs});
        })
        .catch(resultIsEmpty => {return});
    },


    deleteSection: sectionId => {
        if (sectionId < 0) return;
    
        storage.getObject('tabs')
        .then(result => {
            result.tabs[sectionId] = []
    
            storage.setObject({'tabs': result.tabs});
        })
        .catch(resultIsEmpty => {return});
    },


    addNewCategory: newCategory => {
        storage.getObject('categories')
        .then(result => {
            result.categories.push(newCategory);
            storage.setObject({'categories': result.categories});
        })
        .catch(categoriesIsEmpty => {
            // First element of categories array will be undefined meaning 'No Category'
            storage.setObject({'categories': [undefined, newCategory]});
        });
    },


    addSectionCategory: (sectionId, category) => {
        if (sectionId < 0 || category < 0) return;
    
        storage.getObject('tabs')
        .then(result => {
            result.tabs.slice(sectionId).forEach((tabs) => {
                if (tabs[0] != undefined && tabs[0].sectionId == sectionId) {
    
                    tabs[0].category = category;
    
                    storage.setObject({'tabs': result.tabs});
                }
            });
        })
        .catch(resultIsEmpty => {return});
    },


    updateTabs: (tabId, targetTabId, sectionId) => {
        if (tabId < 0|| targetTabId < 0 || sectionId < 0) return;
        
        storage.getObject('tabs')
        .then(result => {
            let draggedTabIndex = result.tabs[sectionId].findIndex(obj => obj.id == tabId);
            let draggedTab = result.tabs[sectionId][draggedTabIndex];

            let targetTabIndex = result.tabs[sectionId].findIndex(obj => obj.id == targetTabId);

            result.tabs[sectionId].splice(draggedTabIndex, 1);

            result.tabs[sectionId].splice(targetTabIndex, 0, draggedTab);
    
            storage.setObject({'tabs': result.tabs});
        })
        .catch(resultIsEmpty => {return});
    },


    updateTabsFromTwoSections: (draggedTab, targetTab) => {
        if (draggedTab.id < 0 || draggedTab.sectionId < 0 || !targetTab.id < 0 || targetTab.sectionId < 0) return
    
        storage.getObject('tabs')
        .then(result => {
            let draggedTabIndex = result.tabs[draggedTab.sectionId].findIndex(obj => obj.id == draggedTab.id);
            let draggedTabContent = result.tabs[draggedTab.sectionId][draggedTabIndex];

            let targetTabIndex = result.tabs[targetTab.sectionId].findIndex(obj => obj.id == targetTab.id);

            result.tabs[draggedTab.sectionId].splice(draggedTabIndex, 1);

            result.tabs[targetTab.sectionId].splice(targetTabIndex, 0, draggedTabContent);
    
            storage.setObject({'tabs': result.tabs});
        })
        .catch(resultIsEmpty => {return});
    },

}